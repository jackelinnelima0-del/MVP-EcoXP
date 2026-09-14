import React, { useState } from 'react';
import { useApp } from '../../context';
import { PageHeader, Btn, Badge } from '../../components/ui';
import { IconAward, IconDownload } from '../../components/Icons';
import { OPERATORS } from '../../data';
import ecoxpLogoSrc from '../../imports/WhatsApp_Image_2026-08-06_at_11.02.36.jpeg';

function CertificateView({ certId, onClose }: { certId: string; onClose: () => void }) {
  const { certificates, requests, collections, destinations, proposals } = useApp();
  const cert = certificates.find(c => c.id === certId);
  if (!cert) return null;

  const req = requests.find(r => r.id === cert.requestId);
  const col = collections.find(c => c.id === cert.collectionId);
  const op = col ? OPERATORS.find(o => o.id === col.operatorId) : null;
  const dest = col ? destinations.find(d => d.collectionId === col.id) : null;
  const prop = proposals.find(p => p.requestId === cert.requestId && p.status === 'accepted');

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          ← Voltar
        </button>
      </div>

      {/* Certificate */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header strip */}
        <div className="p-6 text-center border-b border-gray-100" style={{ backgroundColor: '#F0FBF2' }}>
          <img src={ecoxpLogoSrc} alt="ECOXP" className="h-14 object-contain mx-auto mb-3" />
          <h2 className="font-display font-800 text-xl tracking-wide" style={{ color: '#1B5E2A' }}>CERTIFICADO DE DESTINAÇÃO</h2>
          <p className="text-sm mt-1 font-medium" style={{ color: '#E87B1A' }}>Gestão Ambiental · Conecta · Gera Valor</p>
        </div>

        {/* Body */}
        <div className="p-8">
          <div className="text-center mb-6">
            <p className="text-gray-500 text-sm">Certificamos que a seguinte operação foi realizada:</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              { label: 'Empresa geradora', value: 'Empresa Eco Industrial' },
              { label: 'Operador de resíduos', value: op?.name || '-' },
              { label: 'Tipo de resíduo', value: req?.wasteType || '-' },
              { label: 'Quantidade destinada', value: dest ? `${dest.quantity} kg` : `${req?.quantity} ${req?.unit}` },
              { label: 'Serviço realizado', value: prop?.services.join(', ') || '-' },
              { label: 'Data da operação', value: dest?.date || col?.scheduledDate || '-' },
              { label: 'Destinação', value: dest?.destinationType || req?.desiredDestination || '-' },
              { label: 'CO₂e estimado evitado', value: req ? `~${Math.round(req.quantity * 0.8)} kg CO₂e` : '-' },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                <p className="font-display font-600 text-gray-900 text-sm">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Code */}
          <div className="border-t border-b border-dashed border-gray-200 py-4 mb-6 text-center">
            <p className="text-xs text-gray-400 mb-1">Código de validação</p>
            <p className="font-mono font-700 text-gray-900 text-lg tracking-widest">{cert.validationCode}</p>
            <p className="text-xs text-gray-400 mt-1">Emitido em {cert.createdAt}</p>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs font-bold text-amber-800 mb-1">CERTIFICADO DEMONSTRATIVO</p>
            <p className="text-xs text-amber-700">
              Este certificado é demonstrativo e não possui validade como certificação ambiental oficial. Não representa MTR, licença ambiental, crédito de carbono ou qualquer documento ambiental legalmente reconhecido. Para documentação ambiental oficial, consulte os órgãos competentes.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400">ECOXP — Plataforma digital de gestão e rastreabilidade de resíduos · MVP Demonstrativo 2026</p>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <Btn variant="outline" onClick={() => window.print()}>
          <IconDownload size={16} /> Imprimir / Salvar
        </Btn>
      </div>
    </div>
  );
}

export default function Certificates() {
  const { certificates, requests, collections, navigate } = useApp();
  const [viewId, setViewId] = useState<string | null>(null);

  if (viewId) return <CertificateView certId={viewId} onClose={() => setViewId(null)} />;

  const eligible = requests.filter(r => r.status === 'destination_confirmed' && !certificates.find(c => c.requestId === r.id));

  return (
    <div className="p-6">
      <PageHeader title="Certificados" subtitle="Certificados demonstrativos das operações de destinação realizadas." />

      {eligible.length > 0 && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="font-display font-600 text-green-900 mb-3 text-sm">Chamados com destinação confirmada prontos para certificado:</p>
          <div className="space-y-2">
            {eligible.map(req => {
              const col = collections.find(c => c.requestId === req.id);
              return (
                <div key={req.id} className="flex items-center justify-between gap-3 bg-white rounded-xl p-3 border border-green-100">
                  <div>
                    <span className="font-display font-600 text-sm text-gray-900">#{req.number} — {req.wasteType}</span>
                    <p className="text-xs text-gray-500">{req.quantity} {req.unit} · {req.desiredDate}</p>
                  </div>
                  {col && (
                    <Btn size="sm" onClick={() => { navigate('company-certificates'); }}>
                      🏆 Gerar
                    </Btn>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {certificates.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <IconAward size={24} className="text-green-500" />
          </div>
          <h3 className="font-display font-600 text-gray-700 mb-2">Nenhum certificado gerado</h3>
          <p className="text-gray-400 text-sm max-w-xs mx-auto">Os certificados aparecerão aqui após a destinação ser confirmada em um chamado.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {certificates.map(cert => {
            const req = requests.find(r => r.id === cert.requestId);
            const col = collections.find(c => c.id === cert.collectionId);
            const op = col ? OPERATORS.find(o => o.id === col.operatorId) : null;
            return (
              <button
                key={cert.id}
                onClick={() => setViewId(cert.id)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-left hover:shadow-md hover:border-green-200 transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                    <IconAward size={20} className="text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-700 text-gray-900">{req?.wasteType}</p>
                    <p className="text-xs text-gray-500">{op?.name}</p>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-gray-500 mb-3">
                  <p>Quantidade: {req?.quantity} {req?.unit}</p>
                  <p>Emitido em: {cert.createdAt}</p>
                </div>
                <div className="font-mono text-xs text-gray-400 bg-gray-50 rounded-lg px-2.5 py-1.5">
                  {cert.validationCode}
                </div>
                <p className="text-green-600 text-xs font-semibold mt-3">Ver certificado →</p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
