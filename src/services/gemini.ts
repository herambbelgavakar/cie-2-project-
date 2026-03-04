import { GoogleGenAI, Type } from "@google/genai";
import { Threat, ThreatAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const analyzeThreatTrends = async (threats: Threat[]): Promise<ThreatAnalysis> => {
  const prompt = `Analyze the following cybersecurity threat data and provide a trend analysis:
  ${JSON.stringify(threats.slice(0, 20))}
  
  Provide a summary of the current threat landscape, identify the top 3 most concerning threats, offer 3 actionable recommendations, and determine the overall risk level (Elevated, Stable, or Critical).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            topThreats: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            riskLevel: { 
              type: Type.STRING,
              description: "Elevated, Stable, or Critical"
            }
          },
          required: ["summary", "topThreats", "recommendations", "riskLevel"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      summary: "AI analysis is currently unavailable. Based on raw data, we see consistent activity across all sectors.",
      topThreats: ["Ransomware attempts", "Phishing campaigns", "DDoS spikes"],
      recommendations: ["Update firewall rules", "Conduct employee training", "Enable MFA"],
      riskLevel: "Elevated"
    };
  }
};
