<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\TimeEntry;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class TimeEntryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $this->authenticatedUser($request);
        $perPage = min(max($request->integer('per_page', 100), 1), 100);
        $entries = $this->visibleEntries($user)
            ->orderByDesc('fecha')
            ->orderByDesc('id')
            ->paginate($perPage);

        return response()->json([
            'data' => $entries->getCollection()
                ->map(fn (TimeEntry $entry): array => $this->toDto($entry))
                ->values(),
            'meta' => [
                'current_page' => $entries->currentPage(),
                'last_page' => $entries->lastPage(),
                'per_page' => $entries->perPage(),
                'total' => $entries->total(),
            ],
            'message' => 'Listado de registros de horas',
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $this->authenticatedUser($request);
        $validated = $request->validate($this->storeRules());
        $validated['descripcion'] = trim($validated['descripcion']);
        $this->validateDescription($validated['descripcion']);
        $this->validateTimeRange($validated['horaInicio'] ?? null, $validated['horaFin'] ?? null);

        $legacyId = trim((string) ($validated['id'] ?? '')) ?: 'reg-'.Str::uuid();
        $projectId = $this->resolveProjectId($validated['proyectoId']);
        $attributes = [
            'id_origen' => $legacyId,
            'usuario_id_origen' => null,
            'proyecto_id_origen' => $projectId === null ? $validated['proyectoId'] : null,
            'usuario_id' => $user->getKey(),
            'proyecto_id' => $projectId,
            'tarea_id' => $validated['tareaId'] ?? null,
            'descripcion' => $validated['descripcion'],
            'fecha' => $validated['fecha'],
            'hora_inicio' => $validated['horaInicio'] ?? null,
            'hora_fin' => $validated['horaFin'] ?? null,
            'duracion_minutos' => $validated['duracionMinutos'],
            'es_facturable' => $validated['esFacturable'],
            'creado_en_origen' => isset($validated['creadoEn'])
                ? Carbon::parse($validated['creadoEn'])
                : null,
        ];

        $entry = TimeEntry::query()->firstOrCreate(
            ['id_origen' => $legacyId],
            $attributes
        );

        if ((string) $entry->usuario_id !== (string) $user->getKey() && ! $user->hasRole('admin')) {
            abort(409, 'El identificador del registro ya está en uso.');
        }

        return response()->json([
            'data' => $this->toDto($entry),
            'message' => $entry->wasRecentlyCreated
                ? 'Registro de horas guardado correctamente'
                : 'El registro ya estaba guardado',
        ], $entry->wasRecentlyCreated ? 201 : 200);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $entry = $this->findVisibleEntry($this->authenticatedUser($request), $id);

        return response()->json([
            'data' => $this->toDto($entry),
            'message' => 'Registro de horas',
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $user = $this->authenticatedUser($request);
        $entry = $this->findVisibleEntry($user, $id);
        $validated = $request->validate($this->updateRules());

        if (array_key_exists('descripcion', $validated)) {
            $validated['descripcion'] = trim($validated['descripcion']);
            $this->validateDescription($validated['descripcion']);
        }

        $startTime = array_key_exists('horaInicio', $validated)
            ? $validated['horaInicio']
            : $entry->hora_inicio;
        $endTime = array_key_exists('horaFin', $validated)
            ? $validated['horaFin']
            : $entry->hora_fin;
        $this->validateTimeRange($startTime, $endTime);

        $attributes = [];

        if (array_key_exists('proyectoId', $validated)) {
            $projectId = $this->resolveProjectId($validated['proyectoId']);
            $attributes['proyecto_id'] = $projectId;
            $attributes['proyecto_id_origen'] = $projectId === null
                ? $validated['proyectoId']
                : null;
        }

        foreach ([
            'tareaId' => 'tarea_id',
            'descripcion' => 'descripcion',
            'fecha' => 'fecha',
            'horaInicio' => 'hora_inicio',
            'horaFin' => 'hora_fin',
            'duracionMinutos' => 'duracion_minutos',
            'esFacturable' => 'es_facturable',
        ] as $input => $column) {
            if (array_key_exists($input, $validated)) {
                $attributes[$column] = $validated[$input];
            }
        }

        if ($attributes !== []) {
            $entry->fill($attributes)->save();
        }

        return response()->json([
            'data' => $this->toDto($entry->refresh()),
            'message' => 'Registro de horas actualizado correctamente',
        ]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $entry = $this->findVisibleEntry($this->authenticatedUser($request), $id);
        $entry->delete();

        return response()->json([
            'message' => 'Registro de horas eliminado correctamente',
        ]);
    }

    /** @return array<string, array<int, string>> */
    private function storeRules(): array
    {
        return [
            'id' => ['sometimes', 'nullable', 'string', 'max:100'],
            'proyectoId' => ['required', 'string', 'max:100'],
            'tareaId' => ['sometimes', 'nullable', 'string', 'max:100'],
            'descripcion' => ['required', 'string', 'max:10000'],
            'fecha' => ['required', 'date_format:Y-m-d', 'before_or_equal:today'],
            'horaInicio' => ['sometimes', 'nullable', 'date_format:H:i'],
            'horaFin' => ['sometimes', 'nullable', 'date_format:H:i'],
            'duracionMinutos' => ['required', 'integer', 'min:1', 'max:1440'],
            'esFacturable' => ['required', 'boolean'],
            'creadoEn' => ['sometimes', 'nullable', 'date'],
        ];
    }

    /** @return array<string, array<int, string>> */
    private function updateRules(): array
    {
        return [
            'proyectoId' => ['sometimes', 'required', 'string', 'max:100'],
            'tareaId' => ['sometimes', 'nullable', 'string', 'max:100'],
            'descripcion' => ['sometimes', 'required', 'string', 'max:10000'],
            'fecha' => ['sometimes', 'required', 'date_format:Y-m-d', 'before_or_equal:today'],
            'horaInicio' => ['sometimes', 'nullable', 'date_format:H:i'],
            'horaFin' => ['sometimes', 'nullable', 'date_format:H:i'],
            'duracionMinutos' => ['sometimes', 'required', 'integer', 'min:1', 'max:1440'],
            'esFacturable' => ['sometimes', 'required', 'boolean'],
        ];
    }

    private function authenticatedUser(Request $request): User
    {
        $user = $request->user();
        abort_unless($user instanceof User, 401);

        return $user;
    }

    /** @return Builder<TimeEntry> */
    private function visibleEntries(User $user): Builder
    {
        $query = TimeEntry::query();

        if (! $user->hasRole('admin')) {
            $query->where('usuario_id', $user->getKey());
        }

        return $query;
    }

    private function findVisibleEntry(User $user, string $id): TimeEntry
    {
        return $this->visibleEntries($user)
            ->where(function (Builder $query) use ($id): void {
                $query->where('id_origen', $id);

                if (ctype_digit($id)) {
                    $query->orWhere('id', (int) $id);
                }
            })
            ->firstOrFail();
    }

    private function resolveProjectId(string $projectReference): ?int
    {
        if (! ctype_digit($projectReference)) {
            return null;
        }

        $projectId = (int) $projectReference;

        return Project::query()->whereKey($projectId)->exists() ? $projectId : null;
    }

    private function validateTimeRange(?string $startTime, ?string $endTime): void
    {
        if ($startTime === null || $endTime === null) {
            return;
        }

        if (substr($startTime, 0, 5) >= substr($endTime, 0, 5)) {
            throw ValidationException::withMessages([
                'horaFin' => 'La hora de fin debe ser posterior a la hora de inicio.',
            ]);
        }
    }

    private function validateDescription(string $description): void
    {
        if ($description !== '') {
            return;
        }

        throw ValidationException::withMessages([
            'descripcion' => 'La descripción no puede estar vacía.',
        ]);
    }

    /** @return array<string, bool|int|string|null> */
    private function toDto(TimeEntry $entry): array
    {
        $createdAt = $entry->creado_en_origen ?? $entry->creado_en;

        return [
            'id' => (string) ($entry->id_origen ?? $entry->getKey()),
            'usuarioId' => (string) ($entry->usuario_id_origen ?? $entry->usuario_id ?? ''),
            'proyectoId' => (string) ($entry->proyecto_id_origen ?? $entry->proyecto_id ?? ''),
            'tareaId' => $entry->tarea_id,
            'descripcion' => $entry->descripcion ?? '',
            'fecha' => $entry->fecha->format('Y-m-d'),
            'horaInicio' => $this->formatTime($entry->hora_inicio),
            'horaFin' => $this->formatTime($entry->hora_fin),
            'duracionMinutos' => (int) $entry->duracion_minutos,
            'esFacturable' => (bool) $entry->es_facturable,
            'creadoEn' => $createdAt?->toISOString(),
        ];
    }

    private function formatTime(?string $time): ?string
    {
        return $time === null ? null : substr($time, 0, 5);
    }
}
