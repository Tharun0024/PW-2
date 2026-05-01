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
        if (!text || targetLang === currentLanguage) return text;

        const cacheKey = `${text}_${targetLang}`;
        if (translationCache.has(cacheKey)) {
            return translationCache.get(cacheKey);
        }

        setLoading(true);
        setError(null);
        try {
            const translated = await translateService.translateText(text, targetLang);
            if (translated) {
                translationCache.set(cacheKey, translated);
                return translated;
            }
            return text; // Fallback on empty response
        } catch (err) {
            if (import.meta.env.DEV) {
                console.error('Translation error:', err);
            }
            setError('Translation failed');
            return text; // Fallback to original text
        } finally {
            setLoading(false);
        }
    }, [translationCache, currentLanguage]);

    /**
     * Translates all string values within an object.
     * @param {object} contentObject The object containing strings to translate.
     * @returns {Promise<object>} A new object with translated string values.
     */
    const translateContent = useCallback(async (contentObject) => {
        if (currentLanguage === 'en') return contentObject;

        const translatedObject = {};
        const translations = await Promise.all(
            Object.entries(contentObject).map(async ([key, value]) => {
                if (typeof value === 'string') {
                    const translatedValue = await translateText(value, currentLanguage);
                    return [key, translatedValue];
                }
                return [key, value];
            })
        );

        for (const [key, value] of translations) {
            translatedObject[key] = value;
        }

        return translatedObject;
    }, [currentLanguage, translateText]);
    
    const value = useMemo(() => ({
        currentLanguage,
        setLanguage,
        translateText,
        translateContent,
        loading,
        error,
    }), [currentLanguage, translateText, translateContent, loading, error]);

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
 * @returns {{currentLanguage: string, setLanguage: (langCode: string) => void, translateText: (text: string, targetLang: string) => Promise<string>, translateContent: (contentObject: object) => Promise<object>, loading: boolean, error: string|null}}
 */
export const useTranslate = () => {
    const context = useContext(TranslateContext);
    if (context === undefined) {
        throw new Error('useTranslate must be used within a TranslateProvider');
    }
    return context;
};
