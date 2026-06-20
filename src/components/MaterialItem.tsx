import type { Material } from '../types';

interface MaterialItemProps {
  material: Material;
  checked: boolean;
  onToggle: () => void;
  onShowGuide: () => void;
}

export default function MaterialItem({ material, checked, onToggle, onShowGuide }: MaterialItemProps) {
  return (
    <div className={`rounded-xl border transition-all ${checked ? 'border-green-200 bg-green-50/50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-start gap-3 p-3.5">
        <button
          onClick={onToggle}
          className="mt-0.5 flex-shrink-0"
          aria-label={checked ? '取消勾选' : '勾选'}
        >
          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
            checked
              ? 'bg-green-500 border-green-500'
              : 'border-gray-300 hover:border-brand-400'
          }`}>
            {checked && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            )}
          </div>
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-medium ${checked ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
              {material.name}
            </span>
            {material.required ? (
              <span className="label-tag bg-red-50 text-red-600">必备</span>
            ) : (
              <span className="label-tag bg-gray-100 text-gray-500">选备</span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{material.description}</p>
        </div>

        <button
          onClick={onShowGuide}
          className="flex-shrink-0 text-brand-600 text-sm font-medium hover:text-brand-700 transition-colors"
        >
          补全教程
        </button>
      </div>
    </div>
  );
}
