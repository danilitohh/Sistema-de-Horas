<?php

namespace Tests\Feature;

use App\Models\TimeEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Tests\TestCase;

class TimeEntryReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_normal_user_cannot_download_the_company_report(): void
    {
        $user = User::factory()->create(['rol' => 'user']);
        Sanctum::actingAs($user);

        $this->get('/api/reports/time-entries.xlsx')->assertForbidden();
    }

    public function test_an_admin_can_download_an_organized_excel_report(): void
    {
        $admin = User::factory()->create(['rol' => 'admin']);
        $worker = User::factory()->create([
            'nombre' => 'Ana Pérez',
            'correo' => 'ana@tempo.test',
            'rol' => 'user',
        ]);
        $this->createEntry($worker, 'registro-reporte');
        Sanctum::actingAs($admin);

        $response = $this->get('/api/reports/time-entries.xlsx?desde=2026-11-01&hasta=2026-11-30');

        $response
            ->assertOk()
            ->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        $temporaryFile = tempnam(sys_get_temp_dir(), 'tempo-reporte-');
        file_put_contents($temporaryFile, $response->streamedContent());

        try {
            $spreadsheet = IOFactory::load($temporaryFile);
            $this->assertSame(['Resumen', 'Registros'], $spreadsheet->getSheetNames());

            $summary = $spreadsheet->getSheetByName('Resumen')->toArray(null, false, false, false);
            $entries = $spreadsheet->getSheetByName('Registros')->toArray(null, false, false, false);

            $this->assertSame('Ana Pérez', $summary[7][1]);
            $this->assertSame('ana@tempo.test', $summary[7][2]);
            $this->assertSame('Ana Pérez', $entries[4][2]);
            $this->assertSame('ana@tempo.test', $entries[4][3]);
            $this->assertSame(60, $entries[4][8]);
            $this->assertSame(1.0, $entries[4][9]);
        } finally {
            unlink($temporaryFile);
        }
    }

    public function test_the_report_can_filter_by_date(): void
    {
        $admin = User::factory()->create(['rol' => 'admin']);
        $worker = User::factory()->create(['rol' => 'user']);
        $this->createEntry($worker, 'registro-antiguo', ['fecha' => '2026-11-01']);
        $this->createEntry($worker, 'registro-incluido', ['fecha' => '2026-11-04']);
        Sanctum::actingAs($admin);

        $response = $this->get('/api/reports/time-entries.xlsx?desde=2026-11-04&hasta=2026-11-04');
        $temporaryFile = tempnam(sys_get_temp_dir(), 'tempo-reporte-');
        file_put_contents($temporaryFile, $response->streamedContent());

        try {
            $entries = IOFactory::load($temporaryFile)->getSheetByName('Registros')->toArray(null, false, false, false);

            $this->assertSame('registro-incluido', $entries[4][0]);
            $this->assertSame('TOTAL', $entries[5][0]);
        } finally {
            unlink($temporaryFile);
        }
    }

    /** @param array<string, mixed> $overrides */
    private function createEntry(User $user, string $originId, array $overrides = []): TimeEntry
    {
        return TimeEntry::create(array_merge([
            'id_origen' => $originId,
            'usuario_id' => $user->id,
            'descripcion' => 'Trabajo de prueba',
            'fecha' => '2026-11-04',
            'hora_inicio' => '09:00',
            'hora_fin' => '10:00',
            'duracion_minutos' => 60,
            'es_facturable' => true,
        ], $overrides));

    }
}
