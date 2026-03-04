import { Threat, ThreatTrend } from '../types';
import { subDays, format } from 'date-fns';

const THREAT_TYPES: Threat['type'][] = ['Malware', 'Phishing', 'DDoS', 'Ransomware', 'Zero-Day'];
const SEVERITIES: Threat['severity'][] = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES: Threat['status'][] = ['Active', 'Mitigated', 'Investigating'];

export const generateMockThreats = (count: number): Threat[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `THREAT-${1000 + i}`,
    type: THREAT_TYPES[Math.floor(Math.random() * THREAT_TYPES.length)],
    severity: SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)],
    timestamp: subDays(new Date(), Math.floor(Math.random() * 7)).toISOString(),
    source: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    target: `Internal-Server-${Math.floor(Math.random() * 50)}`,
    status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
    description: `Detected suspicious ${THREAT_TYPES[Math.floor(Math.random() * THREAT_TYPES.length)]} activity originating from external source.`
  }));
};

export const generateTrendData = (days: number): ThreatTrend[] => {
  return Array.from({ length: days }).map((_, i) => {
    const date = subDays(new Date(), days - 1 - i);
    return {
      date: format(date, 'MMM dd'),
      count: Math.floor(Math.random() * 50) + 10,
      severityScore: Math.floor(Math.random() * 100)
    };
  });
};

export const generateSingleThreat = (): Threat => {
  const type = THREAT_TYPES[Math.floor(Math.random() * THREAT_TYPES.length)];
  return {
    id: `THREAT-${Math.floor(Math.random() * 9000) + 1000}`,
    type,
    severity: SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)],
    timestamp: new Date().toISOString(),
    source: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    target: `Internal-Server-${Math.floor(Math.random() * 50)}`,
    status: 'Active',
    description: `Real-time detection: Potential ${type} activity identified.`
  };
};
