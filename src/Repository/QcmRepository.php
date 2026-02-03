<?php

namespace App\Repository;

use App\Entity\Qcm;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Qcm>
 *
 * @method Qcm|null find($id, $lockMode = null, $lockVersion = null)
 * @method Qcm|null findOneBy(array $criteria, array $orderBy = null)
 * @method Qcm[]    findAll()
 * @method Qcm[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class QcmRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Qcm::class);
    }
}
