import { useState } from "react";
import { authAPI } from "../services/api";

interface AuthProps {
    onLogin: (username: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            console.log("Attempting to login with:", { username, password });

            if (isLogin) {
                const response = await authAPI.login({ username, password });
                console.log("Login response:", response);

                if (response.data.ok) {
                    localStorage.setItem("authToken", "dummy-token"); // In real app, use JWT
                    onLogin(username);
                }
            } else {
                const response = await authAPI.signup({ username, password });
                console.log("Signup response:", response);

                if (response.data.ok) {
                    setIsLogin(true);
                    setError("Account created successfully! Please login.");
                }
            }
        } catch (err: any) {
            console.error("Auth error:", err);
            console.error("Error response:", err.response);

            if (err.response) {
                // Server responded with error
                setError(
                    err.response.data?.detail ||
                        `Server error: ${err.response.status}`
                );
            } else if (err.request) {
                // Request was made but no response received
                setError("No response from server. Is the backend running?");
            } else {
                // Something else happened
                setError(err.message || "An unexpected error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {isLogin
                            ? "Sign in to your account"
                            : "Create new account"}
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:ring-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {loading
                                ? "Loading..."
                                : isLogin
                                ? "Sign in"
                                : "Sign up"}
                        </button>
                    </div>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-indigo-600 hover:text-indigo-500 text-sm"
                        >
                            {isLogin
                                ? "Need an account? Sign up"
                                : "Already have an account? Sign in"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Auth;
