/**
 * @file src/components/Layout/Header.jsx
 * @description This component renders the main application header. It includes the app title,
 * a button to change the persona, and a functional language switcher. The header is
 * sticky to remain visible on scroll.
 */
import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslate } from '../../hooks/useTranslate.jsx';
import { useFocusTrap } from '../../hooks/useAccessibility';

const SUPPORTED_LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'bn', label: 'বাংলা' },
];

/**
 * The main header for the application.
 * @param {{ onChangePersona: () => void; personaSelected: boolean; }} props
 * @returns {JSX.Element}
 */
const Header = ({ onChangePersona, personaSelected }) => {
  const { currentLanguage, setLanguage } = useTranslate();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const dropdownRef = useRef(null);
  useFocusTrap(dropdownRef, isLangOpen);

  const handleLangSelect = (langCode) => {
    setLanguage(langCode);
    setIsLangOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
        setIsLangOpen(false);
    }
  }

  return (
    <header
      className="sticky top-0 z-40 w-full bg-primary text-white shadow-md"
      role="banner"
      aria-label="Main header"
    >
      <nav
        className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16"
        aria-label="Main navigation"
      >
        <div className="flex items-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Elect<span className="text-secondary">IQ</span>
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative" ref={dropdownRef} onKeyDown={handleKeyDown}>
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              aria-haspopup="true"
              aria-expanded={isLangOpen}
              className="flex items-center space-x-1 bg-primary border border-blue-400 rounded-md py-1 pl-3 pr-2 text-sm focus:outline-none focus:ring-2 focus:ring-white"
            >
              <span>{SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage)?.label}</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </button>
            {isLangOpen && (
              <div
                role="menu"
                aria-orientation="vertical"
                className="absolute right-0 mt-2 w-36 bg-white text-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    role="menuitem"
                    onClick={() => handleLangSelect(lang.code)}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {personaSelected && (
            <button
              onClick={onChangePersona}
              aria-label="Change selected persona"
              className="px-3 py-1.5 text-sm font-semibold bg-white text-primary rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-white transition-colors"
            >
              Change Persona
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

Header.propTypes = {
  onChangePersona: PropTypes.func.isRequired,
  personaSelected: PropTypes.bool.isRequired,
};

export default Header;
