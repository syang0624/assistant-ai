export interface TimeSlot {
    start: string;
    end: string;
    day: string;
}

export interface OptimizationRequest {
    date: string;
    include_existing: boolean;
    delay_minutes?: number;
    current_location?: string;
}

export interface SuggestionRequest {
    empty_time_slots: TimeSlot[];
    current_week_start?: string;
}

export interface ScheduleItem {
    title: string;
    start_time: string;
    end_time: string;
    location: string;
    address: string;
    location_type: string;
    priority: number;
    travel_time: number;
    travel_distance: number;
    exposure: number;
    description?: string;
    score?: number;
    day?: string;
}

export interface OptimizationResponse {
    success: boolean;
    message: string;
    schedule: ScheduleItem[];
    total_distance: number;
    estimated_exposure: number;
}

export interface SuggestionResponse {
    success: boolean;
    message: string;
    suggestions: ScheduleItem[];
    total_suggestions: number;
}
