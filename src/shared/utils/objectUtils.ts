/**
 * Compares two objects and returns only the fields that have changed.
 * Handles nested objects, arrays, and special cases like null/undefined.
 * 
 * @param original - The original object
 * @param updated - The updated object
 * @returns An object containing only the changed fields
 */
export function getChangedFields<T extends Record<string, any>>(
  original: T,
  updated: Partial<T>
): Partial<T> {
  const changed: Partial<T> = {};

  for (const key in updated) {
    if (Object.prototype.hasOwnProperty.call(updated, key)) {
      const originalValue = original[key];
      const updatedValue = updated[key];

      // Handle arrays - deep comparison
      if (Array.isArray(originalValue) && Array.isArray(updatedValue)) {
        if (JSON.stringify(originalValue) !== JSON.stringify(updatedValue)) {
          changed[key] = updatedValue;
        }
      }
      // Handle objects - recursive comparison
      else if (
        originalValue &&
        typeof originalValue === 'object' &&
        !Array.isArray(originalValue) &&
        updatedValue &&
        typeof updatedValue === 'object' &&
        !Array.isArray(updatedValue)
      ) {
        const nestedChanged = getChangedFields(originalValue, updatedValue);
        if (Object.keys(nestedChanged).length > 0) {
          changed[key] = updatedValue;
        }
      }
      // Handle null/undefined cases
      else if (originalValue === null || originalValue === undefined) {
        if (updatedValue !== null && updatedValue !== undefined) {
          changed[key] = updatedValue;
        }
      }
      // Handle primitive values
      else if (originalValue !== updatedValue) {
        // Special handling for numbers - compare numeric values
        if (typeof originalValue === 'number' && typeof updatedValue === 'number') {
          if (originalValue !== updatedValue) {
            changed[key] = updatedValue;
          }
        }
        // Special handling for booleans
        else if (typeof originalValue === 'boolean' && typeof updatedValue === 'boolean') {
          if (originalValue !== updatedValue) {
            changed[key] = updatedValue;
          }
        }
        // For strings and other types
        else if (originalValue !== updatedValue) {
          changed[key] = updatedValue;
        }
      }
    }
  }

  return changed;
}


