import React from 'react';
import { useApp } from '../context';
import {
  IconHome, IconList, IconShop, IconUsers, IconLeaf, IconAward, IconStar,
  IconBell, IconLogOut, IconMenu, IconX, IconClipboard, IconTruck, IconBuilding, IconPackage
} from './Icons';
import { DemoBanner } from './ui';
import ecoxpLogoSrc from '../imports/WhatsApp_Image_2026-08-06_at_11.02.36.jpeg';

export function EcoxpLogo({ className = 'h-8', showTagline }: { className?: string; showTagline?: boolean }) {
  return (
    <div className="flex flex-col items-start gap-0.5">
      <img src={ecoxpLogoSrc} alt="ECOXP" className={`object-contain ${className}`} />
      {showTagline && (
        <p className="text-xs font-semibold tracking-wide" style={{ color: '#1B5E2A' }}>
          Gestão Ambiental · Conecta · Gera Valor
        </p>
      )}
    </div>
  );
}

function Logo({ small }: { small?: boolean }) {
  return (
    <div className="flex items-center">
      {small
        ? <img src={ecoxpLogoSrc} alt="ECOXP" className="h-7 object-contain" />
        : <img src={ecoxpLogoSrc} alt="ECOXP" className="h-8 object-contain" />
      }
    </div>
  );
}

function NavItem({ icon, label, target, badge }: {
  icon: React.ReactNode; label: string; target: string; badge?: number;
}) {
  const { view, navigate } = useApp();
  const active = view === target || view.startsWith(target + '-');
  return (
    <button
      onClick={() => navigate(target)}
      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
        active ? 'font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
      }`}
      style={active ? { backgroundColor: '#F0FBF2', color: '#1B5E2A' } : {}}
    >
      <span style={active ? { color: '#1B5E2A' } : { color: '#9CA3AF' }}>{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {badge ? <span className="text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold" style={{ backgroundColor: '#E87B1A' }}>{badge}</span> : null}
    </button>
  );
}

function CompanySidebar() {
  const { notifications, proposals, requests } = useApp();
  const unreadNotifs = notifications.filter(n => !n.read).length;
  const pendingProposals = proposals.filter(p => p.status === 'sent' &&
    requests.find(r => r.id === p.requestId && r.status === 'receiving_proposals')
  ).length;

  return (
    <nav className="flex flex-col gap-0.5 px-3 py-2">
      <NavItem icon={<IconHome size={18}/>} label="Dashboard" target="company-dashboard" />
      <NavItem icon={<IconList size={18}/>} label="Meus Chamados" target="company-requests" badge={pendingProposals || undefined} />
      <NavItem icon={<IconShop size={18}/>} label="Marketplace" target="company-marketplace" />
      <NavItem icon={<IconUsers size={18}/>} label="Operadores" target="company-operators" />
      <div className="my-2 border-t border-gray-100" />
      <NavItem icon={<IconLeaf size={18}/>} label="Impacto" target="company-impact" />
      <NavItem icon={<IconAward size={18}/>} label="Certificados" target="company-certificates" />
      <NavItem icon={<IconStar size={18}/>} label="Meu Plano" target="company-plan" />
    </nav>
  );
}

function OperatorSidebar() {
  const { requests, proposals } = useApp();
  const myOperatorId = 'op3';
  const openOpportunities = requests.filter(r => r.status === 'receiving_proposals' && !proposals.find(p => p.requestId === r.id && p.operatorId === myOperatorId)).length;
  return (
    <nav className="flex flex-col gap-0.5 px-3 py-2">
      <NavItem icon={<IconHome size={18}/>} label="Dashboard" target="operator-dashboard" />
      <NavItem icon={<IconPackage size={18}/>} label="Oportunidades" target="operator-opportunities" badge={openOpportunities || undefined} />
      <NavItem icon={<IconClipboard size={18}/>} label="Minhas Propostas" target="operator-proposals" />
      <NavItem icon={<IconTruck size={18}/>} label="Coletas" target="operator-collections" />
      <div className="my-2 border-t border-gray-100" />
      <NavItem icon={<IconBuilding size={18}/>} label="Empresas" target="operator-companies" />
      <NavItem icon={<IconUsers size={18}/>} label="Perfil" target="operator-profile" />
    </nav>
  );
}

export function Sidebar() {
  const { role, notifications, navigate, logout } = useApp();
  const unread = notifications.filter(n => !n.read).length;
  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-100">
      {/* Logo */}
      <div className="px-4 py-3.5 border-b border-gray-100">
        <Logo />
        <div className="mt-2 px-1">
          <span className="text-xs font-semibold" style={{ color: '#1B5E2A', opacity: 0.75 }}>
            {role === 'company' ? 'Empresa Eco Industrial' : 'EcoTrat Resíduos'}
          </span>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-2">
        {role === 'company' ? <CompanySidebar /> : <OperatorSidebar />}
      </div>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-gray-100 space-y-0.5">
        <button
          onClick={() => navigate('notifications')}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all"
        >
          <span className="text-gray-400"><IconBell size={18}/></span>
          <span className="flex-1 text-left font-medium">Notificações</span>
          {unread > 0 && <span className="text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold" style={{ backgroundColor: '#E87B1A' }}>{unread}</span>}
        </button>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <span className="text-gray-400"><IconLogOut size={18}/></span>
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </div>
  );
}

export function Header() {
  const { role, notifications, navigate, setSidebarOpen, sidebarOpen } = useApp();
  const unread = notifications.filter(n => !n.read).length;
  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center px-4 gap-3 lg:hidden">
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100">
        {sidebarOpen ? <IconX size={20} /> : <IconMenu size={20} />}
      </button>
      <Logo />
      <div className="flex-1" />
      <button onClick={() => navigate('notifications')} className="relative p-1.5 rounded-lg text-gray-500 hover:bg-gray-100">
        <IconBell size={20} />
        {unread > 0 && <span className="absolute top-0 right-0 w-4 h-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{unread}</span>}
      </button>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setSidebarOpen } = useApp();
  return (
    <div className="h-full flex flex-col">
      <DemoBanner />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-56 shrink-0 h-full">
          <Sidebar />
        </div>
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
            <div className="relative w-56 h-full bg-white shadow-xl z-50">
              <Sidebar />
            </div>
          </div>
        )}
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
