import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook for resizable panels
 * Handles drag-to-resize functionality with constraints
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.minWidth - Minimum width in pixels
 * @param {number} options.maxWidth - Maximum width in pixels
 * @param {number} options.defaultWidth - Default width in pixels
 * @returns {Object} Resize state and methods
 */
export function useResizable(options = {}) {
  const { minWidth = 200, maxWidth = 600, defaultWidth = 320 } = options;
  
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  // Handle window resize to ensure constraints are maintained
  const handleWindowResize = useCallback(() => {
    const windowWidth = window.innerWidth;
    const maxAllowedWidth = Math.min(maxWidth, windowWidth * 0.6); // Max 60% of window width
    const minAllowedWidth = Math.max(minWidth, 250); // Ensure minimum usability
    
    setWidth(prev => Math.max(minAllowedWidth, Math.min(maxAllowedWidth, prev)));
  }, [minWidth, maxWidth]);

  const handleMouseDown = useCallback((e) => {
    setIsResizing(true);
    startX.current = e.clientX;
    startWidth.current = width;
    
    // Prevent text selection during resize
    e.preventDefault();
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  }, [width]);

  const handleMouseMove = useCallback((e) => {
    if (!isResizing) return;

    const deltaX = e.clientX - startX.current;
    const windowWidth = window.innerWidth;
    const maxAllowedWidth = Math.min(maxWidth, windowWidth * 0.6);
    const minAllowedWidth = Math.max(minWidth, 250);
    const newWidth = Math.max(minAllowedWidth, Math.min(maxAllowedWidth, startWidth.current + deltaX));
    
    setWidth(newWidth);
  }, [isResizing, minWidth, maxWidth]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }, []);

  // Handle window resize
  useEffect(() => {
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [handleWindowResize]);

  // Handle mouse events during resize
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return {
    width,
    isResizing,
    handleMouseDown,
  };
}
