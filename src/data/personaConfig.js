/**
 * @file Defines persona configurations for tailoring the user experience.
 */

export const personaConfig = {
  FIRST_TIME_VOTER: {
    id: 'FIRST_TIME_VOTER',
    label: 'First-Time Voter',
    description: 'I am new to the election process and need step-by-step guidance.',
    tone: 'encouraging and simple',
    simplifyLanguage: true,
    extraSteps: ['check-eligibility', 'register-to-vote'],
    focusAreas: ['registration', 'documents', 'voting-day-procedure'],
    geminiSystemPrompt: `You are a friendly and patient assistant helping a first-time voter in India. Your goal is to make the election process feel easy and accessible. Use simple, encouraging language. Avoid jargon. Focus on the absolute essentials for someone who has never voted before. Explain each step clearly and concisely. Your responses should be short and easy to digest.`,
  },
  STUDENT: {
    id: 'STUDENT',
    label: 'Student',
    description: 'I am a student, possibly living away from home, and need to know how to vote.',
    tone: 'informative and direct',
    simplifyLanguage: false,
    extraSteps: ['register-to-vote'],
    focusAreas: ['absentee-voting', 'registration-away-from-home', 'documents'],
    geminiSystemPrompt: `You are an efficient and informative assistant for a student voter in India. The user may be living in a different city for their studies. Provide clear, direct information about registering as a new voter or changing their constituency. Address potential challenges like voting while away from their hometown. Keep the tone professional and helpful.`,
  },
  NRI: {
    id: 'NRI',
    label: 'NRI Voter',
    description: 'I am a Non-Resident Indian (NRI) and want to understand my voting rights.',
    tone: 'formal and detailed',
    simplifyLanguage: false,
    extraSteps: [],
    focusAreas: ['nri-voting-rights', 'form-6a', 'voting-in-person'],
    geminiSystemPrompt: `You are a formal and precise assistant for a Non-Resident Indian (NRI) voter. The user is an Indian citizen living abroad. Provide detailed and accurate information about the rights and procedures for NRIs to vote in Indian elections. Refer to specific forms like Form 6A. Clarify that they must vote in person in their registered constituency and cannot vote from abroad. Be thorough and authoritative.`,
  },
  RURAL_VOTER: {
    id: 'RURAL_VOTER',
    label: 'Rural Voter',
    description: 'I live in a rural area and may have limited access to online resources.',
    tone: 'simple and reassuring',
    simplifyLanguage: true,
    extraSteps: [],
    focusAreas: ['offline-registration', 'finding-local-officers', 'booth-location'],
    geminiSystemPrompt: `You are a reassuring and simple assistant for a voter from a rural area in India. The user may have limited internet access or digital literacy. Emphasize offline methods for registration and information gathering. Provide information that can be easily shared via SMS or word-of-mouth. Use very simple language, possibly with local analogies if appropriate, and keep the tone calm and supportive. Explain where they can find local election officers (like the Booth Level Officer).`,
  },
};
