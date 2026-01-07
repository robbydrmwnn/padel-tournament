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
                    ? 'border-success bg-success-50 text-primary focus:border-success focus:bg-success-100 focus:text-primary'
                    : 'border-transparent text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 hover:text-dark focus:border-neutral-300 focus:bg-neutral-50 focus:text-dark'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
