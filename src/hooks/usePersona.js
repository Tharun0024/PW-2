/**
 * @file Custom React hook for managing the user persona.
 */
import { useState, useCallback } from 'react';
import { personaConfig as allPersonas } from '../data/personaConfig';

const DEFAULT_PERSONA_ID = 'FIRST_TIME_VOTER';

/**
 * A custom hook to manage the user's selected persona.
 * @returns {{persona: object, setPersona: Function, personaConfig: object, resetPersona: Function}}
 */
export const usePersona = () => {
  const [persona, setPersonaState] = useState(allPersonas[DEFAULT_PERSONA_ID]);

  /**
   * Sets the active persona based on its ID.
   * @param {string} personaId - The ID of the persona to set.
   */
  const setPersona = useCallback((personaId) => {
    const newPersona = allPersonas[personaId];
    if (newPersona) {
      setPersonaState(newPersona);
    } else {
      setPersonaState(allPersonas[DEFAULT_PERSONA_ID]);
      if (import.meta.env.DEV) {
        console.warn(`Persona with id "${personaId}" not found. Falling back to default.`);
      }
    }
  }, []);

  /**
   * Resets the persona to the default.
   */
  const resetPersona = useCallback(() => {
    setPersonaState(allPersonas[DEFAULT_PERSONA_ID]);
  }, []);

  return { persona, setPersona, personaConfig: allPersonas, resetPersona };
};
