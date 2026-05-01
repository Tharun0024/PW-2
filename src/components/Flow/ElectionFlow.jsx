/**
 * @file A component to display the election process flow.
 */
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { electionSteps } from '../../data/electionSteps';
import { useTranslate } from '../../hooks/useTranslate.jsx';

/**
 * A single expandable step in the election timeline.
 * @param {{ step: object; isLast: boolean; }} props
 * @returns {JSX.Element}
 */
const TimelineStep = ({ step, isLast }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <li role="listitem" className="relative flex flex-col pb-8">
      <div className="flex items-start">
        {/* Icon and Line */}
        <div className="flex flex-col items-center mr-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-2xl">
            {step.icon}
          </div>
          {!isLast && (
            <div className="w-px h-full bg-gray-300 mt-2"></div>
          )}
        </div>

        {/* Content */}
        <div className="flex-grow pt-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            className="w-full text-left focus:outline-none"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">{step.id}. {step.title}</h3>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-600 mt-1">{step.description}</p>
          </button>
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-screen mt-4' : 'max-h-0'}`}
          >
            <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50 p-4 rounded-md" dangerouslySetInnerHTML={{ __html: step.content }} />
          </div>
        </div>
      </div>
    </li>
  );
};

TimelineStep.propTypes = {
  step: PropTypes.shape({
    id: PropTypes.number.isRequired,
    icon: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
  }).isRequired,
  isLast: PropTypes.bool.isRequired,
};

/**
 * A component that displays the election process as a timeline.
 * @returns {JSX.Element}
 */
const ElectionFlow = () => {
  const { translateContent, currentLanguage, loading } = useTranslate();
  const [steps, setSteps] = useState(electionSteps);

  useEffect(() => {
    if (currentLanguage === 'en') {
      setTranslatedSteps(ELECTION_STEPS);
      return;
    }

    const translateSteps = async () => {
      const newSteps = await Promise.all(
        ELECTION_STEPS.map(async (step) => {
          const translatedContent = await translateContent({
            title: step.title,
            description: step.description,
            content: step.content,
          });
          return { ...step, ...translatedContent };
        })
      );
      setTranslatedSteps(newSteps);
    };

    translateSteps();
  }, [currentLanguage, translateContent]);

  if (loading && translatedSteps[0].title === ELECTION_STEPS[0].title) {
    return (
        <div className="flex justify-center items-center p-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="ml-4 text-gray-600">Loading content...</p>
        </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">The Journey of a Vote</h2>
      <ol role="list">
        {translatedSteps.map((step, index) => (
          <TimelineStep
            key={step.id}
            step={step}
            isLast={index === translatedSteps.length - 1}
          />
        ))}
      </ol>
    </div>
  );
};

export default ElectionFlow;
