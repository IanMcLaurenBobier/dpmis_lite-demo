import React from 'react';
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  Briefcase,
  FolderKanban,
  User,
  Users,
  ShieldCheck,
  CheckSquare,
  FileSearch,
  Activity,
  History,
  Award,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  collapsed,
  onToggleCollapse,
}) => {
  const { activeRole } = useAuth();

  interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
  }

  const getNavItems = (): { section: string; items: NavItem[] }[] => {
    switch (activeRole) {
      case 'researcher':
        return [
          {
            section: 'Proponent Portal',
            items: [
              { id: 'researcher-dashboard', label: 'My Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
              { id: 'proposal-create', label: 'Submit Proposal', icon: <FilePlus className="w-4 h-4 text-emerald-600" />, badge: 'New' },
              { id: 'researcher-proposals', label: 'Proposal Submissions', icon: <FileText className="w-4 h-4" /> },
              { id: 'researcher-opportunities', label: 'Funding Calls', icon: <Briefcase className="w-4 h-4" /> },
              { id: 'researcher-projects', label: 'Approved Projects', icon: <FolderKanban className="w-4 h-4" /> },
              { id: 'researcher-profile', label: 'Researcher Profile', icon: <User className="w-4 h-4" /> },
            ],
          },
        ];
      case 'admin':
        return [
          {
            section: 'Executive Oversight',
            items: [
              { id: 'admin-dashboard', label: 'Admin Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
              { id: 'admin-proposals', label: 'All Proposals', icon: <FileText className="w-4 h-4" /> },
              { id: 'admin-reviews', label: 'Completeness Intake', icon: <CheckSquare className="w-4 h-4" /> },
              { id: 'admin-evaluators', label: 'Assign Evaluators', icon: <FileSearch className="w-4 h-4" /> },
              { id: 'admin-decisions', label: 'Final Decisions', icon: <ShieldCheck className="w-4 h-4 text-amber-600" /> },
              { id: 'admin-projects', label: 'Project Portfolio', icon: <FolderKanban className="w-4 h-4" /> },
            ],
          },
          {
            section: 'Administration',
            items: [
              { id: 'admin-programs', label: 'Funding Programs', icon: <Briefcase className="w-4 h-4" /> },
              { id: 'admin-users', label: 'User Directory', icon: <Users className="w-4 h-4" /> },
              { id: 'admin-audit', label: 'System Audit Logs', icon: <History className="w-4 h-4" /> },
            ],
          },
        ];
      case 'evaluator':
        return [
          {
            section: 'Peer Review',
            items: [
              { id: 'evaluator-dashboard', label: 'Evaluator Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
              { id: 'evaluator-assigned', label: 'Assigned Proposals', icon: <FileSearch className="w-4 h-4" /> },
              { id: 'evaluator-completed', label: 'Submitted Reviews', icon: <CheckSquare className="w-4 h-4" /> },
              { id: 'evaluator-rubric', label: 'Evaluation Rubric', icon: <Award className="w-4 h-4" /> },
            ],
          },
        ];
      case 'project_officer':
        return [
          {
            section: 'Project Monitoring',
            items: [
              { id: 'monitoring-dashboard', label: 'Monitoring Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
              { id: 'monitoring-projects', label: 'Funded Projects', icon: <FolderKanban className="w-4 h-4" /> },
              { id: 'monitoring-reports', label: 'Progress Reports', icon: <Activity className="w-4 h-4" /> },
              { id: 'monitoring-timeline', label: 'Project Timelines', icon: <Clock className="w-4 h-4" /> },
            ],
          },
        ];
      default:
        return [];
    }
  };

  const sections = getNavItems();

  return (
    <aside
      className={`bg-white border-r border-gray-200 transition-all duration-200 shrink-0 flex flex-col z-30 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Sidebar Header */}
      <div className="p-3 border-b border-gray-100 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2 px-1">
            <span className="text-xs font-semibold tracking-wider uppercase text-gray-500">
              Navigation
            </span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ml-auto"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {sections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                {sec.section}
              </p>
            )}
            {sec.items.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-[#153B65] text-white shadow-xs font-semibold'
                      : 'text-gray-600 hover:bg-blue-50/70 hover:text-[#153B65]'
                  } ${collapsed ? 'justify-center px-2' : ''}`}
                >
                  <span className={`${isActive ? 'text-white' : 'text-gray-500 group-hover:text-[#153B65]'}`}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className="flex-1 text-left truncate">{item.label}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Sidebar Footer info */}
      {!collapsed && (
        <div className="p-3 border-t border-gray-100 bg-slate-50/60 m-2 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-medium text-gray-600">
              DPMIS Cloud v2.4
            </span>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">
            DOST Research Grants Network
          </p>
        </div>
      )}
    </aside>
  );
};
