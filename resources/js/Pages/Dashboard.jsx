import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AuthenticatedLayout header="Dashboard">
            <Head title="Dashboard" />

            <div className="py-12 bg-dark min-h-screen">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    {/* Welcome Banner */}
                    <div className="bg-primary rounded-2xl p-8 mb-8 shadow-lg border-4 border-accent">
                        <div className="flex items-center gap-6">
                            <img src="/logo/logo.jpeg" alt="Logo" className="h-24 w-auto object-contain" />
                            <div>
                                <h1 className="text-4xl font-bold font-raverist text-white mb-2">Welcome Back!</h1>
                                <p className="text-xl font-gotham text-neutral-200">Manage your padel tournaments with ease</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Grid */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {/* Events Card */}
                        <Link
                            href={route('events.index')}
                            className="bg-white rounded-2xl p-8 shadow-lg border-4 border-primary hover:border-accent transition-all hover:shadow-xl group"
                        >
                            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🏆</div>
                            <h3 className="text-2xl font-bold font-raverist text-primary mb-2">Events</h3>
                            <p className="text-lg font-gotham text-neutral-700">Create and manage tournaments</p>
                        </Link>

                        {/* Categories Card */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg border-4 border-success">
                            <div className="text-6xl mb-4">📋</div>
                            <h3 className="text-2xl font-bold font-raverist text-success mb-2">Categories</h3>
                            <p className="text-lg font-gotham text-neutral-700">Organize competition groups</p>
                        </div>

                        {/* Matches Card */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg border-4 border-accent">
                            <div className="text-6xl mb-4">🎾</div>
                            <h3 className="text-2xl font-bold font-raverist text-accent-900 mb-2">Matches</h3>
                            <p className="text-lg font-gotham text-neutral-700">Schedule and track games</p>
                        </div>

                        {/* Participants Card */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg border-4 border-primary">
                            <div className="text-6xl mb-4">👥</div>
                            <h3 className="text-2xl font-bold font-raverist text-primary mb-2">Participants</h3>
                            <p className="text-lg font-gotham text-neutral-700">Manage player registrations</p>
                        </div>

                        {/* Courts Card */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg border-4 border-success">
                            <div className="text-6xl mb-4">🏟️</div>
                            <h3 className="text-2xl font-bold font-raverist text-success mb-2">Courts</h3>
                            <p className="text-lg font-gotham text-neutral-700">Setup and monitor courts</p>
                        </div>

                        {/* Groups Card */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg border-4 border-accent">
                            <div className="text-6xl mb-4">🔢</div>
                            <h3 className="text-2xl font-bold font-raverist text-accent-900 mb-2">Groups</h3>
                            <p className="text-lg font-gotham text-neutral-700">Organize player groups</p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="mt-8 grid gap-6 md:grid-cols-3">
                        <div className="bg-primary rounded-xl p-6 shadow-lg border-2 border-accent">
                            <p className="text-sm font-gotham text-white opacity-80 mb-1">ACTIVE EVENTS</p>
                            <p className="text-5xl font-bold font-raverist text-accent">-</p>
                        </div>
                        <div className="bg-success rounded-xl p-6 shadow-lg border-2 border-dark">
                            <p className="text-sm font-gotham text-white opacity-80 mb-1">TODAY'S MATCHES</p>
                            <p className="text-5xl font-bold font-raverist text-white">-</p>
                        </div>
                        <div className="bg-accent rounded-xl p-6 shadow-lg border-2 border-dark">
                            <p className="text-sm font-gotham text-dark opacity-80 mb-1">TOTAL PLAYERS</p>
                            <p className="text-5xl font-bold font-raverist text-dark">-</p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
