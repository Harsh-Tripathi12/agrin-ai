import AppShell from "./components/navigation/AppShell";
import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from "react-router-dom";


import {
    AuthProvider
} from "./context/AuthContext";


import ProtectedRoute
    from "./components/ProtectedRoute";


import Welcome
    from "./pages/Welcome";

import Login
    from "./pages/Login";

import Signup
    from "./pages/Signup";

import Profile
    from "./pages/Profile";

import FarmSetup
    from "./pages/FarmSetup";

import Dashboard
    from "./pages/Dashboard";

import CropDoctor
    from "./pages/CropDoctor";

import FarmRisk
    from "./pages/FarmRisk";

import RegenerativeAdvisor
    from "./pages/RegenerativeAdvisor";

import FarmerAssistant
    from "./pages/FarmerAssistant";


function App() {

    return (

        <BrowserRouter>

            <AuthProvider>

                <AppShell>

                    <Routes>

                        {/* Public */}

                        <Route
                            path="/"
                            element={<Welcome />}
                        />

                        <Route
                            path="/login"
                            element={<Login />}
                        />

                        <Route
                            path="/signup"
                            element={<Signup />}
                        />


                        {/* Protected */}

                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />


                        <Route
                            path="/farm-setup"
                            element={
                                <ProtectedRoute>
                                    <FarmSetup />
                                </ProtectedRoute>
                            }
                        />


                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />


                        <Route
                            path="/crop-doctor"
                            element={
                                <ProtectedRoute>
                                    <CropDoctor />
                                </ProtectedRoute>
                            }
                        />


                        <Route
                            path="/risk"
                            element={
                                <ProtectedRoute>
                                    <FarmRisk />
                                </ProtectedRoute>
                            }
                        />


                        <Route
                            path="/improve"
                            element={
                                <ProtectedRoute>
                                    <RegenerativeAdvisor />
                                </ProtectedRoute>
                            }
                        />


                        <Route
                            path="/assistant"
                            element={
                                <ProtectedRoute>
                                    <FarmerAssistant />
                                </ProtectedRoute>
                            }
                        />


                        <Route
                            path="*"
                            element={
                                <Navigate
                                    to="/"
                                    replace
                                />
                            }
                        />

                    </Routes>

                </AppShell>

            </AuthProvider>

        </BrowserRouter>
    );
}

export default App;