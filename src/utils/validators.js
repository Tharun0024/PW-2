/**
 * @file Validation utility functions for user inputs.
 */

import { z } from 'zod';

/**
 * Validates if the age is 18 or above.
 * @param {number} age - The age to validate.
 * @returns {boolean} - True if age is 18 or greater.
 */
export function validateAge(age) {
  const schema = z.number().int().min(18);
  return schema.safeParse(age).success;
}

/**
 * Validates an Aadhaar number.
 * It must be a 12-digit number.
 * @param {string} number - The Aadhaar number to validate.
 * @returns {boolean} - True if the Aadhaar number is valid.
 */
export function validateAadhaar(number) {
  const schema = z.string().regex(/^[0-9]{12}$/);
  return schema.safeParse(number).success;
}

/**
 * Validates an Indian pincode.
 * It must be a 6-digit number.
 * @param {string} pincode - The pincode to validate.
 * @returns {boolean} - True if the pincode is valid.
 */
export function validatePincode(pincode) {
  const schema = z.string().regex(/^[1-9][0-9]{5}$/);
  return schema.safeParse(pincode).success;
}

/**
 * Validates a person's name.
 * It must be at least 2 characters long and contain no special characters or numbers.
 * @param {string} name - The name to validate.
 * @returns {boolean} - True if the name is valid.
 */
export function validateName(name) {
  const schema = z.string().min(2).regex(/^[a-zA-Z\s]+$/);
  return schema.safeParse(name).success;
}

/**
 * Validates a location input.
 * For simplicity, we're just checking if it's a non-empty string.
 * In a real app, this could involve more complex validation or geocoding.
 * @param {string} location - The location string to validate.
 * @returns {boolean} - True if the location is a non-empty string.
 */
export function validateLocation(location) {
  const schema = z.string().min(1);
  return schema.safeParse(location).success;
}

/**
 * Validates a physical address.
 * @param {string} address - The address to validate.
 * @returns {boolean} - True if the address is valid.
 */
export function validateAddress(address) {
  const schema = z.string().min(5, { message: "Address must be at least 5 characters long." });
  return schema.safeParse(address).success;
}
