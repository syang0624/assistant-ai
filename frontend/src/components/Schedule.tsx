import { useState } from 'react';
import { scheduleAPI } from '../services/api';
import type { ScheduleRequest, ScheduleResponse } from '../types';
import { format, parseISO } from 'date-fns';

const Schedule: React.FC = () => {
  const [scheduleRequest, setScheduleRequest] = useState<ScheduleRequest>({
    date: new Date().toISOString().split('T')[0],
    day_start: '09:00',
    day_end: '18:00'
  });
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const request = {
        date: new Date(scheduleRequest.date + 'T00:00:00').toISOString(),
        day_start: new Date(scheduleRequest.date + 'T' + scheduleRequest.day_start + ':00').toISOString(),
        day_end: new Date(scheduleRequest.date + 'T' + scheduleRequest.day_end + ':00').toISOString()
      };

      const response = await scheduleAPI.build(request);
      setSchedule(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to build schedule');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (isoString: string) => {
    try {
      return format(parseISO(isoString), 'HH:mm');
    } catch {
      return isoString;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Build Schedule</h1>
        <p className="text-gray-600">Generate an optimal schedule for your tasks</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={scheduleRequest.date}
              onChange={(e) => setScheduleRequest(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Day Start
            </label>
            <input
              type="time"
              value={scheduleRequest.day_start}
              onChange={(e) => setScheduleRequest(prev => ({ ...prev, day_start: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Day End
            </label>
            <input
              type="time"
              value={scheduleRequest.day_end}
              onChange={(e) => setScheduleRequest(prev => ({ ...prev, day_end: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Building Schedule...' : 'Build Schedule'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {schedule && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Scheduled Tasks</h2>
            {schedule.items.length === 0 ? (
              <p className="text-gray-500">No tasks scheduled for this time period.</p>
            ) : (
              <div className="space-y-3">
                {schedule.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{item.title}</span>
                      <span className="text-sm text-gray-500 ml-2">({item.task_id})</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatTime(item.start)} - {formatTime(item.end)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {schedule.unscheduled.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Unscheduled Tasks</h2>
              <div className="space-y-2">
                {schedule.unscheduled.map((taskId, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    {taskId}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Schedule;
