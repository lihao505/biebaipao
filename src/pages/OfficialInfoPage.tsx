import { useState, useEffect, type CSSProperties } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ExternalLink,
  Info,
  Phone,
  Search,
  ShieldCheck,
  Clock,
  AlertTriangle,
  RefreshCw,
  CalendarClock,
  Lightbulb,
  ChevronRight,
  FileText,
  BookmarkCheck,
  Smartphone,
  FileCheck2,
} from 'lucide-react';
import Layout from '../components/Layout';
import { getScenarioById } from '../data/scenarios';
import { searchPolicy, type PolicySearchResult, type PolicySource } from '../lib/policySearch';
import { useApp } from '../context/AppContext';
import AppButton from '../components/ui/AppButton';
import PillChip from '../components/ui/PillChip';
import SearchField from '../components/ui/SearchField';
import { motion } from 'motion/react';
import { spring } from '../lib/motion';
import AnimatedList from '../components/AnimatedList';
import AnimatedCard from '../components/AnimatedCard';

// ===== Confidence display config =====
const confidenceConfig: Record<
  PolicySource['confidence'],
  { tone: 'success' | 'warning' | 'danger'; label: string }
> = {
  high: { tone: 'success', label: '高可信' },
  medium: { tone: 'warning', label: '中可信' },
  low: { tone: 'danger', label: '低可信' },
};

function formatTime(ts: number): string {
  try {
    return new Date(ts).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '未知';
  }
}

export default function OfficialInfoPage() {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const navigate = useNavigate();
  const { settings } = useApp();
  const scenario = scenarioId ? getScenarioById(scenarioId) : undefined;

  const [policyQuery, setPolicyQuery] = useState('');
  const [policyResult, setPolicyResult] = useState<PolicySearchResult | null>(null);
  const [policyLoading, setPolicyLoading] = useState(false);
  const [policyError, setPolicyError] = useState<string | null>(null);

  const handleSearchPolicy = async (query?: string) => {
    if (!scenario) return;
    setPolicyLoading(true);
    setPolicyError(null);
    try {
      const result = await searchPolicy({
        city: settings.defaultCity,
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        materialNames: scenario.materials.map((m) => m.name),
        userQuestion: query || undefined,
      });
      setPolicyResult(result);
    } catch {
      setPolicyError('政策检索失败，请稍后重试或拨打 12345 咨询');
    } finally {
      setPolicyLoading(false);
    }
  };

  // Auto-search once on mount
  useEffect(() => {
    if (scenario) {
      handleSearchPolicy();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioId]);

  if (!scenario) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-gray-500">场景不存在</p>
          <AppButton
            variant="secondary"
            size="md"
            className="mt-4"
            onClick={() => navigate('/scenarios')}
          >
            返回选择
          </AppButton>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* ===== Header ===== */}
      <div className="mb-6">
        <h2 className="section-title">政策来源</h2>
        <p className="section-desc mt-1">
          <span className="mr-1">{scenario.icon}</span>
          {scenario.name} · {settings.defaultCity}
        </p>
      </div>

      {/* ===== Policy Search ===== */}
      <section className="mb-6">
        <div className="rounded-3xl border border-[#0071e3]/12 bg-white/80 p-5 shadow-sm backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0071e3]/10">
              <Search size={18} className="text-[#0071e3]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1d1d1f]">政策检索</h3>
              <p className="text-xs text-[#86868b]">查询当地最新办事要求与政策依据</p>
            </div>
          </div>

          {/* Search input + button */}
          <div className="flex flex-col gap-3">
            <SearchField
              value={policyQuery}
              onChange={setPolicyQuery}
              placeholder="输入问题，如：是否需要预约？能否用电子版？"
              loading={policyLoading}
            />
            <AppButton
              variant="primary"
              size="md"
              fullWidth
              leftIcon={<Search size={18} />}
              loading={policyLoading}
              disabled={policyLoading}
              onClick={() => handleSearchPolicy(policyQuery)}
            >
              {policyLoading ? '检索中' : '搜索政策'}
            </AppButton>
          </div>

          {/* Loading dots */}
          {policyLoading && (
            <div className="mt-5 flex items-center justify-center gap-2 text-sm text-[#86868b]">
              <span>正在检索政策信息</span>
              <span className="policy-loading-dots">
                <span />
                <span />
                <span />
              </span>
            </div>
          )}

          {/* Error */}
          {policyError && !policyLoading && (
            <div className="mt-4 flex items-start gap-2 rounded-2xl bg-[#ff3b30]/8 p-3 text-sm text-[#ff3b30]">
              <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{policyError}</span>
            </div>
          )}

          {/* Results */}
          {policyResult && !policyLoading && (
            <div className="mt-5 space-y-4">
              {/* Summary */}
              <div className="rounded-2xl bg-[#f5f5f7] p-4">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[#86868b]">
                  <FileText size={14} />
                  政策摘要
                </div>
                <p className="text-sm leading-relaxed text-[#1d1d1f]">{policyResult.summary}</p>
              </div>

              {/* Feature chips */}
              {(policyResult.needsReservation !== undefined ||
                policyResult.requiresOriginal !== undefined ||
                policyResult.acceptsElectronic !== undefined) && (
                <div className="flex flex-wrap gap-2">
                  {policyResult.needsReservation && (
                    <PillChip tone="warning" icon={<CalendarClock size={12} />}>
                      建议预约
                    </PillChip>
                  )}
                  {policyResult.requiresOriginal && (
                    <PillChip tone="info" icon={<FileCheck2 size={12} />}>
                      需要原件
                    </PillChip>
                  )}
                  {policyResult.acceptsElectronic && (
                    <PillChip tone="success" icon={<Smartphone size={12} />}>
                      支持电子版
                    </PillChip>
                  )}
                </div>
              )}

              {/* Suggestions */}
              {policyResult.suggestions.length > 0 && (
                <div className="rounded-2xl border border-[#ff9f0a]/20 bg-[#fff7df]/60 p-4">
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[#bf5700]">
                    <Lightbulb size={14} />
                    办事建议
                  </div>
                  <ul className="space-y-2">
                    {policyResult.suggestions.map((suggestion, idx) => (
                      <li
                        key={idx}
                        className="policy-card-item flex items-start gap-2 text-sm text-[#1d1d1f]"
                        style={{ '--stagger-index': idx } as CSSProperties}
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#ff9f0a]" />
                        <span className="leading-relaxed">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sources */}
              {policyResult.sources.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[#86868b]">
                    <BookmarkCheck size={14} />
                    政策来源（{policyResult.sources.length}）
                  </div>
                  <div className="space-y-3">
                    {policyResult.sources.map((source, idx) => {
                      const conf = confidenceConfig[source.confidence];
                      const isRealLink = source.url && source.url !== '#';
                      const cardContent = (
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-semibold text-[#0071e3]">{source.title}</h4>
                              <PillChip tone={conf.tone} icon={<ShieldCheck size={12} />}>
                                {conf.label}
                              </PillChip>
                            </div>
                            <p className="mt-1 text-xs text-[#86868b]">
                              {source.sourceName}
                              {source.publishedAt && (
                                <span className="ml-1.5">· {source.publishedAt}</span>
                              )}
                            </p>
                            <p className="mt-1.5 text-xs leading-relaxed text-[#515154]">
                              {source.snippet}
                            </p>
                            {isRealLink && (
                              <p className="mt-1 truncate text-[11px] text-[#86868b]">{source.url}</p>
                            )}
                          </div>
                          {isRealLink && (
                            <ExternalLink
                              size={16}
                              className="mt-0.5 flex-shrink-0 text-[#d2d2d7]"
                            />
                          )}
                        </div>
                      );

                      return (
                        <div
                          key={idx}
                          className="policy-card-item"
                          style={{ '--stagger-index': idx } as CSSProperties}
                        >
                          {isRealLink ? (
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block rounded-2xl border border-black/5 bg-white p-4 shadow-sm transition-all hover:border-[#0071e3]/30 hover:shadow-md active:scale-[0.98]"
                            >
                              {cardContent}
                            </a>
                          ) : (
                            <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm opacity-90">
                              {cardContent}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Update time + credibility hint */}
              <div className="space-y-2 border-t border-black/5 pt-3">
                <div className="flex items-center gap-1.5 text-xs text-[#86868b]">
                  <Clock size={13} />
                  <span>更新时间：{formatTime(policyResult.searchedAt)}</span>
                </div>
                {policyResult.fallbackUsed ? (
                  <div className="flex items-start gap-1.5 rounded-xl bg-[#ff9f0a]/10 p-2.5 text-xs text-[#bf5700]">
                    <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" />
                    <span>
                      当前为示例政策数据（未接入实时检索），可信度仅供参考，请以当地官方渠道核实。
                    </span>
                  </div>
                ) : (
                  <div className="flex items-start gap-1.5 rounded-xl bg-[#34c759]/10 p-2.5 text-xs text-[#1d7a3a]">
                    <ShieldCheck size={13} className="mt-0.5 flex-shrink-0" />
                    <span>已接入实时政策检索，结果来自官方公开信息，可信度较高。</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ===== Official Links ===== */}
      <section className="mb-6">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-[#1d1d1f]">
          <ExternalLink size={20} className="text-[#0071e3]" />
          官方链接
        </h3>
        <AnimatedList className="space-y-3">
          {scenario.officialLinks.map((link, idx) => {
            const isExample = link.url === '#';
            const content = (
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-[#0071e3]">{link.name}</h4>
                    {isExample && <PillChip tone="default">示例入口</PillChip>}
                  </div>
                  <p className="mt-1 text-xs text-[#86868b]">{link.description}</p>
                  {!isExample && (
                    <p className="mt-1 truncate text-xs text-[#aeaeb2]">{link.url}</p>
                  )}
                </div>
                {!isExample && (
                  <ExternalLink size={18} className="ml-2 flex-shrink-0 text-[#d2d2d7]" />
                )}
              </div>
            );
            if (isExample) {
              return (
                <AnimatedCard key={idx} className="card p-4 opacity-90">
                  {content}
                </AnimatedCard>
              );
            }
            return (
              <AnimatedCard key={idx}>
                <motion.a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card block p-4 transition-all hover:border-[#0071e3]/30"
                  whileTap={{ scale: 0.97 }}
                  transition={spring}
                >
                  {content}
                </motion.a>
              </AnimatedCard>
            );
          })}
        </AnimatedList>
      </section>

      {/* ===== Phones ===== */}
      <section className="mb-6">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-[#1d1d1f]">
          <Phone size={20} className="text-[#0071e3]" />
          咨询电话
        </h3>
        <AnimatedList className="space-y-3">
          {scenario.phones.map((phone, idx) => {
            const isPlaceholder = phone.number.includes('当地');
            return (
              <AnimatedCard key={idx} className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-[#1d1d1f]">{phone.name}</h4>
                    <p className="mt-0.5 text-xs text-[#86868b]">{phone.description}</p>
                  </div>
                  {isPlaceholder ? (
                    <div className="flex items-center gap-1.5 rounded-lg bg-[#f0f0f2] px-3 py-2 text-xs font-medium text-[#86868b]">
                      <Info size={16} />
                      <span>{phone.number}</span>
                    </div>
                  ) : (
                    <a
                      href={`tel:${phone.number}`}
                      className="flex items-center gap-1.5 rounded-lg bg-[#eaf3ff] px-3 py-2 text-sm font-medium text-[#0071e3] transition-all active:scale-95"
                    >
                      <Phone size={16} />
                      {phone.number}
                    </a>
                  )}
                </div>
              </AnimatedCard>
            );
          })}
        </AnimatedList>
      </section>

      {/* ===== 12345 Hotline Tip ===== */}
      <div className="mb-6 rounded-2xl border border-[#0071e3]/15 bg-gradient-to-br from-[#eaf3ff] to-[#d6e9ff] p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#0071e3]">
            <span className="text-sm font-bold text-white">12345</span>
          </div>
          <div>
            <h4 className="font-semibold text-[#003b80]">政务服务热线 12345</h4>
            <p className="mt-1 text-sm leading-relaxed text-[#0058b1]">
              如果不确定具体要求，可拨打 12345 政务服务热线咨询。12345
              可转接对应部门，获取最准确的办事要求。
            </p>
          </div>
        </div>
      </div>

      {/* ===== Declaration ===== */}
      <div className="mb-6 flex items-start gap-2.5 rounded-2xl bg-[#f5f5f7] p-4">
        <ShieldCheck size={18} className="mt-0.5 flex-shrink-0 text-[#86868b]" />
        <p className="text-xs leading-relaxed text-[#86868b]">
          以上政策信息仅供参考，各地执行细则可能存在差异。
          <strong className="text-[#515154]">最终以当地办事窗口及官方页面公布的要求为准。</strong>
          建议出发前通过官方渠道再次确认。
        </p>
      </div>

      {/* ===== Navigation ===== */}
      <div className="space-y-3">
        <AppButton
          variant="primary"
          size="lg"
          fullWidth
          rightIcon={<ChevronRight size={20} />}
          onClick={() => navigate(`/coach/${scenario.id}`)}
        >
          AI 现场教练
        </AppButton>
        <AppButton
          variant="secondary"
          size="lg"
          fullWidth
          leftIcon={<RefreshCw size={18} />}
          onClick={() => handleSearchPolicy(policyQuery)}
        >
          重新检索政策
        </AppButton>
        <AppButton
          variant="ghost"
          size="lg"
          fullWidth
          onClick={() => navigate(`/materials/${scenario.id}`)}
        >
          返回材料清单
        </AppButton>
      </div>
    </Layout>
  );
}
