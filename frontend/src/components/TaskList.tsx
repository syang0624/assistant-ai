import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, Calendar, Clock, MapPin } from "lucide-react";
import { taskAPI } from "../services/api";

// Define Task type locally to avoid import issues
interface Task {
    task_id: string;
    title: string;
    place_id?: string;
    constituency?: string;
    ward?: string;
    priority: number;
    duration_min: number;
    earliest?: string;
    latest?: string;
    window_from?: string;
    window_to?: string;
    depends_on: string[];
}

const TaskList: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const response = await taskAPI.list();
            setTasks(response.data);
        } catch (error) {
            console.error("Failed to load tasks:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (taskId: string) => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            try {
                await taskAPI.delete(taskId);
                setTasks(tasks.filter((task) => task.task_id !== taskId));
            } catch (error) {
                console.error("Failed to delete task:", error);
            }
        }
    };

    const getPriorityColor = (priority: number) => {
        if (priority <= 20) return "status-danger";
        if (priority <= 40) return "status-warning";
        if (priority <= 60) return "status-info";
        return "status-success";
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="loading-spinner"></div>
                <span className="ml-3 text-secondary">Loading tasks...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 fade-in">
            <div className="page-header">
                <h1 className="page-title">Tasks</h1>
                <p className="page-subtitle">
                    Manage your daily tasks and priorities
                </p>
            </div>

            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <span className="text-secondary">
                        {tasks.length} task{tasks.length !== 1 ? "s" : ""} total
                    </span>
                </div>
                <Link to="/tasks/new" className="btn btn-primary">
                    <Plus className="w-4 h-4" />
                    Add Task
                </Link>
            </div>

            {tasks.length === 0 ? (
                <div className="card text-center py-12">
                    <div className="space-y-4">
                        <div className="text-6xl text-secondary">📝</div>
                        <h3 className="text-lg font-medium text-primary">
                            No tasks yet
                        </h3>
                        <p className="text-secondary">
                            Create your first task to get started with
                            scheduling
                        </p>
                        <Link to="/tasks/new" className="btn btn-primary">
                            Create Your First Task
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4">
                    {tasks.map((task) => (
                        <div key={task.task_id} className="card slide-in">
                            <div className="card-body">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <h3 className="text-lg font-medium text-primary">
                                                {task.title}
                                            </h3>
                                            <span
                                                className={`status-badge ${getPriorityColor(
                                                    task.priority
                                                )}`}
                                            >
                                                P{task.priority}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                            <div className="flex items-center space-x-2 text-secondary">
                                                <Clock className="w-4 h-4" />
                                                <span>
                                                    {task.duration_min} min
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-secondary">
                                                <Calendar className="w-4 h-4" />
                                                <span>
                                                    Priority {task.priority}
                                                </span>
                                            </div>
                                            {task.constituency && (
                                                <div className="flex items-center space-x-2 text-secondary">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>
                                                        {task.constituency},{" "}
                                                        {task.ward}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {task.depends_on.length > 0 && (
                                            <div className="text-xs text-secondary bg-gray-50 p-2 rounded">
                                                <strong>Depends on:</strong>{" "}
                                                {task.depends_on.join(", ")}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() =>
                                                handleDelete(task.task_id)
                                            }
                                            className="btn btn-danger"
                                            title="Delete task"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TaskList;
