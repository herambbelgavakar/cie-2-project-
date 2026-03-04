import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Zap, 
  ShieldAlert, 
  Search, 
  Filter, 
  RefreshCw,
  TrendingUp,
  BarChart3,
  List,
  BrainCircuit,
  Globe,
  Terminal as TerminalIcon,
  Cpu,
  Lock,
  Eye
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn } from './lib/utils';
import { Threat, ThreatTrend, ThreatAnalysis } from './types';
import { generateMockThreats, generateTrendData, generateSingleThreat } from './services/mockData';
import { analyzeThreatTrends } from './services/gemini';

// --- Sub-components ---

const StatCard = React.memo(({ title, value, icon: Icon, trend, color, glow }: { 
  title: string; 
  value: string | number; 
  icon: any; 
  trend?: string;
  color: string;
  glow?: string;
}) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className={cn(
      "bg-brand-card border border-brand-border p-5 rounded-2xl flex items-start justify-between relative overflow-hidden group transition-all duration-300",
      glow
    )}
  >
    <div className="absolute top-0 right-0 p-1 opacity-5 group-hover:opacity-10 transition-opacity">
      <Icon className="w-16 h-16" />
    </div>
    <div className="relative z-10">
      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-3xl font-black text-white tracking-tighter">{value}</h3>
      {trend && (
        <p className={cn("text-[10px] mt-2 flex items-center gap-1 font-mono", trend.startsWith('+') ? "text-red-400" : "text-emerald-400")}>
          <TrendingUp className="w-3 h-3" />
          {trend}
        </p>
      )}
    </div>
    <div className={cn("p-2.5 rounded-xl relative z-10", color)}>
      <Icon className="w-5 h-5 text-white" />
    </div>
  </motion.div>
));

const SeverityBadge = React.memo(({ severity }: { severity: Threat['severity'] }) => {
  const colors = {
    Low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    High: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    Critical: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded text-[9px] font-black uppercase border tracking-tighter", colors[severity])}>
      {severity}
    </span>
  );
});

const ThreatItem = React.memo(({ threat, isFirst }: { threat: Threat, isFirst: boolean }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
    className={cn(
      "flex items-start gap-4 p-3 rounded-xl border border-transparent hover:border-brand-border hover:bg-white/5 transition-all group overflow-hidden",
      isFirst && "bg-emerald-500/5 border-emerald-500/20"
    )}
  >
    <span className="text-zinc-600 w-20 shrink-0">[{format(new Date(threat.timestamp), 'HH:mm:ss')}]</span>
    <span className={cn(
      "font-bold w-24 shrink-0",
      threat.severity === 'Critical' ? "text-red-500" : 
      threat.severity === 'High' ? "text-orange-500" : "text-emerald-400"
    )}>
      {threat.severity.toUpperCase()}
    </span>
    <span className="text-zinc-300 w-32 shrink-0">{threat.type}</span>
    <span className="text-zinc-500 w-32 shrink-0">{threat.source}</span>
    <span className="text-zinc-400 flex-1 italic group-hover:text-zinc-200 transition-colors truncate">
      {threat.description}
    </span>
    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
      <Eye className="w-4 h-4 text-emerald-500 cursor-pointer" />
    </div>
  </motion.div>
));

export default function App() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [trends, setTrends] = useState<ThreatTrend[]>([]);
  const [analysis, setAnalysis] = useState<ThreatAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'threats' | 'intelligence'>('overview');
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    const mockThreats = generateMockThreats(40);
    const mockTrends = generateTrendData(14);
    setThreats(mockThreats);
    setTrends(mockTrends);
    
    setIsAnalyzing(true);
    const aiAnalysis = await analyzeThreatTrends(mockThreats);
    setAnalysis(aiAnalysis);
    setIsAnalyzing(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Real-time simulation
  useEffect(() => {
    if (!realTimeEnabled) return;

    const interval = setInterval(() => {
      const newThreat = generateSingleThreat();
      setThreats(prev => [newThreat, ...prev.slice(0, 49)]);
      
      // Update trends slightly
      setTrends(prev => {
        const last = [...prev];
        if (last.length > 0) {
          last[last.length - 1] = {
            ...last[last.length - 1],
            count: last[last.length - 1].count + 1
          };
        }
        return last;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [realTimeEnabled]);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = 0;
    }
  }, [threats]);

  const severityData = useMemo(() => {
    const counts = threats.reduce((acc, t) => {
      acc[t.severity] = (acc[t.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return [
      { name: 'Critical', value: counts.Critical || 0, color: '#ef4444' },
      { name: 'High', value: counts.High || 0, color: '#f97316' },
      { name: 'Medium', value: counts.Medium || 0, color: '#eab308' },
      { name: 'Low', value: counts.Low || 0, color: '#3b82f6' },
    ];
  }, [threats]);

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="scanline" />
      
      {/* Header */}
      <header className="border-b border-brand-border bg-brand-bg/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/40 rotate-3 hover:rotate-0 transition-transform cursor-pointer">
              <Shield className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white uppercase">ThreatPulse <span className="text-emerald-500">v4.0</span></h1>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[9px] text-emerald-500 font-mono uppercase tracking-[0.2em]">Quantum-Ready Intelligence</p>
              </div>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-2 bg-zinc-900/50 border border-brand-border p-1.5 rounded-2xl">
            {[
              { id: 'overview', label: 'Command Center', icon: BarChart3 },
              { id: 'threats', label: 'Live Feed', icon: TerminalIcon },
              { id: 'intelligence', label: 'AI Core', icon: BrainCircuit },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                  activeTab === tab.id 
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Latency</span>
              <span className="text-xs font-mono text-emerald-500">14ms</span>
            </div>
            <div className="h-8 w-[1px] bg-brand-border hidden sm:block" />
            <button 
              onClick={() => setRealTimeEnabled(!realTimeEnabled)}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all",
                realTimeEnabled ? "border-emerald-500/50 text-emerald-500 bg-emerald-500/5" : "border-zinc-700 text-zinc-500"
              )}
            >
              {realTimeEnabled ? 'Real-time: ON' : 'Real-time: OFF'}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Active Threats" 
            value={threats.length} 
            icon={Activity} 
            trend="+14.2%" 
            color="bg-blue-600" 
            glow="hover:shadow-blue-500/10"
          />
          <StatCard 
            title="Critical Alerts" 
            value={threats.filter(t => t.severity === 'Critical').length} 
            icon={AlertTriangle} 
            trend="+2.1%" 
            color="bg-red-600" 
            glow="glow-red"
          />
          <StatCard 
            title="Mitigation Speed" 
            value="0.8s" 
            icon={Zap} 
            trend="-0.2s" 
            color="bg-emerald-600" 
            glow="glow-emerald"
          />
          <StatCard 
            title="System Integrity" 
            value="99.9%" 
            icon={Lock} 
            color="bg-zinc-700" 
          />
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Main Chart */}
              <div className="lg:col-span-2 bg-brand-card border border-brand-border rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-20" />
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tight">Threat Propagation</h2>
                    <p className="text-xs text-zinc-500 font-mono">Real-time telemetry from global nodes</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[10px] text-zinc-400 uppercase font-mono">Volume</span>
                    </div>
                  </div>
                </div>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trends}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="#404040" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false} 
                        dy={10}
                      />
                      <YAxis 
                        stroke="#404040" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false} 
                        dx={-10}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0c0c0c', border: '1px solid #1a1a1a', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                        itemStyle={{ color: '#10b981', fontSize: '12px', fontWeight: 'bold' }}
                        labelStyle={{ color: '#71717a', fontSize: '10px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorCount)" 
                        animationDuration={1000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-8">
                <div className="bg-brand-card border border-brand-border rounded-3xl p-8">
                  <h2 className="text-xs font-black mb-6 uppercase tracking-[0.2em] text-zinc-500">Severity Matrix</h2>
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={severityData}
                          innerRadius={70}
                          outerRadius={90}
                          paddingAngle={8}
                          dataKey="value"
                          stroke="none"
                        >
                          {severityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0c0c0c', border: '1px solid #1a1a1a', borderRadius: '12px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    {severityData.map((item) => (
                      <div key={item.name} className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <div className="flex flex-col">
                          <span className="text-[10px] text-zinc-500 uppercase font-mono">{item.name}</span>
                          <span className="text-sm font-bold text-white">{item.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-brand-card border border-brand-border rounded-3xl p-8 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-3 mb-4">
                    <Cpu className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-sm font-black uppercase tracking-wider">Neural Engine</h2>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                    Our AI core is currently processing <span className="text-emerald-500 font-bold">1.2M events/sec</span> across 42 global clusters.
                  </p>
                  <div className="space-y-3">
                    <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '84%' }}
                        className="h-full bg-emerald-500" 
                      />
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-zinc-500 uppercase">
                      <span>Processing Load</span>
                      <span>84%</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'threats' && (
            <motion.div 
              key="threats"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-brand-card border border-brand-border rounded-3xl overflow-hidden flex flex-col h-[600px]"
            >
              <div className="p-6 border-b border-brand-border flex items-center justify-between bg-zinc-900/20">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <TerminalIcon className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-tight">Live Intelligence Feed</h2>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase">Real-time packet inspection active</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-xl border border-brand-border">
                    <Search className="w-3.5 h-3.5 text-zinc-500" />
                    <input 
                      type="text" 
                      placeholder="Filter by IP, Type, or ID..." 
                      className="bg-transparent border-none focus:ring-0 text-xs w-48 placeholder:text-zinc-700"
                    />
                  </div>
                </div>
              </div>
              
              <div 
                ref={terminalRef}
                className="flex-1 overflow-y-auto terminal-scroll p-6 font-mono text-[11px] space-y-2 bg-black/40"
                style={{ contain: 'paint' }}
              >
                <AnimatePresence initial={false} mode="popLayout">
                  {threats.slice(0, 20).map((threat, idx) => (
                    <ThreatItem 
                      key={threat.id} 
                      threat={threat} 
                      isFirst={idx === 0} 
                    />
                  ))}
                </AnimatePresence>
              </div>
              
              <div className="p-4 border-t border-brand-border bg-zinc-900/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[9px] text-zinc-500 uppercase font-mono">Buffer: 100/100</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-[9px] text-zinc-500 uppercase font-mono">Filter: None</span>
                  </div>
                </div>
                <p className="text-[9px] text-zinc-600 font-mono uppercase">Secure Shell Connection: AES-256-GCM</p>
              </div>
            </motion.div>
          )}

          {activeTab === 'intelligence' && (
            <motion.div 
              key="intelligence"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-brand-card border border-brand-border rounded-[2rem] p-10 relative overflow-hidden group">
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] group-hover:bg-emerald-500/20 transition-all duration-1000" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                          <BrainCircuit className="w-8 h-8 text-emerald-500" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-black uppercase tracking-tight">AI Strategic Intelligence</h2>
                          <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">Model: Gemini-3-Flash-Pro</p>
                        </div>
                      </div>
                      <button 
                        onClick={fetchData}
                        disabled={isAnalyzing}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-50 shadow-xl shadow-emerald-500/20"
                      >
                        <RefreshCw className={cn("w-4 h-4", isAnalyzing && "animate-spin")} />
                        Re-Analyze
                      </button>
                    </div>

                    {isAnalyzing ? (
                      <div className="space-y-6 py-10">
                        <div className="h-6 bg-zinc-900 rounded-xl animate-pulse w-3/4" />
                        <div className="h-6 bg-zinc-900 rounded-xl animate-pulse w-1/2" />
                        <div className="h-6 bg-zinc-900 rounded-xl animate-pulse w-5/6" />
                        <div className="flex items-center gap-3 mt-10">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          <p className="text-xs text-zinc-500 font-mono uppercase animate-pulse">Synthesizing global threat vectors...</p>
                        </div>
                      </div>
                    ) : analysis ? (
                      <div className="space-y-12">
                        <section className="relative">
                          <div className="absolute -left-6 top-0 bottom-0 w-1 bg-emerald-500/20 rounded-full" />
                          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-4 font-mono">Executive Summary</h3>
                          <p className="text-zinc-300 leading-relaxed font-serif text-xl italic">
                            "{analysis.summary}"
                          </p>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                          <section>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 mb-6 font-mono">Critical Vectors</h3>
                            <div className="space-y-4">
                              {analysis.topThreats.map((threat, i) => (
                                <motion.div 
                                  key={i}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.1 }}
                                  className="flex items-start gap-4 p-4 bg-zinc-900/50 border border-brand-border rounded-2xl hover:border-red-500/30 transition-colors"
                                >
                                  <span className="text-red-500 font-black text-xs mt-0.5">0{i+1}</span>
                                  <span className="text-sm text-zinc-300 font-medium">{threat}</span>
                                </motion.div>
                              ))}
                            </div>
                          </section>

                          <section>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-6 font-mono">Countermeasures</h3>
                            <div className="space-y-4">
                              {analysis.recommendations.map((rec, i) => (
                                <motion.div 
                                  key={i}
                                  initial={{ opacity: 0, x: 10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.1 }}
                                  className="flex items-start gap-4 p-4 bg-zinc-900/50 border border-brand-border rounded-2xl hover:border-blue-500/30 transition-colors"
                                >
                                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                  <span className="text-sm text-zinc-300 font-medium">{rec}</span>
                                </motion.div>
                              ))}
                            </div>
                          </section>
                        </div>
                      </div>
                    ) : (
                      <div className="py-20 text-center border-2 border-dashed border-brand-border rounded-[2rem]">
                        <p className="text-zinc-500 font-mono uppercase tracking-widest">No Intelligence Data Cached</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className={cn(
                  "bg-brand-card border border-brand-border rounded-[2rem] p-10 text-center transition-all duration-500 relative overflow-hidden",
                  analysis?.riskLevel === 'Critical' ? "border-red-500/50 glow-red" : "border-emerald-500/30 glow-emerald"
                )}>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-8 font-mono">Threat Posture</h3>
                  <div className="relative inline-block">
                    <motion.div 
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className={cn(
                        "w-40 h-40 rounded-full border-[6px] flex flex-col items-center justify-center mb-6 shadow-2xl",
                        analysis?.riskLevel === 'Critical' ? "border-red-500 shadow-red-500/20" : 
                        analysis?.riskLevel === 'Elevated' ? "border-orange-500 shadow-orange-500/20" : "border-emerald-500 shadow-emerald-500/20"
                      )}
                    >
                      <span className={cn(
                        "text-3xl font-black uppercase tracking-tighter mb-1",
                        analysis?.riskLevel === 'Critical' ? "text-red-500" : 
                        analysis?.riskLevel === 'Elevated' ? "text-orange-500" : "text-emerald-500"
                      )}>
                        {analysis?.riskLevel || 'Stable'}
                      </span>
                      <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">Risk Index</span>
                    </motion.div>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed px-4 font-medium">
                    Automated systems have adjusted firewall heuristics to match the current <span className="text-white">{analysis?.riskLevel}</span> threat profile.
                  </p>
                </div>

                <div className="bg-brand-card border border-brand-border rounded-[2rem] p-8">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6 font-mono">Node Connectivity</h3>
                  <div className="space-y-5">
                    {[
                      { name: 'Global Honeypots', status: 'Active', latency: '42ms', load: 12 },
                      { name: 'Dark Web Scrapers', status: 'Active', latency: '128ms', load: 45 },
                      { name: 'Endpoint Telemetry', status: 'Active', latency: '12ms', load: 89 },
                      { name: 'AI Pattern Engine', status: 'Optimized', latency: '5ms', load: 64 },
                    ].map((source) => (
                      <div key={source.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-white uppercase tracking-tight">{source.name}</p>
                            <p className="text-[9px] text-zinc-500 font-mono uppercase">{source.status}</p>
                          </div>
                          <span className="text-[10px] text-emerald-500 font-mono">{source.latency}</span>
                        </div>
                        <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                          <div className="h-full bg-zinc-700" style={{ width: `${source.load}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-brand-border bg-brand-bg/80 backdrop-blur-md p-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.3em]">ThreatPulse Intelligence &copy; 2026</span>
            </div>
            <div className="h-4 w-[1px] bg-brand-border hidden md:block" />
            <div className="flex items-center gap-4 text-[9px] text-zinc-600 font-mono uppercase tracking-widest">
              <span className="hover:text-emerald-500 cursor-pointer transition-colors">Privacy Protocol</span>
              <span className="hover:text-emerald-500 cursor-pointer transition-colors">API Documentation</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[9px] text-zinc-500 font-mono uppercase">Node: ASIA-SOUTH-1</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[9px] text-zinc-500 font-mono uppercase">Status: Encrypted</span>
            </div>
            <div className="px-3 py-1 bg-zinc-900 border border-brand-border rounded-lg">
              <span className="text-[9px] text-zinc-400 font-mono uppercase">v4.2.0-STABLE</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
