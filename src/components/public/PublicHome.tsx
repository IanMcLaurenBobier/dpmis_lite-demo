import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  FileText,
  Award,
  Calendar,
  Building,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
} from 'lucide-react';
import { FundingOpportunity, Proposal, StatusHistoryItem } from '../../types';
import { getFundingOpportunities, getProposalById, getStatusHistory } from '../../firebase/services';
import { StatusBadge } from '../common/StatusBadge';
import { useAuth } from '../../context/AuthContext';

interface PublicHomeProps {
  onGoToPortal: () => void;
  onSelectOpportunity: (opp: FundingOpportunity) => void;
}

export const PublicHome: React.FC<PublicHomeProps> = ({
  onGoToPortal,
  onSelectOpportunity,
}) => {
  const { switchRole } = useAuth();
  const [opportunities, setOpportunities] = useState<FundingOpportunity[]>([]);
  const [searchTracking, setSearchTracking] = useState('');
  const [trackedProposal, setTrackedProposal] = useState<Proposal | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusHistoryItem[]>([]);
  const [trackingError, setTrackingError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    async function load() {
      const opps = await getFundingOpportunities();
      setOpportunities(opps);
    }
    load();
  }, []);

  const handleTrackSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTracking.trim()) return;
    setIsSearching(true);
    setTrackingError('');
    setTrackedProposal(null);
    setStatusHistory([]);

    try {
      const proposal = await getProposalById(searchTracking.trim());
      if (proposal) {
        setTrackedProposal(proposal);
        const history = await getStatusHistory(proposal.id);
        setStatusHistory(history);
      } else {
        setTrackingError(`No proposal found matching tracking number "${searchTracking.trim()}". Please verify the reference format (e.g. DPMISL-2026-00001).`);
      }
    } catch {
      setTrackingError('Unable to retrieve proposal tracking status at this time. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const steps = [
    {
      num: '01',
      title: 'Researcher Registration',
      desc: 'Create an accredited proponent account and complete your academic and institutional background profile.',
    },
    {
      num: '02',
      title: 'Proposal Submission',
      desc: 'Prepare your 6-section research proposal, itemized budget breakdown, dynamic work plan, and attach endorsements.',
    },
    {
      num: '03',
      title: 'Administrative Intake',
      desc: 'Council Grants Division checks eligibility, format compliance, and documentary completeness.',
    },
    {
      num: '04',
      title: 'Scientific Peer Review',
      desc: 'Assigned national technical evaluators score technical merit, methodology, budget justification, and impact.',
    },
    {
      num: '05',
      title: 'Executive Award & Monitoring',
      desc: 'Approved proposals transition to funded projects with periodic milestone and financial monitoring.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#253247]">
      {/* Hero Banner */}
      <section className="bg-linear-to-b from-[#153B65] via-[#1A4575] to-[#153B65] text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-[#2563A6]/50 relative overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-sky-200 text-xs font-semibold uppercase tracking-wider mb-6 border border-white/20 backdrop-blur-xs">
            <Sparkles className="w-4 h-4 text-sky-300" />
            DOST National Research & Development Management Portal
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Research Project Management <br className="hidden sm:inline" />
            Information System <span className="text-sky-300 font-semibold">(DPMIS Lite)</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-200 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            A comprehensive, transparent digital gateway for Filipino scientists, researchers, and higher education institutions to propose, evaluate, and monitor science & technology research initiatives nationwide.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                switchRole('researcher');
                onGoToPortal();
              }}
              className="px-6 py-3.5 bg-sky-500 hover:bg-sky-400 text-[#153B65] font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group"
            >
              Submit Research Proposal
              <ArrowRight className="w-4 h-4 text-[#153B65] group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="#tracker"
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl border border-white/30 backdrop-blur-xs transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-sky-300" />
              Track Submitted Proposal
            </a>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Cloud Firestore Live Persistence
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-sky-400" /> 4-Role Role-Based Access Control
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" /> 6-Criterion Scientific Evaluation Rubric
            </span>
          </div>
        </div>
      </section>

      {/* Proposal Tracking Tool Section */}
      <section id="tracker" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/80 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-[#153B65]" />
                <h2 className="text-lg font-bold text-[#153B65]">Public Proposal Tracking</h2>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter your system-generated tracking number to verify real-time status and milestone progress.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Info className="w-4 h-4 text-[#2563A6]" />
              <span>Confidential reviewer remarks remain protected.</span>
            </div>
          </div>

          {/* Search Input Bar */}
          <form onSubmit={handleTrackSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTracking}
                onChange={(e) => setSearchTracking(e.target.value)}
                placeholder="Enter Reference Number (e.g. DPMISL-2026-00001, DPMISL-2026-00004)"
                className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#153B65] focus:border-transparent uppercase font-mono tracking-wider"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-6 py-3 bg-[#153B65] hover:bg-[#2563A6] text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm shrink-0"
            >
              {isSearching ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Lookup Status
            </button>
          </form>

          {/* Quick example tracking pills */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span>Try sample tracking numbers:</span>
            {['DPMISL-2026-00001', 'DPMISL-2026-00004', 'DPMISL-2026-00006', 'DPMISL-2026-00007'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setSearchTracking(num)}
                className="px-2 py-0.5 rounded-md bg-blue-50 text-[#153B65] font-mono hover:bg-blue-100 transition-colors border border-blue-200"
              >
                {num}
              </button>
            ))}
          </div>

          {/* Tracking Result Display */}
          {trackingError && (
            <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <HelpCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{trackingError}</span>
            </div>
          )}

          {trackedProposal && (
            <div className="mt-6 border border-gray-200 rounded-xl p-5 bg-slate-50/50 space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-[#153B65] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      {trackedProposal.tracking_number}
                    </span>
                    <StatusBadge status={trackedProposal.status} size="md" />
                  </div>
                  <h3 className="font-bold text-base text-gray-900 mt-2">
                    {trackedProposal.project_title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Funding Call: {trackedProposal.funding_opportunity_title}
                  </p>
                </div>
                <div className="text-right text-xs text-gray-500 shrink-0">
                  <p>Submission Date</p>
                  <p className="font-semibold text-gray-700">{trackedProposal.submission_date || 'N/A'}</p>
                </div>
              </div>

              {/* Administrative Remarks if released */}
              {trackedProposal.admin_remarks && (
                <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-lg text-xs">
                  <p className="font-semibold text-[#153B65] mb-1">Official Administrative Remarks:</p>
                  <p className="text-gray-700 leading-relaxed">{trackedProposal.admin_remarks}</p>
                </div>
              )}

              {/* Public Timeline */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                  Status History & Milestones
                </h4>
                {statusHistory.length === 0 ? (
                  <p className="text-xs text-gray-500">Initial intake record created.</p>
                ) : (
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-200">
                    {statusHistory.map((item, idx) => (
                      <div key={item.id || idx} className="relative">
                        <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#153B65] border-2 border-white ring-1 ring-[#153B65]" />
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                          <span className="font-semibold text-gray-800">
                            Status Transition: <span className="text-[#153B65]">{item.new_status}</span>
                          </span>
                          <span className="text-gray-400 font-mono text-[11px]">
                            {new Date(item.changed_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">{item.remarks}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Active Funding Opportunities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-[#153B65] text-xs font-semibold uppercase tracking-wider mb-2">
              <Award className="w-3.5 h-3.5" /> Open Calls for Proposals
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#153B65]">
              Active Research Funding Opportunities
            </h2>
            <p className="text-sm text-gray-600 mt-1 max-w-2xl">
              Competitive national research grants open for Philippine researchers and higher education institutions.
            </p>
          </div>
          <button
            onClick={() => {
              switchRole('researcher');
              onGoToPortal();
            }}
            className="text-xs font-semibold text-[#2563A6] hover:text-[#153B65] flex items-center gap-1 group"
          >
            Access Full Proponent Portal <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Open for Submission
                  </span>
                  <span className="text-xs font-semibold text-[#153B65]">
                    Up to ₱{(opp.budget_cap / 1000000).toFixed(1)}M
                  </span>
                </div>

                <h3 className="font-bold text-base text-[#153B65] group-hover:text-[#2563A6] transition-colors leading-snug mb-2">
                  {opp.title}
                </h3>

                <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed mb-4">
                  {opp.description}
                </p>

                <div className="space-y-1.5 text-xs text-gray-500 mb-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-[#153B65] shrink-0" />
                    <span className="truncate">{opp.funding_agency}</span>
                  </div>
                  <div className="flex items-center gap-2 text-rose-700 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Deadline: {new Date(opp.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  switchRole('researcher');
                  onSelectOpportunity(opp);
                  onGoToPortal();
                }}
                className="w-full py-2.5 px-4 bg-blue-50 hover:bg-[#153B65] text-[#153B65] hover:text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-2xs"
              >
                Apply for this Grant
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* How to Submit: 5-Step Process */}
      <section className="bg-white border-y border-gray-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#2563A6]">
              Standard Operating Procedure
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#153B65] mt-1">
              How the Research Grant Process Works
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              From online submission to peer evaluation, executive approval, and monitoring.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {steps.map((st, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-gray-50/70 border border-gray-200/60 relative hover:border-[#153B65] transition-colors"
              >
                <span className="font-mono text-2xl font-black text-[#153B65]/30 block mb-2">
                  {st.num}
                </span>
                <h4 className="font-bold text-sm text-[#153B65] mb-2">{st.title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#153B65] text-white pt-12 pb-8 px-4 sm:px-6 lg:px-8 text-xs border-t border-[#2563A6]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-white/10">
          <div>
            <span className="font-black text-lg tracking-tight">DPMIS Lite</span>
            <p className="text-slate-300 mt-2 leading-relaxed">
              An independent research project management information system prototype inspired by the Philippine Department of Science and Technology (DOST) DPMIS V2 workflow.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-sky-300 uppercase tracking-wider mb-3">Partner Councils</h5>
            <ul className="space-y-1.5 text-slate-300">
              <li>PCIEERD - Industry, Energy & Emerging Tech</li>
              <li>PCHRD - Health Research & Development</li>
              <li>PCAARRD - Agriculture & Aquatic Resources</li>
              <li>NRCP - Basic Science & Humanities</li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-sky-300 uppercase tracking-wider mb-3">System Features</h5>
            <ul className="space-y-1.5 text-slate-300">
              <li>Proponent Narrative & Budget Engine</li>
              <li>Cloud Firestore Multi-Role Data Store</li>
              <li>Scientific 6-Criteria Rating Rubric</li>
              <li>Project Accomplishment Tracking</li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-sky-300 uppercase tracking-wider mb-3">Contact & Support</h5>
            <p className="text-slate-300 leading-relaxed">
              Special Projects & Grants Management Directorate<br />
              Science Heritage Building, General Santos Ave, Bicutan, Taguig City<br />
              Email: support@dpmislite.test
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-slate-400 text-[11px] gap-2">
          <span>© 2026 DPMIS Lite. Prototype for Academic & Research Management Demonstration.</span>
          <span>Powered by React 19 & Google Cloud Firestore</span>
        </div>
      </footer>
    </div>
  );
};
