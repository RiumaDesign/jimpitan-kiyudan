import { useState } from 'react';
import { Lock, ShieldAlert } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { PublicHome } from './components/PublicHome';
import { PublicJimpitan } from './components/PublicJimpitan';
import { PublicRekapWarga } from './components/PublicRekapWarga';
import { PublicSavingsLookup } from './components/PublicSavingsLookup';
import { PublicKasLedger } from './components/PublicKasLedger';
import { PublicLaporan } from './components/PublicLaporan';
import { PublicJadwalKelompok } from './components/PublicJadwalKelompok';

import { AdminDashboard } from './components/AdminDashboard';
import { AdminMobileEntry } from './components/AdminMobileEntry';
import { AdminReconciliationModal } from './components/AdminReconciliationModal';
import { AdminWargaManager } from './components/AdminWargaManager';
import { AdminKasManager } from './components/AdminKasManager';
import { AdminPembukuanWizard } from './components/AdminPembukuanWizard';
import { AdminAuditLog } from './components/AdminAuditLog';

function MainApp() {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState<boolean>(false);
  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState<boolean>(false);

  const isAdminTab = activeTab.startsWith('admin');

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 font-sans selection:bg-emerald-500 selection:text-white flex flex-col justify-between">
      
      <div>
        {/* Navigation Header */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          openSavingsModal={() => setIsSavingsModalOpen(true)}
        />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
          
          {/* Public Views */}
          {activeTab === 'home' && (
            <PublicHome
              setActiveTab={setActiveTab}
              openSavingsModal={() => setIsSavingsModalOpen(true)}
            />
          )}

          {activeTab === 'jimpitan' && <PublicJimpitan />}

          {activeTab === 'jadwal-kelompok' && <PublicJadwalKelompok />}

          {activeTab === 'rekap-warga' && <PublicRekapWarga />}

          {activeTab === 'keuangan' && <PublicKasLedger />}

          {activeTab === 'laporan' && <PublicLaporan />}

          {/* Protected Admin Access Guard */}
          {isAdminTab && !currentUser ? (
            <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-rose-500/30 max-w-xl mx-auto text-center space-y-6 animate-fadeIn my-12">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
                <ShieldAlert className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white font-heading">
                  Akses Terproteksi Pengurus
                </h3>
                <p className="text-sm text-gray-300">
                  Dashboard Admin & Pengelolaan Keuangan hanya dapat dibuka oleh 7 Pengurus Resmi Dusun Kiyudan yang telah login.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 text-xs text-left space-y-1.5">
                <p className="font-bold text-amber-400">Daftar Pengurus Resmi Dusun Kiyudan:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-gray-300">
                  <p>1. Slamet Rifaudin</p>
                  <p>2. Syarif Suharsono</p>
                  <p>3. Humam Syarif</p>
                  <p>4. Afif Dwi Cahyo</p>
                  <p>5. Alvin Pratama</p>
                  <p>6. Pawit</p>
                  <p>7. Khoiruddin</p>
                </div>
                <p className="text-[11px] text-emerald-400 font-semibold pt-1">Password Resmi: kiyudan123</p>
              </div>

              <button
                onClick={() => {
                  const loginBtn = document.querySelector('header button:has(svg)') as HTMLButtonElement;
                  if (loginBtn) loginBtn.click();
                }}
                className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-xl shadow-emerald-600/30 hover:from-emerald-500 hover:to-teal-400 transition-all flex items-center justify-center space-x-2"
              >
                <Lock className="w-4 h-4" />
                <span>Klik Untuk Login Pengurus</span>
              </button>
            </div>
          ) : (
            <>
              {/* Admin Backoffice Views */}
              {activeTab === 'admin-dashboard' && (
                <AdminDashboard
                  setActiveTab={setActiveTab}
                  openReconcileModal={() => setIsReconcileModalOpen(true)}
                />
              )}

              {activeTab === 'admin-entry' && (
                <AdminMobileEntry
                  onGoToReconcile={() => setIsReconcileModalOpen(true)}
                  onBack={() => setActiveTab('admin-dashboard')}
                />
              )}

              {activeTab === 'admin-warga' && <AdminWargaManager />}

              {activeTab === 'admin-keuangan' && <AdminKasManager />}

              {activeTab === 'admin-pembukuan' && (
                <AdminPembukuanWizard onComplete={() => setActiveTab('admin-dashboard')} />
              )}

              {activeTab === 'admin-audit' && <AdminAuditLog />}
            </>
          )}

        </main>
      </div>

      {/* Global Modals */}
      <PublicSavingsLookup
        isOpen={isSavingsModalOpen}
        onClose={() => setIsSavingsModalOpen(false)}
      />

      <AdminReconciliationModal
        isOpen={isReconcileModalOpen}
        onClose={() => setIsReconcileModalOpen(false)}
      />

      {/* Footer */}
      <Footer />

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
