import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { OnboardingProvider } from "./contexts/OnboardingContext";

// Lazy-loaded components
const Auth = lazy(() => import("./components/auth/Auth"));
const OnboardingWizard = lazy(
    () => import("./components/onboarding/OnboardingWizard")
);
const Schedule = lazy(() => import("./components/schedule/Schedule"));
const Map = lazy(() => import("./components/map/Map"));

function App() {
    return (
        <Router>
            <AuthProvider>
                <OnboardingProvider>
                    <Suspense fallback={<div>Loading...</div>}>
                        <Routes>
                            <Route path="/login" element={<Auth />} />
                            <Route
                                path="/onboarding"
                                element={<OnboardingWizard />}
                            />
                            <Route path="/schedule" element={<Schedule />} />
                            <Route path="/map" element={<Map />} />
                            <Route path="/" element={<Schedule />} />
                        </Routes>
                    </Suspense>
                </OnboardingProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
