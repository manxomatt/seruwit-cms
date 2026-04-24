<?php

namespace Tests\Feature\AccountManager;

use App\Models\AccountManager;
use App\Models\ReferralRelation;
use App\Models\User;
use App\Services\ExternalApiService;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Response as ClientResponse;
use Mockery\MockInterface;
use Tests\TestCase;

class DownlineControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $amUser;

    private AccountManager $accountManager;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([PermissionSeeder::class, RoleSeeder::class]);

        $this->amUser = User::factory()->withRole('account_manager')->create(['status' => 'active']);
        $this->accountManager = AccountManager::factory()->create(['user_id' => $this->amUser->id]);
    }

    // -------------------------------------------------------------------------
    // Index
    // -------------------------------------------------------------------------

    public function test_account_manager_can_access_downlines_index(): void
    {
        $response = $this->actingAs($this->amUser)
            ->get(route('account-manager.downlines.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('AccountManager/Downlines/Index'));
    }

    public function test_guest_cannot_access_downlines_index(): void
    {
        $response = $this->get(route('account-manager.downlines.index'));

        $response->assertRedirect(route('login'));
    }

    // -------------------------------------------------------------------------
    // Create
    // -------------------------------------------------------------------------

    public function test_account_manager_can_access_create_downline_form(): void
    {
        $response = $this->actingAs($this->amUser)
            ->get(route('account-manager.downlines.create'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('AccountManager/Downlines/Create'));
    }

    // -------------------------------------------------------------------------
    // Store – happy path
    // -------------------------------------------------------------------------

    public function test_account_manager_can_create_downline_successfully(): void
    {
        $fakeApiResponse = [
            'user' => [
                'id' => 99,
                'username' => 'newdownline',
                'email' => 'newdownline@example.com',
                'role' => 'external_user',
                'status' => 'active',
            ],
        ];

        $this->mock(ExternalApiService::class, function (MockInterface $mock) use ($fakeApiResponse) {
            $mockResponse = \Mockery::mock(ClientResponse::class);
            $mockResponse->shouldReceive('successful')->andReturn(true);
            $mockResponse->shouldReceive('json')->andReturn($fakeApiResponse);

            $mock->shouldReceive('post')
                ->once()
                ->with('/users', \Mockery::any())
                ->andReturn($mockResponse);
        });

        $response = $this->actingAs($this->amUser)
            ->post(route('account-manager.downlines.store'), [
                'username' => 'newdownline',
                'email' => 'newdownline@example.com',
                'password' => 'Password123!',
                'role' => 'external_user',
            ]);

        $response->assertRedirect(route('account-manager.downlines.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('users', [
            'email' => 'newdownline@example.com',
            'status' => 'inactive',
        ]);

        $this->assertDatabaseHas('referral_relations', [
            'account_manager_id' => $this->accountManager->id,
            'status' => ReferralRelation::STATUS_PENDING,
        ]);
    }

    public function test_store_returns_error_when_external_api_fails(): void
    {
        $this->mock(ExternalApiService::class, function (MockInterface $mock) {
            $mockResponse = \Mockery::mock(ClientResponse::class);
            $mockResponse->shouldReceive('successful')->andReturn(false);
            $mockResponse->shouldReceive('body')->andReturn('API Error');

            $mock->shouldReceive('post')
                ->once()
                ->andReturn($mockResponse);
        });

        $response = $this->actingAs($this->amUser)
            ->post(route('account-manager.downlines.store'), [
                'username' => 'failuser',
                'email' => 'failuser@example.com',
                'password' => 'Password123!',
                'role' => 'external_user',
            ]);

        $response->assertSessionHasErrors('external');
    }

    public function test_store_fails_validation_when_required_fields_missing(): void
    {
        $response = $this->actingAs($this->amUser)
            ->post(route('account-manager.downlines.store'), []);

        $response->assertSessionHasErrors(['username', 'email', 'password', 'role']);
    }

    // -------------------------------------------------------------------------
    // Index shows downlines
    // -------------------------------------------------------------------------

    public function test_index_shows_existing_downlines(): void
    {
        $downlineUser = User::factory()->withRole('external_user')->create();
        ReferralRelation::factory()->create([
            'account_manager_id' => $this->accountManager->id,
            'user_id' => $downlineUser->id,
            'status' => ReferralRelation::STATUS_APPROVED,
        ]);

        $response = $this->actingAs($this->amUser)
            ->get(route('account-manager.downlines.index'));

        $response->assertInertia(fn ($page) => $page
            ->component('AccountManager/Downlines/Index')
            ->has('downlines.data', 1)
            ->where('pendingCount', 0)
        );
    }
}
