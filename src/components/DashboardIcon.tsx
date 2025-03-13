import React from 'react';
import { BarChart2 } from 'lucide-react';

interface DashboardIconProps {
  onClick: () => void;
}

export function DashboardIcon({ onClick }: DashboardIconProps) {
  return (
    <button
      onClick={onClick}
      className="p-2 text-white/90 hover:text-white transition-colors"
      title="Tableau de bord"
    >
      <BarChart2 className="h-6 w-6" />
    </button>
  );
}