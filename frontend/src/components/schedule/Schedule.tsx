import { useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import koLocale from "@fullcalendar/core/locales/ko";
import Navigation from "../shared/Navigation";
import ScheduleModal from "./ScheduleModal";
import { schedulesAPI } from "../../utils/api";

type FCEvent = {
    id: string;
    title: string;
    start: string;
    end: string;
    extendedProps: {
        description?: string;
        location_id: string;
        location_name?: string;
        location_address?: string;
    };
};

export default function Schedule() {
    const calendarRef = useRef<FullCalendar | null>(null);
    const [events, setEvents] = useState<FCEvent[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<any | null>(null);

    const load = async () => {
        const list = await schedulesAPI.list();
        const mapped: FCEvent[] = (list || []).map((s: any) => ({
            id: s.id,
            title: s.title,
            start: s.start_time,
            end: s.end_time,
            extendedProps: {
                description: s.description,
                location_id: s.location?.id,
                location_name: s.location?.name,
                location_address: s.location?.address,
            },
        }));
        setEvents(mapped);
    };

    useEffect(() => {
        load();
    }, []);

    const handleDateClick = (arg: any) => {
        const start = new Date(arg.date);
        const end = new Date(start.getTime() + 60 * 60 * 1000);
        setEditing({
            start_time: start.toISOString().slice(0, 16),
            end_time: end.toISOString().slice(0, 16),
        });
        setModalOpen(true);
    };

    const handleEventClick = (arg: any) => {
        const e = arg.event;
        setEditing({
            id: e.id,
            title: e.title,
            start_time: e.start
                ? new Date(e.start).toISOString().slice(0, 16)
                : "",
            end_time: e.end ? new Date(e.end).toISOString().slice(0, 16) : "",
            description: e.extendedProps?.description || "",
            location_id: e.extendedProps?.location_id || "",
            location_name: e.extendedProps?.location_name || "",
            location_address: e.extendedProps?.location_address || "",
        });
        setModalOpen(true);
    };

    const handleEventDropOrResize = async (arg: any) => {
        const e = arg.event;
        await schedulesAPI.update(e.id, {
            start_time: e.start?.toISOString(),
            end_time: e.end?.toISOString(),
        });
        await load();
    };

    const handleDelete = async () => {
        if (!editing?.id) return;
        await schedulesAPI.delete(editing.id);
        setModalOpen(false);
        setEditing(null);
        await load();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-center mb-3">
                        <h1 className="text-xl font-semibold">캘린더</h1>
                        <div className="text-sm text-gray-500">
                            일정을 클릭해 수정/삭제, 빈 칸 클릭해 추가
                        </div>
                    </div>
                    <FullCalendar
                        ref={calendarRef as any}
                        plugins={[
                            dayGridPlugin,
                            timeGridPlugin,
                            interactionPlugin,
                        ]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: "prev,next today",
                            center: "title",
                            right: "dayGridMonth,timeGridWeek,timeGridDay",
                        }}
                        locale={koLocale}
                        events={events}
                        selectable
                        editable
                        eventResizableFromStart
                        dateClick={handleDateClick}
                        eventClick={handleEventClick}
                        eventDrop={handleEventDropOrResize}
                        eventResize={handleEventDropOrResize}
                    />
                </div>
            </div>

            <ScheduleModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditing(null);
                }}
                initial={editing || undefined}
                onSaved={load}
            />

            {editing?.id && modalOpen && (
                <div className="fixed bottom-5 right-5">
                    <button
                        className="px-4 py-2 rounded bg-red-600 text-white"
                        onClick={handleDelete}
                    >
                        삭제
                    </button>
                </div>
            )}
        </div>
    );
}
