<?php

namespace Tests\Unit;

use App\Models\Project;
use App\Models\User;
use App\Policies\ProjectPolicy;
use PHPUnit\Framework\TestCase;

class ProjectPolicyTest extends TestCase
{
    private function userWithRole(string $role): User
    {
        $user = new User();
        $user->role = $role;

        return $user;
    }

    public function test_admin_and_user_can_view_projects(): void
    {
        $admin = $this->userWithRole('admin');
        $user = $this->userWithRole('user');
        $project = new Project();
        $policy = new ProjectPolicy();

        $this->assertTrue($policy->viewAny($admin));
        $this->assertTrue($policy->viewAny($user));
        $this->assertTrue($policy->view($admin, $project));
        $this->assertTrue($policy->view($user, $project));
    }

    public function test_only_admin_can_create_projects(): void
    {
        $policy = new ProjectPolicy();

        $this->assertTrue(
            $policy->create($this->userWithRole('admin'))
        );

        $this->assertFalse(
            $policy->create($this->userWithRole('user'))
        );
    }

    public function test_only_admin_can_update_and_delete_projects(): void
    {
        $admin = $this->userWithRole('admin');
        $user = $this->userWithRole('user');
        $project = new Project();
        $policy = new ProjectPolicy();

        $this->assertTrue($policy->update($admin, $project));
        $this->assertFalse($policy->update($user, $project));

        $this->assertTrue($policy->delete($admin, $project));
        $this->assertFalse($policy->delete($user, $project));
    }

    public function test_nobody_can_restore_or_force_delete_projects(): void
    {
        $admin = $this->userWithRole('admin');
        $user = $this->userWithRole('user');
        $project = new Project();
        $policy = new ProjectPolicy();

        $this->assertFalse($policy->restore($admin, $project));
        $this->assertFalse($policy->restore($user, $project));

        $this->assertFalse($policy->forceDelete($admin, $project));
        $this->assertFalse($policy->forceDelete($user, $project));
    }
}