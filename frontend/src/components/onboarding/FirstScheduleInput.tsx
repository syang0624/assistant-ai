import { useOnboarding } from '../../contexts/OnboardingContext';

export default function FirstScheduleInput() {
    const { onboardingData, updateFirstSchedule, prevStep, completeOnboarding, isStepValid } = useOnboarding();

    const handleInputChange = (field: keyof typeof onboardingData.firstSchedule, value: string) => {
        updateFirstSchedule({
            ...onboardingData.firstSchedule,
            [field]: value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isStepValid(3)) {
            completeOnboarding();
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900">첫 일정 입력</h3>
                <p className="mt-1 text-sm text-gray-500">
                    첫 번째 일정을 입력해주세요
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        일정 제목 *
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={onboardingData.firstSchedule.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="예: 지역 주민과의 만남"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                            날짜 *
                        </label>
                        <input
                            type="date"
                            id="date"
                            value={onboardingData.firstSchedule.date}
                            onChange={(e) => handleInputChange('date', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                            시간 *
                        </label>
                        <input
                            type="time"
                            id="time"
                            value={onboardingData.firstSchedule.time}
                            onChange={(e) => handleInputChange('time', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                        장소 *
                    </label>
                    <input
                        type="text"
                        id="location"
                        value={onboardingData.firstSchedule.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="예: 군포시청 앞"
                        required
                    />
                </div>

                <div className="flex justify-between pt-4">
                    <button
                        type="button"
                        onClick={prevStep}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        이전
                    </button>
                    <button
                        type="submit"
                        disabled={!isStepValid(3)}
                        className={`px-6 py-2 rounded-md text-sm font-medium ${
                            isStepValid(3)
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        온보딩 완료
                    </button>
                </div>
            </form>
        </div>
    );
}
