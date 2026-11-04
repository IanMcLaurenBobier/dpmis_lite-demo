import React, { useState } from 'react';
import {
  Shield,
  User,
  FileSearch,
  Activity,
  Globe,
  RotateCcw,
  LogOut,
  ChevronDown,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { NotificationDropdown } from '../common/NotificationDropdown';
import { LoginModal } from '../auth/LoginModal';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isPublicView: boolean;
  onTogglePublic: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  isPublicView,
  onTogglePublic,
}) => {
  const { currentUser, activeRole, switchRole, logout, reseed, isFirebaseConnected } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isReseeding, setIsReseeding] = useState(false);

  const roles: { role: UserRole; label: string; icon: React.ReactNode }[] = [
    { role: 'researcher', label: 'Researcher', icon: <User className="w-3.5 h-3.5" /> },
    { role: 'admin', label: 'Admin', icon: <Shield className="w-3.5 h-3.5" /> },
    { role: 'evaluator', label: 'Evaluator', icon: <FileSearch className="w-3.5 h-3.5" /> },
    { role: 'project_officer', label: 'Project Officer', icon: <Activity className="w-3.5 h-3.5" /> },
  ];

  const handleRoleChange = async (r: UserRole) => {
    await switchRole(r);
    // Navigate to role's home view
    if (r === 'researcher') onNavigate('researcher-dashboard');
    else if (r === 'admin') onNavigate('admin-dashboard');
    else if (r === 'evaluator') onNavigate('evaluator-dashboard');
    else if (r === 'project_officer') onNavigate('monitoring-dashboard');
  };

  const handleReseed = async () => {
    if (window.confirm('Reset all proposals, projects, evaluations and seed demo data back to default state?')) {
      setIsReseeding(true);
      await reseed();
      setIsReseeding(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#153B65] text-white shadow-md border-b border-[#2563A6]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Left: Branding */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (isPublicView) onNavigate('public-home');
                  else handleRoleChange(activeRole);
                }}
                className="flex items-center gap-2.5 text-left group focus:outline-hidden"
              >
                <div className="w-9 h-9 rounded-lg bg-linear-to-br from-[#2563A6] to-sky-500 flex items-center justify-center shadow-inner border border-white/20 group-hover:scale-105 transition-transform">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base tracking-tight text-white group-hover:text-sky-200 transition-colors">
                      DPMIS <span className="text-sky-300 font-medium">Lite</span>
                    </span>
                    <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-sky-500/20 text-sky-200 border border-sky-400/30">
                      R&D Portal
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 hidden md:block tracking-wide">
                    Research Project Management Information System
                  </p>
                </div>
              </button>
            </div>

            {/* Center: Role Switcher Bar */}
            <div className="hidden lg:flex items-center bg-black/25 p-1 rounded-xl border border-white/10">
              <span className="text-[11px] text-slate-300 font-semibold px-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-sky-300" />
                Demo Role:
              </span>
              <div className="flex items-center gap-1">
                {roles.map((r) => {
                  const isActive = !isPublicView && activeRole === r.role;
                  return (
                    <button
                      key={r.role}
                      onClick={() => {
                        if (isPublicView) onTogglePublic();
                        handleRoleChange(r.role);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                        isActive
                          ? 'bg-white text-[#153B65] font-semibold shadow-xs'
                          : 'text-slate-200 hover:text-white hover:bg-white/10'
                      }`}
                      title={`Switch to ${r.label} view`}
                    >
                      {r.icon}
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Actions & User menu */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Public Portal Switcher */}
              <button
                onClick={onTogglePublic}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isPublicView
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
                title="Toggle between Public Site & Internal Management System"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {isPublicView ? 'Public Site' : 'View Public Portal'}
                </span>
              </button>

              {/* Reset Data Button */}
              <button
                onClick={handleReseed}
                disabled={isReseeding}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Reset database to realistic sample data"
              >
                <RotateCcw className={`w-4 h-4 ${isReseeding ? 'animate-spin' : ''}`} />
              </button>

              {/* In-App Notifications */}
              {currentUser && <NotificationDropdown />}

              {/* User Account / Profile Menu */}
              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/10 transition-colors focus:outline-hidden"
                  >
                    <div className="w-7 h-7 rounded-full bg-linear-to-tr from-sky-400 to-indigo-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white/30">
                      {currentUser.full_name.charAt(0)}
                    </div>
                    <div className="hidden xl:block text-left">
                      <p className="text-xs font-medium text-white leading-tight truncate max-w-36">
                        {currentUser.full_name}
                      </p>
                      <p className="text-[10px] text-sky-200 capitalize">
                        {currentUser.role.replace('_', ' ')}
                      </p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
                  </button>

                  {isProfileOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsProfileOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden text-gray-800 animate-in fade-in zoom-in-95 duration-100">
                        <div className="p-4 bg-slate-50 border-b border-gray-100">
                          <p className="text-xs font-semibold text-[#153B65]">{currentUser.full_name}</p>
                          <p className="text-[11px] text-gray-500 font-mono mt-0.5">{currentUser.email}</p>
                          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                            Role: {currentUser.role.replace('_', ' ')}
                          </div>
                          {currentUser.institution && (
                            <p className="text-[11px] text-gray-600 mt-2 line-clamp-1">
                              {currentUser.institution}
                            </p>
                          )}
                        </div>

                        <div className="p-2 space-y-1">
                          {currentUser.role === 'researcher' && (
                            <button
                              onClick={() => {
                                setIsProfileOpen(false);
                                onNavigate('researcher-profile');
                              }}
                              className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 rounded-lg flex items-center gap-2 transition-colors"
                            >
                              <User className="w-4 h-4 text-gray-500" />
                              My Institutional Profile
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setIsProfileOpen(false);
                              setIsLoginOpen(true);
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 rounded-lg flex items-center gap-2 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4 text-gray-500" />
                            Switch Account / Demo Role
                          </button>

                          <div className="border-t border-gray-100 my-1" />

                          <button
                            onClick={() => {
                              setIsProfileOpen(false);
                              logout();
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 transition-colors"
                          >
                            <LogOut className="w-4 h-4 text-rose-500" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-white text-[#153B65] hover:bg-sky-50 rounded-lg transition-colors shadow-xs"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Role Switcher Bar */}
        <div className="lg:hidden flex items-center justify-around py-2 px-3 bg-black/20 border-t border-white/10 text-xs overflow-x-auto">
          {roles.map((r) => (
            <button
              key={r.role}
              onClick={() => {
                if (isPublicView) onTogglePublic();
                handleRoleChange(r.role);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap flex items-center gap-1 ${
                !isPublicView && activeRole === r.role
                  ? 'bg-white text-[#153B65] font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {r.icon}
              {r.label}
            </button>
          ))}
        </div>
      </header>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
};
