import React, { useEffect, useCallback } from 'react';
import { TopBar } from './components/TopBar';
import { LandingPage } from './components/LandingPage';

export default function App() {
  // Smooth scroll helper
  const scrollToSection = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Handle URL hash on load
  useEffect(() => {
    const handleUrlHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setTimeout(() => {
          scrollToSection(hash);
        }, 150);
      }
    };

    handleUrlHash();
    window.addEventListener('hashchange', handleUrlHash);
    return () => window.removeEventListener('hashchange', handleUrlHash);
  }, [scrollToSection]);

  return (
    <div className="w-full min-h-screen bg-white text-[#14294B] font-['Archivo',sans-serif] flex flex-col">
      {/* 1. Header (sticky): logo left, navigation right */}
      <TopBar onScrollToSection={scrollToSection} />

      {/* 2. Main Page Content */}
      <main className="flex-1 w-full flex flex-col">
        <LandingPage onScrollToSection={scrollToSection} />
      </main>
    </div>
  );
}
