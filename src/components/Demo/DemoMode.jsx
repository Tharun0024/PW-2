/**
 * @file A component to demonstrate features of the application.
 */
import { useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslate } from '../../hooks/useTranslate';

/**
 * DemoMode component showcases the application's capabilities.
 * @param {{persona: object}} props
 * @returns {React.ReactElement} - The DemoMode component.
 */
const DemoMode = ({ persona }) => {
  const { t, translateContent, currentLanguage } = useTranslate() || {};

  const uiContent = useMemo(() => ({
    title: 'Demonstration Mode',
    intro: 'This area will be used to showcase various features of ElectIQ, such as:',
    item1: 'Interactive tutorials on using the chat assistant.',
    item2: 'Walkthroughs of the election process flow.',
    item3: 'Examples of how different personas change the experience.',
    personaLabel: 'Current Persona',
  }), []);

  useEffect(() => {
    translateContent(uiContent);
  }, [currentLanguage, translateContent, uiContent]);

  const safePersona = persona || {};

  return (
    <div className="p-4" role="region" aria-label="Demonstration Mode">
      <h2 className="text-2xl font-bold mb-4">{t('title')}</h2>
      <p>{t('intro')}</p>
      <ul className="list-disc list-inside mt-2">
        <li>{t('item1')}</li>
        <li>{t('item2')}</li>
        <li>{t('item3')}</li>
      </ul>
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold">{t('personaLabel')}: {safePersona.label || 'Not Selected'}</h3>
        <p className="text-sm text-gray-600">{safePersona.description || 'No description available.'}</p>
      </div>
    </div>
  );
};

DemoMode.propTypes = {
    persona: PropTypes.object
};

export default DemoMode;
