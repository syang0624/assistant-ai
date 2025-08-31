import { useOnboarding } from '../../contexts/OnboardingContext';

export default function ActivityLevelSelector() {
    const { onboardingData, updateActivityLevel, nextStep, prevStep, isStepValid } = useOnboarding();

    const activityLevels = [
        { value: 'easy', label: '쉬움', description: '하루 2-3개 일정, 가벼운 활동' },
        { value: 'medium', label: '보통', description: '하루 4-6개 일정, 적당한 활동' },
        { value: 'hard', label: '어려움', description: '하루 7-8개 일정, 강한 활동' }
    ];

    const handleLevelSelect = (level: 'easy' | 'medium' | 'hard') => {
        updateActivityLevel(level);
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900">활동 강도 설정</h3>
                <p className="mt-1 text-sm text-gray-500">
                    일일 활동 강도를 선택해주세요
                </p>
            </div>

            <div className="space-y-4">
                {activityLevels.map((level) => (
                    <button
                        key={level.value}
                        onClick={() => handleLevelSelect(level.value as 'easy' | 'medium' | 'hard')}
                        className={`w-full text-left p-4 rounded-lg border transition-colors ${
                            onboardingData.activityLevel === level.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium text-gray-900">{level.label}</div>
                                <div className="text-sm text-gray-500">{level.description}</div>
                            </div>
                            {onboardingData.activityLevel === level.value && (
                                <div className="text-blue-600">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            <div className="flex justify-between">
                <button
                    onClick={prevStep}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    이전
                </button>
                <button
                    onClick={nextStep}
                    disabled={!isStepValid(2)}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                        isStepValid(2)
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    다음
                </button>
            </div>
        </div>
    );
}
