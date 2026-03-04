import React from 'react';
import { Shield, Activity, AlertTriangle, Globe } from 'lucide-react';

export const DashboardHeader = () => {
  return (
    <header className="border-b border-brand-border bg-brand-card/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-accent/10 rounded-lg">
            <Shield className="w-6 h-6 text-brand-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">ThreatPulse</h1>
            <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">Global Threat Intelligence</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-brand-accent rounded-full animate-pulse" />
            <span className="text-xs font-mono text-zinc-400 uppercase">System Live</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <Globe className="w-4 h-4" />
            <span className="text-xs font-mono">Global Node: 0x4F2</span>
          </div>
        </div>
      </div>
    </header>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  icon: React.ReactNode;
  color?: string;
}

export const StatCard = ({ label, value, trend, icon, color = "text-brand-accent" }: StatCardProps) => {
  return (
    <div className="bg-brand-card border border-brand-border p-6 rounded-2xl hover:border-brand-accent/50 transition-colors group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 bg-zinc-900 rounded-xl group-hover:scale-110 transition-transform ${color}`}>
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-mono text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-md">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-zinc-500 text-sm font-medium mb-1">{label}</h3>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
    </div>
  );
};
