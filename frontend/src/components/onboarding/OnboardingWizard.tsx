import { useOnboarding } from '../../contexts/OnboardingContext';
import DistrictSelector from './DistrictSelector';
import ActivityLevelSelector from './ActivityLevelSelector';
import FirstScheduleInput from './FirstScheduleInput';

export default function OnboardingWizard() {
    const { currentStep, steps } = useOnboarding();

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <DistrictSelector />;
            case 2:
                return <ActivityLevelSelector />;
            case 3:
                return <FirstScheduleInput />;
            default:
                return <DistrictSelector />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Assistant AI 설정
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    몇 가지 정보를 입력하면 AI가 최적의 일정을 만들어드립니다
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {/* Stepper */}
                    <div className="mb-8">
                        <nav aria-label="Progress">
                            <ol className="space-y-4 md:flex md:space-x-8 md:space-y-0">
                                {steps.map((step) => (
                                    <li key={step.id} className="md:flex-1">
                                        <div className={`group pl-4 py-2 flex flex-col border-l-4 md:pl-0 md:pt-4 md:pb-0 md:border-l-0 md:border-t-4 ${
                                            step.id <= currentStep
                                                ? 'border-blue-600'
                                                : 'border-gray-200'
                                        }`}>
                                            <span className={`text-xs font-semibold tracking-wide uppercase ${
                                                step.id <= currentStep
                                                    ? 'text-blue-600'
                                                    : 'text-gray-500'
                                            }`}>
                                                {step.id}
                                            </span>
                                            <span className="text-sm font-medium">{step.title}</span>
                                            <span className="text-xs text-gray-500">{step.description}</span>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </nav>
                    </div>

                    {/* Step Content */}
                    {renderStep()}
                </div>
            </div>
        </div>
    );
}
