import { GoogleGenAI } from "@google/genai";
import { LayerConfig, GeminiAnalysis, ErrorDiagnosis, LogEntry } from '../types';

const getAIClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeLayerMetadata = async (layer: LayerConfig): Promise<GeminiAnalysis> => {
  const ai = getAIClient();
  
  const prompt = `
    You are a GIS Data Architect. Analyze the following WFS Layer metadata configuration:
    
    Layer Name: ${layer.name}
    Estimated Feature Count: ${layer.estimatedCount}
    Source URL: ${layer.wfsUrl}
    Target CRS: ${layer.targetCrs}

    Provide a JSON summary with:
    1. A brief description of what this data likely represents in the context of São Paulo (GeoSampa).
    2. 3 specific optimization tips for ingesting this specific type of data into PostGIS (e.g., specific indexes, partitioning strategy).
    
    Format the output as JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);

    return {
      layerName: layer.name,
      summary: data.summary || "No summary available.",
      optimizationTips: data.optimizationTips || ["Use spatial index", "Vacuum analyze after load"]
    };
  } catch (error) {
    console.error("Gemini Analysis Failed", error);
    return {
      layerName: layer.name,
      summary: "Analysis failed due to API error.",
      optimizationTips: ["Check connection", "Verify WFS capabilities"]
    };
  }
};

export const diagnosePipelineError = async (layer: LayerConfig, recentLogs: LogEntry[]): Promise<ErrorDiagnosis> => {
  const ai = getAIClient();
  
  const relevantLogs = recentLogs
    .filter(l => l.message.includes(layer.name) || l.level === 'ERROR' || l.level === 'WARN')
    .slice(-15)
    .map(l => `[${l.level}] ${l.message}`)
    .join('\n');

  const prompt = `
    You are a Backend Engineer debugging a Python WFS ETL pipeline.
    
    Layer: ${layer.name}
    
    Recent Logs:
    ${relevantLogs}

    Analyze the logs above. Identify the likely root cause (e.g., Network Timeout, WFS Exception, CRS Projection Error, Database Lock).
    Provide a JSON response with:
    - errorType: Short title of the error.
    - explanation: 1-2 sentences explaining what happened.
    - suggestedFix: A specific technical recommendation for the Python script (e.g., "Increase timeout in requests.get", "Use ST_Transform").
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    return {
      layerName: layer.name,
      errorType: "Unknown API Error",
      explanation: "Could not consult Gemini API.",
      suggestedFix: "Check internet connection."
    };
  }
};

export const generatePostGISQuery = async (layer: LayerConfig, userQuery: string): Promise<string> => {
  const ai = getAIClient();

  const prompt = `
    You are a PostGIS SQL Assistant.
    
    Context:
    - Table Name: public.${layer.id} (derived from layer ${layer.name})
    - Geometry Column: geom (SRID 4326)
    
    User Request: "${userQuery}"
    
    Generate a valid PostgreSQL/PostGIS SQL query to answer the request. 
    Return ONLY the SQL code, no markdown formatting, no explanations.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.replace(/```sql|```/g, '').trim() || "-- Error generating SQL";
  } catch (error) {
    return "-- Error contacting Gemini API";
  }
};