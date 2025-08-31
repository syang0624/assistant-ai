export interface OptimizationRequest {
    date: string;
    include_existing: boolean;
    delay_minutes?: number;
    current_location?: string;
}

export interface ScheduleItem {
    title: string;
    start_time: string;
    end_time: string;
    location: string;
    location_type: string;
    priority: number;
    travel_time: number;
}

export interface OptimizationResponse {
    success: boolean;
    message: string;
    schedule: ScheduleItem[];
    total_distance: number;
    estimated_exposure: number;
}
