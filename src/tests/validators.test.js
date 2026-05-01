/**
 * @file Tests for validator utility functions.
 */
import { describe, it, expect } from 'vitest';
import {
  validateAge,
  validateAadhaar,
  validatePincode,
  validateName,
} from '../utils/validators';

describe('Validator Utilities', () => {
  // Tests for validateAge
  it('should return true for age 18 or older', () => {
    expect(validateAge(18)).toBe(true);
    expect(validateAge(25)).toBe(true);
    expect(validateAge(100)).toBe(true);
  });

  it('should return false for age under 18', () => {
    expect(validateAge(17)).toBe(false);
    expect(validateAge(0)).toBe(false);
    expect(validateAge(-5)).toBe(false);
  });

  it('should return false for invalid age types', () => {
    expect(validateAge('18')).toBe(false);
    expect(validateAge(null)).toBe(false);
    expect(validateAge(undefined)).toBe(false);
  });

  // Tests for validateAadhaar
  it('should return true for a valid 12-digit Aadhaar number', () => {
    expect(validateAadhaar('123456789012')).toBe(true);
  });

  it('should return false for Aadhaar numbers that are not 12 digits', () => {
    expect(validateAadhaar('12345678901')).toBe(false); // 11 digits
    expect(validateAadhaar('1234567890123')).toBe(false); // 13 digits
  });

  it('should return false for Aadhaar numbers with non-digit characters', () => {
    expect(validateAadhaar('12345678901a')).toBe(false);
    expect(validateAadhaar('1234 5678 9012')).toBe(false);
  });

  // Tests for validatePincode
  it('should return true for a valid 6-digit Indian pincode', () => {
    expect(validatePincode('110001')).toBe(true);
  });

  it('should return false for pincodes that are not 6 digits or start with 0', () => {
    expect(validatePincode('12345')).toBe(false);
    expect(validatePincode('1234567')).toBe(false);
    expect(validatePincode('012345')).toBe(false);
  });

  // Tests for validateName
  it('should return true for a valid name', () => {
    expect(validateName('John Doe')).toBe(true);
  });

  it('should return false for names with special characters or numbers', () => {
    expect(validateName('John Doe123')).toBe(false);
    expect(validateName('John@Doe')).toBe(false);
  });

  it('should return false for names shorter than 2 characters', () => {
    expect(validateName('A')).toBe(false);
  });
});
