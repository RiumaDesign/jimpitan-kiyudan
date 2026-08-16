import React from 'react';
import { ShieldCheck, Clock, UserCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AdminAuditLog: React.FC = () => {
  const { auditLogs } = useApp();

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Keamanan & Akuntabilitas System Audit Trail</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white font-heading">
          Audit Log Aktivitas Pengurus
        </h2>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Setiap tindakan pengesahan sesi, pencatatan kas, dan perubahan data tercatat secara permanen.
        </p>
      </div>

      {/* Audit Log Items */}
      <div className="glass-panel rounded-3xl border border-gray-800 overflow-hidden shadow-xl p-4 sm:p-6 space-y-3">
        {auditLogs.map((log) => (
          <div key={log.id} className="glass-card p-4 rounded-2xl border border-gray-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {log.aksi}
                </span>
                <span className="text-gray-400 font-semibold">• {log.modul}</span>
              </div>
              <p className="font-bold text-white text-sm">{log.detail}</p>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <div className="flex items-center space-x-1 text-gray-400">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold text-gray-200">{log.username}</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-500 text-[10px] mt-0.5">
                <Clock className="w-3 h-3" />
                <span>{log.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
