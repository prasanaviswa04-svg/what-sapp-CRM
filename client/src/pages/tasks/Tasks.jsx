import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';
import {
  CheckSquare,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0]
  });

  const { addToast } = useToast();

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tasks', {
        params: { status: statusFilter }
      });
      if (res.data.success) {
        setTasks(res.data.tasks || []);
      }
    } catch (err) {
      addToast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/tasks', formData);
      if (res.data.success) {
        addToast('Task scheduled successfully!', 'success');
        setIsModalOpen(false);
        setFormData({ title: '', description: '', priority: 'Medium', dueDate: new Date().toISOString().split('T')[0] });
        fetchTasks();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create task', 'error');
    }
  };

  const handleToggleComplete = async (task) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      await api.put(`/tasks/${task._id}`, { status: newStatus });
      addToast(`Task marked as ${newStatus}`, 'success');
      fetchTasks();
    } catch (err) {
      addToast('Failed to update task', 'error');
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      addToast('Task removed', 'info');
      fetchTasks();
    } catch (err) {
      addToast('Failed to delete task', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200/60 pb-5">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100/90 text-amber-900 border border-amber-300/80 inline-flex items-center gap-1 shadow-2xs">
              <CheckSquare className="w-3 h-3 text-amber-600" /> DAILY TASKS & DELIVERABLES
            </span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">Tasks & Operational Reminders</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Track broker deliverables, client document collection, bank approvals, and walkthrough coordination.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="gold" size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
            Add Task
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['All', 'Pending', 'In Progress', 'Completed'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === st
                ? 'bg-gradient-to-r from-[#ffe066] via-[#ffd700] to-[#e6c200] text-zinc-950 font-bold border border-[#ffd700] shadow-xs'
                : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-amber-50/50 hover:text-amber-950'
            }`}
          >
            {st} Tasks
          </button>
        ))}
      </div>

      {/* Task List */}
      <Card>
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No tasks scheduled"
            description="Create tasks to keep broker follow-ups organized."
            actionLabel="Add Task"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="divide-y divide-zinc-200">
            {tasks.map((task) => {
              const isCompleted = task.status === 'Completed';
              return (
                <div
                  key={task._id}
                  className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-3 hover:bg-zinc-50 transition"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition ${
                        isCompleted
                          ? 'bg-zinc-950 border-zinc-950 text-white'
                          : 'border-zinc-300 hover:border-zinc-950 text-transparent'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
                    </button>

                    <div>
                      <h4
                        className={`text-xs sm:text-sm font-bold ${
                          isCompleted ? 'text-zinc-400 line-through' : 'text-zinc-950'
                        }`}
                      >
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{task.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-[11px] text-zinc-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-400" /> Due:{' '}
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>Assigned: {task.assignedTo?.firstName || 'Me'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={task.priority}>{task.priority}</Badge>
                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-950 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Add Task Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Task / Reminder" size="md">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
              placeholder="e.g. Collect stamp duty agreement from buyer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1">Description / Details</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
              placeholder="Add key notes, contact names, or documents needed..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none bg-white text-zinc-900"
              >
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
