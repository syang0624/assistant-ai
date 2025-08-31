import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { OnboardingProvider } from "../../contexts/OnboardingContext";
import OnboardingWizard from "../OnboardingWizard";

const renderWithProviders = (component: React.ReactElement) => {
    return render(
        <BrowserRouter>
            <OnboardingProvider>{component}</OnboardingProvider>
        </BrowserRouter>
    );
};

describe("OnboardingWizard", () => {
    test("온보딩 마법사가 렌더링됩니다", () => {
        renderWithProviders(<OnboardingWizard />);

        expect(screen.getByText("Assistant AI 설정")).toBeInTheDocument();
        expect(screen.getByText("지역구 선택")).toBeInTheDocument();
    });

    test("3단계 진행률이 표시됩니다", () => {
        renderWithProviders(<OnboardingWizard />);

        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
    });
});
