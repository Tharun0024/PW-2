/**
 * @file src/App.jsx
 * @description This is the root component of the ElectIQ application. It manages the main layout,
 * including the tab-based navigation, persona selection, and rendering of different views.
 * It integrates all the major components and wraps the application in a translation provider and error boundary.
 *
 * Google Services Used:
 * - Gemini API (for AI-powered chat responses in useGemini hook)
 * - Google Maps API (for the BoothFinder component)
 * - Cloud Translation API (for multilingual support in useTranslate hook)
 */
import { useState, useRef, lazy, Suspense } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { usePersona } from './hooks/usePersona';
import { TranslateProvider } from './hooks/useTranslate.jsx';
import { useFocusTrap } from './hooks/useAccessibility';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineBanner from './components/OfflineBanner';

// Import Components
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import PersonaSelector from './components/Persona/PersonaSelector';

// Lazy-loaded components
const ChatWindow = lazy(() => import('./components/Chat/ChatWindow'));
const ElectionFlow = lazy(() => import('./components/Flow/ElectionFlow'));
const BoothFinder = lazy(() => import('./components/Booth/BoothFinder'));
const EligibilityChecker = lazy(() => import('./components/Eligibility/EligibilityChecker'));
const AnalyticsDashboard = lazy(() => import('./components/AnalyticsDashboard'));
const DemoMode = lazy(() => import('./components/Demo/DemoMode'));

const TABS_CONFIG = [
  { value: 'chat', label: '💬 Chat', Component: ChatWindow },
  { value: 'flow', label: '🗳️ Election Flow', Component: ElectionFlow },
  { value: 'booth', label: '📍 Find Booth', Component: BoothFinder },
  { value: 'eligibility', label: '✅ Eligibility', Component: EligibilityChecker },
  { value: 'demo', label: '🎬 Demo', Component: DemoMode },
];

const ROUTES_CONFIG = [
    { path: '/analytics', Component: AnalyticsDashboard },
];

const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-8">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" role="status" aria-label="Loading content"></div>
    </div>
);

/**
 * The main application content.
 * @returns {JSX.Element}
 */
const AppContent = () => {
  const { currentPersona, setPersona } = usePersona();
  const [showPersonaSelector, setShowPersonaSelector] = useState(!currentPersona);
  const [activeTab, setActiveTab] = useState(TABS_CONFIG[0].value);
  const personaSelectorRef = useRef(null);

  useFocusTrap(personaSelectorRef, showPersonaSelector);

  const handlePersonaSelect = (personaId) => {
    setPersona(personaId);
    setShowPersonaSelector(false);
  };

  const handleChangePersona = () => {
    setShowPersonaSelector(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 font-sans">
      {showPersonaSelector && (
        <div ref={personaSelectorRef}>
            <PersonaSelector
              onSelect={handlePersonaSelect}
              selectedPersona={currentPersona}
            />
        </div>
      )}

      <Header
        onChangePersona={handleChangePersona}
        personaSelected={!!currentPersona}
      />

      <main id="main-content" className="flex-grow p-4 md:p-6" aria-live="polite">
        <Tabs.Root
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col h-full"
        >
          <Tabs.List
            className="flex-shrink-0 flex border-b border-gray-300"
            aria-label="Main content tabs"
            role="tablist"
          >
            {TABS_CONFIG.map((tab) => (
              <Tabs.Trigger
                key={tab.value}
                value={tab.value}
                className="px-4 py-2 -mb-px text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-blue-600 hover:border-blue-600 focus:outline-none data-[state=active]:text-blue-600 data-[state=active]:border-blue-600"
                role="tab"
              >
                {tab.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          <Suspense fallback={<LoadingSpinner />}>
            {TABS_CONFIG.map(({ value, Component }) => (
              <Tabs.Content key={value} value={value} className="flex-grow mt-4" role="tabpanel" tabIndex="0">
                {activeTab === value && <Component currentPersona={currentPersona} />}
              </Tabs.Content>
            ))}
          </Suspense>
        </Tabs.Root>
      </main>

      <Footer />
    </div>
  );
};

/**
 * Root application component with providers.
 * @returns {JSX.Element}
 */
function App() {
  return (
    <ErrorBoundary>
      <TranslateProvider>
        <Router>
            <Routes>
                <Route path="/" element={<AppContent />} />
                {ROUTES_CONFIG.map(({ path, Component }) => (
                    <Route key={path} path={path} element={
                        <Suspense fallback={<LoadingSpinner />}>
                            <Component />
                        </Suspense>
                    } />
                ))}
            </Routes>
            <OfflineBanner />
        </Router>
      </TranslateProvider>
    </ErrorBoundary>
  );
}

export default App;
