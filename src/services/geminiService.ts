import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function getDashboardInsights(stats: any) {
  try {
    const model = "gemini-3-flash-preview";
    const prompt = `
      Eres un analista de datos experto en transporte público para el sistema SETP de Pasto, Colombia.
      Analiza los siguientes datos actuales del sistema y proporciona 3 insights clave o recomendaciones breves (máximo 100 palabras en total).
      
      Datos:
      - Total de Buses: ${stats.buses}
      - Total de Conductores: ${stats.conductors}
      - Rutas Activas: ${stats.routes}
      - Total de PQR (Peticiones, Quejas y Reclamos): ${stats.pqrs}
      - PQR por estado: ${JSON.stringify(stats.pqrByStatus)}
      
      Formato de respuesta: JSON con un array de strings llamado "insights".
    `;

    const response = await genAI.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (text) {
      const data = JSON.parse(text);
      return data.insights || [];
    }
    return [];
  } catch (error) {
    console.error("Error getting Gemini insights:", error);
    return ["No se pudieron generar insights en este momento."];
  }
}

export async function refinePQRDescription(subject: string, description: string) {
  try {
    const model = "gemini-3-flash-preview";
    const prompt = `
      Eres un asistente cordial para el sistema de transporte SETP de Pasto.
      El usuario ha escrito el siguiente asunto y descripción para una PQR (Petición, Queja o Reclamo).
      Tu tarea es mejorar la redacción para que sea más clara, formal y profesional, manteniendo todos los detalles originales.
      
      Asunto: ${subject}
      Descripción original: ${description}
      
      Responde únicamente con la nueva descripción mejorada en texto plano.
    `;

    const response = await genAI.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    return response.text || description;
  } catch (error) {
    console.error("Error refining PQR description:", error);
    return description;
  }
}

export async function suggestRoutes(origin: string, destination: string, allRoutes: any[]) {
  try {
    const model = "gemini-3-flash-preview";
    const routesList = allRoutes.map(r => `${r.code}: ${r.name}`).join(', ');
    const prompt = `
      Eres un asistente experto en el sistema de transporte SETP de Pasto.
      Un usuario quiere ir desde "${origin}" hasta "${destination}".
      Basado únicamente en la siguiente lista de rutas disponibles, sugiere las 2 mejores opciones (pueden ser rutas directas o con 1 transbordo).
      Rutas disponibles: ${routesList}
      
      Responde en formato JSON con un array de objetos llamado "suggestions", cada uno con:
      - "route": El código de la ruta (o códigos si hay transbordo).
      - "explanation": Una breve explicación de por qué esta ruta sirve (máximo 30 palabras).
    `;

    const response = await genAI.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (text) {
      const data = JSON.parse(text);
      return data.suggestions || [];
    }
    return [];
  } catch (error) {
    console.error("Error suggesting routes:", error);
    return [];
  }
}
