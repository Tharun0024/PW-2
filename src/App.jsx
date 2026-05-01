/**
 * @file src/App.jsx
 * @description This is the root component of the ElectIQ application. It manages the main layout,
 * including the tab-based navigation, persona selection, and rendering of different views.
 * It integrates all the major components and wraps the application in a translation provider.
 *
 * Google Services Used:
 * - Gemini API (for AI-powered chat responses in useGemini hook)
 * - Google Maps API (for the BoothFinder component)
 * - Google Translate API (for multilingual support in useTranslate hook)
 * - Firebase Hosting (for deployment, configured in firebase.json)
 */
import { useState, useRef, lazy, Suspense } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { usePersona } from './hooks/usePersona';
import { TranslateProvider } from './hooks/useTranslate.jsx';
import { useFocusTrap } from './hooks/useAccessibility';

// Import Components
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import PersonaSelector from './components/Persona/PersonaSelector';

// Lazy-loaded components
const ChatWindow = lazy(() => import('./components/Chat/ChatWindow'));
const ElectionFlow = lazy(() => import('./components/Flow/ElectionFlow'));
const BoothFinder = lazy(() => import('./components/Booth/BoothFinder'));
const EligibilityChecker = lazy(() => import('./components/Eligibility/EligibilityChecker'));
const DemoMode = lazy(() => import('./components/Demo/DemoMode'));

const TABS_CONFIG = [
  { value: 'chat', label: '💬 Chat' },
  { value: 'flow', label: '🗳️ Election Flow' },
  { value: 'booth', label: '📍 Find Booth' },
  { value: 'eligibility', label: '✅ Eligibility' },
  { value: 'demo', label: '🎬 Demo' },
];

const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" role="status" aria-label="Loading content"></div>
    </div>
);

/**
 * The main application content, wrapped in a provider.
 * @returns {JSX.Element}
 */
const AppContent = () => {
  const { currentPersona, setPersona } = usePersona();
  const [showPersonaSelector, setShowPersonaSelector] = useState(!currentPersona);
  const [activeTab, setActiveTab] = useState(TABS_CONFIG[0].value);
  const personaSelectorRef = useRef(null);

  useFocusTrap(personaSelectorRef, showPersonaSelector);

  /**
   * Handles the selection of a new persona.
   * @param {string} personaId - The ID of the selected persona.
   */
  const handlePersonaSelect = (personaId) => {
    setPersona(personaId);
    setShowPersonaSelector(false);
  };

  /**
   * Shows the persona selector modal.
   */
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
          className="flex flex-col"
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
                role="tab"
                className="px-4 py-2 text-sm sm:text-base font-medium text-gray-600 border-b-2 border-transparent hover:bg-gray-200 hover:text-gray-800 data-[state=active]:text-accent data-[state=active]:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 transition-colors"
              >
                {tab.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          <div className="mt-6">
            <Suspense fallback={<LoadingSpinner />}>
                <Tabs.Content value="chat" role="tabpanel" tabIndex="0">
                  <ChatWindow currentPersona={currentPersona} />
                </Tabs.Content>
                <Tabs.Content value="flow" role="tabpanel" tabIndex="0">
                  <ElectionFlow />
                </Tabs.Content>
                <Tabs.Content value="booth" role="tabpanel" tabIndex="0">
                  <BoothFinder />
                </Tabs.Content>
                <Tabs.Content value="eligibility" role="tabpanel" tabIndex="0">
                  <EligibilityChecker />
                </Tabs.Content>
                <Tabs.Content value="demo" role="tabpanel" tabIndex="0">
                  <DemoMode />
                </Tabs.Content>
            </Suspense>
          </div>
        </Tabs.Root>
      </main>

      <Footer />
    </div>
  );
}

/**
 * The main application component, with context providers.
 * @returns {JSX.Element}
 */
function App() {
  return (
    <TranslateProvider>
      <AppContent />
    </TranslateProvider>
  );
}


export default App;
