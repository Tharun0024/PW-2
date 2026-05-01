/**
 * @file A component for selecting the user persona.
 */
import PropTypes from 'prop-types';

/**
 * PersonaSelector component allows the user to choose a persona.
 * @param {{
 *  personas: object,
 *  selectedPersona: string,
 *  onPersonaChange: Function
 * }} props - The props for the component.
 * @returns {React.ReactElement} - The PersonaSelector component.
 */
const PersonaSelector = ({ personas, selectedPersona, onPersonaChange }) => {
  return (
    <div className="p-4 bg-gray-100 rounded-lg" role="region" aria-labelledby="persona-heading">
      <h2 id="persona-heading" className="text-lg font-semibold mb-2">Choose Your Persona</h2>
      <select
        aria-label="Select a persona"
        value={selectedPersona}
        onChange={(e) => onPersonaChange(e.target.value)}
        className="w-full p-2 border rounded-md"
      >
        {Object.values(personas || {}).map((persona) => (
          <option key={persona.id} value={persona.id}>
            {persona.label}
          </option>
        ))}
      </select>
      <p className="text-sm text-gray-600 mt-2" aria-describedby="persona-heading">
        {personas[selectedPersona]?.description}
      </p>
    </div>
  );
};

PersonaSelector.propTypes = {
  personas: PropTypes.object.isRequired,
  selectedPersona: PropTypes.string.isRequired,
  onPersonaChange: PropTypes.func.isRequired,
};

export default PersonaSelector;
