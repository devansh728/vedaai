import { GoogleGenerativeAI, SchemaType, type Schema } from '@google/generative-ai';
import { env } from '../config/env';
import { IPaperData } from '../models/Assignment';

export class AIService {
  private static genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

  /**
   * Generates a fully structured assessment using Gemini's JSON structured output features.
   */
  public static async generateAssessment(params: {
    title: string;
    instructions?: string;
    config: {
      subject: string;
      className: string;
      timeAllowedMinutes: number;
      totalMarks: number;
      sections: Array<{
        sectionName: string;
        instructions: string;
        questionCount: number;
        marksPerQuestion: number;
        difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Mixed';
        topics: string[];
      }>;
    };
    rawContextText?: string;
    institutionName: string;
  }): Promise<IPaperData> {

    const systemInstruction = `
You are a senior academic reviewer and curriculum specialist. Your task is to generate a comprehensive, highly rigorous, and syllabus-aligned assessment paper.
The output MUST strictly match the specified JSON schema structure.

CORE INSTRUCTIONS:
1. Academic Rigor: Avoid shallow queries. Build conceptual, application-oriented, and analytical questions.
2. Context Alignment: If a context reference block is provided below, draw terms, definitions, and concepts directly from it.
3. Completeness: Ensure all questions are complete and self-contained (no external references, links, or visual assets are allowed).
4. Exact Fit: The total marks in the output must equal the sum of (questionCount * marksPerQuestion) across all sections, matching the totalMarks parameter.
`;

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      systemInstruction: systemInstruction,
    });

    let prompt = '';

    if (params.rawContextText) {
      prompt += `CONTEXT REFERENCE MATERIAL:\n"""\n${params.rawContextText}\n"""\n\n`;
      prompt += `Instruction: Preferentially generate questions from the above reference context.\n\n`;
    }

    prompt += `ASSESSMENT ATTRIBUTES:\n`;
    prompt += `- Institution Name: ${params.institutionName}\n`;
    prompt += `- Title: ${params.title}\n`;
    if (params.instructions) {
      prompt += `- Overall Instructions: ${params.instructions}\n`;
    }
    prompt += `- Subject: ${params.config.subject}\n`;
    prompt += `- Class: ${params.config.className}\n`;
    prompt += `- Time Allowed: ${params.config.timeAllowedMinutes} minutes\n`;
    prompt += `- Total Marks: ${params.config.totalMarks}\n\n`;

    prompt += `REQUIRED ASSESSMENT SECTIONS:\n`;
    params.config.sections.forEach((sec, idx) => {
      prompt += `Section ${idx + 1}:\n`;
      prompt += `  * Name: ${sec.sectionName}\n`;
      prompt += `  * Instructions: ${sec.instructions}\n`;
      prompt += `  * Questions: ${sec.questionCount} questions\n`;
      prompt += `  * Marks per Question: ${sec.marksPerQuestion}\n`;
      prompt += `  * Difficulty Setting: ${sec.difficulty}\n`;
      prompt += `  * Targeted Syllabus Topics: ${sec.topics.join(', ')}\n\n`;
    });

    prompt += `Generate the structured JSON response exactly matching the provided schema. Ensure question difficulty fields are strictly mapped to "Easy", "Moderate", or "Hard".`;

    const responseSchema: Schema = {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING },
        institutionName: { type: SchemaType.STRING },
        subject: { type: SchemaType.STRING },
        className: { type: SchemaType.STRING },
        timeAllowedMinutes: { type: SchemaType.INTEGER },
        totalMarks: { type: SchemaType.INTEGER },
        sections: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              sectionName: { type: SchemaType.STRING },
              instructions: { type: SchemaType.STRING },
              questions: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    questionText: { type: SchemaType.STRING },
                    difficulty: {
                      type: SchemaType.STRING,
                      format: "enum",
                      enum: ['Easy', 'Moderate', 'Hard']
                    },
                    marks: { type: SchemaType.INTEGER }
                  },
                  required: ['questionText', 'difficulty', 'marks']
                }
              }
            },
            required: ['sectionName', 'instructions', 'questions']
          }
        }
      },
      required: ['title', 'institutionName', 'subject', 'className', 'timeAllowedMinutes', 'totalMarks', 'sections']
    };

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.2,
      },
    });

    const responseText = result.response.text();
    if (!responseText) {
      throw new Error('Gemini API returned an empty text buffer.');
    }

    try {
      const parsedData: IPaperData = JSON.parse(responseText);
      return parsedData;
    } catch (parseErr) {
      console.error('Failed parsing JSON payload from Gemini response text:', responseText);
      throw new Error('AI output formatting error. The returned document structure was not valid JSON.');
    }
  }
}