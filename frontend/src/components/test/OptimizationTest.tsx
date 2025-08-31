import { useState } from 'react';
import { optimizationAPI } from '../../utils/optimizationApi';

export default function OptimizationTest() {
    const [testResult, setTestResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const testOptimization = async () => {
        setLoading(true);
        setError('');
        
        try {
            const request = {
                date: new Date().toISOString(),
                include_existing: false
            };
            
            const result = await optimizationAPI.optimizeSchedule(request);
            setTestResult(result);
        } catch (err: any) {
            setError(err.message || '테스트 실패');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">AI 최적화 테스트</h2>
            
            <button
                onClick={testOptimization}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
                {loading ? '테스트 중...' : '최적화 테스트 실행'}
            </button>
            
            {error && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
                    오류: {error}
                </div>
            )}
            
            {testResult && (
                <div className="mt-4">
                    <h3 className="font-semibold mb-2">테스트 결과:</h3>
                    <div className="bg-gray-50 p-3 rounded">
                        <p><strong>성공:</strong> {testResult.success ? '예' : '아니오'}</p>
                        <p><strong>메시지:</strong> {testResult.message}</p>
                        <p><strong>일정 수:</strong> {testResult.schedule?.length || 0}</p>
                        <p><strong>총 거리:</strong> {testResult.total_distance?.toFixed(1)}km</p>
                        <p><strong>예상 노출:</strong> {testResult.estimated_exposure}명</p>
                    </div>
                    
                    {testResult.schedule && testResult.schedule.length > 0 && (
                        <div className="mt-4">
                            <h4 className="font-semibold mb-2">생성된 일정:</h4>
                            <div className="space-y-2">
                                {testResult.schedule.map((item: any, index: number) => (
                                    <div key={index} className="bg-blue-50 p-3 rounded">
                                        <p><strong>{item.title}</strong></p>
                                        <p>시간: {new Date(item.start_time).toLocaleTimeString()} - {new Date(item.end_time).toLocaleTimeString()}</p>
                                        <p>장소: {item.location}</p>
                                        <p>주소: {item.address}</p>
                                        <p>이동시간: {item.travel_time}분, 거리: {item.travel_distance?.toFixed(1)}km</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
