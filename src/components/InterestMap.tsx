import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { submitToGoogleSheet } from '../config/webhook';
import { CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export interface InterestVote {
  id: string;
  lat: number;
  lng: number;
  city: string;
  note?: string;
  createdAt: string;
}

const STORAGE_VOTES_KEY = 'odskoc_si_real_user_votes_v2';
// Výchozí pohled: Moravskoslezský kraj (Česká republika)
const MSK_CENTER: [number, number] = [49.8209, 18.1625];

interface InterestMapProps {
  onOpenPrivacyModal: () => void;
}

export const InterestMap: React.FC<InterestMapProps> = ({ onOpenPrivacyModal }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const tempMarkerRef = useRef<L.Marker | null>(null);

  // Pouze reálné hlasy zadané formulářem (žádné vymyšlené počty ani města)
  const [votes, setVotes] = useState<InterestVote[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_VOTES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Chyba při načítání návrhů z localStorage:', e);
    }
    return [];
  });

  // Modal / Dialog for new vote on click
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [clickedLatLng, setClickedLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const [inputCity, setInputCity] = useState<string>('');
  const [inputNote, setInputNote] = useState<string>('');
  const [inputEmail, setInputEmail] = useState<string>('');
  const [consentChecked, setConsentChecked] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  // Cities breakdown open/collapse
  const [citiesListOpen, setCitiesListOpen] = useState<boolean>(false);

  // Grouped votes by city (pouze z reálných dat)
  const cityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    votes.forEach((v) => {
      const cityName = v.city?.trim() || 'Jiné místo';
      counts[cityName] = (counts[cityName] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [votes]);

  // Total votes count
  const hasRealData = votes.length > 0;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: MSK_CENTER,
      zoom: 9,
      zoomControl: false,
      attributionControl: true,
      maxZoom: 18,
      minZoom: 7,
    });

    // CARTO Positron dlaždice
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
      subdomains: 'abcd',
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> přispěvatelé &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(map);

    // Zoom control
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Layer group for yellow interest dots
    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    // Kliknutí do mapy označí místo "Tady chybí toaleta"
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setClickedLatLng({ lat, lng });
      setSubmittedSuccess(false);

      // Pomocný odhad regionu podle souřadnic
      let nearestCity = 'Moravskoslezský kraj';
      if (lat > 49.9 && lng < 18.0) nearestCity = 'Opava';
      else if (lat > 49.75 && lng > 18.1 && lng < 18.4) nearestCity = 'Ostrava';
      else if (lat < 49.72 && lng > 18.25) nearestCity = 'Frýdek-Místek';
      else if (lat > 49.74 && lng > 18.4) nearestCity = 'Havířov';

      setInputCity(nearestCity);
      setDialogOpen(true);

      // Dočasný pulzující marker na kliknuté místo
      if (tempMarkerRef.current) {
        tempMarkerRef.current.setLatLng([lat, lng]);
      } else {
        const tempIcon = L.divIcon({
          className: 'temp-click-marker',
          html: `
            <div style="
              width: 22px;
              height: 22px;
              background-color: #14294B;
              border: 3px solid #F5B700;
              border-radius: 50%;
              box-shadow: 0 0 0 6px rgba(245, 183, 0, 0.4);
            "></div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });
        tempMarkerRef.current = L.marker([lat, lng], { icon: tempIcon }).addTo(map);
      }
    });

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update yellow dots on map
  useEffect(() => {
    if (!layerGroupRef.current) return;
    layerGroupRef.current.clearLayers();

    votes.forEach((vote) => {
      const dotIcon = L.divIcon({
        className: 'interest-dot-marker',
        html: `
          <div style="
            width: 14px;
            height: 14px;
            background-color: #F5B700;
            border: 2px solid #14294B;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.25);
            cursor: pointer;
          " title="${vote.city}: Tady chybí toaleta"></div>
        `,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const marker = L.marker([vote.lat, vote.lng], { icon: dotIcon });
      const popupHtml = `
        <div style="font-family: 'Overpass', sans-serif; text-align: left; padding: 4px;">
          <strong style="color: #14294B; font-size: 14px;">${vote.city}</strong><br/>
          <span style="font-size: 12px; color: #475569;">Návrh na WC zdarma</span>
          ${vote.note ? `<div style="font-size: 12px; color: #14294B; margin-top: 4px; font-style: italic;">„${vote.note}“</div>` : ''}
        </div>
      `;
      marker.bindPopup(popupHtml);
      layerGroupRef.current?.addLayer(marker);
    });
  }, [votes]);

  // Handle vote submit
  const handleVoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clickedLatLng) return;

    if (inputEmail.trim() && !consentChecked) {
      alert('Pro zadání e-mailu prosím zaškrtněte souhlas se zpracováním osobních údajů.');
      return;
    }

    setSubmitting(true);
    const newVote: InterestVote = {
      id: 'vote-' + Date.now(),
      lat: clickedLatLng.lat,
      lng: clickedLatLng.lng,
      city: inputCity.trim() || 'Česká republika',
      note: inputNote.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    // Uložit do stavu a localStorage
    const updated = [...votes, newVote];
    setVotes(updated);
    try {
      localStorage.setItem(STORAGE_VOTES_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Nelze uložit hlasy:', err);
    }

    // Odeslat do Google Sheet webhooku
    await submitToGoogleSheet({
      formType: 'interest_vote',
      city: newVote.city,
      note: newVote.note,
      email: inputEmail.trim() || undefined,
      lat: newVote.lat,
      lng: newVote.lng,
      consent: consentChecked,
    });

    setSubmitting(false);
    setSubmittedSuccess(true);

    // Odstranit dočasný marker
    if (tempMarkerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(tempMarkerRef.current);
      tempMarkerRef.current = null;
    }

    // Po 2 sekundách zavřít dialog
    setTimeout(() => {
      setDialogOpen(false);
      setInputNote('');
      setInputEmail('');
      setConsentChecked(false);
      setSubmittedSuccess(false);
    }, 2000);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    if (tempMarkerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(tempMarkerRef.current);
      tempMarkerRef.current = null;
    }
  };

  return (
    <section id="mapa-zajmu" className="scroll-mt-14 w-full bg-slate-100 py-14 sm:py-20 px-4 sm:px-8 border-b-2 border-[#14294B] text-left">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header & Counter (Počítadlo zobrazeno jen když existují skutečná data z formuláře) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h2 className="font-['Overpass',sans-serif] font-[900] text-[32px] sm:text-[44px] text-[#14294B] leading-[1.0] tracking-[-0.5px]">
              Kde chybí toalety? Označte to v mapě
            </h2>
            <p className="font-['Atkinson_Hyperlegible_Next','Atkinson_Hyperlegible',sans-serif] text-[18px] text-slate-700 leading-[1.5] max-w-[62ch]">
              Klikněte na místo v mapě, kde byste ocenili WC zdarma v podniku. Ukážeme samosprávám, kde občanům a návštěvníkům toalety nejvíce schází.
            </p>
          </div>

          {/* Počítadlo: Zobrazit POUZE pokud existují reálná data z formuláře */}
          {hasRealData && (
            <div className="p-4 bg-white border-2 border-[#14294B] rounded-[6px] shrink-0 text-left md:text-right shadow-sm">
              <div className="font-['Overpass',sans-serif] font-[900] text-[30px] text-[#14294B] leading-none tabular-nums">
                {votes.length}{' '}
                <span className="text-[20px]">
                  {votes.length === 1 ? 'návrh' : votes.length < 5 ? 'návrhy' : 'návrhů'}
                </span>
              </div>
              <div className="font-['Atkinson_Hyperlegible_Next',sans-serif] text-xs font-[700] text-slate-600 mt-1">
                od občanů na nová místa v ČR
              </div>
            </div>
          )}
        </div>

        {/* Instrukční lišta pro uživatele */}
        <div className="p-3 bg-[#14294B] text-white rounded-[6px] text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#F5B700] shrink-0 border border-[#14294B]" aria-hidden="true" />
            <span className="font-['Overpass',sans-serif] font-[800]">
              Kliknutím kamkoliv do mapy označíte místo: „Tady chybí toaleta“
            </span>
          </div>
          <span className="font-['Atkinson_Hyperlegible_Next',sans-serif] text-xs text-slate-300">
            Výchozí oblast: Moravskoslezský kraj (mapu lze posunout po celé ČR)
          </span>
        </div>

        {/* Map Canvas with Click Dialog Overlay */}
        <div className="relative w-full h-[520px] sm:h-[580px] rounded-[6px] overflow-hidden border-2 border-[#14294B] bg-white">
          <div ref={mapContainerRef} className="w-full h-full" aria-label="Mapa zájmu o toalety v České republice" />

          {/* Form Modal when user clicks on map */}
          {dialogOpen && (
            <div className="absolute inset-0 z-[1000] bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white text-[#14294B] rounded-[8px] p-6 max-w-md w-full border-2 border-[#14294B] shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 text-left">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2 font-['Overpass',sans-serif] font-[900] text-[18px]">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#F5B700] border-2 border-[#14294B]" aria-hidden="true" />
                    <span>Tady chybí toaleta</span>
                  </div>
                  <button
                    type="button"
                    onClick={closeDialog}
                    className="text-xs font-bold text-slate-500 hover:text-[#14294B] p-1 cursor-pointer focus:outline-none"
                    aria-label="Zavřít formulář"
                  >
                    Zavřít ×
                  </button>
                </div>

                {submittedSuccess ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-[6px] space-y-2 text-center">
                    <CheckCircle2 size={32} className="text-emerald-600 mx-auto" />
                    <div className="font-['Overpass',sans-serif] font-[900] text-[#14294B] text-[17px]">
                      Děkujeme, váš návrh byl zaznamenán!
                    </div>
                    <p className="text-xs text-slate-700">
                      Místo bylo přidáno na mapu zájmu jako žlutá tečka.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleVoteSubmit} className="space-y-3.5">
                    <div>
                      <label htmlFor="vote-city" className="block text-xs font-bold text-slate-800 uppercase mb-1">
                        Město / Obec *
                      </label>
                      <input
                        id="vote-city"
                        required
                        type="text"
                        value={inputCity}
                        onChange={(e) => setInputCity(e.target.value)}
                        placeholder="např. Ostrava, Opava, Havířov..."
                        className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-[4px] focus:border-[#14294B] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="vote-note" className="block text-xs font-bold text-slate-800 uppercase mb-1">
                        Krátká poznámka k místu (volitelné)
                      </label>
                      <input
                        id="vote-note"
                        type="text"
                        value={inputNote}
                        onChange={(e) => setInputNote(e.target.value)}
                        placeholder="např. u náměstí, park, u zastávky..."
                        className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-[4px] focus:border-[#14294B] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="vote-email" className="block text-xs font-bold text-slate-800 uppercase mb-1">
                        E-mail – dejte mi vědět, až to tu spustíte (volitelné)
                      </label>
                      <input
                        id="vote-email"
                        type="email"
                        value={inputEmail}
                        onChange={(e) => setInputEmail(e.target.value)}
                        placeholder="vas@email.cz"
                        className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-[4px] focus:border-[#14294B] focus:outline-none"
                      />
                    </div>

                    {/* Povinné zaškrtávátko souhlasu, pokud zadal e-mail */}
                    {inputEmail.trim().length > 0 && (
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-[4px] text-xs space-y-1">
                        <label className="flex items-start gap-2 cursor-pointer">
                          <input
                            required
                            type="checkbox"
                            checked={consentChecked}
                            onChange={(e) => setConsentChecked(e.target.checked)}
                            className="mt-0.5 accent-[#14294B]"
                          />
                          <span className="text-slate-800 leading-snug">
                            Souhlasím se zpracováním osobních údajů společností <strong>Groovy Company s.r.o.</strong> za účelem informování o spuštění sítě.{' '}
                            <button
                              type="button"
                              onClick={onOpenPrivacyModal}
                              className="text-[#14294B] underline font-bold"
                            >
                              Více informací
                            </button>
                          </span>
                        </label>
                      </div>
                    )}

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 h-11 bg-[#F5B700] hover:bg-[#E0A600] active:bg-[#C99500] text-[#14294B] font-['Overpass',sans-serif] font-[900] text-sm rounded-[4px] transition-colors cursor-pointer"
                      >
                        {submitting ? 'Ukládám...' : 'Přidat návrh do mapy'}
                      </button>
                      <button
                        type="button"
                        onClick={closeDialog}
                        className="text-xs font-bold text-slate-600 hover:text-[#14294B] px-3 py-2 cursor-pointer"
                      >
                        Zrušit
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pod mapou rozbalovací seznam měst – zobrazen jen při reálných datech z formuláře */}
        {hasRealData && (
          <div className="bg-white border-2 border-[#14294B] rounded-[6px] overflow-hidden">
            <button
              type="button"
              onClick={() => setCitiesListOpen(!citiesListOpen)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="font-['Overpass',sans-serif] font-[900] text-[18px] text-[#14294B]">
                  Přehled navržených měst podle počtu hlasů ({cityCounts.length} {cityCounts.length === 1 ? 'město' : cityCounts.length < 5 ? 'města' : 'měst'})
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-['Overpass',sans-serif] font-[800] text-slate-700">
                <span>{citiesListOpen ? 'Sbalit seznam' : 'Rozbalit seznam'}</span>
                {citiesListOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>

            {citiesListOpen && (
              <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {cityCounts.map(([city, count]) => (
                    <div
                      key={city}
                      className="p-3 bg-white border border-slate-200 rounded-[4px] flex items-center justify-between"
                    >
                      <span className="font-bold text-sm text-[#14294B] truncate mr-2">
                        {city}
                      </span>
                      <span className="font-['Overpass',sans-serif] font-[900] text-sm text-[#14294B] tabular-nums bg-slate-100 px-2 py-0.5 rounded-[4px]">
                        {count} {count === 1 ? 'návrh' : count < 5 ? 'návrhy' : 'návrhů'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
