/**
 * @file A component to check voter eligibility.
 */
import { useState, useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { validateAge, validateAadhaar, validatePincode, validateName } from '../../utils/validators';
import { useTranslate } from '../../hooks/useTranslate';

/**
 * EligibilityChecker component provides a form to check voting eligibility.
 * @param {{persona: object}} props
 * @returns {React.ReactElement} - The EligibilityChecker component.
 */
const EligibilityChecker = ({ persona }) => {
  const { t, translateContent, currentLanguage } = useTranslate() || {};
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    aadhaar: '',
    pincode: '',
  });
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);

  const uiContent = useMemo(() => ({
    title: 'Check Your Eligibility',
    personaLabel: 'Current Persona',
    nameLabel: 'Name',
    ageLabel: 'Age',
    aadhaarLabel: 'Aadhaar Number',
    pincodeLabel: 'Pincode',
    checkButton: 'Check',
    nameError: 'Please enter a valid name (min 2 chars, no special characters).',
    ageError: 'You must be 18 or older to vote.',
    aadhaarError: 'Please enter a valid 12-digit Aadhaar number.',
    pincodeError: 'Please enter a valid 6-digit Indian pincode.',
    successMessage: 'Based on the data provided, you are eligible to vote!',
    errorMessage: 'Please fix the errors in the form.',
  }), []);

  useEffect(() => {
    translateContent(uiContent);
  }, [currentLanguage, translateContent, uiContent]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value || '' }));
  }, []);

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    setResult(null);
    const newErrors = {};
    const safeFormData = formData ?? {};

    if (!validateName(safeFormData?.name)) {
      newErrors.name = t('nameError');
    }
    if (!validateAge(parseInt(safeFormData?.age, 10))) {
      newErrors.age = t('ageError');
    }
    if (!validateAadhaar(safeFormData?.aadhaar)) {
      newErrors.aadhaar = t('aadhaarError');
    }
    if (!validatePincode(safeFormData?.pincode)) {
      newErrors.pincode = t('pincodeError');
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setResult(t('successMessage'));
    } else {
      setResult(t('errorMessage'));
    }
  }, [formData, t, uiContent]);

  return (
    <div className="p-4" role="form" aria-labelledby="eligibility-heading">
      <h2 id="eligibility-heading" className="text-xl font-bold mb-4">{t('title')}</h2>
      <p className="mb-4 text-sm text-gray-600">{t('personaLabel')}: {persona?.label || 'Not selected'}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block font-medium">{t('nameLabel')}</label>
          <input type="text" id="name" name="name" value={formData?.name || ''} onChange={handleChange} aria-label="Your full name" className="w-full p-2 border rounded-md" />
          {errors?.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="age" className="block font-medium">{t('ageLabel')}</label>
          <input type="number" id="age" name="age" value={formData?.age || ''} onChange={handleChange} aria-label="Your age" className="w-full p-2 border rounded-md" />
          {errors?.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
        </div>
        <div>
          <label htmlFor="aadhaar" className="block font-medium">{t('aadhaarLabel')}</label>
          <input type="text" id="aadhaar" name="aadhaar" value={formData?.aadhaar || ''} onChange={handleChange} aria-label="Your 12-digit Aadhaar number" className="w-full p-2 border rounded-md" />
          {errors?.aadhaar && <p className="text-red-500 text-sm mt-1">{errors.aadhaar}</p>}
        </div>
        <div>
          <label htmlFor="pincode" className="block font-medium">{t('pincodeLabel')}</label>
          <input type="text" id="pincode" name="pincode" value={formData?.pincode || ''} onChange={handleChange} aria-label="Your 6-digit pincode" className="w-full p-2 border rounded-md" />
          {errors?.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
        </div>
        <button type="submit" className="bg-primary text-white p-2 rounded-md">{t('checkButton')}</button>
      </form>
      {result && (
        <div role="alert" className={`mt-4 p-4 rounded-lg ${Object.keys(errors).length > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {result}
        </div>
      )}
    </div>
  );
};

EligibilityChecker.propTypes = {
    persona: PropTypes.object
};

export default EligibilityChecker;
