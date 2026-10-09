import React, { useState } from 'react';
import { Menu, X, MapPin } from 'lucide-react';

interface TopBarProps {
  onScrollToSection: (sectionId: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onScrollToSection }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    onScrollToSection(sectionId);
  };

  const handleLogoClick = () => {
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 h-14 md:h-16 bg-[#14294B] text-white px-4 sm:px-6 flex items-center justify-between border-b-2 border-[#1E3A67] select-none">
      {/* Left: Negative SVG Logo as <img> with height 36px mobile / 44px desktop */}
      <button
        type="button"
        onClick={handleLogoClick}
        className="flex items-center cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B700] rounded-[4px]"
        aria-label="Odskoč si – návrat na úvod"
      >
        <img
          src="/odskoc-si-logo-negativ.svg"
          alt="Odskoč si"
          className="h-[36px] md:h-[44px] w-auto object-contain block logo-bounce-once"
        />
      </button>

      {/* Right on Desktop:
          Mapa zájmu, Pro města a regiony, Pro kavárny a restaurace, FAQ */}
      <nav aria-label="Hlavní navigace" className="hidden md:flex items-center gap-6 font-['Overpass',sans-serif] font-[900] text-xs uppercase tracking-wider text-white">
        <button
          type="button"
          onClick={() => handleLinkClick('mapa-zajmu')}
          className="hover:text-[#F5B700] transition-colors cursor-pointer flex items-center gap-1.5 text-[#F5B700] focus:outline-none focus-visible:underline"
        >
          <MapPin size={15} />
          <span>Mapa zájmu</span>
        </button>

        <button
          type="button"
          onClick={() => handleLinkClick('pro-mesta')}
          className="hover:text-[#F5B700] transition-colors cursor-pointer focus:outline-none focus-visible:underline"
        >
          Pro města a regiony
        </button>

        <button
          type="button"
          onClick={() => handleLinkClick('pro-podniky')}
          className="hover:text-[#F5B700] transition-colors cursor-pointer focus:outline-none focus-visible:underline"
        >
          Pro kavárny a restaurace
        </button>

        <button
          type="button"
          onClick={() => handleLinkClick('faq')}
          className="hover:text-[#F5B700] transition-colors cursor-pointer focus:outline-none focus-visible:underline"
        >
          FAQ
        </button>
      </nav>

      {/* Right on Mobile: Hamburger button */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-[4px] text-white hover:text-[#F5B700] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B700]"
          aria-label={mobileMenuOpen ? 'Zavřít menu' : 'Otevřít menu'}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-14 left-0 right-0 bg-[#14294B] border-b-2 border-[#1E3A67] p-5 space-y-3 font-['Overpass',sans-serif] shadow-2xl">
          <nav aria-label="Mobilní navigace" className="flex flex-col space-y-3 text-sm font-[900] uppercase tracking-wider text-left">
            <button
              type="button"
              onClick={() => handleLinkClick('mapa-zajmu')}
              className="text-left text-[#F5B700] hover:text-white py-1 cursor-pointer flex items-center gap-2"
            >
              <MapPin size={16} />
              <span>Mapa zájmu (přidat návrh)</span>
            </button>

            <button
              type="button"
              onClick={() => handleLinkClick('pro-mesta')}
              className="text-left text-white hover:text-[#F5B700] py-1 cursor-pointer"
            >
              Pro města a regiony
            </button>

            <button
              type="button"
              onClick={() => handleLinkClick('pro-podniky')}
              className="text-left text-white hover:text-[#F5B700] py-1 cursor-pointer"
            >
              Pro kavárny a restaurace
            </button>

            <button
              type="button"
              onClick={() => handleLinkClick('faq')}
              className="text-left text-white hover:text-[#F5B700] py-1 cursor-pointer"
            >
              FAQ
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};
