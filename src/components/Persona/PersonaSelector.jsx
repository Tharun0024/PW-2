/**
 * @file A component for selecting the user persona.
 */
import { useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslate } from '../../hooks/useTranslate';
import { usePersona } from '../../hooks/usePersona';

/**
 * PersonaSelector component allows the user to choose a persona.
 * @param {{
 *  onSelect: Function,
 *  selectedPersona: string,
 * }} props - The props for the component.
 * @returns {React.ReactElement} - The PersonaSelector component.
 */
const PersonaSelector = ({ onSelect, selectedPersona }) => {
  const { t, translateContent, currentLanguage } = useTranslate() || {};
  const { personaConfig } = usePersona();

  const uiContent = useMemo(() => ({
    title: 'Choose Your Persona',
    selectLabel: 'Select a persona',
  }), []);

  useEffect(() => {
    translateContent(uiContent);
  }, [currentLanguage, translateContent, uiContent]);

  const safePersonas = useMemo(() => Object.values(personaConfig ?? {}), [personaConfig]);
  const currentDescription = personaConfig?.[selectedPersona]?.description || '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8" role="dialog" aria-modal="true" aria-labelledby="persona-heading">
            <h2 id="persona-heading" className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 text-center">{t('title')}</h2>
            <div className="space-y-4">
                {safePersonas.map((persona) => (
                    <button
                        key={persona?.id}
                        onClick={() => onSelect(persona?.id)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                            selectedPersona === persona?.id
                                ? 'bg-blue-50 border-primary shadow-md'
                                : 'bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                        role="radio"
                        aria-checked={selectedPersona === persona?.id}
                    >
                        <p className="font-semibold text-lg text-gray-900">{persona?.label}</p>
                        <p className="text-sm text-gray-600 mt-1">{persona?.description}</p>
                    </button>
                ))}
            </div>
        </div>
    </div>
  );
};

PersonaSelector.propTypes = {
  onSelect: PropTypes.func.isRequired,
  selectedPersona: PropTypes.string,
};

export default PersonaSelector;
