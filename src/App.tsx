import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { PublicHome } from './components/PublicHome';
import { PublicJimpitan } from './components/PublicJimpitan';
import { PublicRekapWarga } from './components/PublicRekapWarga';
import { PublicSavingsLookup } from './components/PublicSavingsLookup';
import { PublicKasLedger } from './components/PublicKasLedger';
import { PublicLaporan } from './components/PublicLaporan';

import { AdminDashboard } from './components/AdminDashboard';
import { AdminMobileEntry } from './components/AdminMobileEntry';
import { AdminReconciliationModal } from './components/AdminReconciliationModal';
import { AdminWargaManager } from './components/AdminWargaManager';
import { AdminKasManager } from './components/AdminKasManager';
import { AdminPembukuanWizard } from './components/AdminPembukuanWizard';
import { AdminAuditLog } from './components/AdminAuditLog';

function MainApp() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState<boolean>(false);
  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState<boolean>(false);

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

          {activeTab === 'rekap-warga' && <PublicRekapWarga />}

          {activeTab === 'keuangan' && <PublicKasLedger />}

          {activeTab === 'laporan' && <PublicLaporan />}

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
