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
        Le format de sortie DOIT être un objet JSON valide contenant une clé "questions" :
        {
            "questions": [
                {
                    "question": "La question ?",
                    "options": ["Choix A", "Choix B", "Choix C", "Choix D"],
                    "answer": "La bonne réponse exacte (doit être l'une des options)"
                }
            ]
        }
        RÈGLES IMPÉRATIVES - NIVEAU CONFIRMÉ: 1. DIFFICULTÉ DES QUESTIONS: - Questions approfondies nécessitant une compréhension fine du texte - Éviter les questions trop évidentes ou superficielles - Tester la capacité d'analyse et de synthèse - Poser des questions sur les nuances, les implications et les détails subtils - Utiliser des formulations complexes qui demandent de la réflexion 2. PIÈGES DANS LES RÉPONSES (OBLIGATOIRE): - Chaque mauvaise réponse doit être PLAUSIBLE et contenir un piège - Utiliser des informations partiellement vraies mais incomplètes - Mélanger des éléments vrais et faux dans une même proposition - Inverser subtilement des concepts similaires - Utiliser des termes du texte dans de faux contextes - Proposer des réponses presque correctes avec une erreur subtile - Inclure des confusions fréquentes ou des contresens logiques 3. TYPES DE PIÈGES À UTILISER: - Inversion de cause et conséquence - Confusion entre termes similaires mais distincts - Généralisation abusive d'un cas particulier - Restriction excessive d'un concept général - Ajout/omission d'un élément clé - Confusion temporelle (avant/après, antérieur/postérieur) - Négation subtile qui change le sens - Chiffres ou dates légèrement modifiés 4. STRUCTURE TECHNIQUE: - Exactement 15 questions - Exactement 4 propositions par question - correctAnswer = index (0, 1, 2 ou 3) de la bonne réponse - Une seule réponse correcte par question - Varier la position de la bonne réponse (pas toujours en A ou D) 5. COUVERTURE DU TEXTE: - Questions réparties sur l'ensemble du texte - Tester différents aspects : détails, concepts, relations, implications - Équilibrer entre questions factuelles pointues et questions analytiques 6. FORMAT DE SORTIE: - JSON valide uniquement - Aucun commentaire, aucun texte explicatif - Pas de backticks markdown EXEMPLES DE BONNES QUESTIONS AVEC PIÈGES: Question: "Selon le texte, quelle est la principale différence entre X et Y ?" - Réponse correcte: "X utilise A tandis que Y se base sur B" - Piège 1: "X utilise B tandis que Y se base sur A" (inversion) - Piège 2: "X et Y utilisent tous deux A mais dans des contextes différents" (fausse similitude) - Piège 3: "X utilise A exclusivement, Y n'utilise jamais A" (généralisation abusive) Question: "Quelle affirmation concernant le processus Z est exacte ?" - Réponse correcte: "Z nécessite l'étape A avant l'étape B pour être efficace" - Piège 1: "Z nécessite l'étape B avant l'étape A pour être efficace" (inversion d'ordre) - Piège 2: "Z nécessite l'étape A, l'étape B est optionnelle" (information partielle) - Piège 3: "Z nécessite uniquement l'étape A pour être efficace" (omission d'élément clé) 
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

        $result = json_decode($content, true) ?? [];

        // Normalize output: ensure we return a flat array of questions
        if (isset($result['questions']) && is_array($result['questions'])) {
            return $result['questions'];
        }

        return $result;
    }
    public function transcribeVideo(string $videoPath): string
    {
        // 1. Extract audio using ffmpeg
        $audioPath = sys_get_temp_dir() . '/' . uniqid('audio_', true) . '.mp3';
        // -q:a 0 for best quality, -vn for no video, -map a for audio stream
        $cmd = sprintf('ffmpeg -i %s -vn -map a -q:a 2 -y %s 2>&1', escapeshellarg($videoPath), escapeshellarg($audioPath));

        exec($cmd, $output, $returnCode);

        if ($returnCode !== 0) {
            // Cleanup on failure
            if (file_exists($audioPath))
                unlink($audioPath);
            throw new \RuntimeException('FFmpeg audio extraction failed: ' . implode("\n", $output));
        }

        try {
            // 2. Transcribe using Mistral API
            $formData = new \Symfony\Component\Mime\Part\Multipart\FormDataPart([
                'model' => 'voxtral-mini-latest',
                'file' => \Symfony\Component\Mime\Part\DataPart::fromPath($audioPath),
            ]);

            $headers = $formData->getPreparedHeaders()->toArray();
            $headers['Authorization'] = 'Bearer ' . $this->apiKey;

            $response = $this->client->request('POST', 'https://api.mistral.ai/v1/audio/transcriptions', [
                'headers' => $headers,
                'body' => $formData->bodyToIterable(),
                'timeout' => 600, // 10 minutes timeout for the API call
            ]);

            $content = $response->toArray();
            return $content['text'] ?? '';
        } finally {
            if (file_exists($audioPath)) {
                @unlink($audioPath);
            }
        }
    }
}
