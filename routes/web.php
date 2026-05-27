<?php

use App\Http\Controllers\AccountManager\CommissionHistoryController as AccountManagerCommissionHistoryController;
use App\Http\Controllers\AccountManager\DashboardController as AccountManagerDashboardController;
use App\Http\Controllers\AccountManager\DownlineAssignmentController as AccountManagerDownlineAssignmentController;
use App\Http\Controllers\AccountManager\DownlineController as AccountManagerDownlineController;
use App\Http\Controllers\AccountManager\PayoutController as AccountManagerPayoutController;
use App\Http\Controllers\Admin\ReferralApprovalController;
use App\Http\Controllers\Billing\InvoiceController as BillingInvoiceController;
use App\Http\Controllers\Billing\PaymentCallbackController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\External\BillingTransactionHistoryController as ExternalBillingTransactionHistoryController;
use App\Http\Controllers\External\DashboardController as ExternalDashboardController;
use App\Http\Controllers\External\DeviceExtensionBillingController as ExternalDeviceExtensionBillingController;
use App\Http\Controllers\External\ObjectController as ExternalObjectController;
use App\Http\Controllers\External\QuotaCartController as ExternalQuotaCartController;
use App\Http\Controllers\External\QuotaReviewController as ExternalQuotaReviewController;
use App\Http\Controllers\External\QuotaUsageHistoryController as ExternalQuotaUsageHistoryController;
use App\Http\Controllers\External\UserController as ExternalUserController;
use App\Http\Controllers\External\WaitingReviewController as ExternalWaitingReviewController;
use App\Http\Controllers\LiveUpdateController;
use App\Http\Controllers\Module\AccountManagerController as ModuleAccountManagerController;
use App\Http\Controllers\Module\AnalyticsController as ModuleAnalyticsController;
use App\Http\Controllers\Module\BillingTransactionController as ModuleBillingTransactionController;
use App\Http\Controllers\Module\CarouselController as ModuleCarouselController;
use App\Http\Controllers\Module\CarouselImageController as ModuleCarouselImageController;
use App\Http\Controllers\Module\DashboardController as ModuleDashboardController;
use App\Http\Controllers\Module\GlobalSearchController as ModuleGlobalSearchController;
use App\Http\Controllers\Module\MediaController as ModuleMediaController;
use App\Http\Controllers\Module\PageController as ModulePageController;
use App\Http\Controllers\Module\PayoutApprovalController as ModulePayoutApprovalController;
use App\Http\Controllers\Module\PostController as ModulePostController;
use App\Http\Controllers\Module\RoleController as ModuleRoleController;
use App\Http\Controllers\Module\SettingController as ModuleSettingController;
use App\Http\Controllers\Module\UserController as ModuleUserController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TodoController;
use Illuminate\Support\Facades\Route;

Route::get('/', [PageController::class, 'homepage'])->name('home');

// Public Blog Routes
Route::get('/blog', [BlogController::class, 'index'])->name('blog.index');
Route::get('/blog/{slug}', [BlogController::class, 'show'])->name('blog.show');

Route::post('/billing/payment/callback', PaymentCallbackController::class)
    ->name('billing.payment.callback');

Route::get('/dashboard', [ModuleDashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// External API user dashboard
Route::get('/external/dashboard', [ExternalDashboardController::class, 'index'])
    ->middleware(['auth'])
    ->name('external.dashboard');

Route::get('/external/quota-cart', [ExternalQuotaCartController::class, 'index'])
    ->middleware(['auth'])
    ->name('external.quota-cart');

Route::post('/external/quota-cart', [ExternalQuotaCartController::class, 'store'])
    ->middleware(['auth'])
    ->name('external.quota-cart.store');

Route::get('/external/quota/review', [ExternalQuotaReviewController::class, 'show'])
    ->middleware(['auth'])
    ->name('external.quota.review');

Route::post('/external/quota/waiting-review', [ExternalWaitingReviewController::class, 'store'])
    ->middleware(['auth'])
    ->name('external.quota.waiting-review.store');

Route::get('/external/quota/waiting-review', [ExternalWaitingReviewController::class, 'show'])
    ->middleware(['auth'])
    ->name('external.quota.waiting-review');

Route::get('/external/billing/device-extension/confirm', [ExternalDeviceExtensionBillingController::class, 'confirm'])
    ->middleware(['auth'])
    ->name('external.billing.device-extension.confirm');

Route::post('/external/billing/device-extension/confirm', [ExternalDeviceExtensionBillingController::class, 'confirmStore'])
    ->middleware(['auth'])
    ->name('external.billing.device-extension.confirm.store');

Route::get('/external/billing/device-extension', [ExternalDeviceExtensionBillingController::class, 'create'])
    ->middleware(['auth'])
    ->name('external.billing.device-extension');

Route::post('/external/billing/device-extension', [ExternalDeviceExtensionBillingController::class, 'store'])
    ->middleware(['auth'])
    ->name('external.billing.device-extension.store');

Route::get('/external/billing/transactions', [ExternalBillingTransactionHistoryController::class, 'index'])
    ->middleware(['auth'])
    ->name('external.billing.transactions.index');

Route::get('/external/quota/usage-history', [ExternalQuotaUsageHistoryController::class, 'index'])
    ->middleware(['auth'])
    ->name('external.quota.usage-history');

Route::get('/billing/invoices/{billingTransaction}/download', [BillingInvoiceController::class, 'download'])
    ->middleware(['auth'])
    ->name('billing.invoices.download');

// Account Manager dashboard
Route::get('/account-manager/dashboard', [AccountManagerDashboardController::class, 'index'])
    ->middleware(['auth', 'account.manager'])
    ->name('account-manager.dashboard');

// Account Manager – Downlines
Route::prefix('account-manager/downlines')->name('account-manager.downlines.')->middleware(['auth', 'account.manager'])->group(function () {
    Route::get('/', [AccountManagerDownlineController::class, 'index'])->name('index');
    Route::get('/create', [AccountManagerDownlineController::class, 'create'])->name('create');
    Route::post('/', [AccountManagerDownlineController::class, 'store'])->name('store');
    Route::get('/assign', [AccountManagerDownlineAssignmentController::class, 'create'])->name('assign');
    Route::post('/assign', [AccountManagerDownlineAssignmentController::class, 'store'])->name('assign.store');
});

// Account Manager – Referral commission history
Route::get('/account-manager/commissions', [AccountManagerCommissionHistoryController::class, 'index'])
    ->middleware(['auth', 'account.manager'])
    ->name('account-manager.commissions.index');

// Account Manager – Commission payouts
Route::prefix('account-manager/payouts')->name('account-manager.payouts.')->middleware(['auth', 'account.manager'])->group(function () {
    Route::get('/', [AccountManagerPayoutController::class, 'index'])->name('index');
    Route::post('/', [AccountManagerPayoutController::class, 'store'])->name('store');
});

// External API – user list (external_super_admin only)
Route::get('/external/users', [ExternalUserController::class, 'index'])
    ->middleware(['auth', 'external.super_admin'])
    ->name('external.users.index');

// External API – object list
Route::get('/external/objects', [ExternalObjectController::class, 'index'])
    ->middleware(['auth'])
    ->name('external.objects.index');

Route::middleware('auth')->group(function () {
    // Module Routes - Local CMS users only; external API users are redirected.
    Route::prefix('module')->name('module.')->middleware('not.external')->group(function () {
        Route::get('/dashboard', [ModuleDashboardController::class, 'index'])->name('dashboard');

        // Global Search
        Route::get('/search', [ModuleGlobalSearchController::class, 'search'])->name('search');

        // Module Page Routes
        Route::get('/pages', [ModulePageController::class, 'index'])->middleware('permission:pages,view')->name('pages.index');
        Route::get('/pages/create', [ModulePageController::class, 'create'])->middleware('permission:pages,create')->name('pages.create');
        Route::post('/pages', [ModulePageController::class, 'store'])->middleware('permission:pages,create')->name('pages.store');
        Route::get('/pages/{page}', [ModulePageController::class, 'show'])->middleware('permission:pages,view')->name('pages.show');
        Route::get('/pages/{page}/edit', [ModulePageController::class, 'edit'])->middleware('permission:pages,update')->name('pages.edit');
        Route::patch('/pages/{page}', [ModulePageController::class, 'update'])->middleware('permission:pages,update')->name('pages.update');
        Route::patch('/pages/{page}/save-content', [ModulePageController::class, 'saveContent'])->middleware('permission:pages,update')->name('pages.save-content');
        Route::patch('/pages/{page}/set-homepage', [ModulePageController::class, 'setHomepage'])->middleware('permission:pages,update')->name('pages.set-homepage');
        Route::delete('/pages/{page}', [ModulePageController::class, 'destroy'])->middleware('permission:pages,delete')->name('pages.destroy');

        // Module Post Routes
        Route::get('/posts', [ModulePostController::class, 'index'])->middleware('permission:posts,view')->name('posts.index');
        Route::get('/posts/create', [ModulePostController::class, 'create'])->middleware('permission:posts,create')->name('posts.create');
        Route::post('/posts', [ModulePostController::class, 'store'])->middleware('permission:posts,create')->name('posts.store');
        Route::get('/posts/{post}', [ModulePostController::class, 'show'])->middleware('permission:posts,view')->name('posts.show');
        Route::get('/posts/{post}/edit', [ModulePostController::class, 'edit'])->middleware('permission:posts,update')->name('posts.edit');
        Route::patch('/posts/{post}', [ModulePostController::class, 'update'])->middleware('permission:posts,update')->name('posts.update');
        Route::patch('/posts/{post}/toggle-publish', [ModulePostController::class, 'togglePublish'])->middleware('permission:posts,update')->name('posts.toggle-publish');
        Route::delete('/posts/{post}', [ModulePostController::class, 'destroy'])->middleware('permission:posts,delete')->name('posts.destroy');

        // Module Carousel Routes
        Route::get('/carousels', [ModuleCarouselController::class, 'index'])->middleware('permission:carousels,view')->name('carousels.index');
        Route::get('/carousels/create', [ModuleCarouselController::class, 'create'])->middleware('permission:carousels,create')->name('carousels.create');
        Route::post('/carousels', [ModuleCarouselController::class, 'store'])->middleware('permission:carousels,create')->name('carousels.store');
        Route::get('/carousels/{carousel}', [ModuleCarouselController::class, 'show'])->middleware('permission:carousels,view')->name('carousels.show');
        Route::get('/carousels/{carousel}/edit', [ModuleCarouselController::class, 'edit'])->middleware('permission:carousels,update')->name('carousels.edit');
        Route::patch('/carousels/{carousel}', [ModuleCarouselController::class, 'update'])->middleware('permission:carousels,update')->name('carousels.update');
        Route::delete('/carousels/{carousel}', [ModuleCarouselController::class, 'destroy'])->middleware('permission:carousels,delete')->name('carousels.destroy');
        Route::post('/carousels/{carousel}/images', [ModuleCarouselImageController::class, 'store'])->middleware('permission:carousels,create')->name('carousels.images.store');
        Route::patch('/carousels/{carousel}/images/{image}', [ModuleCarouselImageController::class, 'update'])->middleware('permission:carousels,update')->name('carousels.images.update');
        Route::delete('/carousels/{carousel}/images/{image}', [ModuleCarouselImageController::class, 'destroy'])->middleware('permission:carousels,delete')->name('carousels.images.destroy');
        Route::post('/carousels/{carousel}/images/reorder', [ModuleCarouselImageController::class, 'reorder'])->middleware('permission:carousels,update')->name('carousels.images.reorder');

        // Module Media Routes
        Route::get('/media', [ModuleMediaController::class, 'index'])->middleware('permission:media,view')->name('media.index');
        Route::get('/media/create', [ModuleMediaController::class, 'create'])->middleware('permission:media,create')->name('media.create');
        Route::post('/media', [ModuleMediaController::class, 'store'])->middleware('permission:media,create')->name('media.store');
        Route::post('/media/upload', [ModuleMediaController::class, 'upload'])->middleware('permission:media,create')->name('media.upload');
        Route::get('/media/picker', [ModuleMediaController::class, 'picker'])->middleware('permission:media,view')->name('media.picker');
        Route::post('/media/bulk-destroy', [ModuleMediaController::class, 'bulkDestroy'])->middleware('permission:media,delete')->name('media.bulk-destroy');
        Route::get('/media/{medium}', [ModuleMediaController::class, 'show'])->middleware('permission:media,view')->name('media.show');
        Route::get('/media/{medium}/edit', [ModuleMediaController::class, 'edit'])->middleware('permission:media,update')->name('media.edit');
        Route::patch('/media/{medium}', [ModuleMediaController::class, 'update'])->middleware('permission:media,update')->name('media.update');
        Route::delete('/media/{medium}', [ModuleMediaController::class, 'destroy'])->middleware('permission:media,delete')->name('media.destroy');

        // Module Analytics Routes
        Route::get('/analytics', [ModuleAnalyticsController::class, 'index'])->middleware('permission:analytics,view')->name('analytics.index');

        // Module Settings Routes
        Route::get('/settings', [ModuleSettingController::class, 'index'])->middleware('permission:settings,view')->name('settings.index');
        Route::get('/settings/create', [ModuleSettingController::class, 'create'])->middleware('permission:settings,create')->name('settings.create');
        Route::post('/settings', [ModuleSettingController::class, 'store'])->middleware('permission:settings,create')->name('settings.store');
        Route::post('/settings/bulk-update', [ModuleSettingController::class, 'bulkUpdate'])->middleware('permission:settings,update')->name('settings.bulk-update');
        Route::get('/settings/{setting}', [ModuleSettingController::class, 'show'])->middleware('permission:settings,view')->name('settings.show');
        Route::get('/settings/{setting}/edit', [ModuleSettingController::class, 'edit'])->middleware('permission:settings,update')->name('settings.edit');
        Route::patch('/settings/{setting}', [ModuleSettingController::class, 'update'])->middleware('permission:settings,update')->name('settings.update');
        Route::delete('/settings/{setting}', [ModuleSettingController::class, 'destroy'])->middleware('permission:settings,delete')->name('settings.destroy');

        // Module User Management Routes
        Route::get('/users', [ModuleUserController::class, 'index'])->middleware('permission:users,view')->name('users.index');
        Route::get('/users/create', [ModuleUserController::class, 'create'])->middleware('permission:users,create')->name('users.create');
        Route::post('/users', [ModuleUserController::class, 'store'])->middleware('permission:users,create')->name('users.store');
        Route::get('/users/{user}', [ModuleUserController::class, 'show'])->middleware('permission:users,view')->name('users.show');
        Route::get('/users/{user}/edit', [ModuleUserController::class, 'edit'])->middleware('permission:users,update')->name('users.edit');
        Route::patch('/users/{user}', [ModuleUserController::class, 'update'])->middleware('permission:users,update')->name('users.update');
        Route::patch('/users/{user}/verify', [ModuleUserController::class, 'verify'])->middleware('permission:users,update')->name('users.verify');
        Route::delete('/users/{user}', [ModuleUserController::class, 'destroy'])->middleware('permission:users,delete')->name('users.destroy');

        // Module Role Management Routes
        Route::get('/roles', [ModuleRoleController::class, 'index'])->middleware('permission:roles,view')->name('roles.index');
        Route::get('/roles/create', [ModuleRoleController::class, 'create'])->middleware('permission:roles,create')->name('roles.create');
        Route::post('/roles', [ModuleRoleController::class, 'store'])->middleware('permission:roles,create')->name('roles.store');
        Route::get('/roles/{role}', [ModuleRoleController::class, 'show'])->middleware('permission:roles,view')->name('roles.show');
        Route::get('/roles/{role}/edit', [ModuleRoleController::class, 'edit'])->middleware('permission:roles,update')->name('roles.edit');
        Route::patch('/roles/{role}', [ModuleRoleController::class, 'update'])->middleware('permission:roles,update')->name('roles.update');
        Route::delete('/roles/{role}', [ModuleRoleController::class, 'destroy'])->middleware('permission:roles,delete')->name('roles.destroy');

        // Account Manager Routes
        Route::get('/account-managers', [ModuleAccountManagerController::class, 'index'])->middleware('permission:users,view')->name('account-managers.index');
        Route::get('/account-managers/create', [ModuleAccountManagerController::class, 'create'])->middleware('permission:users,create')->name('account-managers.create');
        Route::post('/account-managers', [ModuleAccountManagerController::class, 'store'])->middleware('permission:users,create')->name('account-managers.store');
        Route::get('/account-managers/{accountManager}', [ModuleAccountManagerController::class, 'show'])->middleware('permission:users,view')->name('account-managers.show');
        Route::get('/account-managers/{accountManager}/assign-downline', [ReferralApprovalController::class, 'assignDownline'])->middleware('permission:users,create')->name('account-managers.assign-downline');
        Route::post('/account-managers/{accountManager}/assign-downline', [ReferralApprovalController::class, 'storeDownlineAssignment'])->middleware('permission:users,create')->name('account-managers.assign-downline.store');

        // Referral Approval Routes (admin)
        Route::get('/referral-approvals', [ReferralApprovalController::class, 'index'])->middleware('permission:users,view')->name('referral-approvals.index');
        Route::post('/referral-approvals/{referralRelation}/approve', [ReferralApprovalController::class, 'approve'])->middleware('permission:users,update')->name('referral-approvals.approve');
        Route::post('/referral-approvals/{referralRelation}/reject', [ReferralApprovalController::class, 'reject'])->middleware('permission:users,update')->name('referral-approvals.reject');

        // Payout Approval Routes (admin)
        Route::get('/payouts', [ModulePayoutApprovalController::class, 'index'])->middleware('permission:users,view')->name('payouts.index');
        Route::post('/payouts/{payout}/approve', [ModulePayoutApprovalController::class, 'approve'])->middleware('permission:users,update')->name('payouts.approve');
        Route::post('/payouts/{payout}/reject', [ModulePayoutApprovalController::class, 'reject'])->middleware('permission:users,update')->name('payouts.reject');
        Route::post('/payouts/{payout}/mark-paid', [ModulePayoutApprovalController::class, 'markAsPaid'])->middleware('permission:users,update')->name('payouts.mark-paid');

        // Billing Transaction Management (admin)
        Route::get('/billing-transactions', [ModuleBillingTransactionController::class, 'index'])->middleware('permission:users,view')->name('billing-transactions.index');
        Route::get('/billing-transactions/{billingTransaction}', [ModuleBillingTransactionController::class, 'show'])->middleware('permission:users,view')->name('billing-transactions.show');
    });

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar.update');
    Route::delete('/profile/avatar', [ProfileController::class, 'destroyAvatar'])->name('profile.avatar.destroy');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/todos', [TodoController::class, 'index'])->name('todos.index');
    Route::post('/todos', [TodoController::class, 'store'])->name('todos.store');
    Route::patch('/todos/{todo}', [TodoController::class, 'update'])->name('todos.update');
    Route::delete('/todos/{todo}', [TodoController::class, 'destroy'])->name('todos.destroy');

    Route::get('/live-updates', [LiveUpdateController::class, 'index'])->middleware('permission:live-updates,view')->name('live-updates.index');
    Route::get('/live-updates/create', [LiveUpdateController::class, 'create'])->middleware('permission:live-updates,create')->name('live-updates.create');
    Route::post('/live-updates', [LiveUpdateController::class, 'store'])->middleware('permission:live-updates,create')->name('live-updates.store');
    Route::get('/live-updates/{liveUpdate}', [LiveUpdateController::class, 'show'])->middleware('permission:live-updates,view')->name('live-updates.show');
    Route::get('/live-updates/{liveUpdate}/edit', [LiveUpdateController::class, 'edit'])->middleware('permission:live-updates,update')->name('live-updates.edit');
    Route::patch('/live-updates/{liveUpdate}', [LiveUpdateController::class, 'update'])->middleware('permission:live-updates,update')->name('live-updates.update');
    Route::delete('/live-updates/{liveUpdate}', [LiveUpdateController::class, 'destroy'])->middleware('permission:live-updates,delete')->name('live-updates.destroy');
});

// Public page rendering route
Route::get('/p/{slug}', [PageController::class, 'render'])->name('pages.render');

require __DIR__.'/auth.php';
