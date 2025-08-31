export interface User {
    id: string;
    email: string;
    name: string;
    district: string | null;
    activity_level: string | null;
    is_active: boolean;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignupCredentials {
    email: string;
    password: string;
    name: string;
    district: string;
    activity_level: "easy" | "medium" | "hard";
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}

export default {
    User,
    LoginCredentials,
    SignupCredentials,
    AuthResponse,
};
