import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
    test.beforeEach(async ({ page }) => {
        // 온보딩 페이지로 이동
        await page.goto('/onboarding');
    });

    test('온보딩 3단계 완료 후 메인 페이지 이동', async ({ page }) => {
        // 1단계: 지역구 선택
        await expect(page.getByText('지역구 선택')).toBeVisible();
        await page.click('text=제1선거구 (군포1동, 산본1동, 금정동)');
        await page.click('text=다음');

        // 2단계: 활동 강도 선택
        await expect(page.getByText('활동 강도 설정')).toBeVisible();
        await page.click('text=보통');
        await page.click('text=다음');

        // 3단계: 첫 일정 입력
        await expect(page.getByText('첫 일정 입력')).toBeVisible();
        await page.fill('input[name="title"]', '첫 번째 일정');
        await page.fill('input[name="date"]', '2024-01-15');
        await page.fill('input[name="time"]', '09:00');
        await page.fill('input[name="location"]', '군포시청');
        await page.click('text=온보딩 완료');

        // 메인 페이지로 이동 확인
        await expect(page).toHaveURL('/calendar');
        await expect(page.getByText('일정 관리')).toBeVisible();
    });

    test('각 단계별 유효성 검사', async ({ page }) => {
        // 1단계에서 지역구를 선택하지 않고 다음 버튼 클릭
        await page.click('text=다음');
        
        // 다음 버튼이 비활성화되어 있는지 확인
        const nextButton = page.getByRole('button', { name: '다음' });
        await expect(nextButton).toBeDisabled();
        
        // 지역구 선택 후 다음 버튼 활성화 확인
        await page.click('text=제1선거구 (군포1동, 산본1동, 금정동)');
        await expect(nextButton).toBeEnabled();
    });

    test('온보딩 데이터 저장 확인', async ({ page }) => {
        // 전체 온보딩 과정 완료
        await page.click('text=제1선거구 (군포1동, 산본1동, 금정동)');
        await page.click('text=다음');
        await page.click('text=보통');
        await page.click('text=다음');
        await page.fill('input[name="title"]', '테스트 일정');
        await page.fill('input[name="date"]', '2024-01-16');
        await page.fill('input[name="time"]', '14:00');
        await page.fill('input[name="location"]', '테스트 장소');
        await page.click('text=온보딩 완료');

        // 메인 페이지에서 입력한 일정이 표시되는지 확인
        await expect(page.getByText('테스트 일정')).toBeVisible();
        await expect(page.getByText('테스트 장소')).toBeVisible();
    });
});
