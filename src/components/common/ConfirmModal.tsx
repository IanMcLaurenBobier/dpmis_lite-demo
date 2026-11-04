import React from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'primary' | 'danger' | 'warning' | 'success';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  type = 'primary',
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    primary: {
      btn: 'bg-[#153B65] hover:bg-[#2563A6] text-white',
      icon: <Info className="w-6 h-6 text-[#153B65]" />,
      bgIcon: 'bg-blue-50',
    },
    danger: {
      btn: 'bg-rose-600 hover:bg-rose-700 text-white',
      icon: <AlertTriangle className="w-6 h-6 text-rose-600" />,
      bgIcon: 'bg-rose-50',
    },
    warning: {
      btn: 'bg-amber-600 hover:bg-amber-700 text-white',
      icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
      bgIcon: 'bg-amber-50',
    },
    success: {
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
      bgIcon: 'bg-emerald-50',
    },
  }[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${typeConfig.bgIcon}`}>
              {typeConfig.icon}
            </div>
            <h3 className="font-semibold text-[#153B65] text-base">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${typeConfig.btn} disabled:opacity-50`}
          >
            {isLoading && (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
