<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\StatusController;
use App\Http\Controllers\Api\TimeEntryController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/status', [StatusController::class, 'index']);

Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1');

Route::post('/logout', [AuthController::class, 'logout'])
    ->middleware('auth:sanctum');

Route::patch('/me/password', [AuthController::class, 'changePassword'])
    ->middleware(['auth:sanctum', 'throttle:5,1']);

Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    Route::get('/time-entries', [TimeEntryController::class, 'index']);
    Route::post('/time-entries', [TimeEntryController::class, 'store']);
    Route::get('/time-entries/{id}', [TimeEntryController::class, 'show']);
    Route::put('/time-entries/{id}', [TimeEntryController::class, 'update']);
    Route::delete('/time-entries/{id}', [TimeEntryController::class, 'destroy']);
});

Route::get('/reports/time-entries.xlsx', [ReportController::class, 'timeEntries'])
    ->middleware(['auth:sanctum', 'throttle:10,1']);

Route::get('/clients', [ClientController::class, 'index'])
    ->middleware('auth:sanctum')
    ->middleware('can:viewAny,App\Models\Client');

Route::post('/clients', [ClientController::class, 'store'])
    ->middleware('auth:sanctum')
    ->middleware('can:create,App\Models\Client');

Route::get('/projects', [ProjectController::class, 'index'])
    ->middleware('auth:sanctum')
    ->middleware('can:viewAny,App\Models\Project');

Route::post('/projects', [ProjectController::class, 'store'])
    ->middleware('auth:sanctum')
    ->middleware('can:create,App\Models\Project');

Route::get('/projects/{project}', [ProjectController::class, 'show'])
    ->middleware('auth:sanctum')
    ->middleware('can:view,project');

Route::patch('/projects/{project}', [ProjectController::class, 'update'])
    ->middleware('auth:sanctum')
    ->middleware('can:update,project');

Route::delete('/projects/{project}', [ProjectController::class, 'destroy'])
    ->middleware('auth:sanctum')
    ->middleware('can:delete,project');

Route::get('/me', function (Request $request) {
    $user = $request->user();

    return response()->json([
        'user' => [
            'id' => $user->id,
            'name' => $user->nombre,
            'email' => $user->correo,
            'role' => $user->rol,
        ],
    ]);
})->middleware('auth:sanctum');
