import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-accent bg-zinc-800 text-white focus:border-accent focus:bg-zinc-700 focus:text-white'
                    : 'border-transparent text-zinc-400 hover:border-zinc-600 hover:bg-zinc-900 hover:text-white focus:border-zinc-600 focus:bg-zinc-900 focus:text-white'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
