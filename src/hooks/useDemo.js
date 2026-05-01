/**
 * @file src/hooks/useDemo.js
 * @description This custom hook manages the state and logic for the automated demo mode.
 * It controls the playback of predefined scenarios, including starting, pausing, and resetting
 * the demonstration. It uses a queue-based system to simulate user interactions step-by-step.
 */
import { useState, useEffect, useRef, useCallback } from 'react';

const DEMO_SCENARIOS = {
  'first-time': {
    name: 'First-Time Voter',
    persona: 'first-time-voter',
    steps: [
      { type: 'user', text: 'Hi, I am a first-time voter. What should I know?' },
      { type: 'ai-think' },
      { type: 'user', text: 'How do I register to vote?' },
      { type: 'ai-think' },
      { type: 'user', text: 'What documents do I need?' },
      { type: 'ai-think' },
      { type: 'user', text: 'Thanks for the help!' },
    ],
  },
  'nri': {
    name: 'NRI Voter',
    persona: 'nri-voter',
    steps: [
      { type: 'user', text: 'I am an NRI. Can I vote from abroad?' },
      { type: 'ai-think' },
      { type: 'user', text: 'What is Form 6A?' },
      { type: 'ai-think' },
      { type: 'user', text: 'Is proxy voting allowed?' },
    ],
  },
  'rural': {
    name: 'Rural Voter',
    persona: 'rural-voter',
    steps: [
      { type: 'user', text: 'I live in a village. Where is my polling booth?' },
      { type: 'ai-think' },
      { type: 'user', text: 'How can I verify my name is on the voter list?' },
      { type: 'ai-think' },
      { type: 'user', text: 'Are there special provisions for farmers?' },
    ],
  },
};

const useDemo = (sendMessage, setPersona) => {
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentScenario, setCurrentScenario] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [demoLogs, setDemoLogs] = useState([]);
  const [isThinking, setIsThinking] = useState(false);

  const timeoutRef = useRef(null);
  const stepQueue = useRef([]);

  const log = (message) => {
    setDemoLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const processQueue = useCallback(() => {
    if (isPaused || stepQueue.current.length === 0) {
      if (stepQueue.current.length === 0) {
        setIsDemoRunning(false);
        log('Scenario completed.');
      }
      return;
    }

    const step = stepQueue.current.shift();
    setCurrentStepIndex(prev => prev + 1);

    let delay = 2000; // Default delay

    if (step.type === 'user') {
      log(`Simulating user message: "${step.text}"`);
      sendMessage(step.text, currentScenario.persona, step.text);
      setIsThinking(false);
      delay = 3000; // Longer delay after user message
    } else if (step.type === 'ai-think') {
      log('Simulating AI thinking...');
      setIsThinking(true);
      delay = 1500; // Shorter delay for "thinking"
    }

    timeoutRef.current = setTimeout(processQueue, delay);
  }, [isPaused, sendMessage, currentScenario, log]);

  const startDemo = (scenarioId) => {
    if (isDemoRunning) return;

    const scenario = DEMO_SCENARIOS[scenarioId];
    if (!scenario) {
      console.error(`Demo scenario "${scenarioId}" not found.`);
      return;
    }

    log(`Starting demo: ${scenario.name}`);
    setCurrentScenario(scenario);
    setPersona(scenario.persona);
    stepQueue.current = [...scenario.steps];
    setCurrentStepIndex(0);
    setIsDemoRunning(true);
    setIsPaused(false);
    setDemoLogs([`[${new Date().toLocaleTimeString()}] Starting demo: ${scenario.name}`]);

    // Initial delay before starting
    timeoutRef.current = setTimeout(processQueue, 1000);
  };

  const pauseDemo = () => {
    if (!isDemoRunning) return;
    setIsPaused(true);
    clearTimeout(timeoutRef.current);
    log('Demo paused.');
  };

  const resumeDemo = () => {
    if (!isDemoRunning || !isPaused) return;
    setIsPaused(false);
    log('Demo resumed.');
    processQueue();
  };

  const resetDemo = () => {
    clearTimeout(timeoutRef.current);
    setIsDemoRunning(false);
    setIsPaused(false);
    setCurrentScenario(null);
    setCurrentStepIndex(0);
    stepQueue.current = [];
    setIsThinking(false);
    log('Demo reset.');
    setDemoLogs([]);
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return {
    isDemoRunning,
    isPaused,
    currentScenario,
    currentStepIndex,
    demoLogs,
    isThinking,
    startDemo,
    pauseDemo,
    resumeDemo,
    resetDemo,
    scenarios: DEMO_SCENARIOS,
  };
};

export default useDemo;
