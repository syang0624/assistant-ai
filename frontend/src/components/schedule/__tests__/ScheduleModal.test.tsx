import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../../../contexts/AuthContext";
import ScheduleModal from "../ScheduleModal";

const mockUser = {
    id: "test-user-id",
    email: "test@example.com",
    name: "Test User",
    district: "강남구",
    activity_level: "보통"
};

const wrap = (ui: React.ReactElement) => render(
    <BrowserRouter>
        <AuthProvider>
            {ui}
        </AuthProvider>
    </BrowserRouter>
);

test("필수 입력 검증: 제목/시간/장소", async () => {
    const onClose = vi.fn();
    const onSaved = vi.fn();

    wrap(
        <ScheduleModal
            isOpen={true}
            onClose={onClose}
            onSaved={onSaved}
            initial={{ start_time: "2025-01-01T09:00", end_time: "2025-01-01T10:00" }}
        />
    );

    fireEvent.click(screen.getByText("추가"));
    expect(await screen.findByText(/제목을 입력하세요/)).toBeInTheDocument();
});
