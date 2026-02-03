<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260203073424 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE qcm (id INT AUTO_INCREMENT NOT NULL, content JSON NOT NULL, created_at DATETIME NOT NULL, document_id INT NOT NULL, UNIQUE INDEX UNIQ_D7A1FEF4C33F7837 (document_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE qcm ADD CONSTRAINT FK_D7A1FEF4C33F7837 FOREIGN KEY (document_id) REFERENCES document (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE qcm DROP FOREIGN KEY FK_D7A1FEF4C33F7837');
        $this->addSql('DROP TABLE qcm');
    }
}
