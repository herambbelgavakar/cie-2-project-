import { ThreatAnalysis } from '../types';
import { Sparkles, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';

interface AIInsightsProps {
  analysis: ThreatAnalysis | null;
  loading: boolean;
}

export const AIInsights = ({ analysis, loading }: AIInsightsProps) => {
  if (loading) {
    return (
      <div className="bg-brand-card border border-brand-border p-6 rounded-2xl animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-brand-accent" />
          <div className="h-4 w-32 bg-zinc-800 rounded" />
        </div>
        <div className="space-y-3">
          <div className="h-3 w-full bg-zinc-800 rounded" />
          <div className="h-3 w-5/6 bg-zinc-800 rounded" />
          <div className="h-3 w-4/6 bg-zinc-800 rounded" />
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="bg-brand-card border border-brand-border p-6 rounded-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4">
        <div className={cn(
          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
          analysis.riskLevel === 'Critical' && "bg-red-500/10 text-red-500 border-red-500/20",
          analysis.riskLevel === 'Elevated' && "bg-orange-500/10 text-orange-500 border-orange-500/20",
          analysis.riskLevel === 'Stable' && "bg-brand-accent/10 text-brand-accent border-brand-accent/20",
        )}>
          Risk Level: {analysis.riskLevel}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-brand-accent" />
        <h3 className="text-lg font-bold">AI Threat Analysis</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <h4 className="text-xs font-mono text-zinc-500 uppercase mb-3 flex items-center gap-2">
            <TrendingUp className="w-3 h-3" /> Executive Summary
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {analysis.summary}
          </p>
        </div>

        <div>
          <h4 className="text-xs font-mono text-zinc-500 uppercase mb-3 flex items-center gap-2">
            <AlertCircle className="w-3 h-3" /> Top Concerns
          </h4>
          <ul className="space-y-2">
            {analysis.topThreats.map((threat, i) => (
              <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                <span className="text-brand-accent mt-1">•</span>
                {threat}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-mono text-zinc-500 uppercase mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-3 h-3" /> Recommended Actions
          </h4>
          <ul className="space-y-2">
            {analysis.recommendations.map((rec, i) => (
              <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                <span className="text-brand-accent mt-1">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
