import { X, Camera, Image as ImageIcon, Trash2, Shield } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import Portal from './Portal';
import AppButton from './ui/AppButton';
import { compressImage } from '../lib/visionAnalysis';

interface ImageUploadSheetProps {
  open: boolean;
  onClose: () => void;
  onImageSelected: (file: File, base64: string) => void;
}

export default function ImageUploadSheet({ open, onClose, onImageSelected }: ImageUploadSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressedBase64, setCompressedBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setMounted(true));
      document.body.style.overflow = 'hidden';
    } else {
      setMounted(false);
      setPreview(null);
      setSelectedFile(null);
      setCompressedBase64(null);
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return;
    }

    setSelectedFile(file);

    // Read and preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Compress image
    try {
      const compressed = await compressImage(file);
      setCompressedBase64(compressed);
    } catch {
      // Fallback to original
      const reader2 = new FileReader();
      reader2.onload = (ev) => setCompressedBase64(ev.target?.result as string);
      reader2.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    if (selectedFile && compressedBase64) {
      onImageSelected(selectedFile, compressedBase64);
    }
  };

  const handleDelete = () => {
    setPreview(null);
    setSelectedFile(null);
    setCompressedBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <Portal>
      <div
        className={`fixed inset-0 z-[100] flex items-end justify-center ${mounted ? 'overlay-fade-in' : 'overlay-fade-out'}`}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

        <div
          className={`relative w-full max-w-md overflow-y-auto rounded-t-[32px] bg-white shadow-2xl ${mounted ? 'sheet-enter' : 'sheet-exit'}`}
          style={{ maxHeight: '62dvh', paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}
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

          {/* Title - compact */}
          <div className="px-5 pb-2 pt-3">
            <h3 className="text-base font-semibold text-[#1d1d1f]">拍照问下一步</h3>
            <p className="mt-0.5 text-xs text-[#86868b]">上传现场照片，AI 告诉你下一步做什么</p>
          </div>

          {/* Privacy notice - compact */}
          <div className="mx-5 mb-3 flex items-start gap-2 rounded-xl bg-[#fff7df]/40 p-2.5">
            <Shield size={14} className="mt-0.5 flex-shrink-0 text-[#bf5700]" />
            <p className="text-[11px] leading-relaxed text-[#86868b]">
              请遮挡身份证号、手机号等敏感信息。Demo 模式不会真实上传。
            </p>
          </div>

          {/* Preview or upload options */}
          {preview ? (
            <div className="mx-5">
              {/* Image preview */}
              <div className="relative overflow-hidden rounded-2xl">
                <img src={preview} alt="预览" className="max-h-64 w-full object-contain bg-[#f5f5f7]" />
                <button
                  onClick={handleDelete}
                  className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all active:scale-90"
                  aria-label="删除图片"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* File info */}
              {selectedFile && (
                <p className="mt-2 truncate text-xs text-[#86868b]">
                  {selectedFile.name} · {(selectedFile.size / 1024).toFixed(0)} KB
                </p>
              )}

              {/* Confirm button */}
              <div className="mt-4 pb-2">
                <AppButton variant="primary" size="lg" fullWidth onClick={handleConfirm}>
                  上传，告诉我下一步
                </AppButton>
              </div>
            </div>
          ) : (
            <div className="mx-5 mb-5">
              {/* Upload options - visually unified */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-[#e8e8ed] bg-white p-5 transition-all active:scale-95 hover:border-[#0071e3]/30 hover:shadow-md"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0071e3]/10 text-[#0071e3]">
                    <Camera size={24} />
                  </div>
                  <span className="text-sm font-semibold text-[#1d1d1f]">拍照</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-[#e8e8ed] bg-white p-5 transition-all active:scale-95 hover:border-[#0071e3]/30 hover:shadow-md"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0071e3]/10 text-[#0071e3]">
                    <ImageIcon size={24} />
                  </div>
                  <span className="text-sm font-semibold text-[#1d1d1f]">从相册选择</span>
                </button>
              </div>

              {/* Tips - weakened, not competing with main buttons */}
              <div className="mt-3 text-center">
                <p className="text-[10px] text-[#aeaeb2]">可拍：申请表 · 证件 · 取号单 · 窗口公告 · 地图截图</p>
              </div>
            </div>
          )}

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>
    </Portal>
  );
}
