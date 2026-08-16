import React, { useState } from 'react';
import { 
  Coins, Wallet, Landmark, FileText, UserCheck, 
  Lock, LogOut, LayoutDashboard, ShieldCheck, Menu, X, ChevronRight, Home, FileSpreadsheet, AlertCircle 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openSavingsModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, openSavingsModal }) => {
  const { currentUser, logout, login } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Credentials as requested: username (gemuk ireng), password (kiyudan123)
  const [inputUsername, setInputUsername] = useState('gemuk ireng');
  const [inputPassword, setInputPassword] = useState('kiyudan123');
  const [loginError, setLoginError] = useState<string | null>(null);

  const navLinks = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'jimpitan', label: 'Jimpitan', icon: Coins },
    { id: 'rekap-warga', label: 'Rekap Setoran Warga', icon: FileSpreadsheet },
    { id: 'tabungan', label: 'Cek Tabungan', icon: Wallet, isSpecial: true },
    { id: 'keuangan', label: 'Kas & Transparansi', icon: Landmark },
    { id: 'laporan', label: 'Laporan & Grafik', icon: FileText },
  ];

  const adminLinks = [
    { id: 'admin-dashboard', label: 'Dashboard Admin', icon: LayoutDashboard },
    { id: 'admin-entry', label: '📱 Mobile Entry Sesi', icon: UserCheck },
    { id: 'admin-warga', label: 'Master Warga', icon: UserCheck },
    { id: 'admin-keuangan', label: 'Kelola Kas & Tabungan', icon: Landmark },
    { id: 'admin-pembukuan', label: 'Pembukuan Tahun', icon: ShieldCheck },
  ];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const result = login(inputUsername, inputPassword);
    if (result.success) {
      setShowLoginModal(false);
      setActiveTab('admin-dashboard');
    } else {
      setLoginError(result.message || 'Username atau password tidak sesuai.');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-gray-800/60 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Official Dusun Kiyudan Logo & Brand Header */}
            <div 
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => setActiveTab('home')}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden shadow-lg shadow-emerald-500/20 border border-emerald-500/30 bg-white p-0.5 group-hover:scale-105 transition-transform duration-300">
                <img 
                  src="/logo.png" 
                  alt="Logo Dusun Kiyudan" 
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black bg-gradient-to-r from-white via-gray-100 to-emerald-400 bg-clip-text text-transparent tracking-tight leading-none">
                  DUSUN KIYUDAN
                </h1>
                <p className="text-[10px] sm:text-[11px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">
                  Guyub Rukun • Maju Bersama
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = activeTab === link.id;

                if (link.isSpecial) {
                  return (
                    <button
                      key={link.id}
                      onClick={openSavingsModal}
                      className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50 transition-all duration-200 shadow-sm"
                    >
                      <Icon className="w-4 h-4 text-amber-400" />
                      <span>{link.label}</span>
                    </button>
                  );
                }

                return (
                  <button
                    key={link.id}
                    onClick={() => setActiveTab(link.id)}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold shadow-sm'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-gray-400'}`} />
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Action: Admin Control */}
            <div className="hidden lg:flex items-center space-x-3">
              {currentUser ? (
                <div className="flex items-center space-x-2 bg-gray-900/80 p-1.5 pl-3 rounded-2xl border border-gray-800">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-semibold text-gray-200">{currentUser.name}</span>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/50">
                      {currentUser.role}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => setActiveTab('admin-dashboard')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                      activeTab.startsWith('admin')
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Admin Panel</span>
                  </button>

                  <button
                    onClick={logout}
                    title="Logout"
                    className="p-1.5 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all shadow-md"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Login Pengurus</span>
                </button>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex lg:hidden items-center space-x-2">
              <button
                onClick={openSavingsModal}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30"
              >
                <Wallet className="w-3.5 h-3.5 text-amber-400" />
                <span>Cek Saldo</span>
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-gray-300 hover:bg-gray-800 focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-800 bg-gray-950/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3">
            <div className="space-y-1">
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Menu Publik</p>
              {navLinks.map((link) => {
                const Icon = link.icon;
                if (link.isSpecial) return null;
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      setActiveTab(link.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                      activeTab === link.id
                        ? 'bg-emerald-500/15 text-emerald-400 font-semibold'
                        : 'text-gray-300 hover:bg-gray-800/60'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                );
              })}
            </div>

            <div className="border-t border-gray-800 pt-3 space-y-1">
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-emerald-500 mb-1">Akses Pengurus / Admin</p>
              {currentUser ? (
                <>
                  {adminLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <button
                        key={link.id}
                        onClick={() => {
                          setActiveTab(link.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                          activeTab === link.id
                            ? 'bg-emerald-600 text-white font-semibold'
                            : 'text-gray-300 hover:bg-gray-800/60'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-4 h-4" />
                          <span>{link.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      </button>
                    );
                  })}

                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout ({currentUser.name})</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowLoginModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-bold bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                >
                  <Lock className="w-4 h-4" />
                  <span>Login Admin / Petugas</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md glass-panel p-6 sm:p-8 rounded-3xl border border-gray-700 shadow-2xl relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white p-0.5 border border-emerald-500/30 flex items-center justify-center overflow-hidden shadow-md">
                <img src="/logo.png" alt="Logo Dusun Kiyudan" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Login Autentikasi Admin</h3>
                <p className="text-xs text-gray-400">Masuk untuk mengelola keuangan Dusun Kiyudan</p>
              </div>
            </div>

            {loginError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Username Pengurus
                </label>
                <input
                  type="text"
                  required
                  value={inputUsername}
                  onChange={(e) => setInputUsername(e.target.value)}
                  placeholder="Username (contoh: gemuk ireng)"
                  className="w-full glass-input px-4 py-3 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  placeholder="Password (default: kiyudan123)"
                  className="w-full glass-input px-4 py-3 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 text-[11px] text-gray-400 space-y-1">
                <p className="font-semibold text-amber-400">Akses Kredensial Pengurus:</p>
                <p>• Username: <code className="text-white font-mono bg-gray-800 px-1 py-0.5 rounded">gemuk ireng</code></p>
                <p>• Password: <code className="text-white font-mono bg-gray-800 px-1 py-0.5 rounded">kiyudan123</code></p>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-600/30 hover:from-emerald-500 hover:to-teal-400 transition-all"
              >
                Masuk Ke Dashboard Admin
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
