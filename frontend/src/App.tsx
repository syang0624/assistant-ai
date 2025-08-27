import { useState, useEffect } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import Auth from "./components/Auth";
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";
import Schedule from "./components/Schedule";
import LocationForm from "./components/LocationForm";

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        const savedUsername = localStorage.getItem("username");
        if (token && savedUsername) {
            setIsAuthenticated(true);
            setUsername(savedUsername);
        }
    }, []);

    const handleLogin = (user: string) => {
        setIsAuthenticated(true);
        setUsername(user);
        localStorage.setItem("username", user);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setUsername("");
        localStorage.removeItem("authToken");
        localStorage.removeItem("username");
    };

    if (!isAuthenticated) {
        return <Auth onLogin={handleLogin} />;
    }

    return (
        <Router>
            <div className="min-h-screen bg-gray-50">
                <nav className="navbar">
                    <div className="container">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center space-x-8">
                                <a href="/" className="navbar-brand">
                                    Task Scheduler
                                </a>
                                <ul className="navbar-nav">
                                    <li>
                                        <a href="/tasks" className="nav-link">
                                            Tasks
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="/schedule"
                                            className="nav-link"
                                        >
                                            Schedule
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="/locations"
                                            className="nav-link"
                                        >
                                            Locations
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-secondary">
                                    Welcome, {username}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="btn btn-danger"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                <main className="container py-6">
                    <Routes>
                        <Route
                            path="/"
                            element={<Navigate to="/tasks" replace />}
                        />
                        <Route path="/tasks" element={<TaskList />} />
                        <Route path="/tasks/new" element={<TaskForm />} />
                        <Route path="/schedule" element={<Schedule />} />
                        <Route path="/locations" element={<LocationForm />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
