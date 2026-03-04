export interface Threat {
  id: string;
  type: 'Malware' | 'Phishing' | 'DDoS' | 'Ransomware' | 'Zero-Day';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  timestamp: string;
  source: string;
  target: string;
  status: 'Active' | 'Mitigated' | 'Investigating';
  description: string;
}

export interface ThreatTrend {
  date: string;
  count: number;
  severityScore: number;
}

export interface ThreatAnalysis {
  summary: string;
  topThreats: string[];
  recommendations: string[];
  riskLevel: 'Elevated' | 'Stable' | 'Critical';
}
