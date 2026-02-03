<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

class MistralAiService
{
    private const API_URL = 'https://api.mistral.ai/v1/chat/completions';

    public function __construct(
        private HttpClientInterface $client,
        #[Autowire(env: 'MISTRAL_API_KEY')]
        private string $apiKey
    ) {
    }

    public function generateQuiz(string $content, int $nbQuestions = 5, bool $multipleCorrect = false): array
    {
        // Truncate content if too long (basic protection, Mistral header limit is high but good practice)
        $content = substr($content, 0, 15000);

        $multipleInstruction = $multipleCorrect
            ? "Certaines questions PEUVENT avoir plusieurs bonnes réponses. Dans ce cas, indique toutes les bonnes réponses."
            : "";

        $prompt = <<<EOT
        Tu es un professeur expert. Génère un QCM de $nbQuestions questions basé sur le texte suivant.
        $multipleInstruction
        Le format de sortie DOIT être un JSON valide respectant cette structure :
        [
            {
                "question": "La question ?",
                "options": ["Choix A", "Choix B", "Choix C", "Choix D"],
                "answer": "La bonne réponse exacte (doit être l'une des options)"
            }
        ]
        
        Texte :
        $content
        EOT;

        $response = $this->client->request('POST', self::API_URL, [
            'headers' => [
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'model' => 'mistral-medium', // or mistral-tiny for speed/cost
                'messages' => [
                    ['role' => 'user', 'content' => $prompt]
                ],
                'temperature' => 0.7,
                'response_format' => ['type' => 'json_object']
            ],
        ]);

        $data = $response->toArray();
        $content = $data['choices'][0]['message']['content'] ?? '[]';

        // Clean up markdown code blocks if present (Mistral sometimes adds ```json ... ```)
        $content = str_replace(['```json', '```'], '', $content);

        return json_decode($content, true) ?? [];
    }
}
