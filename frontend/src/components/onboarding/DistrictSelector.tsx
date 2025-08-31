import { useOnboarding } from '../../contexts/OnboardingContext';

const DISTRICT_DATA = {
    "군포시": {
        "제1선거구 (군포1동, 산본1동, 금정동)": ["군포1동", "산본1동", "금정동"],
    },
    "서대문구": {
        "제1선거구": {
            "가선거구 (천연동, 북아현동, 충현동, 신촌동)": ["천연동", "북아현동", "충현동", "신촌동"],
        },
    },
};

export default function DistrictSelector() {
    const { onboardingData, updateDistrict, nextStep, isStepValid } = useOnboarding();

    const handleDistrictSelect = (district: string) => {
        updateDistrict(district);
    };

    const handleNext = () => {
        if (isStepValid(1)) {
            nextStep();
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900">지역구 선택</h3>
                <p className="mt-1 text-sm text-gray-500">
                    활동할 지역구를 선택해주세요
                </p>
            </div>

            <div className="space-y-4">
                {Object.entries(DISTRICT_DATA).map(([city, districts]) => (
                    <div key={city} className="border rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">{city}</h4>
                        <div className="space-y-2">
                            {Object.entries(districts).map(([district, dongs]) => (
                                <button
                                    key={district}
                                    onClick={() => handleDistrictSelect(`${city} ${district}`)}
                                    className={`w-full text-left p-3 rounded-md border transition-colors ${
                                        onboardingData.district === `${city} ${district}`
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="font-medium text-gray-900">{district}</div>
                                    {Array.isArray(dongs) && (
                                        <div className="text-sm text-gray-500">
                                            {dongs.join(', ')}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleNext}
                    disabled={!isStepValid(1)}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                        isStepValid(1)
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
