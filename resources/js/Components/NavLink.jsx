import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center px-4 py-2 text-sm font-ffdin font-medium transition duration-150 ease-in-out focus:outline-none border-b-2 ' +
                (active
                    ? 'border-accent text-white font-bold'
                    : 'border-transparent text-zinc-400 hover:text-white hover:border-zinc-500') +
                ' ' + className
            }
        >
            {children}
        </Link>
    );
}
