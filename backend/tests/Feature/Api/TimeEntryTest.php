<?php

namespace Tests\Feature\Api;

use App\Models\TimeEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TimeEntryTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_access_time_entries(): void
    {
        $this->getJson('/api/time-entries')->assertUnauthorized();
        $this->postJson('/api/time-entries', [])->assertUnauthorized();
    }

    public function test_a_normal_user_can_create_a_time_entry(): void
    {
        $user = User::factory()->create(['rol' => 'user']);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/time-entries', [
            'id' => 'registro-normal-1',
            'proyectoId' => 'proyecto-1',
            'tareaId' => 'tarea-1',
            'descripcion' => 'Trabajo de prueba',
            'fecha' => '2026-11-04',
            'horaInicio' => '09:00',
            'horaFin' => '10:30',
            'duracionMinutos' => 90,
            'esFacturable' => true,
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.id', 'registro-normal-1')
            ->assertJsonPath('data.usuarioId', (string) $user->id)
            ->assertJsonPath('data.duracionMinutos', 90);

        $this->assertDatabaseHas('registros_horas', [
            'id_origen' => 'registro-normal-1',
            'usuario_id' => $user->id,
            'proyecto_id_origen' => 'proyecto-1',
            'duracion_minutos' => 90,
        ]);
    }

    public function test_a_normal_user_cannot_assign_an_entry_to_another_user(): void
    {
        $user = User::factory()->create(['rol' => 'user']);
        $otherUser = User::factory()->create(['rol' => 'user']);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/time-entries', [
            'proyectoId' => 'proyecto-1',
            'usuarioId' => $otherUser->id,
            'descripcion' => 'Registro propio',
            'fecha' => '2026-11-04',
            'duracionMinutos' => 30,
            'esFacturable' => false,
        ]);

        $response->assertCreated()->assertJsonPath('data.usuarioId', (string) $user->id);
        $this->assertDatabaseHas('registros_horas', [
            'usuario_id' => $user->id,
            'descripcion' => 'Registro propio',
        ]);
    }

    public function test_a_normal_user_only_sees_their_own_entries(): void
    {
        $user = User::factory()->create(['rol' => 'user']);
        $otherUser = User::factory()->create(['rol' => 'user']);
        $ownEntry = $this->createEntry($user, 'registro-propio');
        $this->createEntry($otherUser, 'registro-ajeno');
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/time-entries');

        $response->assertOk()->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.id', $ownEntry->id_origen);
    }

    public function test_an_admin_can_see_entries_from_all_users(): void
    {
        $admin = User::factory()->create(['rol' => 'admin']);
        $user = User::factory()->create(['rol' => 'user']);
        $this->createEntry($admin, 'registro-admin');
        $this->createEntry($user, 'registro-usuario');
        Sanctum::actingAs($admin);

        $this->getJson('/api/time-entries')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_a_normal_user_can_update_and_delete_their_own_entry(): void
    {
        $user = User::factory()->create(['rol' => 'user']);
        $entry = $this->createEntry($user, 'registro-editable');
        Sanctum::actingAs($user);

        $this->putJson('/api/time-entries/registro-editable', [
            'descripcion' => 'Descripción actualizada',
            'duracionMinutos' => 120,
        ])
            ->assertOk()
            ->assertJsonPath('data.descripcion', 'Descripción actualizada')
            ->assertJsonPath('data.duracionMinutos', 120);

        $this->assertDatabaseHas('registros_horas', [
            'id' => $entry->id,
            'descripcion' => 'Descripción actualizada',
            'duracion_minutos' => 120,
        ]);

        $this->deleteJson('/api/time-entries/registro-editable')
            ->assertOk();

        $this->assertDatabaseMissing('registros_horas', ['id' => $entry->id]);
    }

    public function test_a_normal_user_cannot_read_update_or_delete_another_users_entry(): void
    {
        $owner = User::factory()->create(['rol' => 'user']);
        $otherUser = User::factory()->create(['rol' => 'user']);
        $entry = $this->createEntry($owner, 'registro-protegido');
        Sanctum::actingAs($otherUser);

        $this->getJson('/api/time-entries/registro-protegido')->assertNotFound();
        $this->putJson('/api/time-entries/registro-protegido', [
            'descripcion' => 'No permitido',
        ])->assertNotFound();
        $this->deleteJson('/api/time-entries/registro-protegido')->assertNotFound();

        $this->assertDatabaseHas('registros_horas', [
            'id' => $entry->id,
            'descripcion' => 'Registro de prueba',
        ]);
    }

    public function test_a_time_entry_rejects_an_invalid_time_range(): void
    {
        $user = User::factory()->create(['rol' => 'user']);
        Sanctum::actingAs($user);

        $this->postJson('/api/time-entries', [
            'proyectoId' => 'proyecto-1',
            'descripcion' => 'Horario inválido',
            'fecha' => '2026-11-04',
            'horaInicio' => '11:00',
            'horaFin' => '10:00',
            'duracionMinutos' => 60,
            'esFacturable' => false,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['horaFin']);
    }

    public function test_a_time_entry_rejects_a_future_date(): void
    {
        $user = User::factory()->create(['rol' => 'user']);
        Sanctum::actingAs($user);

        $this->postJson('/api/time-entries', [
            'proyectoId' => 'proyecto-1',
            'descripcion' => 'Fecha futura',
            'fecha' => now()->addDay()->toDateString(),
            'duracionMinutos' => 60,
            'esFacturable' => false,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['fecha']);
    }

    /** @param array<string, mixed> $overrides */
    private function createEntry(User $user, string $originId, array $overrides = []): TimeEntry
    {
        return TimeEntry::create(array_merge([
            'id_origen' => $originId,
            'usuario_id' => $user->id,
            'proyecto_id_origen' => 'proyecto-1',
            'descripcion' => 'Registro de prueba',
            'fecha' => '2026-11-04',
            'hora_inicio' => '09:00',
            'hora_fin' => '10:00',
            'duracion_minutos' => 60,
            'es_facturable' => true,
        ], $overrides));
    }
}
