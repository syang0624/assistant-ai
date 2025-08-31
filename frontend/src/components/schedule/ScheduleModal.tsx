import { useEffect, useMemo, useState } from "react";
import { locationsAPI, schedulesAPI } from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    initial?: {
        id?: string;
        title?: string;
        start_time: string;
        end_time: string;
        description?: string;
        location_id?: string;
        location_name?: string;
        location_address?: string;
    };
    onSaved: () => void;
};

export default function ScheduleModal({ isOpen, onClose, initial, onSaved }: Props) {
    const { user } = useAuth();
    const [title, setTitle] = useState(initial?.title || "");
    const [start, setStart] = useState(initial?.start_time || "");
    const [end, setEnd] = useState(initial?.end_time || "");
    const [description, setDescription] = useState(initial?.description || "");
    const [locationId, setLocationId] = useState(initial?.location_id || "");
    const [locationName, setLocationName] = useState(initial?.location_name || "");
    const [locationAddress, setLocationAddress] = useState(initial?.location_address || "");
    const [locations, setLocations] = useState<any[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isOpen) return;
        (async () => {
            try {
                const list = await locationsAPI.list(user?.district || undefined);
                setLocations(list || []);
            } catch {
                setLocations([]);
            }
        })();
    }, [isOpen, user?.district]);

    useEffect(() => {
        setTitle(initial?.title || "");
        setStart(initial?.start_time || "");
        setEnd(initial?.end_time || "");
        setDescription(initial?.description || "");
        setLocationId(initial?.location_id || "");
        setLocationName(initial?.location_name || "");
        setLocationAddress(initial?.location_address || "");
        setError("");
    }, [initial, isOpen]);

    const isEdit = useMemo(() => Boolean(initial?.id), [initial?.id]);

    const validate = () => {
        if (!title.trim()) return "제목을 입력하세요.";
        if (!start || !end) return "시간을 입력하세요.";
        if (new Date(start) >= new Date(end)) return "끝 시간은 시작 시간보다 이후여야 합니다.";
        if (!locationId && (!locationName.trim() || !locationAddress.trim())) return "장소를 선택하거나 새 장소 정보를 입력하세요.";
        return "";
    };

    const handleSave = async () => {
        const v = validate();
        if (v) return setError(v);

        try {
            let finalLocationId = locationId;

            if (!finalLocationId) {
                const created = await locationsAPI.create({
                    name: locationName.trim(),
                    address: locationAddress.trim(),
                    district: user?.district || "",
                });
                finalLocationId = created.id;
            }

            if (isEdit && initial?.id) {
                await schedulesAPI.update(initial.id, {
                    title: title.trim(),
                    start_time: start,
                    end_time: end,
                    description: description.trim() || undefined,
                    location_id: finalLocationId,
                });
            } else {
                await schedulesAPI.create({
                    title: title.trim(),
                    start_time: start,
                    end_time: end,
                    description: description.trim() || undefined,
                    location_id: finalLocationId,
                });
            }
            onSaved();
            onClose();
        } catch (e: any) {
            setError(e?.message || "저장 중 오류가 발생했습니다.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-lg shadow p-5">
                    <h3 className="text-lg font-semibold mb-4">{isEdit ? "일정 편집" : "새 일정"}</h3>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">제목 *</label>
                            <input className="w-full border rounded px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 주민 간담회" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">시작 *</label>
                                <input type="datetime-local" className="w-full border rounded px-3 py-2" value={start} onChange={(e) => setStart(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">종료 *</label>
                                <input type="datetime-local" className="w-full border rounded px-3 py-2" value={end} onChange={(e) => setEnd(e.target.value)} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">기존 장소 선택</label>
                            <select className="w-full border rounded px-3 py-2" value={locationId} onChange={(e) => setLocationId(e.target.value)}>
                                <option value="">선택 안 함</option>
                                {locations.map((l) => (
                                    <option key={l.id} value={l.id}>{l.name} ({l.address})</option>
                                ))}
                            </select>
                        </div>

                        {!locationId && (
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">새 장소명 *</label>
                                    <input className="w-full border rounded px-3 py-2" value={locationName} onChange={(e) => setLocationName(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">새 장소 주소 *</label>
                                    <input className="w-full border rounded px-3 py-2" value={locationAddress} onChange={(e) => setLocationAddress(e.target.value)} />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-1">설명</label>
                            <textarea className="w-full border rounded px-3 py-2" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>

                        {error && <div className="text-red-600 text-sm">{error}</div>}
                    </div>

                    <div className="mt-5 flex justify-end gap-2">
                        <button className="px-4 py-2 rounded border" onClick={onClose}>취소</button>
                        <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={handleSave}>{isEdit ? "수정" : "추가"}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
