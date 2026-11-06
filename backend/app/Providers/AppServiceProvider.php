<?php

namespace App\Providers;

use App\Auth\SpanishPasswordBrokerManager;
use App\Database\Migrations\SpanishMigrationRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->extend('migration.repository', function ($repository, $app) {
            return new SpanishMigrationRepository(
                $app['db'],
                (string) config('database.migrations.table', 'migraciones'),
            );
        });

        $this->app->extend('auth.password', function ($manager, $app) {
            return new SpanishPasswordBrokerManager($app);
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
    }
}
