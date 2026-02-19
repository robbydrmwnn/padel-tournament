export default function ApplicationLogo({ className = '', ...props }) {
    // return (
    //     <img
    //         src="/logo/logo.jpeg"
    //         alt="Logo"
    //         className={className}
    //         {...props}
    //     />
    // );

    return (
        <div className={className} {...props}>
            <span className="text-2xl font-bold">Padel Tournament</span>
        </div>
    );
}
