import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { PublicHome } from './components/public/PublicHome';
import { ResearcherDashboard } from './components/researcher/ResearcherDashboard';
import { ProposalForm } from './components/researcher/ProposalForm';
import { ResearcherProfileView } from './components/researcher/ResearcherProfile';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ProposalManagement } from './components/admin/ProposalManagement';
import { FundingManagement } from './components/admin/FundingManagement';
import { UserManagement } from './components/admin/UserManagement';
import { AuditLogsView } from './components/admin/AuditLogsView';
import { EvaluatorDashboard } from './components/evaluator/EvaluatorDashboard';
import { ProjectMonitoringView } from './components/monitoring/ProjectMonitoring';
import { Proposal, FundingOpportunity } from './types';
import { ChevronRight, Home, Sparkles } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { activeRole, currentUser } = useAuth();
  const [isPublicView, setIsPublicView] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState<string>('researcher-dashboard');

  // Proposal form state
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<FundingOpportunity | null>(null);

  // Sync default view when role switches
  const handleRoleDefaultView = (role: string) => {
    if (role === 'admin') setCurrentView('admin-dashboard');
    else if (role === 'evaluator') setCurrentView('evaluator-dashboard');
    else if (role === 'project_officer') setCurrentView('monitoring-dashboard');
    else setCurrentView('researcher-dashboard');
  };

  const handleNavigate = (view: string) => {
    if (view !== 'proposal-create') {
      setEditingProposal(null);
    }
    setCurrentView(view);
  };

  const renderAuthenticatedContent = () => {
    // 1. New/Edit Proposal Form
    if (currentView === 'proposal-create' || editingProposal) {
      return (
        <ProposalForm
          initialProposal={editingProposal}
          selectedOpportunity={selectedOpportunity}
          onSuccess={(saved) => {
            setEditingProposal(null);
            setSelectedOpportunity(null);
            if (activeRole === 'admin') setCurrentView('admin-proposals');
            else setCurrentView('researcher-dashboard');
          }}
          onCancel={() => {
            setEditingProposal(null);
            setSelectedOpportunity(null);
            handleRoleDefaultView(activeRole);
          }}
        />
      );
    }

    // 2. Researcher Views
    if (currentView === 'researcher-dashboard' || currentView === 'researcher-proposals') {
      return (
        <ResearcherDashboard
          onNewProposal={() => {
            setEditingProposal(null);
            setCurrentView('proposal-create');
          }}
          onEditProposal={(proposal) => {
            setEditingProposal(proposal);
            setCurrentView('proposal-create');
          }}
          onViewProjects={() => setCurrentView('researcher-projects')}
        />
      );
    }

    if (currentView === 'researcher-profile') {
      return <ResearcherProfileView />;
    }

    if (currentView === 'researcher-opportunities') {
      return <FundingManagement />;
    }

    if (currentView === 'researcher-projects') {
      return <ProjectMonitoringView />;
    }

    // 3. Admin Views
    if (currentView === 'admin-dashboard') {
      return (
        <AdminDashboard
          onNavigateTab={(tab) => setCurrentView(tab)}
          onOpenProposal={(proposal) => {
            setCurrentView('admin-proposals');
          }}
        />
      );
    }

    if (
      currentView === 'admin-proposals' ||
      currentView === 'admin-reviews' ||
      currentView === 'admin-evaluators' ||
      currentView === 'admin-decisions'
    ) {
      const initialTab =
        currentView === 'admin-reviews'
          ? 'intake'
          : currentView === 'admin-evaluators'
          ? 'evaluation'
          : currentView === 'admin-decisions'
          ? 'decision'
          : 'all';
      return <ProposalManagement initialStatusTab={initialTab} />;
    }

    if (currentView === 'admin-projects') {
      return <ProjectMonitoringView />;
    }

    if (currentView === 'admin-programs') {
      return <FundingManagement />;
    }

    if (currentView === 'admin-users') {
      return <UserManagement />;
    }

    if (currentView === 'admin-audit') {
      return <AuditLogsView />;
    }

    // 4. Evaluator Views
    if (
      currentView === 'evaluator-dashboard' ||
      currentView === 'evaluator-assigned' ||
      currentView === 'evaluator-completed' ||
      currentView === 'evaluator-rubric'
    ) {
      return <EvaluatorDashboard />;
    }

    // 5. Project Officer Views
    if (
      currentView === 'monitoring-dashboard' ||
      currentView === 'monitoring-projects' ||
      currentView === 'monitoring-reports' ||
      currentView === 'monitoring-timeline'
    ) {
      return <ProjectMonitoringView />;
    }

    // Fallback
    return (
      <ResearcherDashboard
        onNewProposal={() => setCurrentView('proposal-create')}
        onEditProposal={(p) => {
          setEditingProposal(p);
          setCurrentView('proposal-create');
        }}
        onViewProjects={() => setCurrentView('researcher-projects')}
      />
    );
  };

  const breadcrumbTitle = () => {
    switch (currentView) {
      case 'researcher-dashboard':
        return 'Researcher Dashboard';
      case 'proposal-create':
        return editingProposal ? `Edit Proposal (${editingProposal.tracking_number})` : 'New Proposal Submission';
      case 'researcher-proposals':
        return 'Submitted Proposals';
      case 'researcher-profile':
        return 'Institutional Profile';
      case 'researcher-opportunities':
        return 'Funding Opportunities';
      case 'researcher-projects':
        return 'Approved Projects';
      case 'admin-dashboard':
        return 'Executive Admin Dashboard';
      case 'admin-proposals':
        return 'Proposal Repository';
      case 'admin-reviews':
        return 'Completeness Review';
      case 'admin-evaluators':
        return 'Evaluator Assignment';
      case 'admin-decisions':
        return 'Final Council Decisions';
      case 'admin-projects':
        return 'Project Portfolio';
      case 'admin-programs':
        return 'Call for Proposals Manager';
      case 'admin-users':
        return 'User Account Directory';
      case 'admin-audit':
        return 'Security & Audit Logs';
      case 'evaluator-dashboard':
        return 'Evaluator Dashboard';
      case 'evaluator-assigned':
        return 'Assigned Proposals';
      case 'evaluator-completed':
        return 'Completed Reviews';
      case 'monitoring-dashboard':
        return 'Project Monitoring';
      case 'monitoring-projects':
        return 'Funded Projects';
      case 'monitoring-reports':
        return 'Accomplishment Reports';
      default:
        return 'Management System';
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        isPublicView={isPublicView}
        onTogglePublic={() => setIsPublicView(!isPublicView)}
      />

      {/* Main View Area */}
      {isPublicView ? (
        <PublicHome
          onGoToPortal={() => {
            setIsPublicView(false);
            handleRoleDefaultView(activeRole);
          }}
          onSelectOpportunity={(opp) => {
            setSelectedOpportunity(opp);
            setEditingProposal(null);
            setIsPublicView(false);
            setCurrentView('proposal-create');
          }}
        />
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Collapsible Left Sidebar */}
          <Sidebar
            currentView={currentView}
            onNavigate={handleNavigate}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />

          {/* Main Body */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Breadcrumb Navigation Bar */}
              <div className="flex items-center justify-between text-xs text-gray-500 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="flex items-center gap-1 text-[#153B65] font-semibold">
                    <Home className="w-3.5 h-3.5" />
                    DPMIS Lite
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  <span className="capitalize font-semibold text-gray-700">
                    {activeRole.replace('_', ' ')} Portal
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-900 font-bold">{breadcrumbTitle()}</span>
                </div>

                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-[11px] text-gray-400">Current Role:</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#153B65] border border-blue-200">
                    {activeRole.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Render Selected View */}
              {renderAuthenticatedContent()}
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
