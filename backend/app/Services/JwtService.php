<?php

namespace App\Services;

use Illuminate\Support\Str;
use RuntimeException;

class JwtService
{
    public function issue(int $userId, string $type, int $ttlSeconds): string
    {
        $now = time();
        $header = $this->encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = $this->encode([
            'sub' => $userId,
            'typ' => $type,
            'iat' => $now,
            'exp' => $now + $ttlSeconds,
            'jti' => (string) Str::uuid(),
        ]);
        $unsigned = $header.'.'.$payload;

        return $unsigned.'.'.$this->base64UrlEncode(hash_hmac('sha256', $unsigned, $this->secret(), true));
    }

    /** @return array{sub: int, typ: string, exp: int, jti: string} */
    public function verify(string $token, string $expectedType): array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            throw new RuntimeException('Token inválido.');
        }

        [$header, $payload, $signature] = $parts;
        $headerData = json_decode($this->base64UrlDecode($header), true);
        $claims = json_decode($this->base64UrlDecode($payload), true);
        $expectedSignature = $this->base64UrlEncode(hash_hmac('sha256', $header.'.'.$payload, $this->secret(), true));

        if (! is_array($headerData) || ($headerData['alg'] ?? null) !== 'HS256'
            || ! is_array($claims) || ! hash_equals($expectedSignature, $signature)
            || ($claims['typ'] ?? null) !== $expectedType
            || ! is_numeric($claims['sub'] ?? null)
            || ! is_numeric($claims['exp'] ?? null)
            || (int) $claims['exp'] <= time()) {
            throw new RuntimeException('Token inválido o vencido.');
        }

        return [
            'sub' => (int) $claims['sub'],
            'typ' => (string) $claims['typ'],
            'exp' => (int) $claims['exp'],
            'jti' => (string) ($claims['jti'] ?? ''),
        ];
    }

    private function secret(): string
    {
        $secret = (string) config('app.jwt_secret');
        if (strlen($secret) < 32) {
            throw new RuntimeException('JWT_SECRET debe tener al menos 32 caracteres.');
        }

        return $secret;
    }

    private function encode(array $data): string
    {
        return $this->base64UrlEncode(json_encode($data, JSON_THROW_ON_ERROR));
    }

    private function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $value): string
    {
        $decoded = base64_decode(strtr($value, '-_', '+/'), true);
        if ($decoded === false) {
            throw new RuntimeException('Token inválido.');
        }

        return $decoded;
    }
}
