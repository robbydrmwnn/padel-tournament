export default function ApplicationLogo({ className = '', ...props }) {
    return (
        <img
            src="/logo/logo.jpeg"
            alt="Logo"
            className={className}
            {...props}
        />
    );
}
