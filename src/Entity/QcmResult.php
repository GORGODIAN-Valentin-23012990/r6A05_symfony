<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use App\Repository\QcmResultRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: QcmResultRepository::class)]
#[ApiResource(
    operations: [
        new Get(),
        new GetCollection(),
        new Post(processor: \App\State\QcmResultUserProcessor::class)
    ],
    normalizationContext: ['groups' => ['qcm_result:read']],
    denormalizationContext: ['groups' => ['qcm_result:write']]
)]
class QcmResult
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['qcm_result:read'])]
    private ?int $id = null;

    #[ORM\Column]
    #[Groups(['qcm_result:read', 'qcm_result:write'])]
    private ?int $score = null;

    #[ORM\Column]
    #[Groups(['qcm_result:read', 'qcm_result:write'])]
    private ?int $maxScore = null;

    #[ORM\Column]
    #[Groups(['qcm_result:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['qcm_result:read'])]
    private ?User $user = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['qcm_result:read', 'qcm_result:write'])]
    private ?Qcm $qcm = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getScore(): ?int
    {
        return $this->score;
    }

    public function setScore(int $score): static
    {
        $this->score = $score;

        return $this;
    }

    public function getMaxScore(): ?int
    {
        return $this->maxScore;
    }

    public function setMaxScore(int $maxScore): static
    {
        $this->maxScore = $maxScore;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }

    public function getQcm(): ?Qcm
    {
        return $this->qcm;
    }

    public function setQcm(?Qcm $qcm): static
    {
        $this->qcm = $qcm;

        return $this;
    }
}
