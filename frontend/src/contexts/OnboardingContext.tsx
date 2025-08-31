import { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { OnboardingData, OnboardingStep } from '../types/onboarding';
import { authAPI } from '../utils/api';

interface OnboardingContextType {
    currentStep: number;
    onboardingData: OnboardingData;
    steps: OnboardingStep[];
    updateDistrict: (district: string) => void;
    updateActivityLevel: (level: 'easy' | 'medium' | 'hard') => void;
    updateFirstSchedule: (schedule: OnboardingData['firstSchedule']) => void;
    nextStep: () => void;
    prevStep: () => void;
    completeOnboarding: () => Promise<void>;
    isStepValid: (step: number) => boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const INITIAL_STEPS: OnboardingStep[] = [
    {
        id: 1,
        title: '지역구 선택',
        description: '활동할 지역구를 선택해주세요',
        isCompleted: false,
    },
    {
        id: 2,
        title: '활동 강도 설정',
        description: '일일 활동 강도를 선택해주세요',
        isCompleted: false,
    },
    {
        id: 3,
        title: '첫 일정 입력',
        description: '첫 번째 일정을 입력해주세요',
        isCompleted: false,
    },
];

const INITIAL_DATA: OnboardingData = {
    district: '',
    activityLevel: 'medium',
    firstSchedule: {
        title: '',
        date: '',
        time: '',
        location: '',
    },
};

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [onboardingData, setOnboardingData] = useState<OnboardingData>(INITIAL_DATA);
    const [steps, setSteps] = useState<OnboardingStep[]>(INITIAL_STEPS);
    const navigate = useNavigate();

    const updateDistrict = useCallback((district: string) => {
        setOnboardingData(prev => ({ ...prev, district }));
        updateStepCompletion(1, true);
    }, []);

    const updateActivityLevel = useCallback((level: 'easy' | 'medium' | 'hard') => {
        setOnboardingData(prev => ({ ...prev, activityLevel: level }));
        updateStepCompletion(2, true);
    }, []);

    const updateFirstSchedule = useCallback((schedule: OnboardingData['firstSchedule']) => {
        setOnboardingData(prev => ({ ...prev, firstSchedule: schedule }));
        updateStepCompletion(3, true);
    }, []);

    const updateStepCompletion = useCallback((stepId: number, isCompleted: boolean) => {
        setSteps(prev => prev.map(step => 
            step.id === stepId ? { ...step, isCompleted } : step
        ));
    }, []);

    const nextStep = useCallback(() => {
        if (currentStep < 3) {
            setCurrentStep(prev => prev + 1);
        }
    }, [currentStep]);

    const prevStep = useCallback(() => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    const isStepValid = useCallback((step: number) => {
        switch (step) {
            case 1:
                return onboardingData.district.length > 0;
            case 2:
                return onboardingData.activityLevel !== '';
            case 3:
                return onboardingData.firstSchedule.title.length > 0 &&
                       onboardingData.firstSchedule.date.length > 0 &&
                       onboardingData.firstSchedule.time.length > 0 &&
                       onboardingData.firstSchedule.location.length > 0;
            default:
                return false;
        }
    }, [onboardingData]);

    const completeOnboarding = useCallback(async () => {
        try {
            // 온보딩 데이터를 백엔드로 전송
            await authAPI.completeOnboarding(onboardingData);
            
            // 온보딩 완료 후 메인 페이지로 이동
            navigate('/calendar');
        } catch (error) {
            console.error('온보딩 완료 실패:', error);
        }
    }, [onboardingData, navigate]);

    const value: OnboardingContextType = {
        currentStep,
        onboardingData,
        steps,
        updateDistrict,
        updateActivityLevel,
        updateFirstSchedule,
        nextStep,
        prevStep,
        completeOnboarding,
        isStepValid,
    };

    return (
        <OnboardingContext.Provider value={value}>
            {children}
        </OnboardingContext.Provider>
    );
}

export function useOnboarding() {
    const context = useContext(OnboardingContext);
    if (context === undefined) {
        throw new Error('useOnboarding must be used within an OnboardingProvider');
    }
    return context;
}
