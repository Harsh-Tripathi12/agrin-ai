import {
    useAuth,
} from "../context/AuthContext";


export default function LogoutButton() {

    const {
        logout,
    } = useAuth();


    return (
        <button
            onClick={logout}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
            Logout
        </button>
    );
}