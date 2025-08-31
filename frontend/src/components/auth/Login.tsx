import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface LoginProps {
    onSwitchToSignup: () => void;
}

export default function Login({ onSwitchToSignup }: LoginProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            await login({ email, password });
            navigate("/schedule");
        } catch (err: any) {
            setError("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
                <div>
                    <h2 className="text-center text-3xl font-bold text-text">
                        로그인
                    </h2>
                    <p className="mt-2 text-center text-sm text-text-light">
                        Assistant AI에 오신 것을 환영합니다
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative text-center text-sm">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="appearance-none rounded relative block w-full px-3 py-2 border border-secondary placeholder-secondary text-text focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="이메일"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded relative block w-full px-3 py-2 border border-secondary placeholder-secondary text-text focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="비밀번호"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            로그인
                        </button>
                    </div>
                </form>

                <div className="text-center">
                    <button
                        onClick={onSwitchToSignup}
                        className="text-sm text-primary hover:text-primary-dark"
                    >
                        계정이 없으신가요? 회원가입하기
                    </button>
                </div>
            </div>
        </div>
    );
}
