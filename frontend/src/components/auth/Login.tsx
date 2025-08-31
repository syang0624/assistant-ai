import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
    Button,
    Input,
    Card,
    CardHeader,
    CardContent,
    CardTitle,
    CardDescription,
} from "../ui";

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
        } catch {
            setError("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8"
            style={{ backgroundColor: "#F6F7F8" }}
        >
            <div className="w-full max-w-md">
                <Card variant="elevated" padding="lg">
                    <CardHeader className="text-center">
                        <CardTitle as="h1" className="text-heading-1">
                            로그인
                        </CardTitle>
                        <CardDescription className="text-body">
                            Assistant AI에 오신 것을 환영합니다
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {error && (
                            <div
                                className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm text-center"
                                role="alert"
                                aria-live="polite"
                            >
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                id="email"
                                type="email"
                                label="이메일"
                                placeholder="이메일을 입력하세요"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />

                            <Input
                                id="password"
                                type="password"
                                label="비밀번호"
                                placeholder="비밀번호를 입력하세요"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />

                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                className="w-full mt-6"
                                disabled={!email || !password}
                            >
                                로그인
                            </Button>
                        </form>

                        <div className="text-center">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onSwitchToSignup}
                                className="text-caption"
                            >
                                계정이 없으신가요? 회원가입하기
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
