/**
 * 한국 시간 기준 유틸리티 함수들
 * 모든 시간을 한국 시간 기준으로 처리 (UTC 변환 없음)
 */

/**
 * 현재 한국 시간을 ISO 문자열로 반환 (한국 시간 기준)
 */
export function getCurrentKoreanTime(): string {
    const now = new Date();
    // 한국 시간대를 명시적으로 설정
    const koreanTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Seoul" })
    );
    return koreanTime.toISOString().slice(0, 16);
}

/**
 * 한국 시간 기준으로 1시간 후 시간을 ISO 문자열로 반환
 */
export function getKoreanTimePlusOneHour(): string {
    const now = new Date();
    const koreanTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Seoul" })
    );
    const oneHourLater = new Date(koreanTime.getTime() + 60 * 60 * 1000);
    return oneHourLater.toISOString().slice(0, 16);
}

/**
 * 특정 날짜를 한국 시간 기준으로 처리
 */
export function getKoreanTimeForDate(date: Date): string {
    const koreanTime = new Date(
        date.toLocaleString("en-US", { timeZone: "Asia/Seoul" })
    );
    return koreanTime.toISOString().slice(0, 16);
}

/**
 * 한국 시간 기준으로 날짜를 포맷팅
 */
export function formatKoreanDate(date: Date): string {
    return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
        timeZone: "Asia/Seoul",
    });
}

/**
 * 한국 시간 기준으로 시간을 포맷팅
 */
export function formatKoreanTime(date: Date): string {
    return date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Seoul",
    });
}

/**
 * 한국 시간 기준으로 날짜와 시간을 포맷팅
 */
export function formatKoreanDateTime(date: Date): string {
    return `${formatKoreanDate(date)} ${formatKoreanTime(date)}`;
}

/**
 * 한국 시간 기준으로 현재 시간을 Date 객체로 반환
 */
export function getCurrentKoreanDate(): Date {
    const now = new Date();
    return new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
}

/**
 * 한국 시간 기준으로 특정 시간을 Date 객체로 반환
 */
export function getKoreanDateForTime(timeString: string): Date {
    // timeString은 "YYYY-MM-DDTHH:MM" 형식
    const [datePart, timePart] = timeString.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);

    // 한국 시간대로 Date 객체 생성
    return new Date(year, month - 1, day, hour, minute);
}
