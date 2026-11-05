<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        foreach ([
            'Acortador de enlaces',
            'AI Projects',
            'Avatar IA',
            'B2B UCamp',
            'B2B UtelX',
            'Becas',
            'Blogs Latam',
            'Brandbook',
            'Calendly',
            'CMS Strapi Mejoras/Fix',
            'Comparador-api',
            'ConectaTest',
            'Crawler de Contenidos',
            'Educación continua',
            'Emprendedores',
            'Equivalencias',
            'Evaluación de competencias',
            'Formularios',
            'Front Hub',
            'Generador de Fichas Tecnicas',
            'Generador de TYC',
            'Generador Landings',
            'Google Analytics & Ads - Portal LatAm',
            'Google Analytics & Ads - Portal Mex',
            'Google Analytics & Ads - Utel Mex',
            'Google Analytics & Ads - UtelX',
            'Google Analytics & GTM - Global',
            'HubSpot',
            'Integraciones - Altas Url',
            'Integración de formularios',
            'Integracion formularios',
            'Landing Pages Mexico',
            'Landings Global',
            'Landings Internacional',
            'Legion 1000',
            'Maquetación Aula Virtual',
            'Maquetación HTML',
            'Meets',
            'Performance Webs',
            'Portal de Solicitudes',
            'Premiaciones',
            'Primer Paso',
            'Proyecto Interno',
            'Pruebas QA',
            'Quiz',
            'Referidos',
            'Reportes',
            'Revista de Interactividad',
            'Scala HED - S4 Learning',
            'Servicios Escolares',
            'Siempre Utel',
            'Sociabble Utel',
            'Soporte Landings',
            'Soporte Landings Internacional',
            'Soporte Landings Mex',
            'Soporte Site',
            'Soporte Site CMS',
            'Soporte Web',
            'Super Orgánicos',
            'Talent land',
            'Talento Humano',
            'Test Vocacional',
            'Universidad Perú',
            'Usabilidad y Experiencia',
            'Utel Smart',
            'UtelHub',
            'Utelios',
            'UtelLabIA',
            'Zapier',
        ] as $nombre) {
            if (DB::table('proyectos')->where('nombre', $nombre)->exists()) {
                continue;
            }

            DB::table('proyectos')->insert([
                'cliente_id' => null,
                'nombre' => $nombre,
                'codigo' => null,
                'color' => null,
                'horas_estimadas' => null,
                'creado_en' => $now,
                'actualizado_en' => $now,
            ]);
        }
    }

    public function down(): void
    {
        // No se eliminan proyectos existentes al revertir migraciones.
    }
};
