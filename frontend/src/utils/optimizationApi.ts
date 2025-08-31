import api from './api';
import type { OptimizationRequest, OptimizationResponse } from '../types/optimization';

export const optimizationAPI = {
    optimizeSchedule: async (request: OptimizationRequest): Promise<OptimizationResponse> => {
        const { data } = await api.post<OptimizationResponse>('/api/v1/optimize-schedule', request);
        return data;
    },

    reoptimizeSchedule: async (request: OptimizationRequest): Promise<OptimizationResponse> => {
        const { data } = await api.post<OptimizationResponse>('/api/v1/reoptimize-schedule', request);
        return data;
    }
};
