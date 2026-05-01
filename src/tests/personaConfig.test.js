/**
 * @file Tests for the persona configuration.
 */
import { describe, it, expect } from 'vitest';
import { personaConfig } from '../data/personaConfig';

describe('Persona Configuration', () => {
  const requiredKeys = [
    'id',
    'label',
    'description',
    'tone',
    'simplifyLanguage',
    'extraSteps',
    'focusAreas',
    'geminiSystemPrompt',
  ];

  it('should have configurations for all 4 required personas', () => {
    expect(personaConfig.FIRST_TIME_VOTER).toBeDefined();
    expect(personaConfig.STUDENT).toBeDefined();
    expect(personaConfig.NRI).toBeDefined();
    expect(personaConfig.RURAL_VOTER).toBeDefined();
  });

  it('FIRST_TIME_VOTER persona should have all required fields', () => {
    const persona = personaConfig.FIRST_TIME_VOTER;
    requiredKeys.forEach(key => {
      expect(persona).toHaveProperty(key);
    });
  });

  it('STUDENT persona should have all required fields', () => {
    const persona = personaConfig.STUDENT;
    requiredKeys.forEach(key => {
      expect(persona).toHaveProperty(key);
    });
  });

  it('NRI persona should have all required fields', () => {
    const persona = personaConfig.NRI;
    requiredKeys.forEach(key => {
      expect(persona).toHaveProperty(key);
    });
  });

  it('RURAL_VOTER persona should have all required fields', () => {
    const persona = personaConfig.RURAL_VOTER;
    requiredKeys.forEach(key => {
      expect(persona).toHaveProperty(key);
    });
  });

  it('geminiSystemPrompt should be a non-empty string for all personas', () => {
    for (const personaId in personaConfig) {
      const persona = personaConfig[personaId];
      expect(typeof persona.geminiSystemPrompt).toBe('string');
      expect(persona.geminiSystemPrompt.length).toBeGreaterThan(0);
    }
  });
});
