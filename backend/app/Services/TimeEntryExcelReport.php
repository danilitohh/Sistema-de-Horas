<?php

namespace App\Services;

use App\Models\TimeEntry;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

final class TimeEntryExcelReport
{
    /** @param array<string, mixed> $filters */
    public function build(array $filters): Spreadsheet
    {
        $rows = $this->rows($this->query($filters)->get());
        $spreadsheet = new Spreadsheet;
        $spreadsheet->getProperties()
            ->setCreator('TEMPO')
            ->setTitle('Reporte de horas TEMPO')
            ->setSubject('Horas registradas por trabajador');

        $this->addSummarySheet($spreadsheet->getActiveSheet(), $rows, $filters);
        $this->addEntriesSheet($spreadsheet->createSheet(), $rows, $filters);
        $spreadsheet->setActiveSheetIndex(0);

        return $spreadsheet;
    }

    /** @param array<string, mixed> $filters */
    public function filename(array $filters): string
    {
        $desde = $filters['desde'] ?? null;
        $hasta = $filters['hasta'] ?? null;
        $periodo = $desde && $hasta
            ? $desde.'_'.$hasta
            : ($desde ?: ($hasta ?: now()->format('Ymd')));

        return 'Reporte_horas_TEMPO_'.$periodo.'.xlsx';
    }

    /** @param array<string, mixed> $filters */
    private function query(array $filters): Builder
    {
        $query = TimeEntry::query()
            ->select([
                'id',
                'id_origen',
                'usuario_id',
                'usuario_id_origen',
                'proyecto_id',
                'proyecto_id_origen',
                'tarea_id',
                'descripcion',
                'fecha',
                'hora_inicio',
                'hora_fin',
                'duracion_minutos',
                'es_facturable',
                'creado_en_origen',
                'creado_en',
            ])
            ->with([
                'user:id,nombre,correo,rol',
                'project:id,nombre,codigo',
            ])
            ->orderBy('usuario_id')
            ->orderBy('fecha')
            ->orderBy('id');

        if (! empty($filters['desde'])) {
            $query->whereDate('fecha', '>=', $filters['desde']);
        }

        if (! empty($filters['hasta'])) {
            $query->whereDate('fecha', '<=', $filters['hasta']);
        }

        if (isset($filters['usuarioId']) && $filters['usuarioId'] !== null) {
            $query->where('usuario_id', (int) $filters['usuarioId']);
        }

        if (! empty($filters['proyectoId'])) {
            $proyectoId = (string) $filters['proyectoId'];
            $query->where(function (Builder $builder) use ($proyectoId): void {
                $builder->where('proyecto_id_origen', $proyectoId);

                if (ctype_digit($proyectoId)) {
                    $builder->orWhere('proyecto_id', (int) $proyectoId);
                }
            });
        }

        if (isset($filters['facturable']) && $filters['facturable'] !== null) {
            $query->where('es_facturable', (bool) $filters['facturable']);
        }

        return $query;
    }

    /** @return array<int, array<string, mixed>> */
    private function rows(Collection $entries): array
    {
        return $entries
            ->map(fn (TimeEntry $entry): array => $this->row($entry))
            ->values()
            ->all();
    }

    /** @return array<string, mixed> */
    private function row(TimeEntry $entry): array
    {
        $minutes = (int) $entry->duracion_minutos;
        $user = $entry->user;
        $project = $entry->project;
        $createdAt = $entry->creado_en_origen ?? $entry->creado_en;
        $workerId = $entry->usuario_id ?? $entry->usuario_id_origen ?? '';
        $projectId = $entry->proyecto_id ?? $entry->proyecto_id_origen ?? '';

        return [
            'registro_id' => (string) ($entry->id_origen ?? $entry->id),
            'usuario_id' => (string) $workerId,
            'trabajador' => $user?->nombre ?? 'Sin usuario vinculado',
            'correo' => $user?->correo ?? '',
            'rol' => $this->roleLabel($user?->rol),
            'fecha' => $entry->fecha?->format('Y-m-d') ?? '',
            'hora_inicio' => $this->time($entry->hora_inicio),
            'hora_fin' => $this->time($entry->hora_fin),
            'duracion_minutos' => $minutes,
            'horas' => round($minutes / 60, 2),
            'facturable' => $entry->es_facturable ? 'Sí' : 'No',
            'proyecto_id' => (string) $projectId,
            'proyecto' => $project?->nombre ?? 'Sin proyecto vinculado',
            'codigo_proyecto' => $project?->codigo ?? '',
            'tarea_id' => (string) ($entry->tarea_id ?? ''),
            'descripcion' => (string) ($entry->descripcion ?? ''),
            'creado_en' => $this->dateTime($createdAt),
        ];
    }

    /** @param array<int, array<string, mixed>> $rows */
    /** @param array<string, mixed> $filters */
    private function addSummarySheet(Worksheet $sheet, array $rows, array $filters): void
    {
        $sheet->setTitle('Resumen');
        $this->configureSheet($sheet);
        $sheet->mergeCells('A1:H1');
        $sheet->setCellValue('A1', 'TEMPO - Reporte de horas por trabajador');
        $sheet->mergeCells('A2:H2');
        $sheet->setCellValue('A2', 'Periodo: '.$this->periodLabel($filters).' | Generado: '.now()->format('Y-m-d H:i'));
        $sheet->mergeCells('A3:H3');
        $sheet->setCellValue('A3', 'Este resumen permite revisar rápidamente el total de horas de cada trabajador.');

        $totalMinutes = array_sum(array_column($rows, 'duracion_minutos'));
        $billableMinutes = array_sum(array_map(
            fn (array $row): int => $row['facturable'] === 'Sí' ? (int) $row['duracion_minutos'] : 0,
            $rows
        ));
        $summaryRows = $this->summaryRows($rows);

        $kpis = [
            ['Registros', count($rows), 'Trabajadores', count($summaryRows), 'Horas totales', round($totalMinutes / 60, 2), 'Horas facturables', round($billableMinutes / 60, 2)],
        ];
        $sheet->fromArray($kpis, null, 'A5');
        $sheet->getStyle('A5:H5')->applyFromArray($this->kpiStyle());
        $sheet->getStyle('B5:B5')->getNumberFormat()->setFormatCode('0');
        $sheet->getStyle('D5:D5')->getNumberFormat()->setFormatCode('0');
        $sheet->getStyle('F5:H5')->getNumberFormat()->setFormatCode('0.00');

        $headers = ['Trabajador ID', 'Trabajador', 'Correo', 'Rol', 'Registros', 'Minutos', 'Horas', 'Horas facturables'];
        $sheet->fromArray($headers, null, 'A7');
        $this->styleHeader($sheet, 'A7:H7');

        $rowNumber = 8;
        foreach ($summaryRows as $summaryRow) {
            $sheet->fromArray(array_values($summaryRow), null, 'A'.$rowNumber);
            $rowNumber++;
        }

        $lastDataRow = $rowNumber - 1;
        if ($lastDataRow >= 8) {
            $this->styleData($sheet, 'A8:H'.$lastDataRow, 'H');
            $sheet->getStyle('G8:H'.$lastDataRow)->getNumberFormat()->setFormatCode('0.00');
            $sheet->setAutoFilter('A7:H'.$lastDataRow);
        }

        $sheet->setCellValue('A'.$rowNumber, 'TOTAL');
        $sheet->setCellValue('E'.$rowNumber, count($rows));
        $sheet->setCellValue('F'.$rowNumber, $totalMinutes);
        $sheet->setCellValue('G'.$rowNumber, round($totalMinutes / 60, 2));
        $sheet->setCellValue('H'.$rowNumber, round($billableMinutes / 60, 2));
        $sheet->getStyle('A'.$rowNumber.':H'.$rowNumber)->applyFromArray($this->totalStyle());
        $sheet->getStyle('G'.$rowNumber.':H'.$rowNumber)->getNumberFormat()->setFormatCode('0.00');
        $sheet->freezePane('A8');

        foreach (['A' => 18, 'B' => 28, 'C' => 34, 'D' => 18, 'E' => 12, 'F' => 12, 'G' => 12, 'H' => 18] as $column => $width) {
            $sheet->getColumnDimension($column)->setWidth($width);
        }
    }

    /** @param array<int, array<string, mixed>> $rows */
    /** @param array<string, mixed> $filters */
    private function addEntriesSheet(Worksheet $sheet, array $rows, array $filters): void
    {
        $sheet->setTitle('Registros');
        $this->configureSheet($sheet);
        $sheet->mergeCells('A1:Q1');
        $sheet->setCellValue('A1', 'TEMPO - Detalle de registros de horas');
        $sheet->mergeCells('A2:Q2');
        $sheet->setCellValue('A2', 'Periodo: '.$this->periodLabel($filters));

        $headers = [
            'ID registro',
            'ID trabajador',
            'Trabajador',
            'Correo',
            'Rol',
            'Fecha',
            'Hora inicio',
            'Hora fin',
            'Duración (minutos)',
            'Horas',
            'Facturable',
            'ID proyecto',
            'Proyecto',
            'Código proyecto',
            'ID tarea',
            'Descripción',
            'Creado en',
        ];
        $sheet->fromArray($headers, null, 'A4');
        $this->styleHeader($sheet, 'A4:Q4');

        $rowNumber = 5;
        foreach ($rows as $row) {
            $sheet->fromArray(array_values($row), null, 'A'.$rowNumber);
            $rowNumber++;
        }

        $lastDataRow = $rowNumber - 1;
        if ($lastDataRow >= 5) {
            $this->styleData($sheet, 'A5:Q'.$lastDataRow, 'Q');
            $sheet->getStyle('I5:I'.$lastDataRow)->getNumberFormat()->setFormatCode('0');
            $sheet->getStyle('J5:J'.$lastDataRow)->getNumberFormat()->setFormatCode('0.00');
            $sheet->setAutoFilter('A4:Q'.$lastDataRow);
        }

        $sheet->setCellValue('A'.$rowNumber, 'TOTAL');
        $sheet->setCellValue('I'.$rowNumber, array_sum(array_column($rows, 'duracion_minutos')));
        $sheet->setCellValue('J'.$rowNumber, round(array_sum(array_column($rows, 'duracion_minutos')) / 60, 2));
        $sheet->getStyle('A'.$rowNumber.':Q'.$rowNumber)->applyFromArray($this->totalStyle());
        $sheet->getStyle('J'.$rowNumber)->getNumberFormat()->setFormatCode('0.00');
        $sheet->freezePane('A5');

        foreach (['A' => 18, 'B' => 14, 'C' => 26, 'D' => 32, 'E' => 16, 'F' => 13, 'G' => 13, 'H' => 13, 'I' => 18, 'J' => 10, 'K' => 12, 'L' => 14, 'M' => 28, 'N' => 18, 'O' => 14, 'P' => 48, 'Q' => 20] as $column => $width) {
            $sheet->getColumnDimension($column)->setWidth($width);
        }
    }

    /** @param array<int, array<string, mixed>> $rows */
    /** @return array<int, array<int, mixed>> */
    private function summaryRows(array $rows): array
    {
        $groups = [];

        foreach ($rows as $row) {
            $key = $row['usuario_id'].'|'.$row['correo'];
            $groups[$key] ??= [
                $row['usuario_id'],
                $row['trabajador'],
                $row['correo'],
                $row['rol'],
                0,
                0,
                0.0,
                0.0,
            ];
            $groups[$key][4]++;
            $groups[$key][5] += $row['duracion_minutos'];
            $groups[$key][6] += $row['horas'];
            if ($row['facturable'] === 'Sí') {
                $groups[$key][7] += $row['horas'];
            }
        }

        usort($groups, fn (array $left, array $right): int => strcasecmp((string) $left[1], (string) $right[1]));

        return array_map(function (array $group): array {
            $group[6] = round($group[6], 2);
            $group[7] = round($group[7], 2);

            return $group;
        }, $groups);
    }

    private function configureSheet(Worksheet $sheet): void
    {
        $sheet->setShowGridlines(false);
        $sheet->getPageSetup()
            ->setOrientation(PageSetup::ORIENTATION_LANDSCAPE)
            ->setFitToWidth(1)
            ->setFitToHeight(0);
        $sheet->getPageMargins()
            ->setTop(0.4)
            ->setRight(0.3)
            ->setLeft(0.3)
            ->setBottom(0.4);
        $sheet->getStyle('A1:Q1000')->getFont()->setName('Aptos')->setSize(10);
        $sheet->getStyle('A1')->getFont()->setSize(16)->setBold(true);
        $sheet->getStyle('A2')->getFont()->setItalic(true)->getColor()->setARGB('FF64748B');
    }

    /** @return array<string, mixed> */
    private function kpiStyle(): array
    {
        return [
            'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF1F4E78']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ];
    }

    private function styleHeader(Worksheet $sheet, string $range): void
    {
        $sheet->getStyle($range)->applyFromArray([
            'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF1F4E78']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FFD9E2F3']]],
        ]);
        preg_match('/(\d+)$/', $range, $matches);
        $headerRow = (int) ($matches[1] ?? 1);
        $sheet->getRowDimension($headerRow)->setRowHeight(30);
    }

    private function styleData(Worksheet $sheet, string $range, string $lastColumn): void
    {
        $sheet->getStyle($range)->applyFromArray([
            'alignment' => ['vertical' => Alignment::VERTICAL_TOP, 'wrapText' => true],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_HAIR, 'color' => ['argb' => 'FFE2E8F0']]],
        ]);
        [$firstCell, $lastCell] = explode(':', $range);
        $firstRow = (int) preg_replace('/\D/', '', $firstCell);
        $lastRow = (int) preg_replace('/\D/', '', $lastCell);
        for ($row = $firstRow; $row <= $lastRow; $row += 2) {
            $sheet->getStyle('A'.$row.':'.$lastColumn.$row)->getFill()
                ->setFillType(Fill::FILL_SOLID)
                ->getStartColor()
                ->setARGB('FFF8FAFC');
        }
    }

    /** @return array<string, mixed> */
    private function totalStyle(): array
    {
        return [
            'font' => ['bold' => true, 'color' => ['argb' => 'FF0F172A']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFE2E8F0']],
            'borders' => ['top' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['argb' => 'FF1F4E78']]],
        ];
    }

    /** @param array<string, mixed> $filters */
    private function periodLabel(array $filters): string
    {
        $desde = $filters['desde'] ?? 'inicio';
        $hasta = $filters['hasta'] ?? 'hoy';

        return $desde.' a '.$hasta;
    }

    private function roleLabel(?string $role): string
    {
        return match ($role) {
            'admin' => 'Administrador',
            'user' => 'Usuario',
            'colaborador' => 'Colaborador',
            default => $role ?? '',
        };
    }

    private function time(?string $time): string
    {
        return $time === null ? '' : substr($time, 0, 5);
    }

    private function dateTime(mixed $value): string
    {
        if ($value === null || $value === '') {
            return '';
        }

        if ($value instanceof CarbonInterface) {
            return $value->format('Y-m-d H:i:s');
        }

        return Carbon::parse($value)->format('Y-m-d H:i:s');
    }
}
