<?php

namespace App\Auth;

use Illuminate\Auth\Passwords\DatabaseTokenRepository;
use Illuminate\Contracts\Auth\CanResetPassword;
use Illuminate\Support\Carbon;

class SpanishDatabaseTokenRepository extends DatabaseTokenRepository
{
    protected function deleteExisting(CanResetPassword $user)
    {
        return $this->getTable()
            ->where('correo', $user->getEmailForPasswordReset())
            ->delete();
    }

    protected function getPayload($email, $token)
    {
        return [
            'correo' => $email,
            'token' => $this->hasher->make($token),
            'creado_en' => new Carbon,
        ];
    }

    public function exists(CanResetPassword $user, $token)
    {
        $record = (array) $this->getTable()
            ->where('correo', $user->getEmailForPasswordReset())
            ->first();

        return $record
            && ! $this->tokenExpired($record['creado_en'])
            && $this->hasher->check($token, $record['token']);
    }

    public function recentlyCreatedToken(CanResetPassword $user)
    {
        $record = (array) $this->getTable()
            ->where('correo', $user->getEmailForPasswordReset())
            ->first();

        return $record && $this->tokenRecentlyCreated($record['creado_en']);
    }

    public function deleteExpired()
    {
        $expiredAt = Carbon::now()->subSeconds($this->expires);

        $this->getTable()->where('creado_en', '<', $expiredAt)->delete();
    }
}
