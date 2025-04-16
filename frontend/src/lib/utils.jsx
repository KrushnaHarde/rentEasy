// utils.jsx

/**
 * Utility function to conditionally join class names.
 * @param {...(string | object)} classes - Class names as strings or an object with boolean values.
 * @returns {string} - A string containing the concatenated class names.
 */
export const cn = (...classes) => {
    return classes
      .filter(Boolean) // Removes any falsy values like null, undefined, or false
      .join(' '); // Joins the remaining class names with spaces
  };