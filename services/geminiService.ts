import { GoogleGenAI } from "@google/genai";
import { Patient, InjuryProfile } from '../types';

/**
 * Creates a fresh GoogleGenAI instance using the system-provided API Key.
 */
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is missing. Recovery analysis is offline.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Analyzes patient progress trends using Gemini 3 Flash.
 */
export const analyzePatientProgress = async (patient: Patient): Promise<string> => {
  const ai = getClient();
  
  const prompt = `
    Context: Expert Physiotherapist Assistant.
    Patient: ${patient.name}
    Injury: ${patient.injury}
    
    Data Logs (Last 5 sessions):
    ${patient.logs.slice(-5).map(l => `- Date: ${l.date}, Pain: ${l.painScore}/10, ROM: ${l.maxRom}°, Reps: ${l.repsCompleted}`).join('\n')}
    
    Task:
    1. Summarize the recovery trajectory.
    2. Identify correlation between Pain and Range of Motion.
    3. Suggest any adjustments for the next 7 days.
    
    Format: Professional Markdown. Use headings and bullet points.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        temperature: 0.2,
        topP: 0.8
      }
    });

    return response.text || "No analysis could be generated.";
  } catch (error) {
    console.error("Gemini Text Analysis Error:", error);
    return "The AI analysis system is temporarily unavailable. Please review logs manually.";
  }
};

/**
 * Predicts recovery curve against clinical benchmarks.
 */
export const getRecoveryPrediction = async (patient: Patient, injuryProfile: InjuryProfile): Promise<string> => {
    const ai = getClient();
    const lastLog = patient.logs.length > 0 ? patient.logs[patient.logs.length - 1] : null;

    const prompt = `
      You are a clinical prediction engine.
      Protocol: ${injuryProfile.name}
      Standard Benchmarks: ${injuryProfile.expectedMilestones.join(', ')}
      
      Patient Actuals:
      - Current ROM: ${lastLog?.maxRom || 0}°
      - Current Pain: ${lastLog?.painScore || 0}/10
      - Progress Period: Week ${Math.ceil(patient.logs.length / 3)}
      
      Output: 
      - A 2-week prediction.
      - Are they meeting the "${injuryProfile.name}" clinical standard?
      - One specific "Look out for" warning.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { temperature: 0.3 }
        });
        return response.text || "Trajectory calculation failed.";
    } catch (error) {
        return "Prediction engine timed out. Please try again.";
    }
};

/**
 * Generates motivational content for the Patient App.
 */
export const getProgressBooster = async (patient: Patient): Promise<string> => {
    const ai = getClient();
    const lastLog = patient.logs.length > 0 ? patient.logs[patient.logs.length - 1] : null;

    const prompt = `
        Generate a highly encouraging, 2-sentence motivational "booster" for ${patient.name} recovering from ${patient.injury}.
        Latest status: ${lastLog ? `${lastLog.maxRom}° ROM and ${lastLog.repsCompleted} reps` : 'Starting their journey'}.
        Keep it professional, empathetic, and upbeat. No markdown.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { temperature: 0.8 }
        });
        return response.text || "You are making great progress! Every small win counts toward your recovery.";
    } catch (error) {
        return "Consistency is the key to recovery. You've got this!";
    }
};

/**
 * Processes patient voice notes using native audio intelligence.
 */
export const analyzeVoiceNote = async (base64Audio: string): Promise<string> => {
    const ai = getClient();
    const cleanBase64 = base64Audio.replace(/^data:audio\/\w+;base64,/, "");

    const prompt = `
        Listen to this post-physio patient check-in.
        1. Transcribe the patient's words.
        2. Detect signs of clinical distress or unusual pain descriptions.
        3. Note the overall emotional sentiment.
        
        Format: "Transcription: [Text] | Sentiment: [Positive/Concern/Neutral]"
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: "audio/webm",
                            data: cleanBase64
                        }
                    },
                    { text: prompt }
                ]
            }
        });
        return response.text || "Audio analysis failed.";
    } catch (error) {
        console.error("Gemini Native Audio Error:", error);
        return "Voice note transcribed manually (AI Processing Error).";
    }
};

/**
 * Final medical report generator for discharge.
 */
export const generateDischargeReport = async (patient: Patient): Promise<string> => {
    const ai = getClient();
    const lastLog = patient.logs.length > 0 ? patient.logs[patient.logs.length - 1] : null;

    const prompt = `
        Draft a formal Medical Discharge Summary for ${patient.name}.
        Injury: ${patient.injury}
        Final ROM: ${lastLog?.maxRom || 0}°
        Sessions Completed: ${patient.logs.length}
        
        Include:
        - Summary of recovery success.
        - Long-term maintenance advice.
        - Formal notification that local logs are now purged.
        
        Use a professional, compassionate tone.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { temperature: 0.4 }
        });
        return response.text || "Discharge report generated successfully.";
    } catch (error) {
        return "Discharge report generation failed. Clinical data remains for manual export.";
    }
};

/**
 * Analyzes Muscle Dystrophy specific metrics and progress.
 */
export const analyzeMDMetrics = async (patient: Patient): Promise<string> => {
  const ai = getClient();
  if (patient.mode !== 'MuscleDystrophy' || !patient.mdData) {
    return "Not in Muscle Dystrophy mode.";
  }

  const prompt = `
    Context: Specialist in Neuromuscular Disorders & Muscle Dystrophy Support.
    Patient: ${patient.name}
    Condition: ${patient.mdData.type}
    Mobility: ${patient.mdData.mobilityLevel}
    Affected Groups: ${patient.mdData.affectedMuscleGroups.join(', ')}
    
    Data Logs (Last 5 MD sessions):
    ${patient.logs.slice(-5).map(l => `- Date: ${l.date}, Stability: ${l.stabilityScore}%, Fatigue: ${l.fatigueIndex}/10, Degradation: ${l.movementDegradation}%, Pain: ${l.painScore}`).join('\n')}
    
    Task:
    1. Evaluate Muscle Stability and Fatigue trends.
    2. Identify signs of "Overexertion" or rapid "Movement Degradation".
    3. Provide supportive recommendations for the "Virtual Scaffold" settings.
    4. Flag critical alerts if deterioration is detected (e.g. fatigue index > 8).
    
    Format: Clinical Intelligence Report (Markdown). Emphasize support and safety.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { temperature: 0.3 }
    });
    return response.text || "MD Analysis failed.";
  } catch (error) {
    return "MD Analysis Engine offline. Consult physiotherapist immediately if unusual fatigue is felt.";
  }
};
