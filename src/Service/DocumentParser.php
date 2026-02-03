<?php

namespace App\Service;

use Smalot\PdfParser\Parser;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\File\Exception\FileException;

class DocumentParser
{
    public function __construct(
        #[Autowire('%kernel.project_dir%')]
        private readonly string $projectDir
    ) {
    }

    public function parse(string $filename): string
    {
        $filePath = $this->projectDir . '/public/uploads/documents/' . $filename;

        if (!file_exists($filePath)) {
            throw new FileException("File not found: " . $filePath);
        }

        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

        if ($extension === 'pdf') {
            return $this->parsePdf($filePath);
        }

        // Add Logic for DOCX or other formats here if needed

        return "Unsupported file format for text extraction: " . $extension;
    }

    private function parsePdf(string $filePath): string
    {
        $parser = new Parser();
        $pdf = $parser->parseFile($filePath);
        return $pdf->getText();
    }
}
