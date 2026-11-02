<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\StatusController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProjectController;

Route::get('/status', [StatusController::class, 'index']);

Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1');

Route::post('/logout', [AuthController::class, 'logout'])
    ->middleware('auth:sanctum');

Route::get('/clients', [ClientController::class, 'index'])
    ->middleware('auth:sanctum')
    ->middleware('can:viewAny,App\Models\Client');

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