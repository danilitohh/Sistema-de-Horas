
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\StatusController;

Route::get('/status', [StatusController::class, 'index']);
  