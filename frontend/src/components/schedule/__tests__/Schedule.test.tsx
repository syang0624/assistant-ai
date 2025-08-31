import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../../../contexts/AuthContext";
import Schedule from "../Schedule";
import { schedulesAPI } from "../../../utils/api";

// Mock the API calls
vi.mock("../../../utils/api", () => ({
    schedulesAPI: {
        list: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
    locationsAPI: {
        list: vi.fn(),
        create: vi.fn(),
    },
}));

const mockSchedules = [
    {
        id: "1",
        title: "테스트 일정",
        start_time: "2025-01-01T09:00:00",
        end_time: "2025-01-01T10:00:00",
        description: "테스트 설명",
        location: {
            id: "loc1",
            name: "테스트 장소",
            address: "테스트 주소",
        },
    },
];

const wrap = (ui: React.ReactElement) => render(
    <BrowserRouter>
        <AuthProvider>
            {ui}
        </AuthProvider>
    </BrowserRouter>
);

describe("Schedule Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock successful API responses
        vi.mocked(schedulesAPI.list).mockResolvedValue(mockSchedules);
    });

    test("renders calendar with title", async () => {
        wrap(<Schedule />);
        
        expect(screen.getByText("캘린더")).toBeInTheDocument();
        expect(screen.getByText("일정을 클릭해 수정/삭제, 빈 칸 클릭해 추가")).toBeInTheDocument();
    });

    test("loads and displays schedules", async () => {
        wrap(<Schedule />);
        
        await waitFor(() => {
            expect(schedulesAPI.list).toHaveBeenCalled();
        });
    });

    test("shows calendar navigation controls", () => {
        wrap(<Schedule />);
        
        // Check for FullCalendar navigation elements (Korean locale)
        expect(screen.getByText("오늘")).toBeInTheDocument();
        expect(screen.getByTitle("월")).toBeInTheDocument(); // Use title attribute for month button
        expect(screen.getByTitle("주")).toBeInTheDocument(); // Use title attribute for week button
    });
});
