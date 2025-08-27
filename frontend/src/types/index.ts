// User types
export interface User {
    username: string;
    password: string;
}

// Task types
export interface Task {
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

// Location types
export interface Location {
    constituencies: Record<string, string[]>;
}

// Schedule types
export interface ScheduleRequest {
    date: string;
    day_start: string;
    day_end: string;
}

export interface ScheduleItem {
    task_id: string;
    title: string;
    start: string;
    end: string;
}

export interface ScheduleResponse {
    items: ScheduleItem[];
    unscheduled: string[];
}

// API response types
export interface ApiResponse {
    ok: boolean;
}
