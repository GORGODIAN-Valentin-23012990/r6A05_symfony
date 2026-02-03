<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260203100058 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE qcm_result (id INT AUTO_INCREMENT NOT NULL, score INT NOT NULL, max_score INT NOT NULL, created_at DATETIME NOT NULL, user_id INT NOT NULL, qcm_id INT NOT NULL, INDEX IDX_A3347735A76ED395 (user_id), INDEX IDX_A3347735FF6241A6 (qcm_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE qcm_result ADD CONSTRAINT FK_A3347735A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE qcm_result ADD CONSTRAINT FK_A3347735FF6241A6 FOREIGN KEY (qcm_id) REFERENCES qcm (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE qcm_result DROP FOREIGN KEY FK_A3347735A76ED395');
        $this->addSql('ALTER TABLE qcm_result DROP FOREIGN KEY FK_A3347735FF6241A6');
        $this->addSql('DROP TABLE qcm_result');
    }
}
