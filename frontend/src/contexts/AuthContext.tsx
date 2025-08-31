import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User, LoginCredentials, SignupCredentials } from '../types/auth';
import { authAPI } from '../utils/api';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    signup: (credentials: SignupCredentials) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // 초기 로드 시 토큰 확인 및 사용자 정보 가져오기
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const userData = await authAPI.me();
                    setUser(userData);
                } catch (error) {
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (credentials: LoginCredentials) => {
        const response = await authAPI.login(credentials);
        localStorage.setItem('token', response.access_token);
        const userData = await authAPI.me();
        setUser(userData);
        navigate('/schedule');  // 로그인 성공 시 schedule 페이지로 이동
    };

    const signup = async (credentials: SignupCredentials) => {
        const response = await authAPI.signup(credentials);
        localStorage.setItem('token', response.access_token);
        const userData = await authAPI.me();
        setUser(userData);
        navigate('/schedule');  // 회원가입 성공 시 schedule 페이지로 이동
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');  // 로그아웃 시 로그인 페이지로 이동
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
                login,
                signup,
                logout,
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
