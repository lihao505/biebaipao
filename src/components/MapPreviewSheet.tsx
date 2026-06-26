import { X, Navigation, MapPin, Info, Compass, Copy, Clock, CircleDot, Printer, HelpCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import Portal from './Portal';
import type { RiskLevel } from '../types';

export interface NavInfo {
  keyword: string;
  cityHint: string;
  addressHint: string;
  tips: string[];
}

interface MapPreviewSheetProps {
  open: boolean;
  onClose: () => void;
  scenarioName: string;
  scenarioIcon: string;
  location: string;
  city: string;
  navInfo?: NavInfo;
  riskLevel?: RiskLevel;
  completeness?: number;
}

export default function MapPreviewSheet({
  open,
  onClose,
  scenarioName,
  scenarioIcon,
  location,
  city,
  navInfo,
  riskLevel = 'low',
  completeness = 100,
}: MapPreviewSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setMounted(true));
      document.body.style.overflow = 'hidden';
    } else {
      setMounted(false);
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const keyword = navInfo?.keyword || location || scenarioName;
  const cityHint = navInfo?.cityHint || city;
  const addressHint = navInfo?.addressHint || location;
  const tips = navInfo?.tips || [
    '建议出发前确认今日是否办公',
    '到达后先取号，再准备材料',
    '如遇排队较长，可先咨询窗口确认材料是否齐全',
  ];

  const hasMissingMaterials = completeness < 100;
  const isHighRisk = riskLevel === 'high';

  const handleNavigate = (provider: 'amap' | 'baidu' | 'apple') => {
    const encodedKeyword = encodeURIComponent(keyword);
    const encodedCity = encodeURIComponent(cityHint);
    let url = '';
    if (provider === 'amap') {
      url = `https://uri.amap.com/search?keyword=${encodedKeyword}&city=${encodedCity}`;
    } else if (provider === 'baidu') {
      url = `https://api.map.baidu.com/geocoder?address=${encodedKeyword}&output=html`;
    } else {
      url = `https://maps.apple.com/?q=${encodedKeyword}`;
    }
    window.open(url, '_blank');
  };

  const handleCopyLocation = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(addressHint).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {});
    }
  };

  const navProviders = [
    { id: 'amap' as const, name: '高德导航', color: '#0071e3', bg: 'bg-[#0071e3]/10' },
    { id: 'baidu' as const, name: '百度导航', color: '#ff3b30', bg: 'bg-[#ff3b30]/10' },
    { id: 'apple' as const, name: 'Apple 地图', color: '#34c759', bg: 'bg-[#34c759]/10' },
  ];

  return (
    <Portal>
      <div
        className={`fixed inset-0 z-[100] flex items-end justify-center ${mounted ? 'overlay-fade-in' : 'overlay-fade-out'}`}
        onClick={onClose}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

        {/* Sheet */}
        <div
          className={`relative w-full max-w-md overflow-y-auto rounded-t-[32px] bg-white shadow-2xl ${mounted ? 'sheet-enter' : 'sheet-exit'}`}
          style={{ maxHeight: '88dvh', paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle bar */}
          <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-[#d2d2d7]" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-20 grid h-8 w-8 place-items-center rounded-full bg-[#f0f0f2] text-[#86868b] transition-all active:scale-90 hover:bg-[#e8e8ed]"
            aria-label="关闭"
          >
            <X size={18} />
          </button>

          {/* Title */}
          <div className="px-5 pb-3 pt-4">
            <h3 className="text-lg font-semibold text-[#1d1d1f]">地图预览</h3>
            <p className="mt-0.5 text-sm text-[#86868b]">{scenarioName} · 导航前往</p>
          </div>

          {/* Departure suggestion module */}
          <div className="mx-5 mb-3">
            {hasMissingMaterials ? (
              <div className="flex items-start gap-2.5 rounded-2xl bg-[#fff7df]/80 p-3 border border-[#ff9f0a]/20">
                <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-[#ff9f0a]/15 text-[#ff9f0a]">
                  <AlertCircle size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#bf5700]">建议先补齐材料再出发</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-[#86868b]">
                    当前完整度 {completeness}%，{isHighRisk ? '存在高风险缺失材料' : '部分材料未备齐'}，贸然前往可能白跑一趟。
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2.5 rounded-2xl bg-[#ecfff3]/80 p-3 border border-[#34c759]/20">
                <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-[#34c759]/15 text-[#34c759]">
                  <CheckCircle2 size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#34c759]">可以出发，预计办理 15-25 分钟</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-[#86868b]">
                    材料已全部备齐，建议避开午休（12:00-14:00）和下班前时段。
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Faux map card */}
          <div className="mx-5 overflow-hidden rounded-3xl border border-[#e8e8ed] shadow-inner">
            <div className="relative h-56 bg-gradient-to-br from-[#eef4fb] via-[#e8f0fa] to-[#dde8f5]">
              {/* Simplified road lines + route */}
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 220" preserveAspectRatio="none">
                {/* Major road */}
                <path d="M 0 120 Q 100 110, 200 100 T 400 80" stroke="#c8d6e8" strokeWidth="8" fill="none" strokeLinecap="round" />
                <path d="M 0 120 Q 100 110, 200 100 T 400 80" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="6 8" />
                {/* Minor roads */}
                <path d="M 80 0 L 120 220" stroke="#d5e0ee" strokeWidth="5" fill="none" strokeLinecap="round" />
                <path d="M 250 0 Q 230 80, 260 220" stroke="#d5e0ee" strokeWidth="5" fill="none" strokeLinecap="round" />
                <path d="M 0 50 L 400 60" stroke="#dce8f3" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M 180 0 L 190 220" stroke="#dce8f3" strokeWidth="3" fill="none" strokeLinecap="round" />
                {/* Water area */}
                <path d="M 300 160 Q 340 150, 400 170 L 400 220 L 280 220 Z" fill="#c5dcf0" opacity="0.5" />
                {/* Green area */}
                <ellipse cx="60" cy="180" rx="50" ry="30" fill="#c8e6c9" opacity="0.4" />

                {/* Route line (blue dashed, animated) */}
                <path
                  d="M 50 190 Q 120 160, 160 120 Q 200 90, 200 92"
                  stroke="#0071e3"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="6 6"
                  className="route-draw"
                  opacity="0.7"
                />
              </svg>

              {/* Start point (current location) */}
              <div className="absolute bottom-[14%] left-[12%]">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-[#0071e3] ring-4 ring-[#0071e3]/20" />
                  <span className="rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-medium text-[#6e6e73] shadow-sm backdrop-blur-sm">
                    我的位置
                  </span>
                </div>
              </div>

              {/* POI markers */}
              <div className="poi-fade-in absolute top-[20%] left-[38%]" style={{ animationDelay: '0.6s' }}>
                <div className="flex items-center gap-1">
                  <div className="grid h-6 w-6 place-items-center rounded-full bg-white/90 shadow-sm">
                    <HelpCircle size={13} className="text-[#ff9f0a]" />
                  </div>
                  <span className="rounded-full bg-white/85 px-1.5 py-0.5 text-[9px] font-medium text-[#6e6e73] shadow-sm backdrop-blur-sm">
                    咨询台
                  </span>
                </div>
              </div>
              <div className="poi-fade-in absolute top-[45%] left-[55%]" style={{ animationDelay: '0.8s' }}>
                <div className="flex items-center gap-1">
                  <div className="grid h-6 w-6 place-items-center rounded-full bg-white/90 shadow-sm">
                    <CircleDot size={13} className="text-[#0071e3]" />
                  </div>
                  <span className="rounded-full bg-white/85 px-1.5 py-0.5 text-[9px] font-medium text-[#6e6e73] shadow-sm backdrop-blur-sm">
                    取号机
                  </span>
                </div>
              </div>
              <div className="poi-fade-in absolute top-[60%] left-[28%]" style={{ animationDelay: '1.0s' }}>
                <div className="flex items-center gap-1">
                  <div className="grid h-6 w-6 place-items-center rounded-full bg-white/90 shadow-sm">
                    <Printer size={13} className="text-[#86868b]" />
                  </div>
                  <span className="rounded-full bg-white/85 px-1.5 py-0.5 text-[9px] font-medium text-[#6e6e73] shadow-sm backdrop-blur-sm">
                    打印/复印
                  </span>
                </div>
              </div>

              {/* Destination pin with drop animation */}
              <div className="pin-drop absolute left-1/2 top-[42%]">
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-[#0071e3] px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg whitespace-nowrap">
                    {scenarioIcon} {scenarioName}
                  </div>
                  <div className="mt-0.5 h-2 w-2 rotate-45 bg-[#0071e3] shadow-md" />
                </div>
              </div>

              {/* City label */}
              <div className="absolute bottom-2 left-3 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-medium text-[#6e6e73] shadow-sm backdrop-blur-sm">
                {cityHint}
              </div>

              {/* Compass */}
              <div className="absolute bottom-2 right-3 grid h-7 w-7 place-items-center rounded-full bg-white/85 shadow-sm backdrop-blur-sm">
                <Compass size={15} className="text-[#0071e3]" />
              </div>
            </div>

            {/* Address info + copy */}
            <div className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0 flex-1">
                  <MapPin size={16} className="mt-0.5 flex-shrink-0 text-[#0071e3]" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1d1d1f]">{addressHint}</p>
                    <p className="mt-0.5 text-xs text-[#86868b]">点击下方导航按钮前往</p>
                  </div>
                </div>
                <button
                  onClick={handleCopyLocation}
                  className="flex-shrink-0 inline-flex items-center gap-1 rounded-full bg-[#f0f0f2] px-2.5 py-1.5 text-xs font-medium text-[#6e6e73] transition-all active:scale-95 hover:bg-[#e8e8ed]"
                >
                  {copied ? (
                    <>
                      <Copy size={12} className="text-[#34c759]" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      复制地点
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Route summary */}
          <div className="mx-5 mt-3 flex items-center gap-3 rounded-2xl bg-[#eaf3ff]/60 p-3">
            <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-[#0071e3]/10 text-[#0071e3]">
              <Clock size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#1d1d1f]">预计 15-25 分钟</p>
              <p className="mt-0.5 text-xs text-[#86868b]">建议避开午休（12:00-14:00）和下班前时段</p>
            </div>
          </div>

          {/* Tips */}
          <div className="mx-5 mt-3 rounded-2xl bg-[#fff7df]/60 p-3">
            <div className="mb-1.5 flex items-center gap-1.5">
              <Info size={14} className="text-[#bf5700]" />
              <span className="text-xs font-semibold text-[#bf5700]">到达后注意事项</span>
            </div>
            <ul className="space-y-1">
              {tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-1.5 text-xs leading-relaxed text-[#86868b]">
                  <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-[#bf5700]" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation buttons - vertical list */}
          <div className="px-5 pb-5 pt-4">
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-[#86868b]">
              选择导航应用
            </p>
            <div className="space-y-2.5">
              {navProviders.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => handleNavigate(provider.id)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-[#e8e8ed] bg-white px-4 py-3 transition-all active:scale-[0.98] hover:border-[#0071e3]/30 hover:shadow-md"
                >
                  <div className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl ${provider.bg}`} style={{ color: provider.color }}>
                    <Navigation size={18} />
                  </div>
                  <span className="flex-1 text-left text-sm font-semibold text-[#1d1d1f]">{provider.name}</span>
                  <MapPin size={16} className="text-[#d2d2d7]" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
