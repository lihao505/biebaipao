import { useNavigate } from 'react-router-dom';
import { type CSSProperties } from 'react';
import { Calendar, ChevronRight, Clock, Inbox, MapPin, RotateCcw } from 'lucide-react';
import Layout from '../components/Layout';
import EmptyState from '../components/EmptyState';
import RiskBadge from '../components/RiskBadge';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/cn';
import type { Task, TaskStatus } from '../types/task';
import type { RiskLevel } from '../types';

function formatDateTime(ts: number): string {
  const d = new Date(ts);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${mm}/${dd} ${hh}:${mi}`;
}

function riskTone(level: RiskLevel): string {
  if (level === 'low') return '#34c759';
  if (level === 'medium') return '#ff9f0a';
  return '#ff3b30';
}

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  preparing: { label: '准备中', className: 'bg-[#eaf3ff] text-[#0071e3]' },
  completed: { label: '已完成', className: 'bg-[#ecfff3] text-[#1a9e3f]' },
  abandoned: { label: '已放弃', className: 'bg-[#f0f0f2] text-[#86868b]' },
};

export default function HistoryPage() {
  const navigate = useNavigate();
  const { tasks, reopenTask, setCurrentTaskId, showToast } = useApp();

  const sortedTasks = [...tasks].sort((a, b) => b.updatedAt - a.updatedAt);

  const handleViewTask = (task: Task) => {
    if (task.status === 'preparing') {
      setCurrentTaskId(task.id);
    }
    navigate(`/task/${task.id}`);
  };

  const handleReopen = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    reopenTask(task.id);
    showToast('任务已重新打开', 'success');
    navigate(`/task/${task.id}`);
  };

  return (
    <Layout>
      <div className="mb-6">
        <p className="text-sm font-semibold text-[#0071e3]">办事记录</p>
        <h2 className="section-title mt-1">历史任务</h2>
        <p className="section-desc mt-2">
          查看所有任务的准备进度与状态，随时继续或复盘。
        </p>
      </div>

      {sortedTasks.length === 0 ? (
        <EmptyState
          icon={<Inbox size={28} />}
          title="还没有办事记录"
          description="完成第一个任务后，这里会留下你的办事足迹与准备进度。"
          actionLabel="开始第一个任务"
          onAction={() => navigate('/scenarios')}
        />
      ) : (
        <div className="space-y-3">
          {sortedTasks.map((task, idx) => {
            const status = statusConfig[task.status];
            const isPreparing = task.status === 'preparing';
            return (
              <div
                key={task.id}
                onClick={() => handleViewTask(task)}
                className="card lift-card stagger-item w-full cursor-pointer overflow-hidden p-4 text-left"
                style={{ '--stagger-index': idx } as CSSProperties}
              >
                <div className="flex items-start gap-3">
                  <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-[#f5f5f7] text-2xl">
                    {task.scenarioIcon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate text-sm font-semibold text-[#1d1d1f]">
                        {task.title}
                      </h3>
                      <span className={cn('label-tag flex-shrink-0', status.className)}>
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-[#86868b]">
                      {task.scenarioName}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#86868b]">
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={11} /> {task.location}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock size={11} /> {task.estimatedTime}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={11} /> {formatDateTime(task.createdAt)}
                      </span>
                    </div>

                    {/* Completeness + risk */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <RiskBadge level={task.riskLevel} size="sm" />
                          <span className="text-xs font-medium text-[#6e6e73]">
                            完整度 {task.completeness}%
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#0071e3]">
                          {isPreparing ? '继续准备' : '查看详情'}
                          <ChevronRight size={14} />
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#f0f0f2]">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${task.completeness}%`,
                            backgroundColor: riskTone(task.riskLevel),
                          }}
                        />
                      </div>
                    </div>

                    {/* Reopen button for completed/abandoned tasks */}
                    {!isPreparing && (
                      <button
                        onClick={(e) => handleReopen(e, task)}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#0071e3]/20 bg-[#0071e3]/8 px-3 py-1.5 text-xs font-semibold text-[#0071e3] transition-all active:scale-95 hover:bg-[#0071e3]/12"
                      >
                        <RotateCcw size={13} />
                        重新打开任务
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
