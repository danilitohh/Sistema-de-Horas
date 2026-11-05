<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ChangePasswordRequest;
use App\Http\Requests\Api\LoginRequest;
use App\Http\Requests\Api\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = User::create([
            'nombre' => $data['name'],
            'correo' => $data['email'],
            'contrasena' => Hash::make($data['password']),
            'rol' => 'user',
        ]);

        $token = $user->createToken('tempo-api')->plainTextToken;

        return response()->json([
            'message' => 'Usuario registrado correctamente.',
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $this->userData($user),
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();

        $user = User::where('correo', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->contrasena)) {
            return response()->json([
                'message' => 'Credenciales incorrectas.',
            ], 401);
        }

        $token = $user->createToken('tempo-api')->plainTextToken;

        return response()->json([
            'message' => 'Inicio de sesión exitoso.',
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $this->userData($user),
        ], 200);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada correctamente.',
        ], 200);
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
            'contrasena' => $request->string('password')->toString(),
        ])->save();

        return response()->json([
            'message' => 'Contraseña actualizada correctamente.',
        ]);
    }

    /** @return array{id: int, name: ?string, email: ?string, role: ?string} */
    private function userData(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->nombre,
            'email' => $user->correo,
            'role' => $user->rol,
        ];
    }
}
