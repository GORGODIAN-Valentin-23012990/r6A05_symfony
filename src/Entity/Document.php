<?php

namespace App\Entity;

use App\Repository\DocumentRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: DocumentRepository::class)]
#[ApiResource(
    operations: [
        new Get(),
        new GetCollection()
    ],
    normalizationContext: ['groups' => ['read:collection']]
)]
class Document
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['read:collection'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['read:collection', 'qcm:item'])]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['read:collection'])]
    private ?string $description = null;

    #[ORM\Column(length: 255)]
    #[Groups(['read:collection'])]
    private ?string $filename = null;

    #[ORM\Column]
    #[Groups(['read:collection'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\OneToOne(mappedBy: 'document', cascade: ['persist', 'remove'])]
    #[Groups(['read:collection'])]
    private ?Qcm $qcm = null;

    public function getQcm(): ?Qcm
    {
        return $this->qcm;
    }

    public function setQcm(Qcm $qcm): static
    {
        // set the owning side of the relation if necessary
        if ($qcm->getDocument() !== $this) {
            $qcm->setDocument($this);
        }

        $this->qcm = $qcm;

        return $this;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getFilename(): ?string
    {
        return $this->filename;
    }

    public function setFilename(string $filename): static
    {
        $this->filename = $filename;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    #[ORM\ManyToOne(inversedBy: 'documents')]
    #[Groups(['read:collection'])]
    private ?User $user = null;
    // ... (keep existing methods)

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }
}
