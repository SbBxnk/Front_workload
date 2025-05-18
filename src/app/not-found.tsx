// app/not-found.js
import Link from "next/link";
export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-base-100">
            <h1 className="text-4xl font-bold text-error">404 - Page Not Found</h1>
            <p className="text-lg mt-4">Oops! The page you are looking for does not exist.</p>
            <Link href="/" className="btn btn-primary mt-6">
                Go Back Home
            </Link>
        </div>
    );
}
