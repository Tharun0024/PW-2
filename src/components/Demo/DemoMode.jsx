/**
 * @file A component to demonstrate features of the application.
 */
import PropTypes from 'prop-types';

/**
 * DemoMode component showcases the application's capabilities.
 * @param {{persona: object}} props
 * @returns {React.ReactElement} - The DemoMode component.
 */
const DemoMode = ({ persona }) => {
  return (
    <div className="p-4" role="region" aria-label="Demonstration Mode">
      <h2 className="text-2xl font-bold mb-4">Demonstration Mode</h2>
      <p>This area will be used to showcase various features of ElectIQ, such as:</p>
      <ul className="list-disc list-inside mt-2">
        <li>Interactive tutorials on using the chat assistant.</li>
        <li>Walkthroughs of the election process flow.</li>
        <li>Examples of how different personas change the experience.</li>
      </ul>
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold">Current Persona: {persona.label}</h3>
        <p className="text-sm text-gray-600">{persona.description}</p>
      </div>
    </div>
  );
};

DemoMode.propTypes = {
    persona: PropTypes.object
};

export default DemoMode;
