import React, { useState } from 'react';
import { X, Shield, User, FileSearch, Activity, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginAsDemo, loginWithEmail, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'demo' | 'credentials'>('demo');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDemoSelect = async (role: UserRole) => {
    setLoading(true);
    await loginAsDemo(role);
    setLoading(false);
    onClose();
  };

  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await loginWithEmail(email);
    setLoading(false);
    onClose();
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    await loginWithGoogle();
    setLoading(false);
    onClose();
  };

  const demoRoles = [
    {
      role: 'admin' as UserRole,
      title: 'Administrator',
      email: 'admin@dpmislite.test',
      pass: 'Admin123!',
      name: 'Dr. Alejandro V. Ramos',
      desc: 'Full administrative review, completeness checks, evaluator assignment, final approvals, user & grant management.',
      icon: <Shield className="w-5 h-5 text-indigo-600" />,
      badgeBg: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    },
    {
      role: 'researcher' as UserRole,
      title: 'Researcher / Proponent',
      email: 'researcher@dpmislite.test',
      pass: 'Research123!',
      name: 'Dr. Maria Corazon De Castro (UP Diliman)',
      desc: 'Submit proposals, edit drafts, upload documents, track real-time status, manage researcher profile & reports.',
      icon: <User className="w-5 h-5 text-blue-600" />,
      badgeBg: 'bg-blue-50 border-blue-200 text-blue-700',
    },
    {
      role: 'evaluator' as UserRole,
      title: 'Evaluator / Peer Reviewer',
      email: 'evaluator@dpmislite.test',
      pass: 'Evaluator123!',
      name: 'Academician Dr. Ernesto L. Morales',
      desc: 'Evaluate assigned proposals across 6 scientific criteria, assign ratings 1-5, and submit formal recommendations.',
      icon: <FileSearch className="w-5 h-5 text-purple-600" />,
      badgeBg: 'bg-purple-50 border-purple-200 text-purple-700',
    },
    {
      role: 'project_officer' as UserRole,
      title: 'Project Officer / Monitoring',
      email: 'officer@dpmislite.test',
      pass: 'Officer123!',
      name: 'Engr. Sarah Jane O. Reyes (PCIEERD)',
      desc: 'Monitor approved projects, review periodic accomplishment reports, update milestone statuses, verify completions.',
      icon: <Activity className="w-5 h-5 text-teal-600" />,
      badgeBg: 'bg-teal-50 border-teal-200 text-teal-700',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 bg-[#153B65] text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Shield className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-wide">DPMIS Lite Portal Access</h3>
              <p className="text-xs text-sky-200">Department of Science and Technology R&D Network</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selectors */}
        <div className="flex border-b border-gray-200 bg-gray-50/70">
          <button
            type="button"
            onClick={() => setActiveTab('demo')}
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'demo'
                ? 'border-[#153B65] text-[#153B65] bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            One-Click Demo Roles (Instant Access)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('credentials')}
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'credentials'
                ? 'border-[#153B65] text-[#153B65] bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Email / Google Sign-In
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'demo' ? (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 mb-2">
                Select an authorized test role to test the complete end-to-end research funding workflow:
              </p>
              {demoRoles.map((item) => (
                <div
                  key={item.role}
                  onClick={() => handleDemoSelect(item.role)}
                  className="p-3.5 border border-gray-200 hover:border-[#153B65] rounded-xl transition-all cursor-pointer hover:shadow-md bg-white group flex items-start gap-3.5"
                >
                  <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-blue-50 transition-colors mt-0.5">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-sm text-[#153B65] group-hover:text-[#2563A6] transition-colors">
                        {item.title}
                      </h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-medium ${item.badgeBg}`}>
                        {item.email}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-gray-800 mt-0.5">{item.name}</p>
                    <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#153B65] group-hover:translate-x-1 transition-all self-center" />
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleCredentialLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Institutional Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. researcher@dpmislite.test"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#153B65] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#153B65] focus:border-transparent"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Demo password for all accounts is: <code className="font-mono text-[#153B65]">Admin123!</code> / <code className="font-mono text-[#153B65]">Research123!</code>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#153B65] hover:bg-[#2563A6] text-white font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Sign In to System
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500 font-semibold">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-2xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Sign In with Google Account
              </button>
            </form>
          )}
        </div>

        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
          <span>Security Level: Authorized Government R&D Proponents</span>
          <span className="text-emerald-700 font-medium">Cloud Firestore Synchronized</span>
        </div>
      </div>
    </div>
  );
};
