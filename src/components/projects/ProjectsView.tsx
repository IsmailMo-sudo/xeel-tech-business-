import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Clock,
  Calendar,
  User,
  CheckCircle2,
  DollarSign,
  X,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import type { ProjectStage, Task } from '../../types';

export const ProjectsView: React.FC = () => {
  const { t } = useLanguage();
  const {
    projects,
    tasks,
    createProject,
    updateProjectStage,
    createTask,
    toggleTaskChecklist,
    updateTaskStatus,
    clients,
    currentUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'projects' | 'tasks'>('projects');
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Project form state
  const [projectForm, setProjectForm] = useState({
    name: '',
    clientId: '',
    budget: 0,
    startDate: new Date().toISOString().split('T')[0],
    deadline: new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0],
    manager: currentUser.fullName,
    assignedStaff: '',
    stage: 'planning' as ProjectStage,
    deliverables: '',
    notes: '',
  });

  // Task form state
  const [taskForm, setTaskForm] = useState({
    projectId: '',
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium' as Task['priority'],
    deadline: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    status: 'todo' as Task['status'],
    checklistInput: '',
  });

  const stages: { stage: ProjectStage; label: string; color: string }[] = [
    { stage: 'not_started', label: t.projects.stages.not_started, color: 'bg-neutral-400' },
    { stage: 'planning', label: t.projects.stages.planning, color: 'bg-blue-500' },
    { stage: 'in_progress', label: t.projects.stages.in_progress, color: 'bg-[#FF5407]' },
    { stage: 'review', label: t.projects.stages.review, color: 'bg-purple-500' },
    { stage: 'client_feedback', label: t.projects.stages.client_feedback, color: 'bg-amber-500' },
    { stage: 'revision', label: t.projects.stages.revision, color: 'bg-orange-500' },
    { stage: 'completed', label: t.projects.stages.completed, color: 'bg-emerald-500' },
    { stage: 'on_hold', label: t.projects.stages.on_hold, color: 'bg-neutral-500' },
  ];

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === projectForm.clientId);
    if (!projectForm.name || !client) return;

    createProject({
      name: projectForm.name,
      clientId: client.id,
      clientName: client.companyName || client.name,
      budget: Number(projectForm.budget) || 0,
      startDate: projectForm.startDate,
      deadline: projectForm.deadline,
      manager: projectForm.manager,
      assignedStaff: projectForm.assignedStaff.split(',').map(s => s.trim()).filter(Boolean),
      stage: projectForm.stage,
      deliverables: projectForm.deliverables,
      notes: projectForm.notes,
    });

    setIsProjectModalOpen(false);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find(p => p.id === taskForm.projectId);
    if (!taskForm.title || !proj) return;

    const checklistItems = taskForm.checklistInput
      ? taskForm.checklistInput.split(',').map((item, idx) => ({
          id: `chk-${Date.now()}-${idx}`,
          text: item.trim(),
          completed: false,
        })).filter(i => i.text)
      : [];

    createTask({
      projectId: proj.id,
      projectName: proj.name,
      title: taskForm.title,
      description: taskForm.description,
      assignedTo: taskForm.assignedTo,
      priority: taskForm.priority,
      deadline: taskForm.deadline,
      status: taskForm.status,
      checklist: checklistItems,
    });

    setIsTaskModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            {t.projects.title}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            {t.projects.subtitle} • {projects.length} Active Productions
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center p-1 bg-neutral-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'projects' ? 'bg-white text-neutral-900 shadow-2xs font-bold' : 'text-neutral-500'
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'tasks' ? 'bg-white text-neutral-900 shadow-2xs font-bold' : 'text-neutral-500'
              }`}
            >
              Tasks ({tasks.length})
            </button>
          </div>

          <button
            onClick={() => {
              if (clients.length > 0) setProjectForm(prev => ({ ...prev, clientId: clients[0].id }));
              setIsProjectModalOpen(true);
            }}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-[#FF5407] hover:bg-[#E04703] text-white shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {activeTab === 'projects' ? (
        /* Projects List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(proj => {
            const isLate = new Date(proj.deadline) < new Date() && proj.stage !== 'completed';

            return (
              <div
                key={proj.id}
                className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-2xs hover:border-[#FF5407] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-neutral-100 text-neutral-600">
                      {proj.projectRef}
                    </span>
                    <select
                      value={proj.stage}
                      onChange={e => updateProjectStage(proj.id, e.target.value as ProjectStage)}
                      className="text-[10px] font-bold rounded-full px-2.5 py-1 bg-neutral-100 border-none capitalize focus:outline-hidden"
                    >
                      {stages.map(s => (
                        <option key={s.stage} value={s.stage}>{s.label}</option>
                      ))}
                    </select>
                  </div>

                  <h3 className="text-base font-extrabold text-neutral-900 mb-1">{proj.name}</h3>
                  <p className="text-xs font-semibold text-[#FF5407] mb-2">{proj.clientName}</p>
                  <p className="text-xs text-neutral-500 line-clamp-2 mb-4">
                    {proj.deliverables || 'Ongoing deliverables handoff in progress.'}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-neutral-100 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-neutral-600">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      Budget: <strong>${proj.budget.toFixed(2)}</strong>
                    </span>
                    <span className={`flex items-center gap-1 font-semibold ${isLate ? 'text-rose-600' : 'text-neutral-500'}`}>
                      <Calendar className="w-3.5 h-3.5" />
                      Due: {proj.deadline}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                      <User className="w-3.5 h-3.5" />
                      <span>{proj.manager}</span>
                    </div>

                    <button
                      onClick={() => {
                        setTaskForm(prev => ({ ...prev, projectId: proj.id }));
                        setIsTaskModalOpen(true);
                      }}
                      className="text-[11px] font-bold text-[#FF5407] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Task
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Tasks List View */
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#FF5407]" />
              <span>Project Tasks & Milestones</span>
            </h3>
            <button
              onClick={() => {
                if (projects.length > 0) setTaskForm(prev => ({ ...prev, projectId: projects[0].id }));
                setIsTaskModalOpen(true);
              }}
              className="px-3 py-1.5 text-xs font-bold bg-[#FF5407] text-white rounded-lg flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Task
            </button>
          </div>

          <div className="divide-y divide-neutral-100">
            {tasks.length === 0 ? (
              <p className="p-8 text-center text-xs text-neutral-400">No tasks created yet.</p>
            ) : (
              tasks.map(task => {
                const isLate = new Date(task.deadline) < new Date() && task.status !== 'done';

                return (
                  <div key={task.id} className="p-4 hover:bg-neutral-50/70 transition-colors space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => updateTaskStatus(task.id, task.status === 'done' ? 'in_progress' : 'done')}
                          className={`mt-0.5 p-1 rounded-md transition-colors ${
                            task.status === 'done'
                              ? 'bg-emerald-500 text-white'
                              : 'border border-neutral-300 text-transparent hover:border-neutral-400'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <div>
                          <p className={`text-xs font-bold ${task.status === 'done' ? 'line-through text-neutral-400' : 'text-neutral-900'}`}>
                            {task.title}
                          </p>
                          <p className="text-[11px] text-neutral-500 font-medium">
                            Project: {task.projectName} • Assigned to: <strong className="text-neutral-700">{task.assignedTo}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            task.priority === 'urgent'
                              ? 'bg-rose-100 text-rose-700'
                              : task.priority === 'high'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          {task.priority}
                        </span>

                        <span className={`text-[11px] font-semibold flex items-center gap-1 ${isLate ? 'text-rose-600' : 'text-neutral-500'}`}>
                          <Clock className="w-3.5 h-3.5" />
                          {task.deadline}
                        </span>
                      </div>
                    </div>

                    {/* Checklists */}
                    {task.checklist && task.checklist.length > 0 && (
                      <div className="ml-7 pt-1 flex flex-wrap gap-2">
                        {task.checklist.map(item => (
                          <button
                            key={item.id}
                            onClick={() => toggleTaskChecklist(task.id, item.id)}
                            className={`px-2 py-1 rounded text-[11px] flex items-center gap-1.5 transition-colors ${
                              item.completed
                                ? 'bg-emerald-50 text-emerald-700 line-through'
                                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${item.completed ? 'bg-emerald-500' : 'bg-neutral-400'}`}></span>
                            <span>{item.text}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h3 className="text-base font-extrabold text-neutral-900">Initiate New Project</h3>
              <button onClick={() => setIsProjectModalOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={projectForm.name}
                  onChange={e => setProjectForm({ ...projectForm, name: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                  placeholder="e.g. Al-Nuur Social Campaign & Video Pack"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Client *</label>
                <select
                  required
                  value={projectForm.clientId}
                  onChange={e => setProjectForm({ ...projectForm, clientId: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.companyName ? `(${c.companyName})` : ''}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Agreed Budget ($)</label>
                  <input
                    type="number"
                    value={projectForm.budget}
                    onChange={e => setProjectForm({ ...projectForm, budget: Number(e.target.value) })}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Deadline Date *</label>
                  <input
                    type="date"
                    required
                    value={projectForm.deadline}
                    onChange={e => setProjectForm({ ...projectForm, deadline: e.target.value })}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Assigned Specialists</label>
                <input
                  type="text"
                  value={projectForm.assignedStaff}
                  onChange={e => setProjectForm({ ...projectForm, assignedStaff: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                  placeholder="Nimco Jaamac, Cabdifataax Raage"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Deliverables & Scope</label>
                <textarea
                  rows={2}
                  value={projectForm.deliverables}
                  onChange={e => setProjectForm({ ...projectForm, deliverables: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2 font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-[#FF5407] hover:bg-[#E04703] text-white rounded-xl shadow-xs"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h3 className="text-base font-extrabold text-neutral-900">Add Project Task</h3>
              <button onClick={() => setIsTaskModalOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Target Project *</label>
                <select
                  required
                  value={taskForm.projectId}
                  onChange={e => setTaskForm({ ...taskForm, projectId: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.clientName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                  placeholder="e.g. Export 4K video render and color grade"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Assignee</label>
                  <input
                    type="text"
                    value={taskForm.assignedTo}
                    onChange={e => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={e => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Deadline Date</label>
                <input
                  type="date"
                  value={taskForm.deadline}
                  onChange={e => setTaskForm({ ...taskForm, deadline: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Checklist Items (comma separated)</label>
                <input
                  type="text"
                  value={taskForm.checklistInput}
                  onChange={e => setTaskForm({ ...taskForm, checklistInput: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                  placeholder="Draft, Review, Client handoff"
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-[#FF5407] hover:bg-[#E04703] text-white rounded-xl shadow-xs"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
