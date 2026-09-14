import React from 'react';
import { useApp } from '../context';
import { PageHeader, Btn } from '../components/ui';
import { IconBell } from '../components/Icons';

export default function Notifications() {
  const { notifications, markNotificationRead, markAllRead, navigate, role } = useApp();

  const typeColors: Record<string, string> = {
    proposal: 'bg-blue-50 text-blue-600',
    selection: 'bg-green-50 text-green-600',
    schedule: 'bg-orange-50 text-orange-600',
    collection: 'bg-purple-50 text-purple-600',
    destination: 'bg-green-50 text-green-700',
  };

  const prefix = role === 'company' ? 'company' : 'operator';

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <PageHeader
        title="Notificações"
        action={
          <Btn variant="ghost" size="sm" onClick={markAllRead}>Marcar todas como lidas</Btn>
        }
      />
      <div className="space-y-3">
        {notifications.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <IconBell size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhuma notificação</p>
          </div>
        )}
        {notifications.map(n => (
          <button
            key={n.id}
            onClick={() => {
              markNotificationRead(n.id);
              navigate(`${prefix}-requests`, n.requestId);
            }}
            className={`w-full text-left flex items-start gap-4 p-4 rounded-xl border transition-all ${
              n.read ? 'bg-white border-gray-100' : 'bg-white border-green-200 shadow-sm'
            } hover:shadow-md`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${typeColors[n.type] || 'bg-gray-50 text-gray-500'}`}>
              <IconBell size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-display font-600 text-sm text-gray-900">{n.message}</p>
                {!n.read && <span className="w-2 h-2 bg-green-500 rounded-full shrink-0"/>}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{n.detail}</p>
              <p className="text-xs text-gray-400 mt-1">{n.createdAt}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
