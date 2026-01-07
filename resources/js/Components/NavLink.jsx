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
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-success text-primary focus:border-success'
                    : 'border-transparent text-neutral-600 hover:border-neutral-400 hover:text-dark focus:border-neutral-400 focus:text-dark') +
                className
            }
        >
            {children}
        </Link>
    );
}
