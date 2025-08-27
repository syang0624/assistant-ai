import axios from "axios";

// Define types locally to avoid import issues
interface Task {
    task_id: string;
    title: string;
    place_id?: string;
    constituency?: string;
    ward?: string;
    priority: number;
    duration_min: number;
    earliest?: string;
    latest?: string;
    window_from?: string;
    window_to?: string;
    depends_on: string[];
}

interface ScheduleRequest {
    date: string;
    day_start: string;
    day_end: string;
}

interface ScheduleResponse {
    items: Array<{
        task_id: string;
        title: string;
        start: string;
        end: string;
    }>;
    unscheduled: string[];
}

interface Location {
    constituencies: Record<string, string[]>;
}

// Use the actual Docker backend URL
const API_BASE_URL = "http://localhost:8000/api";

// Create axios instance with base configuration
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: false, // Important for CORS
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth APIs
export const authAPI = {
    signup: (user: { username: string; password: string }) =>
        api.post<{ ok: boolean }>("/signup", user),

    login: (user: { username: string; password: string }) =>
        api.post<{ ok: boolean }>("/login", user),
};

// Task APIs
export const taskAPI = {
    create: (task: Omit<Task, "task_id">) => api.post<Task>("/tasks", task),

    list: () => api.get<Task[]>("/tasks"),

    delete: (taskId: string) => api.delete<{ ok: boolean }>(`/tasks/${taskId}`),
};

// Schedule APIs
export const scheduleAPI = {
    build: (request: ScheduleRequest) =>
        api.post<ScheduleResponse>("/schedule/build", request),
};

// Location APIs
export const locationAPI = {
    get: () => api.get<Location>("/locations"),

    set: (location: Location) =>
        api.put<{ ok: boolean; count: number }>("/locations", location),
};

export default api;
