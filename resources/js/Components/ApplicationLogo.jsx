export default function ApplicationLogo({ className = '', variant = 'black', ...props }) {
    const src = variant === 'white' ? '/logo/logo-white.jpg' : '/logo/logo-black.jpg';

    return (
        <img
            src={src}
            alt="Gonuts Cup"
            className={className}
            {...props}
        />
    );
}
