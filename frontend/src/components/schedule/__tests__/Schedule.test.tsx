import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../../../contexts/AuthContext";
import Schedule from "../Schedule";
import { vi } from "vitest";

// Mock the API calls
vi.mock("../../../utils/api", () => ({
    schedulesAPI: {
        list: vi.fn().mockResolvedValue([]),
    },
    locationsAPI: {
        list: vi.fn().mockResolvedValue([]),
    },
}));

const wrap = (component: React.ReactElement) => {
    return render(
        <BrowserRouter>
            <AuthProvider>{component}</AuthProvider>
        </BrowserRouter>
    );
};

describe("Schedule Component", () => {
    it("renders calendar with title", () => {
        wrap(<Schedule />);

        expect(screen.getByText("캘린더")).toBeInTheDocument();
        expect(
            screen.getByText(
                "일정을 클릭해 수정/삭제, 빈 칸 클릭해 추가, 시간대 드래그로 해당 시간에 일정 생성"
            )
        ).toBeInTheDocument();
    });

    it("loads and displays schedules", async () => {
        wrap(<Schedule />);

        // Wait for schedules to load
        await screen.findByText("캘린더");
    });

    it("shows calendar navigation controls", () => {
        wrap(<Schedule />);

        // Check for navigation controls
        expect(screen.getByText("오늘")).toBeInTheDocument();
        expect(screen.getByTitle("월")).toBeInTheDocument();
        expect(screen.getByTitle("주")).toBeInTheDocument();
    });
});
