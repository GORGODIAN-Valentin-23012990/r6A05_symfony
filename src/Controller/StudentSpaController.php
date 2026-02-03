<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

final class StudentSpaController extends AbstractController
{
    #[Route('/student/{reactRouting}', name: 'student_spa', requirements: ['reactRouting' => '.*'])]
    public function index(): Response
    {
        return $this->render('student_spa/index.html.twig', [
            'hide_navbar' => true,
        ]);
    }
}