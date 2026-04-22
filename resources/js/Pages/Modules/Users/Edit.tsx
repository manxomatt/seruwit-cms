import DynamicLayout from '@/Layouts/DynamicLayout';
import { useRoutePrefix } from '@/hooks/useRoutePrefix';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Role {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_system: boolean;
}

interface UserProfile {
    id: number;
    user_id: number;
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
    created_at: string;
    updated_at: string;
    profile: UserProfile | null;
}

interface Props {
    user: User;
    userRoles: number[];
    roles: Role[];
}

export default function Edit({ user, userRoles, roles }: Props): JSX.Element {
    const { prefixedRoute } = useRoutePrefix();
    const { data, setData, patch, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        roles: userRoles,
        first_name: user.profile?.first_name || '',
        last_name: user.profile?.last_name || '',
        phone_number: user.profile?.phone_number || '',
        avatar_url: user.profile?.avatar_url || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(prefixedRoute('users.update', user.id));
    };

    const selectRole = (roleId: number) => {
        setData('roles', [roleId]);
    };

    return (
        <DynamicLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Edit User
                    </h2>
                </div>
            }
        >
            <Head title={`Edit User - ${user.name}`} />

            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                <div className="p-6">
                    <form onSubmit={submit} className="max-w-2xl">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* Left Column - User Details */}
                            <div className="space-y-4">
                                <div>
                                    <InputLabel htmlFor="name" value="Name" />
                                    <TextInput
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        className="mt-1 block w-full"
                                        autoComplete="name"
                                        isFocused={true}
                                        onChange={(e) => setData('name', e.target.value)}
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="email" value="Email" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="mt-1 block w-full"
                                        autoComplete="email"
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                    <InputError message={errors.email} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="password" value="Password (leave blank to keep current)" />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="mt-1 block w-full"
                                        autoComplete="new-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    <InputError message={errors.password} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                                    <TextInput
                                        id="password_confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        className="mt-1 block w-full"
                                        autoComplete="new-password"
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                    />
                                    <InputError message={errors.password_confirmation} className="mt-2" />
                                </div>

                                {/* Profile Fields */}
                                <div className="border-t pt-4 mt-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">Profile Information</h4>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <InputLabel htmlFor="first_name" value="First Name" />
                                            <TextInput
                                                id="first_name"
                                                type="text"
                                                name="first_name"
                                                value={data.first_name}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('first_name', e.target.value)}
                                            />
                                            <InputError message={errors.first_name} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="last_name" value="Last Name" />
                                            <TextInput
                                                id="last_name"
                                                type="text"
                                                name="last_name"
                                                value={data.last_name}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('last_name', e.target.value)}
                                            />
                                            <InputError message={errors.last_name} className="mt-2" />
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <InputLabel htmlFor="phone_number" value="Phone Number" />
                                        <TextInput
                                            id="phone_number"
                                            type="text"
                                            name="phone_number"
                                            value={data.phone_number}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('phone_number', e.target.value)}
                                        />
                                        <InputError message={errors.phone_number} className="mt-2" />
                                    </div>

                                    <div className="mt-4">
                                        <InputLabel htmlFor="avatar_url" value="Avatar URL" />
                                        <TextInput
                                            id="avatar_url"
                                            type="text"
                                            name="avatar_url"
                                            value={data.avatar_url}
                                            className="mt-1 block w-full"
                                            placeholder="https://example.com/avatar.jpg"
                                            onChange={(e) => setData('avatar_url', e.target.value)}
                                        />
                                        <InputError message={errors.avatar_url} className="mt-2" />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Roles */}
                            <div>
                                <InputLabel value="Role" />
                                <div className="mt-2 border rounded-lg divide-y">
                                    {roles.map((role) => (
                                        <label
                                            key={role.id}
                                            className="flex items-start p-3 cursor-pointer hover:bg-gray-50"
                                        >
                                            <input
                                                type="radio"
                                                name="role"
                                                checked={data.roles[0] === role.id}
                                                onChange={() => selectRole(role.id)}
                                                className="mt-1 border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                            />
                                            <div className="ml-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {role.name}
                                                    </span>
                                                    {role.is_system && (
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                                            System
                                                        </span>
                                                    )}
                                                </div>
                                                {role.description && (
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {role.description}
                                                    </p>
                                                )}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                <InputError message={errors.roles} className="mt-2" />
                            </div>
                        </div>

                        <div className="mt-6 flex items-center gap-4">
                            <PrimaryButton disabled={processing}>
                                Update User
                            </PrimaryButton>
                            <Link href={prefixedRoute('users.index')}>
                                <SecondaryButton type="button">Cancel</SecondaryButton>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </DynamicLayout>
    );
}
