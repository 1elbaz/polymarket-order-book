// Fix for the mergeState function in src/types/state.ts - replace the problematic function

/**
 * Deep merge state updates with proper TypeScript constraints
 */
export function mergeState<T extends Record<string, unknown>>(
  current: T, 
  updates: Partial<T>
): T {
  if (typeof current !== 'object' || current === null) {
    return { ...((current as Record<string, unknown>) || {}), ...updates } as T;
  }
  
  const result: T = { ...current };
  
  Object.keys(updates).forEach((key) => {
    const typedKey = key as keyof T;
    const updateValue = updates[typedKey];
    
    if (updateValue !== undefined) {
      if (
        typeof updateValue === 'object' && 
        updateValue !== null && 
        !Array.isArray(updateValue) &&
        typeof current[typedKey] === 'object' &&
        current[typedKey] !== null &&
        !Array.isArray(current[typedKey])
      ) {
        // Recursively merge objects
        result[typedKey] = mergeState(
          current[typedKey] as Record<string, unknown>,
          updateValue as Record<string, unknown>
        ) as T[keyof T];
      } else {
        // Direct assignment for primitive values and arrays
        result[typedKey] = updateValue as T[keyof T];
      }
    }
  });
  
  return result;
}