import { z } from 'zod';

export const onboardingSchema = z.object({
    district: z.string().min(1, '지역구를 선택해주세요'),
    activityLevel: z.enum(['easy', 'medium', 'hard'], {
        required_error: '활동 강도를 선택해주세요'
    }),
    firstSchedule: z.object({
        title: z.string().min(1, '일정 제목을 입력해주세요'),
        date: z.string().min(1, '날짜를 선택해주세요'),
        time: z.string().min(1, '시간을 선택해주세요'),
        location: z.string().min(1, '장소를 입력해주세요')
    })
});

export type OnboardingSchema = z.infer<typeof onboardingSchema>;
