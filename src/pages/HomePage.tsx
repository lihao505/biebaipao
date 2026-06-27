import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bot, ClipboardList, Clock, MapPin, Plus, Sparkles, Star, Settings, Compass } from 'lucide-react';
import Layout from '../components/Layout';
import RiskBadge from '../components/RiskBadge';
import PressableCard from '../components/PressableCard';
import GlassPanel from '../components/GlassPanel';
import { useApp } from '../context/AppContext';
import { scenarios } from '../data/scenarios';
import type { Task } from '../types/task';
import type { RiskLevel } from '../types';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return '早上好';
  if (hour < 18) return '下午好';
  return '晚上好';
}

function riskTone(level: RiskLevel): string {
  if (level === 'low') return '#34c759';
  if (level === 'medium') return '#ff9f0a';
  return '#ff3b30';
}

export default function HomePage() {
  const navigate = useNavigate();
  const { tasks, getCurrentTask, settings } = useApp();

  const preparingTasks = tasks.filter((t) => t.status === 'preparing');
  const currentTask = getCurrentTask();
  const activeTask: Task | null =
    currentTask && currentTask.status === 'preparing'
      ? currentTask
      : preparingTasks.length > 0
        ? [...preparingTasks].sort((a, b) => b.updatedAt - a.updatedAt)[0]
        : null;

  const greeting = getGreeting();
  const todayCount = preparingTasks.length;
  const preferredScenarios = scenarios.filter((s) => settings.preferredScenarios.includes(s.id));

  return (
    <Layout>
      {/* Greeting header */}
      <section className="pt-2">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold text-[#0071e3]">{greeting}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#1d1d1f]">
              今天去办点什么？
            </h1>
            <p className="mt-1.5 text-sm text-[#6e6e73]">
              AI 线下办事教练 · 让每一次出门都不白跑
            </p>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#1d1d1f] text-white shadow-[0_18px_45px_rgba(29,29,31,0.25)]">
            <Sparkles size={22} />
          </div>
        </div>

        {/* Current task card or empty hero */}
        {activeTask ? (
          <CurrentTaskCard
            task={activeTask}
            onContinue={() => navigate(`/task/${activeTask.id}`)}
          />
        ) : (
          <EmptyHero onStart={() => navigate('/scenarios')} />
        )}
      </section>

      {/* Today todo */}
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold text-[#1d1d1f]">
            <ClipboardList size={18} className="text-[#0071e3]" />
            今日待办
          </h2>
          <span className="label-tag bg-[#0071e3]/10 text-[#0071e3]">{todayCount} 个进行中</span>
        </div>

        {todayCount > 0 ? (
          <div className="space-y-2.5">
            {preparingTasks.map((t) => (
              <button
                key={t.id}
                onClick={() => navigate(`/task/${t.id}`)}
                className="card lift-card flex w-full items-center gap-3 p-3.5 text-left"
              >
                <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-[#f5f5f7] text-xl">
                  {t.scenarioIcon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#1d1d1f]">{t.title}</p>
                  <p className="truncate text-xs text-[#86868b]">
                    {t.scenarioName} · {t.location}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs font-semibold text-[#1d1d1f]">{t.completeness}%</span>
                  <ArrowRight size={16} className="text-[#86868b]" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="card p-4 text-center">
            <p className="text-sm text-[#86868b]">暂无进行中的任务，选个场景开始准备吧</p>
          </div>
        )}
      </section>

      {/* Recommended scenarios based on profile preferences */}
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold text-[#1d1d1f]">
            <Star size={18} className="text-[#ff9f0a]" />
            为你推荐
          </h2>
          <button
            onClick={() => navigate('/profile')}
            className="inline-flex items-center gap-1 text-xs font-medium text-[#0071e3]"
          >
            <Settings size={13} />
            管理偏好
          </button>
        </div>

        {preferredScenarios.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {preferredScenarios.map((s) => (
              <button
                key={s.id}
                onClick={() => navigate(`/guide/${s.id}`)}
                className="card lift-card flex flex-col items-start p-3.5 text-left"
              >
                <div className="mb-2 grid h-10 w-10 place-items-center rounded-xl bg-[#f5f5f7] text-xl">
                  {s.icon}
                </div>
                <span className="text-sm font-semibold text-[#1d1d1f]">{s.name}</span>
                <span className="mt-0.5 truncate text-xs text-[#86868b]">{s.shortDesc}</span>
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={() => navigate('/profile')}
            className="card lift-card flex w-full items-center gap-3 p-4 text-left"
          >
            <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-[#ff9f0a]/10 text-[#ff9f0a]">
              <Star size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#1d1d1f]">设置常用场景</p>
              <p className="mt-0.5 text-xs text-[#86868b]">选择你常办的场景，这里会显示快捷入口</p>
            </div>
            <ArrowRight size={16} className="text-[#86868b]" />
          </button>
        )}
      </section>

      {/* Quick actions */}
      <section className="mt-6 grid grid-cols-2 gap-3">
        <QuickAction
          icon={<ClipboardList size={20} />}
          title="选择场景"
          desc="6 个高频办事场景"
          onClick={() => navigate('/scenarios')}
        />
        <QuickAction
          icon={<Bot size={20} />}
          title="AI 教练"
          desc="现场问题随时问"
          onClick={() => navigate('/coach')}
        />
      </section>

      {/* Next Step Assistant */}
      {activeTask && (
        <section className="mt-4">
          <button
            onClick={() => navigate(`/next-step/${activeTask.id}`)}
            className="glass-panel lift-card flex w-full items-center gap-3 rounded-[24px] p-4 text-left"
          >
            <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#0071e3] to-[#0062cc] text-white shadow-[0_12px_28px_rgba(0,113,227,0.32)]">
              <Compass size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#1d1d1f]">告诉我下一步该做什么</p>
              <p className="mt-0.5 text-xs text-[#86868b]">AI 智能引导，傻瓜式办事</p>
            </div>
            <ArrowRight size={18} className="flex-shrink-0 text-[#86868b]" />
          </button>
        </section>
      )}

      <p className="mt-6 text-center text-xs text-[#86868b]">
        6 个高频办事场景 · 数据本地保存 · 无需登录
      </p>
    </Layout>
  );
}

function CurrentTaskCard({ task, onContinue }: { task: Task; onContinue: () => void }) {
  return (
    <PressableCard>
      <GlassPanel className="relative overflow-hidden rounded-[28px] p-5" intensity="strong">
        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#0071e3]/12 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="label-tag bg-[#0071e3]/10 text-[#0071e3]">当前任务</span>
            <RiskBadge level={task.riskLevel} size="sm" />
          </div>

          <div className="mt-3 flex items-start gap-3">
            <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-white/80 text-2xl shadow-sm">
              {task.scenarioIcon}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold tracking-tight text-[#1d1d1f]">{task.title}</h3>
              <p className="mt-0.5 text-xs text-[#86868b]">{task.scenarioName}</p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#6e6e73]">
            <span className="inline-flex items-center gap-1">
              <MapPin size={13} /> {task.location}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock size={13} /> {task.estimatedTime}
            </span>
          </div>

          {/* Mini risk indicator */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#6e6e73]">材料完整度</span>
              <span className="font-semibold text-[#1d1d1f]">{task.completeness}%</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#f0f0f2]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${task.completeness}%`,
                  backgroundColor: riskTone(task.riskLevel),
                }}
              />
            </div>
          </div>

          <button onClick={onContinue} className="btn-primary mt-5 w-full">
            继续准备
            <ArrowRight size={18} />
          </button>
        </div>
      </GlassPanel>
    </PressableCard>
  );
}

function EmptyHero({ onStart }: { onStart: () => void }) {
  return (
    <PressableCard>
      <GlassPanel className="relative overflow-hidden rounded-[28px] p-6 text-center" intensity="strong">
        <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-[#0071e3]/15 blur-3xl" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="grid h-16 w-16 place-items-center rounded-3xl bg-[#0071e3]/10 text-[#0071e3]">
            <ClipboardList size={30} />
          </div>
          <h3 className="mt-4 text-xl font-semibold tracking-tight text-[#1d1d1f]">
            还没有进行中的任务
          </h3>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#6e6e73]">
            选一个办事场景，AI 帮你检查材料、估算风险，让出门不白跑。
          </p>
          <button onClick={onStart} className="btn-primary mt-5 w-full">
            <Plus size={18} />
            开始办事检查
          </button>
        </div>
      </GlassPanel>
    </PressableCard>
  );
}

function QuickAction({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="card lift-card flex flex-col items-start p-4 text-left"
    >
      <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-[#0071e3]/10 text-[#0071e3]">
        {icon}
      </div>
      <span className="text-sm font-semibold text-[#1d1d1f]">{title}</span>
      <span className="mt-0.5 text-xs text-[#86868b]">{desc}</span>
    </button>
  );
}
