<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ChangePasswordRequest;
use App\Http\Requests\Api\LoginRequest;
use App\Models\User;
use App\Services\JwtService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use RuntimeException;
use Throwable;

class AuthController extends Controller
{
    public function login(LoginRequest $request, JwtService $jwt): JsonResponse
    {
        $credentials = $request->validated();

        $user = User::where('correo', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->contrasena)) {
            return response()->json([
                'message' => 'Credenciales incorrectas.',
            ], 401);
        }

        return $this->tokenResponse($user, $jwt, 'Inicio de sesión exitoso.');
    }

    public function refresh(Request $request, JwtService $jwt): JsonResponse
    {
        $request->validate(['refresh_token' => ['required', 'string']]);

        try {
            $claims = $jwt->verify($request->string('refresh_token')->toString(), 'refresh');
            $user = User::query()->find($claims['sub']);
        } catch (Throwable) {
            $user = null;
        }

        if (! $user) {
            return response()->json(['message' => 'Refresh token inválido o vencido.'], 401);
        }

        return $this->tokenResponse($user, $jwt, 'Tokens renovados.');
    }

    public function logout(Request $request): JsonResponse
    {
        return response()->json(['message' => 'Sesión cerrada. El cliente debe descartar sus tokens.']);
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! Hash::check(
            $request->string('current_password')->toString(),
            $user->getAuthPassword()
        )) {
            return response()->json([
                'message' => 'La contraseña actual no es correcta.',
                'errors' => [
                    'current_password' => [
                        'La contraseña actual no es correcta.',
                    ],
                ],
            ], 422);
        }

        $user->forceFill([
            'contrasena' => Hash::make($request->string('password')->toString()),
        ])->save();

        return response()->json([
            'message' => 'Contraseña actualizada correctamente.',
        ]);
    }

    private function tokenResponse(User $user, JwtService $jwt, string $message): JsonResponse
    {
        return response()->json([
            'message' => $message,
            'token' => $jwt->issue($user->id, 'access', (int) config('app.jwt_access_ttl', 900)),
            'refresh_token' => $jwt->issue($user->id, 'refresh', (int) config('app.jwt_refresh_ttl', 604800)),
            'token_type' => 'Bearer',
            'expires_in' => (int) config('app.jwt_access_ttl', 900),
            'user' => $this->userData($user),
        ]);
    }

    /** @return array{id: int, name: ?string, email: ?string, role: string} */
    private function userData(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->nombre,
            'email' => $user->correo,
            'role' => $user->roleCode(),
        ];
    }
}
