<?php

namespace App\Controller;

use App\Entity\Document;
use App\Entity\Video;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Doctrine\ORM\EntityManagerInterface;

#[IsGranted('ROLE_USER')]
class ContentController extends AbstractController
{
    #[Route('/video/{id}', name: 'app_video_show')]
    public function showVideo(Video $video): Response
    {
        return $this->render('content/video_show.html.twig', [
            'video' => $video,
        ]);
    }

    #[Route('/document/{id}', name: 'app_document_show')]
    public function showDocument(Document $document): Response
    {
        return $this->render('content/document_show.html.twig', [
            'document' => $document,
        ]);
    }

    #[Route('/video/{id}/generate-qcm', name: 'app_video_generate_qcm')]
    public function generateVideoQcm(
        Video $video,
        \App\Service\MistralAiService $aiService,
        \Doctrine\ORM\EntityManagerInterface $entityManager,
        \Symfony\Component\HttpFoundation\Request $request,
        \Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface $params
    ): Response {
        set_time_limit(600); // 10 minutes timeout for video processing
        try {
            $force = $request->query->get('force');
            $nbQuestions = $request->query->getInt('nb_questions', 5);
            $multipleCorrect = $request->query->getBoolean('multiple_correct', false);

            if ($video->getQcm() && !$force) {
                return $this->render('content/qcm_result.html.twig', [
                    'video' => $video, // Using video variable in template
                    'document' => null,
                    'quiz' => $video->getQcm()->getContent(),
                ]);
            }

            // Get absolute path to video
            // Assuming video filename is stored and public dir is known
            // Actually Video entity has `filename`. 
            // We need to know where it is stored. config/services.yaml usually has this or we use public_path
            $projectDir = $params->get('kernel.project_dir');
            $videoPath = $projectDir . '/public/uploads/videos/' . $video->getFilename(); // Adjust path if needed

            // Or maybe it's configured in VichUploader? 
            // I'll assume standard /public/uploads/videos for now based on common practices or check if I can find it.
            // But let's check standard mapped path.
            if (!file_exists($videoPath)) {
                $videoPath = $projectDir . '/public/assets/videos/' . $video->getFilename();
            }

            $transcript = $aiService->transcribeVideo($videoPath);
            $quiz = $aiService->generateQuiz($transcript, $nbQuestions, $multipleCorrect);

            if ($video->getQcm()) {
                $qcm = $video->getQcm();
                $qcm->setContent($quiz);
                $qcm->setCreatedAt(new \DateTimeImmutable());
            } else {
                $qcm = new \App\Entity\Qcm();
                $qcm->setContent($quiz);
                $qcm->setCreatedAt(new \DateTimeImmutable());
                $qcm->setVideo($video);
                $entityManager->persist($qcm);
            }

            $entityManager->flush();

            return $this->render('content/qcm_result.html.twig', [
                'video' => $video,
                'document' => null,
                'quiz' => $qcm->getContent(),
            ]);

        } catch (\Exception $e) {
            $this->addFlash('error', 'Erreur lors de la génération du QCM vidéo : ' . $e->getMessage());
            return $this->redirectToRoute('app_video_show', ['id' => $video->getId()]);
        }
    }

    #[Route('/document/{id}/generate-qcm', name: 'app_document_generate_qcm')]
    public function generateQcm(
        Document $document,
        \App\Service\DocumentParser $parser,
        \App\Service\MistralAiService $aiService,
        \Doctrine\ORM\EntityManagerInterface $entityManager,
        \Symfony\Component\HttpFoundation\Request $request
    ): Response {
        try {
            $force = $request->query->get('force');
            $nbQuestions = $request->query->getInt('nb_questions', 5);
            $multipleCorrect = $request->query->getBoolean('multiple_correct', false);

            // If QCM exists and not forcing, return it
            if ($document->getQcm() && !$force) {
                return $this->render('content/qcm_result.html.twig', [
                    'document' => $document,
                    'video' => null,
                    'quiz' => $document->getQcm()->getContent(),
                ]);
            }

            // Regenerate or Create
            $text = $parser->parse($document->getFilename());
            $quiz = $aiService->generateQuiz($text, $nbQuestions, $multipleCorrect);

            if ($document->getQcm()) {
                // Update existing
                $qcm = $document->getQcm();
                $qcm->setContent($quiz);
                $qcm->setCreatedAt(new \DateTimeImmutable());
            } else {
                // Create new
                $qcm = new \App\Entity\Qcm();
                $qcm->setContent($quiz);
                $qcm->setCreatedAt(new \DateTimeImmutable());
                $qcm->setDocument($document);
                $entityManager->persist($qcm);
            }

            $entityManager->flush();

            return $this->render('content/qcm_result.html.twig', [
                'document' => $document,
                'video' => null,
                'quiz' => $qcm->getContent(),
            ]);
        } catch (\Exception $e) {
            $this->addFlash('error', 'Erreur lors de la génération du QCM : ' . $e->getMessage());
            return $this->redirectToRoute('app_document_show', ['id' => $document->getId()]);
        }
    }

    #[Route('/document/{id}/take-qcm', name: 'app_document_take_qcm')]
    public function takeQcm(Document $document): Response
    {
        if (!$document->getQcm()) {
            $this->addFlash('warning', 'Aucun QCM n\'a été généré pour ce document.');
            return $this->redirectToRoute('app_document_show', ['id' => $document->getId()]);
        }

        return $this->render('content/take_qcm.html.twig', [
            'item' => $document,
            'quiz' => $document->getQcm()->getContent(),
            'backUrl' => $this->generateUrl('app_document_show', ['id' => $document->getId()]),
            'retryUrl' => $this->generateUrl('app_document_take_qcm', ['id' => $document->getId()]),
        ]);
    }

    #[Route('/video/{id}/take-qcm', name: 'app_video_take_qcm')]
    public function takeVideoQcm(Video $video): Response
    {
        if (!$video->getQcm()) {
            $this->addFlash('warning', 'Aucun QCM n\'a été généré pour cette vidéo.');
            return $this->redirectToRoute('app_video_show', ['id' => $video->getId()]);
        }

        return $this->render('content/take_qcm.html.twig', [
            'item' => $video,
            'quiz' => $video->getQcm()->getContent(),
            'backUrl' => $this->generateUrl('app_video_show', ['id' => $video->getId()]),
            'retryUrl' => $this->generateUrl('app_video_take_qcm', ['id' => $video->getId()]),
        ]);
    }

    #[Route('/document/{id}/delete', name: 'app_document_delete', methods: ['POST'])]
    public function deleteDocument(Request $request, Document $document, EntityManagerInterface $entityManager): Response
    {
        if ($this->isCsrfTokenValid('delete' . $document->getId(), $request->request->get('_token'))) {
            // Optional: Remove file from filesystem if needed (skipped for now to keep it simple, Doctrine removes the entity)
            $entityManager->remove($document);
            $entityManager->flush();
            $this->addFlash('success', 'Document supprimé avec succès.');
        }

        return $this->redirectToRoute('app_dashboard');
    }
    #[Route('/video/{id}/delete', name: 'app_video_delete', methods: ['POST'])]
    public function deleteVideo(Request $request, Video $video, EntityManagerInterface $entityManager): Response
    {
        if ($this->isCsrfTokenValid('delete' . $video->getId(), $request->request->get('_token'))) {
            $entityManager->remove($video);
            $entityManager->flush();
            $this->addFlash('success', 'Vidéo supprimée avec succès.');
        }

        return $this->redirectToRoute('app_dashboard');
    }
}
