export interface OnboardingData {
    district: string;
    activityLevel: "easy" | "medium" | "hard";
    firstSchedule: {
        title: string;
        date: string;
        time: string;
        location: string;
    };
}

export interface OnboardingStep {
    id: number;
    title: string;
    description: string;
    isCompleted: boolean;
}
