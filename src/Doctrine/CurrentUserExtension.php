<?php

namespace App\Doctrine;

use ApiPlatform\Doctrine\Orm\Extension\QueryCollectionExtensionInterface;
use ApiPlatform\Doctrine\Orm\Extension\QueryItemExtensionInterface;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use App\Entity\QcmResult;
use App\Entity\User;
use Doctrine\ORM\QueryBuilder;
use Symfony\Bundle\SecurityBundle\Security;

final class CurrentUserExtension implements QueryCollectionExtensionInterface, QueryItemExtensionInterface
{
    public function __construct(private readonly Security $security)
    {
    }

    public function applyToCollection(QueryBuilder $queryBuilder, QueryNameGeneratorInterface $queryNameGenerator, string $resourceClass, Operation $operation = null, array $context = []): void
    {
        $this->addWhere($queryBuilder, $resourceClass);
    }

    public function applyToItem(QueryBuilder $queryBuilder, QueryNameGeneratorInterface $queryNameGenerator, string $resourceClass, array $identifiers, Operation $operation = null, array $context = []): void
    {
        $this->addWhere($queryBuilder, $resourceClass);
    }

    private function addWhere(QueryBuilder $queryBuilder, string $resourceClass): void
    {
        if (QcmResult::class !== $resourceClass) {
            return;
        }

        $user = $this->security->getUser();
        if (!$user instanceof User) {
            return;
        }

        // If user is a professor/admin, maybe they want to see all? 
        // But for /student context which uses this API, we usually want filtering.
        // Let's assume strict filtering: a user can only see their own results via the API default endpoints.
        // If professors need to see results, they might use a different endpoint or we check for ROLE_PROFESSOR.
        // For now, let's just filter for the current user to support the 'Student Dashboard' requirement securely.

        // However, if the system has a 'Professor' role that needs to see all results, we should exclude them from this filter.
        // Let's check roles.
        // For safety, I will filter for EVERYONE unless I know otherwise. 
        // But wait, the repository 'findByProfessor' exists, which suggests professors have their own way or this API needs to support them.
        // If I enforce this global filter, `findByProfessor` (custom repo method) is not affected by API Platform extensions usually unless used as a state provider.
        // But API Platform GET /api/qcm_results uses the standard provider which uses these extensions.

        // I will restrict it to the current user.

        $rootAlias = $queryBuilder->getRootAliases()[0];
        $queryBuilder->andWhere(sprintf('%s.user = :current_user', $rootAlias));
        $queryBuilder->setParameter('current_user', $user);
    }
}
