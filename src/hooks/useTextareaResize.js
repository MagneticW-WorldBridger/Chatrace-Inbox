import { useRef, useEffect } from 'react';

/**
 * Custom hook for auto-resizing textarea elements
 * Automatically adjusts height based on content
 * 
 * @param {string} value - Current textarea value
 * @param {number} rows - Minimum number of rows (default: 1)
 * @returns {React.RefObject} Ref to attach to textarea element
 */
export function useTextareaResize(value, rows = 1) {
  const textareaRef = useRef(null);

  useEffect(() => {
    const textArea = textareaRef.current;
    if (textArea) {
      const computedStyle = window.getComputedStyle(textArea);
      const lineHeight = parseInt(computedStyle.lineHeight, 10) || 20;
      const padding =
        parseInt(computedStyle.paddingTop, 10) +
        parseInt(computedStyle.paddingBottom, 10);

      const minHeight = lineHeight * rows + padding;
      const maxHeight = 200; // Maximum height in pixels

      // Reset height to calculate scroll height
      textArea.style.height = "0px";
      const scrollHeight = Math.max(textArea.scrollHeight, minHeight);
      const finalHeight = Math.min(scrollHeight + 2, maxHeight);
      textArea.style.height = `${finalHeight}px`;
    }
  }, [value, rows]);

  return textareaRef;
} 
