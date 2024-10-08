/**
 * Extracts the filename from a URL
 * @param {string} url - The full URL of the file
 * @returns {string} The extracted filename
 */ 

export function getFilenameFromUrl(url) {
    return url.split('/').pop();
  }