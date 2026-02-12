<?php

namespace App\DataFixtures;

use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    public function __construct(
        private UserPasswordHasherInterface $passwordHasher
    ) {
    }

    public function load(ObjectManager $manager): void
    {
        // Create Teacher (Admin)
        $teacher = new User();
        $teacher->setEmail('prof@example.com');
        $teacher->setRoles(['ROLE_ADMIN']);
        $teacher->setFirstname('Professeur');
        $teacher->setPassword($this->passwordHasher->hashPassword($teacher, 'password'));
        $manager->persist($teacher);

        // Create Student (User)
        $student = new User();
        $student->setEmail('eleve@example.com');
        $student->setRoles(['ROLE_USER']);
        $student->setFirstname('Eleve');
        $student->setPassword($this->passwordHasher->hashPassword($student, 'password'));
        $manager->persist($student);

        $manager->flush();
    }
}
