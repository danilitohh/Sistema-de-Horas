<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        foreach ([
            'Conecta',
            'Expansión profesional',
            'Global',
            'GSS Web',
            'Internacional',
            'PEAP',
            'Portal Mexico',
            'Portales LatAm',
            'Procodesk',
            'S4Learning',
            'Transversal',
            'UCamp',
            'Utel LatAm',
            'Utel Mex',
            'UtelX',
            'Web',
        ] as $nombre) {
            if (DB::table('clientes')->where('nombre', $nombre)->exists()) {
                continue;
            }

            DB::table('clientes')->insert([
                'nombre' => $nombre,
                'creado_en' => $now,
                'actualizado_en' => $now,
            ]);
        }
    }

    public function down(): void
    {
        // No se eliminan clientes existentes al revertir migraciones.
    }
};
