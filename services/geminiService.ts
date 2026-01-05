import { GoogleGenAI } from "@google/genai";
import { LayerConfig, GeminiAnalysis } from '../types';

export const analyzeLayerMetadata = async (layer: LayerConfig): Promise<GeminiAnalysis> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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
      config: {
        responseMimeType: 'application/json'
      }
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