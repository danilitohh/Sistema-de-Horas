<?php

namespace Tests\Unit;

use App\Models\Client;
use App\Models\User;
use App\Policies\ClientPolicy;
use PHPUnit\Framework\TestCase;

class ClientPolicyTest extends TestCase
{
    public function test_admin_can_create_clients(): void
    {
        $user = new User();
        $user->role = 'admin';

        $policy = new ClientPolicy();

        $this->assertTrue($policy->create($user));
    }

    public function test_normal_user_cannot_create_clients(): void
    {
        $user = new User();
        $user->role = 'user';

        $policy = new ClientPolicy();

        $this->assertFalse($policy->create($user));
    }

    public function test_admin_can_update_clients(): void
    {
        $user = new User();
        $user->role = 'admin';

        $client = new Client();
        $policy = new ClientPolicy();

        $this->assertTrue($policy->update($user, $client));
    }

    public function test_normal_user_cannot_update_clients(): void
    {
        $user = new User();
        $user->role = 'user';

        $client = new Client();
        $policy = new ClientPolicy();

        $this->assertFalse($policy->update($user, $client));
    }

    public function test_admin_can_delete_clients(): void
    {
        $user = new User();
        $user->role = 'admin';

        $client = new Client();
        $policy = new ClientPolicy();

        $this->assertTrue($policy->delete($user, $client));
    }

    public function test_normal_user_cannot_delete_clients(): void
    {
        $user = new User();
        $user->role = 'user';

        $client = new Client();
        $policy = new ClientPolicy();

        $this->assertFalse($policy->delete($user, $client));
    }
}
  