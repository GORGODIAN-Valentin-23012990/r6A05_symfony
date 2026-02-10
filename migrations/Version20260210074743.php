<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260210074743 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE qcm ADD video_id INT DEFAULT NULL, CHANGE document_id document_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE qcm ADD CONSTRAINT FK_D7A1FEF429C1004E FOREIGN KEY (video_id) REFERENCES video (id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_D7A1FEF429C1004E ON qcm (video_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE qcm DROP FOREIGN KEY FK_D7A1FEF429C1004E');
        $this->addSql('DROP INDEX UNIQ_D7A1FEF429C1004E ON qcm');
        $this->addSql('ALTER TABLE qcm DROP video_id, CHANGE document_id document_id INT NOT NULL');
    }
}
