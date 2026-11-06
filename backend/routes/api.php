<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\StatusController;
use App\Http\Controllers\Api\TimeEntryController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/status', [StatusController::class, 'index']);

Route::post('/login', [AuthController::class, 'login']);

Route::post('/refresh', [AuthController::class, 'refresh'])->middleware('throttle:10,1');

Route::middleware(['jwt', 'throttle:60,1'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::patch('/me/password', [AuthController::class, 'changePassword'])->middleware('throttle:5,1');
    Route::get('/me', function (Request $request) {
        $user = $request->user();

        return response()->json(['user' => [
            'id' => $user->id,
            'name' => $user->nombre,
            'email' => $user->correo,
            'role' => $user->roleCode(),
        ]]);
    });

    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/analytics', [AdminController::class, 'analytics']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::post('/users', [AdminController::class, 'storeUser']);
        Route::patch('/users/{user}', [AdminController::class, 'updateUser']);
        Route::delete('/users/{user}', [AdminController::class, 'deleteUser']);
        Route::get('/roles', [AdminController::class, 'roles']);
        Route::patch('/roles/{role}', [AdminController::class, 'updateRole']);
    });

    Route::get('/time-entries', [TimeEntryController::class, 'index']);
    Route::post('/time-entries', [TimeEntryController::class, 'store']);
    Route::get('/time-entries/{id}', [TimeEntryController::class, 'show']);
    Route::put('/time-entries/{id}', [TimeEntryController::class, 'update']);
    Route::delete('/time-entries/{id}', [TimeEntryController::class, 'destroy']);

    Route::get('/reports/time-entries.xlsx', [ReportController::class, 'timeEntries'])->middleware('role:admin');

    Route::get('/clients', [ClientController::class, 'index'])->middleware('role:admin');

    Route::post('/clients', [ClientController::class, 'store'])->middleware('role:admin');
    Route::patch('/clients/{client}', [ClientController::class, 'update'])->middleware('role:admin');
    Route::delete('/clients/{client}', [ClientController::class, 'destroy'])->middleware('role:admin');

    Route::get('/projects', [ProjectController::class, 'index']);

    Route::post('/projects', [ProjectController::class, 'store'])->middleware('role:admin');

    Route::get('/projects/{project}', [ProjectController::class, 'show']);

    Route::patch('/projects/{project}', [ProjectController::class, 'update'])->middleware('role:admin');

    Route::delete('/projects/{project}', [ProjectController::class, 'destroy'])->middleware('role:admin');
});
