import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { API_URL } from '../config';
import { MapPin, CheckCircle2, AlertCircle, X, ChevronDown, ChevronUp } from 'lucide-react';

export interface ApiPlace {
  typ?: string;
  type?: string;
  mesto?: string;
  city?: string;
  nazev?: string;
  name?: string;
  adresa?: string;
  address?: string;
  lat?: number | string;
  lng?: number | string;
  lon?: number | string;
  poznamka?: string;
  note?: string;
  email?: string;
  overeno?: boolean | string | number;
  verified?: boolean | string | number;
}

interface InterestMapProps {
  onOpenPrivacyModal: () => void;
}

// Střed České republiky a výchozí přiblížení
const CZECH_CENTER: [number, number] = [49.8175, 15.473];
const DEFAULT_ZOOM = 7;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const InterestMap: React.FC<InterestMapProps> = ({ onOpenPrivacyModal }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const tempMarkerRef = useRef<L.Marker | null>(null);

  // Data z Google Apps Script API
  const [places, setPlaces] = useState<ApiPlace[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState<boolean>(true);

  // Formulář „Navrhnout místo“
  const [formMesto, setFormMesto] = useState<string>('');
  const [formNazev, setFormNazev] = useState<string>('');
  const [formAdresa, setFormAdresa] = useState<string>('');
  const [formPoznamka, setFormPoznamka] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formConsent, setFormConsent] = useState<boolean>(false);
  // Honeypot proti spamu
  const [formWebsite, setFormWebsite] = useState<string>('');
  // Souřadnice vybrané kliknutím do mapy
  const [formLat, setFormLat] = useState<number | null>(null);
  const [formLng, setFormLng] = useState<number | null>(null);

  // Stavy odeslání
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Rozbalovací seznam měst
  const [citiesListOpen, setCitiesListOpen] = useState<boolean>(false);

  // 1. Načtení dat z API (GET)
  const fetchPlaces = async () => {
    setLoadingPlaces(true);
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        let list: ApiPlace[] = [];
        if (Array.isArray(data)) {
          list = data;
        } else if (data && typeof data === 'object') {
          if (Array.isArray(data.data)) list = data.data;
          else if (Array.isArray(data.items)) list = data.items;
          else if (Array.isArray(data.places)) list = data.places;
        }
        setPlaces(list);
      } else {
        setPlaces([]);
      }
    } catch (err) {
      console.warn('Nepodařilo se načíst data z Google Apps Script API:', err);
      setPlaces([]);
    } finally {
      setLoadingPlaces(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  // 2. Inicializace Leaflet mapy
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Leaflet + OpenStreetMap dlaždice (bez API klíče), výchozí pohled celá ČR
    const map = L.map(mapContainerRef.current, {
      center: CZECH_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: true,
      maxZoom: 19,
      minZoom: 6,
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> přispěvatelé',
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    // Kliknutím do mapy se doplní lat/lng a umístí dočasný marker
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setFormLat(lat);
      setFormLng(lng);

      // Umístit nebo posunout dočasný marker
      if (tempMarkerRef.current) {
        tempMarkerRef.current.setLatLng([lat, lng]);
      } else {
        const tempIcon = L.divIcon({
          className: 'temp-marker-icon',
          html: `
            <div style="
              width: 22px;
              height: 22px;
              background-color: #F5B700;
              border: 3px solid #14294B;
              border-radius: 50%;
              box-shadow: 0 0 0 6px rgba(245, 183, 0, 0.45), 0 2px 6px rgba(0,0,0,0.3);
            "></div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });
        tempMarkerRef.current = L.marker([lat, lng], { icon: tempIcon }).addTo(map);
      }

      // Pokus o pomocné reverzní geokódování pro doplnění města/adresy, pokud jsou pole prázdná
      try {
        const revRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        if (revRes.ok) {
          const revData = await revRes.json();
          if (revData && revData.address) {
            const detectedCity =
              revData.address.city ||
              revData.address.town ||
              revData.address.village ||
              revData.address.municipality ||
              '';
            const detectedRoad = revData.address.road || '';
            const detectedHouse = revData.address.house_number || '';
            const detectedStreet = [detectedRoad, detectedHouse].filter(Boolean).join(' ');

            setFormMesto((prev) => (prev.trim() ? prev : detectedCity));
            setFormAdresa((prev) => (prev.trim() ? prev : detectedStreet));
          }
        }
      } catch {
        // Ignorovat chybu reverzního vyhledávání
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

  // 3. Vykreslení bodů z API
  // Body bez ověření (overeno: false) = menší poloprůhledný žlutý kroužek. Popup: jen „Tip na WC – [město]“
  // Ověřené body (overeno: true):
  // typ „tip“ = žlutý kroužek
  // „zajem“ = žlutý kroužek s modrým okrajem
  // „misto“ = modrý pin s bílým „WC“
  // Popup: název, město, adresa, poznámka
  useEffect(() => {
    if (!layerGroupRef.current) return;
    layerGroupRef.current.clearLayers();

    places.forEach((place) => {
      const pLat = typeof place.lat === 'number' ? place.lat : parseFloat(String(place.lat || ''));
      const pLng =
        typeof place.lng === 'number'
          ? place.lng
          : typeof place.lon === 'number'
          ? place.lon
          : parseFloat(String(place.lng || place.lon || ''));

      if (isNaN(pLat) || isNaN(pLng)) return;

      // Zjištění stavu ověření
      const rawOvereno = place.overeno !== undefined ? place.overeno : place.verified;
      const isUnverified =
        rawOvereno === false ||
        rawOvereno === 'false' ||
        rawOvereno === 'FALSE' ||
        rawOvereno === 0 ||
        rawOvereno === '0';

      const nazev = place.nazev || place.name || '';
      const mesto = place.mesto || place.city || '';
      const adresa = place.adresa || place.address || '';
      const poznamka = place.poznamka || place.note || '';

      let icon: L.DivIcon;
      let popupHtml: string;

      if (isUnverified) {
        // Body bez ověření (overeno: false) zobraz jako menší poloprůhledný žlutý kroužek.
        // Popup: jen „Tip na WC – [město]“.
        icon = L.divIcon({
          className: 'marker-unverified-tip-icon',
          html: `
            <div style="
              width: 10px;
              height: 10px;
              background-color: rgba(245, 183, 0, 0.7);
              border: 1.5px solid rgba(20, 41, 75, 0.6);
              border-radius: 50%;
              box-shadow: 0 1px 3px rgba(0,0,0,0.25);
              cursor: pointer;
            "></div>
          `,
          iconSize: [10, 10],
          iconAnchor: [5, 5],
          popupAnchor: [0, -6],
        });

        const mestoDisplay = mesto.trim() ? ` – ${escapeHtml(mesto.trim())}` : '';
        popupHtml = `
          <div style="font-family: 'Overpass', sans-serif; font-weight: 800; font-size: 13px; color: #14294B; text-align: left; padding: 2px 4px; white-space: nowrap;">
            Tip na WC${mestoDisplay}
          </div>
        `;
      } else {
        // Ověřené body (overeno: true) zobraz jako dosud, s názvem, adresou a poznámkou.
        const rawTyp = (place.typ || place.type || 'tip').toLowerCase().trim();

        if (rawTyp === 'misto' || rawTyp === 'místo') {
          // typ „misto“ = modrý pin s bílým „WC“
          icon = L.divIcon({
            className: 'marker-misto-icon',
            html: `
              <div style="width: 28px; height: 36px; cursor: pointer; filter: drop-shadow(0 2px 5px rgba(0,0,0,0.35));">
                <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 0C6.268 0 0 6.268 0 14C0 23.5 12 34.5 14 36C16 34.5 28 23.5 28 14C28 6.268 21.732 0 14 0Z" fill="#14294B"/>
                  <circle cx="14" cy="14" r="10.5" fill="#1E3A67"/>
                  <text x="14" y="15" fill="#FFFFFF" font-family="'Overpass', system-ui, sans-serif" font-weight="900" font-size="10.5" text-anchor="middle" dominant-baseline="central">WC</text>
                </svg>
              </div>
            `,
            iconSize: [28, 36],
            iconAnchor: [14, 36],
            popupAnchor: [0, -36],
          });
        } else if (rawTyp === 'zajem' || rawTyp === 'zájem') {
          // „zajem“ = žlutý kroužek s modrým okrajem
          icon = L.divIcon({
            className: 'marker-zajem-icon',
            html: `
              <div style="
                width: 16px;
                height: 16px;
                background-color: #F5B700;
                border: 3px solid #14294B;
                border-radius: 50%;
                box-shadow: 0 2px 6px rgba(0,0,0,0.35);
                cursor: pointer;
              "></div>
            `,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
            popupAnchor: [0, -10],
          });
        } else {
          // typ „tip“ = žlutý kroužek
          icon = L.divIcon({
            className: 'marker-tip-icon',
            html: `
              <div style="
                width: 14px;
                height: 14px;
                background-color: #F5B700;
                border: 1px solid rgba(20, 41, 75, 0.4);
                border-radius: 50%;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                cursor: pointer;
              "></div>
            `,
            iconSize: [14, 14],
            iconAnchor: [7, 7],
            popupAnchor: [0, -8],
          });
        }

        popupHtml = `
          <div style="font-family: 'Overpass', sans-serif; min-width: 160px; max-width: 260px; color: #14294B; text-align: left; padding: 4px;">
            ${nazev ? `<div style="font-weight: 900; font-size: 15px; margin-bottom: 2px;">${escapeHtml(nazev)}</div>` : ''}
            ${mesto ? `<div style="font-weight: 700; font-size: 13px; color: #1E3A67;">${escapeHtml(mesto)}</div>` : ''}
            ${adresa ? `<div style="font-size: 12px; color: #475569; margin-top: 2px;">${escapeHtml(adresa)}</div>` : ''}
            ${poznamka ? `<div style="font-size: 12px; color: #14294B; font-style: italic; margin-top: 6px; padding-top: 4px; border-top: 1px solid #E2E8F0;">„${escapeHtml(poznamka)}“</div>` : ''}
          </div>
        `;
      }

      const marker = L.marker([pLat, pLng], { icon });
      marker.bindPopup(popupHtml);
      layerGroupRef.current?.addLayer(marker);
    });
  }, [places]);

  // Vyčištění formuláře a odstranění dočasného markeru
  const clearForm = () => {
    setFormMesto('');
    setFormNazev('');
    setFormAdresa('');
    setFormPoznamka('');
    setFormEmail('');
    setFormConsent(false);
    setFormWebsite('');
    setFormLat(null);
    setFormLng(null);
    if (tempMarkerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(tempMarkerRef.current);
      tempMarkerRef.current = null;
    }
  };

  // Zrušení samotného výběru z mapy bez vymazání textových polí
  const handleClearMapSelection = () => {
    setFormLat(null);
    setFormLng(null);
    if (tempMarkerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(tempMarkerRef.current);
      tempMarkerRef.current = null;
    }
  };

  // Odeslání formuláře
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Honeypot proti spamu: pokud je pole website vyplněné, formulář nic neodešle
    if (formWebsite.trim() !== '') {
      setSuccessMessage('Díky! Váš tip je na mapě.');
      clearForm();
      return;
    }

    if (!formConsent) {
      setErrorMessage('Pro odeslání prosím potvrďte souhlas se zpracováním osobních údajů.');
      return;
    }

    setSubmitting(true);

    let finalLat = formLat;
    let finalLng = formLng;

    // Bez kliknutí do mapy zkus adresu dohledat přes Nominatim
    if (finalLat === null || finalLng === null) {
      try {
        const query = [formAdresa.trim(), formMesto.trim()].filter(Boolean).join(', ');
        if (query) {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&countrycodes=cz&q=${encodeURIComponent(query)}`,
            { headers: { 'Accept-Language': 'cs,en' } }
          );
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            if (Array.isArray(geoData) && geoData.length > 0) {
              const parsedLat = parseFloat(geoData[0].lat);
              const parsedLon = parseFloat(geoData[0].lon);
              if (!isNaN(parsedLat) && !isNaN(parsedLon)) {
                finalLat = parsedLat;
                finalLng = parsedLon;
              }
            }
          }
        }

        // Pokud adresa nic nevrátila, zkusit alespoň město
        if ((finalLat === null || finalLng === null) && formMesto.trim()) {
          const cityRes = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&countrycodes=cz&q=${encodeURIComponent(formMesto.trim())}`,
            { headers: { 'Accept-Language': 'cs,en' } }
          );
          if (cityRes.ok) {
            const cityData = await cityRes.json();
            if (Array.isArray(cityData) && cityData.length > 0) {
              const parsedLat = parseFloat(cityData[0].lat);
              const parsedLon = parseFloat(cityData[0].lon);
              if (!isNaN(parsedLat) && !isNaN(parsedLon)) {
                finalLat = parsedLat;
                finalLng = parsedLon;
              }
            }
          }
        }
      } catch (geoErr) {
        console.warn('Geokódování přes Nominatim selhalo:', geoErr);
      }
    }

    // Odeslání: fetch(API_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ typ: 'tip', mesto, nazev, adresa, lat, lng, poznamka, email }) })
    try {
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          typ: 'tip',
          mesto: formMesto.trim(),
          nazev: formNazev.trim(),
          adresa: formAdresa.trim(),
          lat: finalLat,
          lng: finalLng,
          poznamka: formPoznamka.trim(),
          email: formEmail.trim(),
        }),
      });

      // Po odeslání ukaž „Díky! Váš tip je na mapě.“ a formulář vyčisti, znovu načti body z API
      setSuccessMessage('Díky! Váš tip je na mapě.');
      clearForm();
      fetchPlaces();
    } catch (err) {
      console.error('Chyba při odesílání tipu:', err);
      setErrorMessage('Omlouváme se, došlo k chybě při odesílání. Zkuste to prosím znovu.');
    } finally {
      setSubmitting(false);
    }
  };

  // Skupiny měst pro počítadlo/přehled (pouze při skutečných datech)
  const cityCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    places.forEach((p) => {
      const cityName = (p.mesto || p.city || '').trim();
      if (cityName) {
        counts[cityName] = (counts[cityName] || 0) + 1;
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [places]);

  const hasRealData = places.length > 0;

  return (
    <section
      id="mapa-zajmu"
      className="scroll-mt-14 w-full bg-slate-100 py-14 sm:py-20 px-4 sm:px-8 border-b-2 border-[#14294B] text-left"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header & Counter (Počítadlo zobrazeno jen tehdy, když existují skutečná data) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h2 className="font-['Overpass',sans-serif] font-[900] text-[32px] sm:text-[44px] text-[#14294B] leading-[1.0] tracking-[-0.5px]">
              Kde chybí toalety? Označte to v mapě
            </h2>
            <p className="font-['Atkinson_Hyperlegible_Next','Atkinson_Hyperlegible',sans-serif] text-[18px] text-slate-700 leading-[1.5] max-w-[64ch]">
              Kavárny a restaurace, kde si odskočíte zdarma a bez ptaní. Síť právě vzniká, pomozte nám vybrat místa.
            </p>
          </div>

          {/* Počítadlo návrhů jen tehdy, když existují skutečná data z formuláře */}
          {hasRealData && (
            <div className="p-4 bg-white border-2 border-[#14294B] rounded-[6px] shrink-0 text-left md:text-right shadow-sm">
              <div className="font-['Overpass',sans-serif] font-[900] text-[30px] text-[#14294B] leading-none tabular-nums">
                {places.length}{' '}
                <span className="text-[20px]">
                  {places.length === 1 ? 'místo' : places.length < 5 ? 'místa' : 'míst'}
                </span>
              </div>
              <div className="font-['Atkinson_Hyperlegible_Next',sans-serif] text-xs font-[700] text-slate-600 mt-1">
                v databázi Odskoč si
              </div>
            </div>
          )}
        </div>

        {/* Instrukční lišta pro uživatele */}
        <div className="p-3 bg-[#14294B] text-white rounded-[6px] text-sm flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-[#F5B700] shrink-0 border border-[#14294B]" aria-hidden="true" />
          <span className="font-['Overpass',sans-serif] font-[800]">
            Kliknutím do mapy označíte přesnou polohu, kde vám WC chybí
          </span>
        </div>

        {/* Hlavní grid: Mapa vlevo + Formulář „Navrhnout místo“ vpravo */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* MAPA (7 sloupců na velkých obrazovkách) */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            <div className="relative w-full h-[440px] sm:h-[560px] rounded-[6px] overflow-hidden border-2 border-[#14294B] bg-white">
              <div
                ref={mapContainerRef}
                className="w-full h-full"
                aria-label="Mapa toalet a zájmu v České republice"
              />

              {/* Když API vrátí prázdný seznam, ukaž na mapě text: „Zatím tu nic není. Buďte první, kdo navrhne místo.“ */}
              {places.length === 0 && !loadingPlaces && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] max-w-[90%] bg-white/95 backdrop-blur-xs text-[#14294B] px-5 py-3 rounded-[8px] border-2 border-[#14294B] shadow-lg text-center font-['Overpass',sans-serif] pointer-events-auto">
                  <div className="font-[900] text-[15px] sm:text-[17px] text-[#14294B]">
                    Zatím tu nic není. Buďte první, kdo navrhne místo.
                  </div>
                  <div className="font-['Atkinson_Hyperlegible_Next',sans-serif] text-xs text-slate-600 mt-0.5">
                    Klikněte do mapy nebo vyplňte formulář vedle.
                  </div>
                </div>
              )}
            </div>

            {/* Legenda markerů */}
            <div className="p-3 bg-white border-2 border-[#14294B] rounded-[6px] flex flex-wrap items-center justify-between gap-3 text-xs font-['Overpass',sans-serif] font-[800]">
              <div className="flex items-center gap-2 text-slate-800">
                <span className="w-3.5 h-3.5 rounded-full bg-[#F5B700] border border-black/30 inline-block shrink-0" />
                <span>Tip na WC</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800">
                <span className="w-4 h-4 rounded-full bg-[#F5B700] border-[3px] border-[#14294B] inline-block shrink-0" />
                <span>Zájem podniku</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800">
                <span className="inline-flex items-center justify-center w-5 h-5 bg-[#14294B] text-white text-[9px] font-[900] rounded-sm shrink-0">
                  WC
                </span>
                <span>Zapojené místo</span>
              </div>
            </div>
          </div>

          {/* FORMULÁŘ „Navrhnout místo“ (5 sloupců na velkých obrazovkách) */}
          <div
            id="navrhnout-misto"
            className="lg:col-span-5 bg-white text-[#14294B] rounded-[8px] p-6 sm:p-7 border-2 border-[#14294B] shadow-sm space-y-5 text-left"
          >
            <div className="border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="text-[#F5B700] shrink-0" size={22} />
                <h3 className="font-['Overpass',sans-serif] font-[900] text-[22px] sm:text-[24px] text-[#14294B] leading-tight">
                  Navrhnout místo
                </h3>
              </div>
              <p className="font-['Atkinson_Hyperlegible_Next',sans-serif] text-xs text-slate-600 mt-1 leading-normal">
                Víte o kavárně, restauraci nebo ulici, kde by toaleta bodla? Dejte nám vědět.
              </p>
            </div>

            {/* Zpráva o úspěchu */}
            {successMessage && (
              <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-[6px] space-y-2 text-center animate-in fade-in duration-200">
                <CheckCircle2 size={32} className="text-emerald-600 mx-auto" />
                <div className="font-['Overpass',sans-serif] font-[900] text-[#14294B] text-[18px]">
                  {successMessage}
                </div>
                <button
                  type="button"
                  onClick={() => setSuccessMessage(null)}
                  className="text-xs font-bold text-emerald-800 underline hover:no-underline pt-1 cursor-pointer"
                >
                  Navrhnout další místo
                </button>
              </div>
            )}

            {/* Chybová hláška */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-300 rounded-[6px] flex items-center gap-2 text-xs text-red-800">
                <AlertCircle size={18} className="shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Samotný formulář */}
            {!successMessage && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Skryté pole honeypot proti spamu */}
                <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
                  <label htmlFor="hp-website">Website</label>
                  <input
                    type="text"
                    id="hp-website"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={formWebsite}
                    onChange={(e) => setFormWebsite(e.target.value)}
                  />
                </div>

                {/* Pole: Město */}
                <div>
                  <label htmlFor="form-mesto" className="block text-xs font-bold text-slate-800 uppercase mb-1">
                    Město / Obec *
                  </label>
                  <input
                    id="form-mesto"
                    required
                    type="text"
                    value={formMesto}
                    onChange={(e) => setFormMesto(e.target.value)}
                    placeholder="např. Brno, Praha, Ostrava, Tábor..."
                    className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-[4px] focus:border-[#14294B] focus:ring-1 focus:ring-[#14294B] focus:outline-none"
                  />
                </div>

                {/* Pole: Název podniku (nepovinné) */}
                <div>
                  <label htmlFor="form-nazev" className="block text-xs font-bold text-slate-800 uppercase mb-1">
                    Název podniku <span className="text-slate-500 font-normal lowercase">(nepovinné)</span>
                  </label>
                  <input
                    id="form-nazev"
                    type="text"
                    value={formNazev}
                    onChange={(e) => setFormNazev(e.target.value)}
                    placeholder="např. Kavárna U Kostela, Bistro Roh..."
                    className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-[4px] focus:border-[#14294B] focus:ring-1 focus:ring-[#14294B] focus:outline-none"
                  />
                </div>

                {/* Pole: Adresa */}
                <div>
                  <label htmlFor="form-adresa" className="block text-xs font-bold text-slate-800 uppercase mb-1">
                    Adresa nebo orientační místo *
                  </label>
                  <input
                    id="form-adresa"
                    required
                    type="text"
                    value={formAdresa}
                    onChange={(e) => setFormAdresa(e.target.value)}
                    placeholder="např. Náměstí Svobody 12, u vlakového nádraží..."
                    className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-[4px] focus:border-[#14294B] focus:ring-1 focus:ring-[#14294B] focus:outline-none"
                  />
                </div>

                {/* Indikátor výběru z mapy / Nominatim */}
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-[4px] text-xs space-y-1">
                  {formLat !== null && formLng !== null ? (
                    <div className="flex items-center justify-between text-slate-800 font-medium">
                      <div className="flex items-center gap-1.5 text-emerald-700">
                        <MapPin size={15} />
                        <span>Poloha vybrána kliknutím do mapy</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearMapSelection}
                        className="text-slate-500 hover:text-red-600 flex items-center gap-0.5 font-bold cursor-pointer"
                        title="Zrušit označení z mapy"
                      >
                        <X size={14} />
                        <span>Zrušit</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-slate-600 leading-tight">
                      💡 <strong>Tip:</strong> Kliknutím kamkoliv do mapy vyberete přesné souřadnice. Bez kliknutí souřadnice dohledáme z adresy automaticky.
                    </div>
                  )}
                </div>

                {/* Pole: Poznámka */}
                <div>
                  <label htmlFor="form-poznamka" className="block text-xs font-bold text-slate-800 uppercase mb-1">
                    Poznámka <span className="text-slate-500 font-normal lowercase">(nepovinné)</span>
                  </label>
                  <input
                    id="form-poznamka"
                    type="text"
                    value={formPoznamka}
                    onChange={(e) => setFormPoznamka(e.target.value)}
                    placeholder="např. v okolí není žádné veřejné WC, rušná cyklostezka..."
                    className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-[4px] focus:border-[#14294B] focus:ring-1 focus:ring-[#14294B] focus:outline-none"
                  />
                </div>

                {/* Pole: E-mail (nepovinný) */}
                <div>
                  <label htmlFor="form-email" className="block text-xs font-bold text-slate-800 uppercase mb-1">
                    E-mail <span className="text-slate-500 font-normal lowercase">(nepovinný, dáme vám vědět po schválení)</span>
                  </label>
                  <input
                    id="form-email"
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="vas@email.cz"
                    className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-[4px] focus:border-[#14294B] focus:ring-1 focus:ring-[#14294B] focus:outline-none"
                  />
                </div>

                {/* Checkbox souhlasu se zpracováním údajů (povinný) */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] text-xs">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      required
                      type="checkbox"
                      checked={formConsent}
                      onChange={(e) => setFormConsent(e.target.checked)}
                      className="mt-0.5 accent-[#14294B]"
                    />
                    <span className="text-slate-800 leading-snug">
                      Souhlasím se zpracováním údajů za účelem zanesení a prověření tipu na WC.{' '}
                      <button
                        type="button"
                        onClick={onOpenPrivacyModal}
                        className="text-[#14294B] underline font-bold inline"
                      >
                        Ochrana údajů
                      </button>
                    </span>
                  </label>
                </div>

                {/* Tlačítko Odeslat */}
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 bg-[#F5B700] hover:bg-[#E0A600] active:bg-[#C99500] text-[#14294B] font-['Overpass',sans-serif] font-[900] text-[16px] rounded-[4px] transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {submitting ? 'Odesílám návrh...' : 'Odeslat tip na místo'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Pod mapou: rozbalovací seznam měst – pouze tehdy, když existují skutečná data */}
        {hasRealData && (
          <div className="bg-white border-2 border-[#14294B] rounded-[6px] overflow-hidden">
            <button
              type="button"
              onClick={() => setCitiesListOpen(!citiesListOpen)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="font-['Overpass',sans-serif] font-[900] text-[18px] text-[#14294B]">
                  Přehled navržených měst ({cityCounts.length}{' '}
                  {cityCounts.length === 1 ? 'město' : cityCounts.length < 5 ? 'města' : 'měst'})
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
                      <span className="font-bold text-sm text-[#14294B] truncate mr-2">{city}</span>
                      <span className="font-['Overpass',sans-serif] font-[900] text-sm text-[#14294B] tabular-nums bg-slate-100 px-2 py-0.5 rounded-[4px]">
                        {count} {count === 1 ? 'místo' : count < 5 ? 'místa' : 'míst'}
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
