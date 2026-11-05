<?php

namespace App\Database\Migrations;

use Illuminate\Database\ConnectionResolverInterface as Resolver;
use Illuminate\Database\Migrations\DatabaseMigrationRepository;

class SpanishMigrationRepository extends DatabaseMigrationRepository
{
    private string $spanishTable;

    private string $legacyTable = 'migrations';

    public function __construct(Resolver $resolver, $table)
    {
        parent::__construct($resolver, $table ?: 'migraciones');

        $this->spanishTable = $table ?: 'migraciones';
    }

    public function getRan()
    {
        $migrationColumn = $this->migrationColumn();
        $batchColumn = $this->batchColumn();

        return $this->table()
            ->orderBy($batchColumn, 'asc')
            ->orderBy($migrationColumn, 'asc')
            ->pluck($migrationColumn)
            ->all();
    }

    public function getMigrations($steps)
    {
        $migrationColumn = $this->migrationColumn();
        $batchColumn = $this->batchColumn();

        return $this->selectMigrationColumns()
            ->where($batchColumn, '>=', '1')
            ->orderBy($batchColumn, 'desc')
            ->orderBy($migrationColumn, 'desc')
            ->limit($steps)
            ->get()
            ->all();
    }

    public function getMigrationsByBatch($batch)
    {
        $migrationColumn = $this->migrationColumn();
        $batchColumn = $this->batchColumn();

        return $this->selectMigrationColumns()
            ->where($batchColumn, $batch)
            ->orderBy($migrationColumn, 'desc')
            ->get()
            ->all();
    }

    public function getLast()
    {
        $batchColumn = $this->batchColumn();

        return $this->selectMigrationColumns()
            ->where($batchColumn, $this->getLastBatchNumber())
            ->orderBy($this->migrationColumn(), 'desc')
            ->get()
            ->all();
    }

    public function getMigrationBatches()
    {
        $migrationColumn = $this->migrationColumn();
        $batchColumn = $this->batchColumn();

        return $this->table()
            ->orderBy($batchColumn, 'asc')
            ->orderBy($migrationColumn, 'asc')
            ->pluck($batchColumn, $migrationColumn)
            ->all();
    }

    public function log($file, $batch)
    {
        $this->table()->insert([
            $this->migrationColumn() => $file,
            $this->batchColumn() => $batch,
        ]);
    }

    public function delete($migration)
    {
        $this->table()
            ->where($this->migrationColumn(), $migration->migration)
            ->delete();
    }

    public function getNextBatchNumber()
    {
        return $this->getLastBatchNumber() + 1;
    }

    public function getLastBatchNumber()
    {
        return (int) ($this->table()->max($this->batchColumn()) ?? 0);
    }

    public function createRepository()
    {
        $schema = $this->getConnection()->getSchemaBuilder();

        $schema->create($this->spanishTable, function ($table): void {
            $table->increments('id');
            $table->string('migracion');
            $table->integer('lote');
        });
    }

    public function repositoryExists()
    {
        $schema = $this->getConnection()->getSchemaBuilder();

        return $schema->hasTable($this->spanishTable)
            || $schema->hasTable($this->legacyTable);
    }

    public function deleteRepository()
    {
        $schema = $this->getConnection()->getSchemaBuilder();
        $table = $this->activeTable();

        if ($schema->hasTable($table)) {
            $schema->drop($table);
        }
    }

    protected function table()
    {
        return $this->getConnection()->table($this->activeTable())->useWritePdo();
    }

    private function selectMigrationColumns()
    {
        $migrationColumn = $this->migrationColumn();
        $batchColumn = $this->batchColumn();

        return $this->table()->select([
            'id',
            $migrationColumn.' as migration',
            $batchColumn.' as batch',
        ]);
    }

    private function activeTable(): string
    {
        $schema = $this->getConnection()->getSchemaBuilder();

        if ($schema->hasTable($this->spanishTable)) {
            return $this->spanishTable;
        }

        return $this->legacyTable;
    }

    private function migrationColumn(): string
    {
        return $this->activeTable() === $this->spanishTable ? 'migracion' : 'migration';
    }

    private function batchColumn(): string
    {
        return $this->activeTable() === $this->spanishTable ? 'lote' : 'batch';
    }
}
