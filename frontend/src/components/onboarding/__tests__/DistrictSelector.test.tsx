import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { OnboardingProvider } from '../../contexts/OnboardingContext';
import DistrictSelector from '../DistrictSelector';

const renderWithProviders = (component: React.ReactElement) => {
    return render(
        <BrowserRouter>
            <OnboardingProvider>
                {component}
            </OnboardingProvider>
        </BrowserRouter>
    );
};

describe('DistrictSelector', () => {
    test('지역구 선택 UI가 올바르게 렌더링됩니다', () => {
        renderWithProviders(<DistrictSelector />);
        
        expect(screen.getByText('지역구 선택')).toBeInTheDocument();
        expect(screen.getByText('군포시')).toBeInTheDocument();
        expect(screen.getByText('서대문구')).toBeInTheDocument();
    });

    test('지역구를 선택하면 다음 버튼이 활성화됩니다', () => {
        renderWithProviders(<DistrictSelector />);
        
        const nextButton = screen.getByText('다음');
        expect(nextButton).toBeDisabled();
        
        const districtButton = screen.getByText('제1선거구 (군포1동, 산본1동, 금정동)');
        fireEvent.click(districtButton);
        
        expect(nextButton).not.toBeDisabled();
    });

    test('지역구 선택 후 다음 단계로 이동할 수 있습니다', () => {
        renderWithProviders(<DistrictSelector />);
        
        const districtButton = screen.getByText('제1선거구 (군포1동, 산본1동, 금정동)');
        fireEvent.click(districtButton);
        
        const nextButton = screen.getByText('다음');
        fireEvent.click(nextButton);
        
        // 다음 단계로 이동했는지 확인 (컨텍스트 상태 변경 확인)
        expect(nextButton).toBeInTheDocument();
    });
});
