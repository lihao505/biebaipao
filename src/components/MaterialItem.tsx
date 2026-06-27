import type { Material } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { spring, useReducedMotion } from '../lib/motion';
import AppButton from './ui/AppButton';
import PillChip from './ui/PillChip';

interface MaterialItemProps {
  material: Material;
  checked: boolean;
  onToggle: () => void;
  onShowGuide: () => void;
}

export default function MaterialItem({ material, checked, onToggle, onShowGuide }: MaterialItemProps) {
  const missingRequired = material.required && !checked;
  const reduced = useReducedMotion();

  return (
    <motion.div
      layout={!reduced}
      transition={spring}
      className={`lift-card rounded-3xl border transition-all ${
        checked
          ? 'border-[#34c759]/25 bg-[#ecfff3]/80'
          : missingRequired
          ? 'breath-warn border-[#ff9f0a]/45 bg-[#fffaf0]/90'
          : 'border-white/80 bg-white/[0.82]'
      }`}
    >
      <div className="flex items-start gap-3 p-3.5">
        <button
          onClick={onToggle}
          className="mt-0.5 flex-shrink-0"
          aria-label={checked ? '取消勾选' : '勾选'}
        >
          <motion.div
            whileTap={reduced ? undefined : { scale: 0.85 }}
            transition={spring}
            className={`flex h-7 w-7 items-center justify-center rounded-xl border-2 transition-colors ${
              checked
                ? 'border-[#34c759] bg-[#34c759] shadow-[0_8px_18px_rgba(52,199,89,0.24)]'
                : missingRequired
                ? 'border-[#ff9f0a] bg-white'
                : 'border-[#d2d2d7] bg-white hover:border-[#0071e3]'
            }`}
          >
            <AnimatePresence>
              {checked && (
                <motion.svg
                  initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0 }}
                  animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0 }}
                  transition={spring}
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </motion.svg>
              )}
            </AnimatePresence>
          </motion.div>
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap pr-1">
            <span className={`font-semibold transition-colors ${checked ? 'text-[#86868b] line-through' : 'text-[#1d1d1f]'}`}>
              {material.name}
            </span>
            {material.required ? (
              <PillChip tone="danger">必备</PillChip>
            ) : (
              <PillChip tone="default">选备</PillChip>
            )}
            {checked && <PillChip tone="success">已准备</PillChip>}
            {missingRequired && <PillChip tone="warning">缺失</PillChip>}
          </div>
          <p className="mt-1 text-sm leading-relaxed text-[#6e6e73]">{material.description}</p>
        </div>

        <AppButton
          variant={missingRequired ? 'warning' : 'secondary'}
          size="sm"
          onClick={onShowGuide}
          className="mt-0.5 flex-shrink-0 self-start"
        >
          补全
        </AppButton>
      </div>
    </motion.div>
  );
}
