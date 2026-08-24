import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    onAuthStateChanged,
    signOut,
} from "firebase/auth";

import { auth } from "../config/firebase";


const AuthContext = createContext(null);


export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);

    const [loading, setLoading] =
        useState(true);


    useEffect(() => {

        const unsubscribe =
            onAuthStateChanged(
                auth,
                (currentUser) => {

                    setUser(currentUser);

                    setLoading(false);
                }
            );


        return unsubscribe;

    }, []);


    async function logout() {

        await signOut(auth);

        localStorage.removeItem(
            "agrin_farmer_id"
        );

        localStorage.removeItem(
            "agrin_language"
        );
    }


    const value = {
        user,
        loading,
        logout,
        isAuthenticated: !!user,
    };


    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth() {

    const context =
        useContext(AuthContext);


    if (!context) {

        throw new Error(
            "useAuth must be used inside AuthProvider"
        );

    }


    return context;
}