<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Services\JwtService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class AuthenticateJwt
{
    public function __construct(private JwtService $jwt) {}

    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();
        if (! $token) {
            return response()->json(['message' => 'Autenticación requerida.'], 401);
        }

        try {
            $claims = $this->jwt->verify($token, 'access');
            $user = User::query()->find($claims['sub']);
            if (! $user) {
                return response()->json(['message' => 'La sesión no es válida.'], 401);
            }

            $request->setUserResolver(fn () => $user);
        } catch (Throwable) {
            return response()->json(['message' => 'Token inválido o vencido.'], 401);
        }

        return $next($request);
    }
}
