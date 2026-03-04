import { Threat } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface ThreatTableProps {
  threats: Threat[];
}

export const ThreatTable = ({ threats }: ThreatTableProps) => {
  return (
    <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-brand-border">
        <h3 className="text-lg font-bold">Live Threat Feed</h3>
        <p className="text-sm text-zinc-500">Real-time detection logs across infrastructure</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-900/50 text-zinc-500 text-xs uppercase tracking-wider font-mono">
              <th className="px-6 py-4 font-medium">Timestamp</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Severity</th>
              <th className="px-6 py-4 font-medium">Source IP</th>
              <th className="px-6 py-4 font-medium">Target</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {threats.map((threat) => (
              <tr key={threat.id} className="hover:bg-zinc-900/30 transition-colors group">
                <td className="px-6 py-4 text-xs font-mono text-zinc-400">
                  {format(new Date(threat.timestamp), 'HH:mm:ss')}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium">{threat.type}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border",
                    threat.severity === 'Critical' && "bg-red-500/10 text-red-500 border-red-500/20",
                    threat.severity === 'High' && "bg-orange-500/10 text-orange-500 border-orange-500/20",
                    threat.severity === 'Medium' && "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
                    threat.severity === 'Low' && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                  )}>
                    {threat.severity}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs font-mono text-zinc-400">
                  {threat.source}
                </td>
                <td className="px-6 py-4 text-sm text-zinc-300">
                  {threat.target}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      threat.status === 'Active' ? "bg-red-500 animate-pulse" : 
                      threat.status === 'Mitigated' ? "bg-brand-accent" : "bg-zinc-500"
                    )} />
                    <span className="text-xs text-zinc-400">{threat.status}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
