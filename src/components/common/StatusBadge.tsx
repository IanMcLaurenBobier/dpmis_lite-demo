import React from 'react';
import { ProposalStatus, ProjectStatus } from '../../types';

interface StatusBadgeProps {
  status: ProposalStatus | ProjectStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  let bg = 'bg-gray-100 text-gray-700 border-gray-200';
  let dot = 'bg-gray-400';

  switch (status) {
    case 'Draft':
      bg = 'bg-slate-100 text-slate-700 border-slate-300';
      dot = 'bg-slate-400';
      break;
    case 'Submitted':
      bg = 'bg-sky-50 text-sky-700 border-sky-200';
      dot = 'bg-sky-500';
      break;
    case 'Administrative Review':
      bg = 'bg-blue-50 text-blue-700 border-blue-200';
      dot = 'bg-blue-500';
      break;
    case 'For Correction':
      bg = 'bg-amber-50 text-amber-800 border-amber-300';
      dot = 'bg-amber-500';
      break;
    case 'Under Evaluation':
      bg = 'bg-purple-50 text-purple-700 border-purple-200';
      dot = 'bg-purple-500';
      break;
    case 'For Approval':
      bg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      dot = 'bg-indigo-500';
      break;
    case 'Approved':
      bg = 'bg-emerald-50 text-emerald-800 border-emerald-300';
      dot = 'bg-emerald-600';
      break;
    case 'Disapproved':
      bg = 'bg-rose-50 text-rose-800 border-rose-300';
      dot = 'bg-rose-600';
      break;
    case 'Ongoing':
      bg = 'bg-teal-50 text-teal-800 border-teal-300';
      dot = 'bg-teal-500 animate-pulse';
      break;
    case 'For Monitoring':
      bg = 'bg-amber-50 text-amber-800 border-amber-300';
      dot = 'bg-amber-500';
      break;
    case 'Completed':
      bg = 'bg-emerald-100 text-emerald-900 border-emerald-400 font-semibold';
      dot = 'bg-emerald-700';
      break;
    case 'Delayed':
      bg = 'bg-red-50 text-red-800 border-red-300';
      dot = 'bg-red-500';
      break;
    case 'active':
      bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      dot = 'bg-emerald-500';
      break;
    case 'closed':
      bg = 'bg-gray-100 text-gray-600 border-gray-300';
      dot = 'bg-gray-400';
      break;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-2xs ${sizeClasses} ${bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
};
