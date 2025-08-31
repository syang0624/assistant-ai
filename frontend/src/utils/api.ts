import axios from "axios";
import type {
    LoginCredentials,
    SignupCredentials,
    AuthResponse,
    User,
} from "../types/auth";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
    headers: {
        "Content-Type": "application/json",
    },
});

// 요청 인터셉터 - 토큰 추가
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Default export for the api instance
export default api;

export const schedulesAPI = {
    list: async () => {
        const { data } = await api.get("/api/v1/schedules");
        return data;
    },
    create: async (payload: {
        title: string;
        start_time: string;
        end_time: string;
        description?: string;
        location_id: string;
    }) => {
        const { data } = await api.post("/api/v1/schedules", payload);
        return data;
    },
    update: async (
        id: string,
        payload: Partial<{
            title: string;
            start_time: string;
            end_time: string;
            description?: string;
            location_id: string;
        }>
    ) => {
        const { data } = await api.put(`/api/v1/schedules/${id}`, payload);
        return data;
    },
    delete: async (id: string) => {
        const { data } = await api.delete(`/api/v1/schedules/${id}`);
        return data;
    },
};

export const locationsAPI = {
    list: async (district?: string) => {
        const params = district ? { district } : undefined;
        const { data } = await api.get("/api/v1/locations", { params });
        return data;
    },
    create: async (payload: {
        name: string;
        address: string;
        district: string;
        latitude?: number;
        longitude?: number;
    }) => {
        const { data } = await api.post("/api/v1/locations", payload);
        return data;
    },
};

export const authAPI = {
    login: async (credentials: LoginCredentials) => {
        const formData = new FormData();
        formData.append("username", credentials.email);
        formData.append("password", credentials.password);

        const { data } = await api.post<AuthResponse>(
            "/api/v1/auth/login",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return data;
    },

    signup: async (credentials: SignupCredentials) => {
        try {
            const { data } = await api.post<AuthResponse>(
                "/api/v1/auth/signup",
                credentials
            );
            return data;
        } catch (error: any) {
            console.error("Signup error:", error.response?.data);
            if (error.response?.data?.detail) {
                throw new Error(error.response.data.detail);
            }
            throw new Error("회원가입 중 오류가 발생했습니다.");
        }
    },

    me: async () => {
        const { data } = await api.get<User>("/api/v1/auth/me");
        return data;
    },
};
