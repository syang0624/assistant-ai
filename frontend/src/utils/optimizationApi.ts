import api from "./api";
import type {
    OptimizationRequest,
    OptimizationResponse,
    SuggestionRequest,
    SuggestionResponse,
} from "../types/optimization";

export const optimizationAPI = {
    optimizeSchedule: async (
        request: OptimizationRequest
    ): Promise<OptimizationResponse> => {
        const { data } = await api.post<OptimizationResponse>(
            "/api/v1/optimize-schedule",
            request
        );
        return data;
    },

    reoptimize: async (
        request: OptimizationRequest
    ): Promise<OptimizationResponse> => {
        const { data } = await api.post<OptimizationResponse>(
            "/api/v1/reoptimize-schedule",
            request
        );
        return data;
    },

    reoptimizeSchedule: async (
        request: OptimizationRequest
    ): Promise<OptimizationResponse> => {
        const { data } = await api.post<OptimizationResponse>(
            "/api/v1/reoptimize-schedule",
            request
        );
        return data;
    },

    suggestSchedules: async (
        request: SuggestionRequest
    ): Promise<SuggestionResponse> => {
        const { data } = await api.post<SuggestionResponse>(
            "/api/v1/suggest-schedules",
            request
        );
        return data;
    },
};
