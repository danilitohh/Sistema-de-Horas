<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class StatusController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'application' => 'TEMPO',
            'status' => 'ok',
            'message' => 'API funcionando correctamente',
        ]);
    }
}
  