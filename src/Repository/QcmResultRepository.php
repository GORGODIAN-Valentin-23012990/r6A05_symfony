<?php

namespace App\Repository;

use App\Entity\QcmResult;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<QcmResult>
 */
class QcmResultRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, QcmResult::class);
    }

    public function findByProfessor(\App\Entity\User $professor)
    {
        return $this->createQueryBuilder('qr')
            ->join('qr.qcm', 'q')
            ->leftJoin('q.document', 'd')
            ->leftJoin('q.video', 'v')
            ->where('d.user = :professor OR v.user = :professor')
            ->setParameter('professor', $professor)
            ->orderBy('qr.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
