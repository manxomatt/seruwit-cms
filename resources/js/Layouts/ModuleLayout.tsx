import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import GlobalSearch from '@/Components/GlobalSearch';
import { Link, usePage } from '@inertiajs/react';
import { useState, ReactNode, useMemo } from 'react';

interface UserProfile {
    id: number;
    first_name: string | null;
    last_name: string | null;
    phone_number: string | null;
    avatar_url: string | null;
}

interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    is_admin: boolean;
    dashboard_path: string;
    primary_role_slug: string | null;
    profile: UserProfile | null;
    permissions: Record<string, string[]>;
}

interface Props {
    header?: ReactNode;
    children?: ReactNode;
}

interface MenuItem {
    name: string;
    href: string;
    icon: ReactNode;
    current: boolean;
    module: string;
}

const DashboardIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
);

const PagesIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);

const SettingsIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const AnalyticsIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
);

const MediaIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
);

const CarouselIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-.98.626-1.813 1.5-2.122" />
    </svg>
);

const PostsIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
    </svg>
);

const UsersIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
);

const RolesIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
);

const LiveUpdatesIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
);

const MenuIcon = () => (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

const CloseIcon = () => (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// Avatar component that shows image or initials
const UserAvatar = ({ user, size = 'md' }: { user: User | null; size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
        sm: 'h-8 w-8 text-sm',
        md: 'h-9 w-9 text-sm',
        lg: 'h-10 w-10 text-base',
    };

    const avatarUrl = user?.profile?.avatar_url;

    if (avatarUrl) {
        return (
            <img
                src={avatarUrl}
                alt={user?.name || 'User'}
                className={`${sizeClasses[size]} rounded-full object-cover`}
            />
        );
    }

    // Color based on user role
    const bgColor = user?.is_admin ? 'bg-indigo-500' : 'bg-purple-500';

    return (
        <div className={`${sizeClasses[size]} rounded-full ${bgColor} flex items-center justify-center`}>
            <span className="font-medium text-white">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
        </div>
    );
};

// Module to route mapping - use module routes
const moduleRouteMap: Record<string, { route: string; routePattern: string }> = {
    'pages': { route: 'module.pages.index', routePattern: 'module.pages.*' },
    'posts': { route: 'module.posts.index', routePattern: 'module.posts.*' },
    'carousels': { route: 'module.carousels.index', routePattern: 'module.carousels.*' },
    'media': { route: 'module.media.index', routePattern: 'module.media.*' },
    'analytics': { route: 'module.analytics.index', routePattern: 'module.analytics.*' },
    'settings': { route: 'module.settings.index', routePattern: 'module.settings.*' },
    'users': { route: 'module.users.index', routePattern: 'module.users.*' },
    'roles': { route: 'module.roles.index', routePattern: 'module.roles.*' },
    'live-updates': { route: 'module.live-updates.index', routePattern: 'module.live-updates.*' },
};

// Module to icon mapping
const moduleIconMap: Record<string, ReactNode> = {
    'pages': <PagesIcon />,
    'posts': <PostsIcon />,
    'carousels': <CarouselIcon />,
    'media': <MediaIcon />,
    'analytics': <AnalyticsIcon />,
    'settings': <SettingsIcon />,
    'users': <UsersIcon />,
    'roles': <RolesIcon />,
    'live-updates': <LiveUpdatesIcon />,
};

// Module display names
const moduleDisplayNames: Record<string, string> = {
    'pages': 'Pages',
    'posts': 'Posts',
    'carousels': 'Carousels',
    'media': 'Media',
    'analytics': 'Analytics',
    'settings': 'Settings',
    'users': 'Users',
    'roles': 'Roles',
    'live-updates': 'Live Updates',
};

// Helper function to check if a route exists
const routeExists = (routeName: string): boolean => {
    try {
        route(routeName);
        return true;
    } catch {
        return false;
    }
};

// Helper function to get dashboard route based on user role
const getDashboardRoute = (user: User | null): string => {
    if (user?.dashboard_path) {
        return user.dashboard_path;
    }

    if (routeExists('module.dashboard')) {
        return route('module.dashboard');
    }

    return route('dashboard');
};

// Get theme colors based on user role - using Sky Track theme (dark blue gradient)
const getThemeColors = (isAdmin: boolean) => {
    // Both admin and module users use the same Sky Track theme
    return {
        gradient: 'from-slate-900 via-blue-900 to-slate-900',
        border: 'border-blue-700/50',
        text: 'text-blue-100',
        textHover: 'text-cyan-300',
        bg: 'bg-blue-600',
        activeItem: 'bg-cyan-500/20 text-white border-l-4 border-cyan-400',
        hoverItem: 'hover:bg-white/5 hover:text-white',
    };
};

export default function ModuleLayout({ header, children }: Props) {
    const pageProps = usePage().props as any;
    const user = pageProps.auth.user as User | null;
    const settings = pageProps.settings as Record<string, string> | undefined;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    const isAdmin = user?.is_admin || false;
    const theme = getThemeColors(isAdmin);
    const panelName = isAdmin ? 'Admin' : 'Module';
    
    // Get logo and site name from settings
    const siteLogo = settings?.['site.logo'];
    const siteName = settings?.['general.site_name'] || 'Sky Track';

    // Build navigation based on user permissions
    const navigation = useMemo(() => {
        const dashboardRoute = getDashboardRoute(user);
        const items: MenuItem[] = [
            {
                name: 'Dashboard',
                href: dashboardRoute,
                icon: <DashboardIcon />,
                current: route().current('module.dashboard') || route().current('dashboard') || route().current('account-manager.dashboard'),
                module: 'dashboard',
            },
        ];

        if (!user) {
            return items;
        }

        const permissions = user.permissions || {};

        // Add menu items based on user permissions (need 'view' permission for the module)
        Object.keys(permissions).forEach((module) => {
            const modulePermissions = permissions[module];
            // Only add menu item if user has 'view' permission, route mapping exists, and route actually exists
            if (modulePermissions.includes('view') && moduleRouteMap[module] && routeExists(moduleRouteMap[module].route)) {
                const routeInfo = moduleRouteMap[module];
                items.push({
                    name: moduleDisplayNames[module] || module,
                    href: route(routeInfo.route),
                    icon: moduleIconMap[module] || <PagesIcon />,
                    current: route().current(routeInfo.routePattern),
                    module: module,
                });
            }
        });

        // External super admin: add users list from external API
        if (user.primary_role_slug === 'external_super_admin' && routeExists('external.users.index')) {
            items.push({
                name: 'Users',
                href: route('external.users.index'),
                icon: <UsersIcon />,
                current: route().current('external.users.*'),
                module: 'external-users',
            });
        }

        // Account Manager: add downline management
        if (user.primary_role_slug === 'account_manager' && routeExists('account-manager.downlines.index')) {
            items.push({
                name: 'Downline',
                href: route('account-manager.downlines.index'),
                icon: <UsersIcon />,
                current: route().current('account-manager.downlines.*'),
                module: 'downlines',
            });
        }

        return items;
    }, [user]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div 
                        className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <div className={`fixed inset-y-0 left-0 flex w-64 flex-col bg-gradient-to-b ${theme.gradient}`}>
                        <div className="flex h-16 items-center justify-between px-4">
                            <Link href={getDashboardRoute(user)} className="flex items-center">
                                {siteLogo ? (
                                    <img src={siteLogo} alt={siteName} className="h-8 w-auto" />
                                ) : (
                                    <ApplicationLogo className="h-8 w-auto text-white" />
                                )}
                                <span className="ml-2 text-xl font-bold text-white">{siteName}</span>
                            </Link>
                            <button
                                type="button"
                                className="text-white hover:text-gray-200"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <CloseIcon />
                            </button>
                        </div>
                        <nav className="flex-1 space-y-1 px-2 py-4">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                                        item.current
                                            ? 'bg-white/20 text-white shadow-lg'
                                            : `${theme.text} hover:bg-white/10 hover:text-white`
                                    }`}
                                >
                                    <span className={`mr-3 ${item.current ? 'text-white' : `${theme.textHover} group-hover:text-white`}`}>
                                        {item.icon}
                                    </span>
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                        {/* Mobile sidebar user section */}
                        <div className={`border-t ${theme.border} p-4`}>
                            <Link href={route('profile.edit')} className="flex items-center hover:opacity-80 transition-opacity">
                                <UserAvatar user={user} size="md" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                                    <p className={`text-xs ${theme.text}`}>{user?.email || 'user@example.com'}</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
                <div className={`flex min-h-0 flex-1 flex-col bg-gradient-to-b ${theme.gradient}`}>
                    <div className={`flex h-16 items-center px-4 border-b ${theme.border}`}>
                        <Link href={getDashboardRoute(user)} className="flex items-center">
                            {siteLogo ? (
                                <img src={siteLogo} alt={siteName} className="h-8 w-auto" />
                            ) : (
                                <ApplicationLogo className="h-8 w-auto text-white" />
                            )}
                            <span className="ml-2 text-xl font-bold text-white">{siteName}</span>
                        </Link>
                    </div>
                    <nav className="flex-1 space-y-1 px-3 py-4">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                                    item.current
                                        ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                                        : `${theme.text} hover:bg-white/10 hover:text-white`
                                }`}
                            >
                                <span className={`mr-3 ${item.current ? 'text-white' : `${theme.textHover} group-hover:text-white`}`}>
                                    {item.icon}
                                </span>
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                    {/* Desktop sidebar user section (kiri bawah) */}
                    <div className={`border-t ${theme.border} p-4`}>
                        <Link href={route('profile.edit')} className="flex items-center hover:opacity-80 transition-opacity">
                            <UserAvatar user={user} size="md" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                                <p className={`text-xs ${theme.text}`}>{user?.email || 'user@example.com'}</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top navigation */}
                <div className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
                    <button
                        type="button"
                        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <MenuIcon />
                    </button>

                    {/* Separator */}
                    <div className="h-6 w-px bg-gray-200 lg:hidden" />

                    <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                        {/* Global Search */}
                        <div className="relative flex flex-1 items-center">
                            <GlobalSearch />
                        </div>

                        <div className="flex items-center gap-x-4 lg:gap-x-6">
                            {/* Notifications */}
                            <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                                </svg>
                            </button>

                            {/* Separator */}
                            <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />

                            {/* Profile dropdown (kanan atas) */}
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button type="button" className="-m-1.5 flex items-center p-1.5">
                                        <UserAvatar user={user} size="sm" />
                                        <span className="hidden lg:flex lg:items-center">
                                            <span className="ml-4 text-sm font-semibold leading-6 text-gray-900">
                                                {user?.name || 'User'}
                                            </span>
                                            <svg className="ml-2 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                            </svg>
                                        </span>
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content>
                                    <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">
                                        Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </div>

                {/* Page header */}
                {header && (
                    <header className="bg-white shadow-sm">
                        <div className="px-4 py-6 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}

                {/* Main content area */}
                <main className="py-6">
                    <div className="px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
