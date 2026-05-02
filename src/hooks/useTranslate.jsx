/**
 * @file src/hooks/useTranslate.jsx
 * @description This hook provides translation functionality across the application.
 * It manages the current language, caches translations to avoid redundant API calls,
 * and provides functions to translate text and entire objects.
 */
import { useState, useCallback, createContext, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import * as translateService from '../services/translateService';

const TranslateContext = createContext();

/**
 * Provides translation state and functions to its children.
 * @param {{children: React.ReactNode}} props
 * @returns {JSX.Element}
 */
export const TranslateProvider = ({ children }) => {
    const [currentLanguage, setCurrentLanguage] = useState('en');
    const [translations, setTranslations] = useState({});
    const [translationCache] = useState(() => new Map());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Sets the application's current language.
     * @param {string} langCode The language code (e.g., 'en', 'hi').
     */
    const setLanguage = (langCode) => {
        setCurrentLanguage(langCode);
    };

    /**
     * Translates a single string of text to a target language, using a cache.
     * @param {string} text The text to translate.
     * @param {string} targetLang The target language code.
     * @returns {Promise<string>} The translated text, or original text on error.
     */
    const translateText = useCallback(async (text, targetLang) => {
        const safeText = text || "";
        if (!safeText || targetLang === currentLanguage) return safeText;

        const cacheKey = `${safeText}_${targetLang}`;
        if (translationCache.has(cacheKey)) {
            return translationCache.get(cacheKey);
        }

        setLoading(true);
        setError(null);
        try {
            const translated = await translateService.translateText(safeText, targetLang);
            if (translated) {
                translationCache.set(cacheKey, translated);
                return translated;
            }
            return safeText; // Fallback on empty response
        } catch (err) {
            if (import.meta.env.DEV) {
                console.error('Translation error:', err);
            }
            setError('Translation failed');
            return safeText; // Fallback to original text
        } finally {
            setLoading(false);
        }
    }, [translationCache, currentLanguage]);

    /**
     * Translates all string values within an object and updates the state.
     * @param {object} contentObject The object containing strings to translate.
     * @returns {Promise<void>}
     */
    const translateContent = useCallback(async (contentObject) => {
        const safeContent = contentObject || {};
        if (currentLanguage === 'en' || !safeContent) {
            setTranslations(safeContent);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const translatedObject = {};
            const safeEntries = Object.entries(safeContent);
            const translatedPairs = await Promise.all(
                safeEntries.map(async ([key, value]) => {
                    if (typeof value === 'string') {
                        const translatedValue = await translateText(value, currentLanguage);
                        return [key, translatedValue];
                    }
                    return [key, value];
                })
            );

            for (const [key, value] of translatedPairs) {
                translatedObject[key] = value;
            }
            setTranslations(translatedObject);
        } catch (err) {
            if (import.meta.env.DEV) {
                console.error('Content translation error:', err);
            }
            setError('Content translation failed');
            setTranslations(safeContent); // Fallback to original content
        } finally {
            setLoading(false);
        }
    }, [currentLanguage, translateText]);

    /**
     * Gets a translated string by key, with a fallback.
     * @param {string} key The key for the translation.
     * @returns {string} The translated string or the key itself.
     */
    const t = (key) => {
        const safeKey = key || "";
        return translations?.[safeKey] || safeKey;
    };
    
    const value = useMemo(() => ({
        t,
        translations,
        currentLanguage,
        setLanguage,
        translateText,
        translateContent,
        loading,
        error,
    }), [t, translations, currentLanguage, translateText, translateContent, loading, error]);

    return (
        <TranslateContext.Provider value={value}>
            {children}
        </TranslateContext.Provider>
    );
};

TranslateProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

/**
 * Custom hook to access translation context.
 * @returns {{t: (key: string) => string, translations: object, currentLanguage: string, setLanguage: (langCode: string) => void, translateText: (text: string, targetLang: string) => Promise<string>, translateContent: (contentObject: object) => Promise<void>, loading: boolean, error: string|null}}
 */
export const useTranslate = () => {
    const context = useContext(TranslateContext);
    if (context === undefined) {
        throw new Error('useTranslate must be used within a TranslateProvider');
    }
    return context;
};
