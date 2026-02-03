<?php

namespace App\Controller;

use App\Entity\Video;
use App\Repository\VideoRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\String\Slugger\SluggerInterface;

class DashboardController extends AbstractController
{
    #[Route('/dashboard', name: 'app_dashboard')]
    #[IsGranted('ROLE_USER')]
    public function index(Request $request, EntityManagerInterface $entityManager, SluggerInterface $slugger, VideoRepository $videoRepository, \App\Repository\DocumentRepository $documentRepository, \App\Repository\QcmResultRepository $qcmResultRepository): Response
    {
        // Handle Video Upload
        if ($request->isMethod('POST')) {
            if ($request->files->get('video_file')) {
                /** @var UploadedFile $videoFile */
                $videoFile = $request->files->get('video_file');
                $title = $request->request->get('title');
                $description = $request->request->get('description');

                if ($videoFile) {
                    $originalFilename = pathinfo($videoFile->getClientOriginalName(), PATHINFO_FILENAME);
                    $safeFilename = $slugger->slug($originalFilename);
                    $newFilename = $safeFilename . '-' . uniqid() . '.' . $videoFile->guessExtension();

                    try {
                        $videoFile->move(
                            $this->getParameter('kernel.project_dir') . '/public/uploads/videos',
                            $newFilename
                        );
                    } catch (FileException $e) {
                        $this->addFlash('error', 'Erreur lors de l\'upload de la vidéo.');
                        return $this->redirectToRoute('app_dashboard');
                    }

                    $video = new Video();
                    $video->setTitle($title);
                    $video->setDescription($description);
                    $video->setFilename($newFilename);
                    $video->setCreatedAt(new \DateTimeImmutable());
                    $video->setUser($this->getUser());

                    $entityManager->persist($video);
                    $entityManager->flush();

                    $this->addFlash('success', 'Vidéo ajoutée avec succès !');
                    return $this->redirectToRoute('app_dashboard');
                }
            } elseif ($request->files->get('document_file')) {
                // Handle Document Upload
                /** @var UploadedFile $documentFile */
                $documentFile = $request->files->get('document_file');
                $title = $request->request->get('title');
                $description = $request->request->get('description');

                if ($documentFile) {
                    $originalFilename = pathinfo($documentFile->getClientOriginalName(), PATHINFO_FILENAME);
                    $safeFilename = $slugger->slug($originalFilename);
                    $newFilename = $safeFilename . '-' . uniqid() . '.' . $documentFile->guessExtension();

                    try {
                        $documentFile->move(
                            $this->getParameter('kernel.project_dir') . '/public/uploads/documents',
                            $newFilename
                        );
                    } catch (FileException $e) {
                        $this->addFlash('error', 'Erreur lors de l\'upload du document.');
                        return $this->redirectToRoute('app_dashboard');
                    }

                    $document = new \App\Entity\Document();
                    $document->setTitle($title);
                    $document->setDescription($description);
                    $document->setFilename($newFilename);
                    $document->setCreatedAt(new \DateTimeImmutable());
                    $document->setUser($this->getUser());

                    $entityManager->persist($document);
                    $entityManager->flush();

                    $this->addFlash('success', 'Document ajouté avec succès !');
                    return $this->redirectToRoute('app_dashboard');
                }
            }
        }

        return $this->render('dashboard/index.html.twig', [
            'controller_name' => 'DashboardController',
            'videos' => $videoRepository->findBy(['user' => $this->getUser()], ['createdAt' => 'DESC']),
            'documents' => $documentRepository->findBy(['user' => $this->getUser()], ['createdAt' => 'DESC']),
            'results' => $qcmResultRepository->findByProfessor($this->getUser()),
        ]);
    }
}
