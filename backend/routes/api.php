<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\StatusController;
use App\Http\Controllers\Api\ClientController;

Route::get('/status', [StatusController::class, 'index']);

Route::get('/clients', [ClientController::class, 'index'])
    ->middleware('auth:sanctum')
    ->middleware('can:viewAny,App\Models\Client');
  