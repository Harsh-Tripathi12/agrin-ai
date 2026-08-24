import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";


export default function ProtectedRoute({
    children,
}) {

    const {
        user,
        loading,
    } = useAuth();


    if (loading) {

        return (
            <div className="flex min-h-screen items-center justify-center bg-green-50">

                <div className="text-center">

                    <div className="text-4xl">
                        🌱
                    </div>

                    <p className="mt-3 font-medium text-gray-700">
                        Loading AgriN...
                    </p>

                </div>

            </div>
        );
    }


    if (!user) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );

    }


    return children;
}