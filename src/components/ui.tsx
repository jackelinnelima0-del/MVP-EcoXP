import React, { useEffect } from 'react';
import { useApp } from '../context';
import { IconCheck, IconX, IconAlertCircle, IconInfo } from './Icons';
import type { RequestStatus, CollectionStatus } from '../types';

// ─── Toast ────────────────────────────────────────────────────────────────────
export function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  const colors = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-blue-600 text-white',
  };
  const Icon = toast.type === 'success' ? IconCheck : toast.type === 'error' ? IconX : IconInfo;
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl font-display font-medium text-sm ${colors[toast.type]} animate-[fadeIn_0.2s_ease]`}
      style={{ animation: 'slideUp 0.25s ease' }}>
      <Icon size={17} />
      {toast.message}
    </div>
  );
}

// ─── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }: {
  open: boolean; onClose: () => void; title?: string; children: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!open) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-5xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="font-display font-700 text-gray-900 text-lg">{title}</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
              <IconX size={18} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

// ─── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ children, color = 'gray', dot }: { children: React.ReactNode; color?: string; dot?: boolean }) {
  const colors: Record<string, string> = {
    green: 'bg-green-50 text-green-700 border-green-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    gray: 'bg-gray-100 text-gray-600 border-gray-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };
  const dotColors: Record<string, string> = {
    green: 'bg-green-500', orange: 'bg-orange-500', blue: 'bg-blue-500',
    red: 'bg-red-500', yellow: 'bg-yellow-500', gray: 'bg-gray-400', purple: 'bg-purple-500',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[color] || colors.gray}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[color] || dotColors.gray}`} />}
      {children}
    </span>
  );
}

// ─── Status badge helpers ──────────────────────────────────────────────────────
export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const map: Record<RequestStatus, { label: string; color: string }> = {
    receiving_proposals: { label: 'Recebendo propostas', color: 'blue' },
    operator_selected: { label: 'Operador selecionado', color: 'purple' },
    collection_scheduled: { label: 'Coleta agendada', color: 'orange' },
    in_collection: { label: 'Em coleta', color: 'yellow' },
    collection_done: { label: 'Coleta realizada', color: 'green' },
    destination_confirmed: { label: 'Destinação confirmada', color: 'green' },
  };
  const { label, color } = map[status] || { label: status, color: 'gray' };
  return <Badge color={color} dot>{label}</Badge>;
}

export function CollectionStatusBadge({ status }: { status: CollectionStatus }) {
  const map: Record<CollectionStatus, { label: string; color: string }> = {
    scheduled: { label: 'Agendada', color: 'orange' },
    in_progress: { label: 'Em coleta', color: 'yellow' },
    done: { label: 'Coleta realizada', color: 'blue' },
    destination_confirmed: { label: 'Destinação confirmada', color: 'green' },
  };
  const { label, color } = map[status] || { label: status, color: 'gray' };
  return <Badge color={color} dot>{label}</Badge>;
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
export function KpiCard({ label, value, sub, icon, accent }: {
  label: string; value: string | number; sub?: string; icon: React.ReactNode; accent?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accent || 'bg-green-50 text-green-600'}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">{label}</p>
        <p className="font-display font-700 text-2xl text-gray-900 leading-none">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Section header ────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="font-display font-800 text-2xl text-gray-900">{title}</h1>
        {subtitle && <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, body, action }: {
  icon: React.ReactNode; title: string; body: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 mb-4">{icon}</div>
      <h3 className="font-display font-600 text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-400 text-sm max-w-xs mb-6">{body}</p>
      {action}
    </div>
  );
}

// ─── Button ────────────────────────────────────────────────────────────────────
export function Btn({ children, onClick, variant = 'primary', size = 'md', className = '', disabled, type = 'button', full }: {
  children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'outline' | 'ghost' | 'danger' | 'orange';
  size?: 'sm' | 'md' | 'lg'; className?: string; disabled?: boolean; type?: 'button' | 'submit';
  full?: boolean;
}) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-display font-600 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 shadow-sm',
    outline: 'border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 focus:ring-gray-300',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-300',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400',
    orange: 'bg-orange-500 hover:bg-orange-600 text-white focus:ring-orange-400 shadow-sm',
  };
  const sizes = { sm: 'text-xs px-3 py-1.5', md: 'text-sm px-4 py-2.5', lg: 'text-sm px-6 py-3' };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${full ? 'w-full' : ''} ${className}`}>
      {children}
    </button>
  );
}

// ─── Timeline step ─────────────────────────────────────────────────────────────
export function TimelineStep({ label, active, done, last }: {
  label: string; active?: boolean; done?: boolean; last?: boolean;
}) {
  return (
    <div className="flex gap-3 items-start">
      <div className="flex flex-col items-center">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border-2 ${
          done ? 'bg-green-600 border-green-600 text-white' :
          active ? 'bg-white border-green-600 text-green-600' :
          'bg-white border-gray-200 text-gray-300'
        }`}>
          {done ? <IconCheck size={12} /> : null}
        </div>
        {!last && <div className={`w-0.5 h-8 mt-1 ${done ? 'bg-green-300' : 'bg-gray-100'}`} />}
      </div>
      <p className={`text-sm pt-0.5 ${done ? 'text-gray-700 font-medium' : active ? 'text-green-700 font-semibold' : 'text-gray-300'}`}>{label}</p>
    </div>
  );
}

// ─── Demo banner ───────────────────────────────────────────────────────────────
export function DemoBanner() {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 text-center text-xs text-amber-700 font-medium">
      Ambiente demonstrativo — dados fictícios
    </div>
  );
}

// ─── Star rating ──────────────────────────────────────────────────────────────
export function StarRating({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-1 text-sm font-medium text-amber-500">
      ★ <span className="text-gray-700">{value.toFixed(1)}</span>
    </span>
  );
}
