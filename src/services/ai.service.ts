import { GoogleGenAI, Type } from "@google/genai";
import { Idea, AnalysisQuestion, Premise } from "../types/app.types";
import { generateId } from "../utils/id";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
const GEMINI_MODEL = "gemini-2.5-flash";

export const aiService = {
  async analyzeIdea(idea: Idea): Promise<AnalysisQuestion[]> {
    const prompt = `
      Você é um analista lógico sênior no ÓRION LAB. 
      Sua tarefa é analisar a estrutura de um argumento ou ideia em desenvolvimento.
      
      Título da Ideia: ${idea.title}
      
      Conteúdo (Blocos):
      ${idea.blocks.map(b => `[${b.type}] ${b.content}`).join('\n')}
      
      Premissas Extraídas:
      ${idea.premises.map(p => `- [${p.type}] ${p.text}`).join('\n')}
      
      Argumentos Estruturados:
      ${idea.arguments.map(a => `- Conclusão: ${a.conclusion}. Baseado em: ${a.premiseIds.join(', ')} (Força: ${a.strength}/5)`).join('\n')}
      
      Com base nessas informações, identifique problemas lógicos, pressupostos ocultos, inconsistências ou áreas que precisam de mais evidências.
      Forneça uma lista de perguntas críticas ou observações analíticas.
      
      Responda APENAS em formato JSON seguindo este esquema:
      Array<{
        question: string,
        type: 'critical' | 'clarity' | 'evidence' | 'consistency',
        severity: 'low' | 'medium' | 'high'
      }>
    `;

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                type: {
                  type: Type.STRING,
                  enum: ["critical", "clarity", "evidence", "consistency"]
                },
                severity: {
                  type: Type.STRING,
                  enum: ["low", "medium", "high"]
                }
              },
              required: ["question", "type", "severity"]
            }
          }
        }
      });

      const text = response.text;
      if (!text) return [];

      const results = JSON.parse(text);
      return results.map((r: any) => ({
        ...r,
        id: generateId()
      }));
    } catch (error: any) {
      console.error("Erro na análise de IA:", error);

      const isQuotaError =
        error?.status === 429 ||
        String(error?.message || "").includes("429") ||
        String(error?.message || "").includes("RESOURCE_EXHAUSTED");

      if (isQuotaError) {
        return [
          {
            id: generateId(),
            question: "A cota da IA foi excedida no momento. Aguarde um pouco e tente novamente.",
            type: "evidence",
            severity: "medium"
          }
        ];
      }

      return [
        {
          id: generateId(),
          question: "Não foi possível realizar a análise de IA no momento. Verifique sua conexão ou tente novamente mais tarde.",
          type: "clarity",
          severity: "medium"
        }
      ];
    }
  },

  async extractPremises(idea: Idea): Promise<Premise[]> {
    const prompt = `
      Você é um analista lógico sênior no ÓRION LAB. 
      Sua tarefa é extrair premissas lógicas a partir de um texto ou conjunto de blocos de uma ideia.
      
      Título da Ideia: ${idea.title}
      
      Conteúdo (Blocos):
      ${idea.blocks.map(b => `[${b.type}] ${b.content}`).join('\n')}
      
      Extraia três tipos específicos de premissas:
      1. 'base': Premissas fundamentais explicitamente declaradas ou fatos de apoio.
      2. 'hidden': Premissas ocultas (entimemas) que são necessárias para a lógica mas não foram ditas.
      3. 'antithesis': Pontos de vista opostos ou contra-argumentos que desafiam a ideia.
      
      Responda APENAS em formato JSON seguindo este esquema:
      Array<{
        text: string,
        type: 'base' | 'hidden' | 'antithesis'
      }>
    `;

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                type: {
                  type: Type.STRING,
                  enum: ["base", "hidden", "antithesis"]
                }
              },
              required: ["text", "type"]
            }
          }
        }
      });

      const text = response.text;
      if (!text) return [];

      const results = JSON.parse(text);
      return results.map((r: any) => ({
        id: generateId(),
        text: r.text,
        type: r.type,
        notes: ""
      }));
    } catch (error: any) {
      console.error("Erro na extração de premissas:", error);

      const isQuotaError =
        error?.status === 429 ||
        String(error?.message || "").includes("429") ||
        String(error?.message || "").includes("RESOURCE_EXHAUSTED");

      if (isQuotaError) {
        throw new Error("A cota da IA foi excedida no momento. Aguarde um pouco e tente novamente.");
      }

      throw new Error("Não foi possível extrair premissas com IA no momento.");
    }
  }
};