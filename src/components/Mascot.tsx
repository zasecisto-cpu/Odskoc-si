import React from 'react';

/**
 * Official Odskoč si Logo as an <img> tag with preserved aspect ratio
 * Negative (on blue background): /odskoc-si-logo-negativ.svg
 * Positive (on white background): /odskoc-si-logo.svg
 * Height in header: 36px on mobile, 44px on desktop.
 */
export const Logo: React.FC<{
  variant?: 'negative' | 'positive';
  className?: string;
  bounce?: boolean;
  alt?: string;
}> = ({
  variant = 'negative',
  className = '',
  bounce = false,
  alt = 'Odskoč si – logo',
}) => {
  const src = variant === 'positive' ? '/odskoc-si-logo.svg' : '/odskoc-si-logo-negativ.svg';
  return (
    <img
      src={src}
      alt={alt}
      className={`block object-contain select-none ${bounce ? 'logo-bounce-once' : ''} ${className}`}
    />
  );
};
