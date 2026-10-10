import React, { useState } from 'react';
import { InterestMap } from './InterestMap';
import { StickerSection } from './StickerSection';
import { PrivacyModal } from './PrivacyModal';
import Logo from './Logo';
import { submitToGoogleSheet } from '../config/webhook';
import {
  ChevronDown,
  ArrowRight,
  Send,
  CheckCircle2,
  MapPin,
  Compass,
  Store,
  Building2,
  FileCheck2,
  QrCode,
  ShieldCheck,
  Calendar,
  Sparkles
} from 'lucide-react';

interface LandingPageProps {
  onScrollToSection: (sectionId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onScrollToSection }) => {
  // Modal & form states
  const [privacyOpen, setPrivacyOpen] = useState(false);

  // Business form state
  const [businessSubmitted, setBusinessSubmitted] = useState(false);
  const [businessSubmitting, setBusinessSubmitting] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [businessCity, setBusinessCity] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessContactPerson, setBusinessContactPerson] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessBarrierFree, setBusinessBarrierFree] = useState(false);
  const [businessChangingTable, setBusinessChangingTable] = useState(false);
  const [businessConsent, setBusinessConsent] = useState(false);

  // City form state
  const [citySubmitted, setCitySubmitted] = useState(false);
  const [citySubmitting, setCitySubmitting] = useState(false);
  const [cityMunicipality, setCityMunicipality] = useState('');
  const [cityNamePerson, setCityNamePerson] = useState('');
  const [cityRole, setCityRole] = useState('');
  const [cityEmail, setCityEmail] = useState('');
  const [cityPhone, setCityPhone] = useState('');
  const [cityConsent, setCityConsent] = useState(false);

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Business submission handler
  const handleBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessConsent) {
      alert('Pro odeslání je nutný souhlas se zpracováním osobních údajů.');
      return;
    }
    setBusinessSubmitting(true);
    await submitToGoogleSheet({
      formType: 'business_preregistration',
      businessName,
      city: businessCity,
      address: businessAddress,
      contactPerson: businessContactPerson,
      phone: businessPhone,
      email: businessEmail,
      barrierFree: businessBarrierFree,
      changingTable: businessChangingTable,
      consent: businessConsent,
    });
    setBusinessSubmitting(false);
    setBusinessSubmitted(true);
  };

  // City submission handler
  const handleCitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityConsent) {
      alert('Pro odeslání je nutný souhlas se zpracováním osobních údajů.');
      return;
    }
    setCitySubmitting(true);
    await submitToGoogleSheet({
      formType: 'city_inquiry',
      city: cityMunicipality,
      name: cityNamePerson,
      role: cityRole,
      email: cityEmail,
      phone: cityPhone,
      consent: cityConsent,
    });
    setCitySubmitting(false);
    setCitySubmitted(true);
  };

  const faqItems = [
    {
      q: 'Musím si v podniku něco koupit?',
      a: 'Ne. Vstup na WC je zdarma a bez nutnosti nákupu pro každého slušného návštěvníka. Obsluha ví, že podnik je zapojený v síti, a nikdo po vás nebude vyžadovat účtenku ani útratu.',
    },
    {
      q: 'Je to pro veřejnost skutečně zdarma?',
      a: 'Ano, pro návštěvníky zcela zdarma. Provozování toalet kompenzuje město či region formou stálého měsíčního nájmu 2 000 Kč přímo zapojeným kavárnám a restauracím.',
    },
    {
      q: 'Kdy a kde síť Odskoč si odstartuje?',
      a: 'Síť se právě připravuje. Spouštíme na jaře 2027 v prvních městech v České republice. Konkrétní lokality vybíráme podle počtu návrhů od občanů a otevřenosti místních radnic.',
    },
    {
      q: 'Může personál podniku někoho na WC nevpustit?',
      a: 'Ano. Pravidla sítě garantují personálu plné právo vykázat nebo odmítnout zjevně agresivní, podnapilé či znečištěné osoby k ochraně bezpečí zaměstnanců a stávajících hostů.',
    },
    {
      q: 'Potřebuji do mobilu nějakou aplikaci?',
      a: 'Ne, žádná aplikace se neinstaluje. Odskoč si funguje jednoduše v internetovém prohlížeči jako interaktivní mapa přístupná na mobilu i počítači.',
    },
    {
      q: 'Jak funguje zkušební provoz pro města a regiony?',
      a: 'Zkušební provoz nabízíme na jednu celou turistickou sezónu se zavedením sítě zcela zdarma, bez finančního rizika a s možností smlouvu bez sankcí ukončit.',
    },
    {
      q: 'Kdo síť Odskoč si provozuje?',
      a: 'Správcem a provozovatelem sítě je společnost Groovy Company s.r.o., která zajišťuje smluvní vztahy s městy i podniky, audity kvality, jednotné značení a výplatu odměn.',
    },
  ];

  return (
    <div className="w-full text-left font-['Atkinson_Hyperlegible_Next','Atkinson_Hyperlegible',sans-serif] bg-white text-[#14294B]">
      {/* ========================================================= */}
      {/* 1. HERO SECTION                                           */}
      {/* ========================================================= */}
      <section className="bg-[#14294B] text-white pt-12 sm:pt-16 pb-16 sm:pb-20 px-5 sm:px-8 border-b-2 border-[#1E3A67] relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left: Headline, Subtitle & Launch Badge */}
            <div className="lg:col-span-12 max-w-4xl space-y-5 sm:space-y-6">
              {/* Hlavní nadpis dle zadání:
                  Slovo „WC“ v hranatém žlutém štítku (#F5B700, text #14294B, zaoblení 8 px, vnitřní okraj 0 8px)
                  a zbytek bílý. „Bez nákupu.“ na druhém řádku žlutě. */}
              <h1 className="font-['Overpass',sans-serif] font-[900] text-[40px] sm:text-[56px] lg:text-[68px] leading-[1.0] tracking-[-0.5px] text-left">
                <span className="badge badge-wc bg-[#F5B700] text-[#14294B] mr-2.5 align-baseline select-none">
                  WC
                </span>
                <span className="text-white align-baseline">zdarma.</span>
                <span className="block text-[#F5B700] mt-1.5 sm:mt-2">Bez nákupu.</span>
              </h1>

              {/* Podnadpis dle zadání */}
              <p className="font-['Atkinson_Hyperlegible_Next','Atkinson_Hyperlegible',sans-serif] text-[18px] sm:text-[21px] text-white/90 leading-[1.4] max-w-[55ch] font-medium">
                Kavárny a restaurace, kde si odskočíte zdarma a bez ptaní. Síť právě vzniká, pomozte nám vybrat místa.
              </p>

              {/* Jednoduchý žlutý štítek „Spouštíme na jaře 2027“ */}
              <div className="pt-1">
                <span className="badge badge-start bg-[#F5B700] text-[#14294B] font-['Overpass',sans-serif] font-[900] text-sm sm:text-base uppercase tracking-wider">
                  Spouštíme na jaře 2027
                </span>
              </div>
            </div>
          </div>

          {/* Rozcestník – tři cesty (karty vedle sebe na desktopu, na mobilu pod sebou) */}
          <div className="mt-12 sm:mt-16 pt-8 border-t border-[#1E3A67]">
            <div className="text-xl sm:text-2xl font-['Overpass',sans-serif] font-[900] text-[#F5B700] uppercase tracking-wider mb-4">
              Kdo jste?
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
              {/* Karta 1: Město nebo region */}
              <button
                type="button"
                onClick={() => onScrollToSection('pro-mesta')}
                className="group bg-[#1E3560] hover:bg-[#254277] border-2 border-[#2B4B85] hover:border-[#F5B700] p-5 sm:p-6 rounded-[10px] text-left transition-all duration-150 cursor-pointer flex flex-col justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B700]"
              >
                <div>
                  <div className="font-['Overpass',sans-serif] font-[900] text-[20px] sm:text-[22px] text-white tracking-[-0.5px] leading-tight mb-2 flex items-center justify-between">
                    <span>Město nebo region</span>
                    <span className="text-[#F5B700] text-[22px] font-[900] transition-transform duration-150 group-hover:translate-x-1.5 shrink-0 ml-2" aria-hidden="true">
                      →
                    </span>
                  </div>
                  <p className="font-['Atkinson_Hyperlegible_Next',sans-serif] text-[15px] sm:text-[16px] text-slate-200 leading-[1.4]">
                    Veřejná WC v centru bez stavby a investic. Podniky zajistíme my, vy platíte jednu fakturu.
                  </p>
                </div>
              </button>

              {/* Karta 2: Kavárna nebo restaurace */}
              <button
                type="button"
                onClick={() => onScrollToSection('pro-podniky')}
                className="group bg-[#1E3560] hover:bg-[#254277] border-2 border-[#2B4B85] hover:border-[#F5B700] p-5 sm:p-6 rounded-[10px] text-left transition-all duration-150 cursor-pointer flex flex-col justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B700]"
              >
                <div>
                  <div className="font-['Overpass',sans-serif] font-[900] text-[20px] sm:text-[22px] text-white tracking-[-0.5px] leading-tight mb-2 flex items-center justify-between">
                    <span>Kavárna nebo restaurace</span>
                    <span className="text-[#F5B700] text-[22px] font-[900] transition-transform duration-150 group-hover:translate-x-1.5 shrink-0 ml-2" aria-hidden="true">
                      →
                    </span>
                  </div>
                  <p className="font-['Atkinson_Hyperlegible_Next',sans-serif] text-[15px] sm:text-[16px] text-slate-200 leading-[1.4]">
                    Pusťte lidi na toaletu a dostávejte 2 000 Kč každý měsíc. Nálepku i zápis do map zařídíme my.
                  </p>
                </div>
              </button>

              {/* Karta 3 (zvýrazněná žlutým rámečkem): Chybí vám WC ve městě? */}
              <button
                type="button"
                onClick={() => onScrollToSection('mapa-zajmu')}
                className="group bg-[#1E3560] hover:bg-[#254277] border-2 border-[#F5B700] hover:border-[#F5B700] p-5 sm:p-6 rounded-[10px] text-left transition-all duration-150 cursor-pointer flex flex-col justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B700] ring-1 ring-[#F5B700]/30 shadow-md shadow-[#F5B700]/10"
              >
                <div>
                  <div className="font-['Overpass',sans-serif] font-[900] text-[20px] sm:text-[22px] text-[#F5B700] tracking-[-0.5px] leading-tight mb-2 flex items-center justify-between">
                    <span>Chybí vám WC ve městě?</span>
                    <span className="text-[#F5B700] text-[22px] font-[900] transition-transform duration-150 group-hover:translate-x-1.5 shrink-0 ml-2" aria-hidden="true">
                      →
                    </span>
                  </div>
                  <p className="font-['Atkinson_Hyperlegible_Next',sans-serif] text-[15px] sm:text-[16px] text-slate-100 leading-[1.4]">
                    Dejte nám tip, kde toaleta chybí. Ukážeme to vaší radnici.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. MAPA ZÁJMU                                             */}
      {/* ========================================================= */}
      <InterestMap onOpenPrivacyModal={() => setPrivacyOpen(true)} />

      {/* ========================================================= */}
      {/* 3. NÁLEPKA NA DVEŘÍCH PODNIKU                             */}
      {/* ========================================================= */}
      <StickerSection />

      {/* ========================================================= */}
      {/* 4. PRO MĚSTA A REGIONY                                     */}
      {/* ========================================================= */}
      <section
        id="pro-mesta"
        className="scroll-mt-14 bg-[#14294B] text-white py-16 sm:py-24 px-5 sm:px-8 border-b-2 border-[#1E3A67]"
      >
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header sekce */}
          <div className="max-w-3xl space-y-4">
            <div className="text-xs font-['Overpass',sans-serif] font-[900] text-[#F5B700] uppercase tracking-wider">
              Partnerství pro samosprávy
            </div>
            <h2 className="font-['Overpass',sans-serif] font-[900] text-[34px] sm:text-[46px] leading-[1.05] tracking-[-0.5px] text-white">
              Síť veřejných toalet pro města a regiony. Bez stavby a bez investice.
            </h2>
            <p className="font-['Atkinson_Hyperlegible_Next',sans-serif] text-[18px] sm:text-[19px] text-white/90 leading-[1.5]">
              Využijte existující zázemí restaurací a kaváren v centru, u náměstí, cyklostezek a turistických cílů. Jedna smlouva, jedna faktura měsíčně, nulová administrativa s jednotlivými provozovnami.
            </p>
          </div>

          {/* Čtyři kroky realizace */}
          <div>
            <div className="text-xs font-['Overpass',sans-serif] font-[900] text-[#F5B700] uppercase tracking-wider mb-4">
              Jak funguje realizace ve 4 krocích:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-[#1E3560] border border-[#2B4B85] rounded-[8px] space-y-2">
                <div className="font-['Overpass',sans-serif] font-[900] text-[#F5B700] text-[24px] tabular-nums leading-none">
                  01
                </div>
                <div className="font-['Overpass',sans-serif] font-[900] text-[18px] text-white leading-snug">
                  Vybereme a podepíšeme podniky
                </div>
                <p className="text-[14px] text-slate-200 leading-relaxed">
                  Zmapujeme klíčové zóny ve vašem městě či regionu, oslovíme kvalitní kavárny a uzavřeme s nimi jednotné smlouvy.
                </p>
              </div>

              <div className="p-5 bg-[#1E3560] border border-[#2B4B85] rounded-[8px] space-y-2">
                <div className="font-['Overpass',sans-serif] font-[900] text-[#F5B700] text-[24px] tabular-nums leading-none">
                  02
                </div>
                <div className="font-['Overpass',sans-serif] font-[900] text-[18px] text-white leading-snug">
                  Označíme a zapíšeme do map
                </div>
                <p className="text-[14px] text-slate-200 leading-relaxed">
                  Každé místo označíme žlutou nálepkou a zaneseme do všech hlavních map: Google Mapy, Mapy.cz i OpenStreetMap.
                </p>
              </div>

              <div className="p-5 bg-[#1E3560] border border-[#2B4B85] rounded-[8px] space-y-2">
                <div className="font-['Overpass',sans-serif] font-[900] text-[#F5B700] text-[24px] tabular-nums leading-none">
                  03
                </div>
                <div className="font-['Overpass',sans-serif] font-[900] text-[18px] text-white leading-snug">
                  Hlídáme kvalitu
                </div>
                <p className="text-[14px] text-slate-200 leading-relaxed">
                  QR hodnocení od návštěvníků a místní kontrolor, který každé místo anonymně navštíví jednou měsíčně.
                </p>
              </div>

              <div className="p-5 bg-[#1E3560] border border-[#2B4B85] rounded-[8px] space-y-2">
                <div className="font-['Overpass',sans-serif] font-[900] text-[#F5B700] text-[24px] tabular-nums leading-none">
                  04
                </div>
                <div className="font-['Overpass',sans-serif] font-[900] text-[18px] text-white leading-snug">
                  Vyplácíme podniky a reportujeme
                </div>
                <p className="text-[14px] text-slate-200 leading-relaxed">
                  Zajišťujeme pravidelnou výplatu odměn podnikům. Město od nás dostává jednu fakturu měsíčně a čtvrtletní report.
                </p>
              </div>
            </div>
          </div>

          {/* Dva klíčové bloky: Mikroregiony a Zkušební provoz bez rizika */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Blok: Pro mikroregiony a turistické oblasti */}
            <div className="p-6 sm:p-7 bg-[#1A3158] border-2 border-[#F5B700] rounded-[8px] space-y-3">
              <div className="flex items-center gap-2 font-['Overpass',sans-serif] font-[900] text-[#F5B700] text-[20px]">
                <Compass size={22} className="text-[#F5B700]" />
                <span>Pro mikroregiony a turistické oblasti</span>
              </div>
              <p className="text-[16px] text-white/95 leading-[1.5]">
                „Turista nekončí na hranici obce. Jednou smlouvou pokryjeme celý region – náměstí, zámky, cyklostezky i vinařské trasy. Varianta jen na turistickou sezónu (duben–říjen).“
              </p>
              <div className="text-xs text-slate-300 pt-1">
                Ideální pro sdružení obcí, MAS, destinační agentury a turistické svazky.
              </div>
            </div>

            {/* Blok: Zkušební provoz bez rizika */}
            <div className="p-6 sm:p-7 bg-[#1E3560] border-2 border-slate-300 rounded-[8px] space-y-3">
              <div className="flex items-center gap-2 font-['Overpass',sans-serif] font-[900] text-white text-[20px]">
                <ShieldCheck size={22} className="text-[#F5B700]" />
                <span>Zkušební provoz bez rizika</span>
              </div>
              <ul className="text-[15px] text-slate-200 space-y-2 list-disc list-inside">
                <li><strong>Pevný konec po sezóně</strong> – žádné automatické prodlužování ani dlouhodobé závazky.</li>
                <li><strong>Zavedení sítě zdarma</strong> – ve zkušebním provozu neplatíte žádné implementační poplatky.</li>
                <li><strong>Platba zpětně a jen za ověřená místa</strong> – platíte pouze za provozovny s garantovanou kvalitou.</li>
                <li><strong>Smlouva zaniká bez sankcí</strong>, když se v lokalitě nesejde smluvený počet podniků.</li>
              </ul>
            </div>
          </div>

          {/* Kontaktní poptávkový formulář pro města a regiony (žádné ceny na webu) */}
          <div className="bg-white text-[#14294B] rounded-[8px] p-6 sm:p-8 border-2 border-[#F5B700] shadow-xl">
            <div className="max-w-3xl mb-6">
              <h3 className="font-['Overpass',sans-serif] font-[900] text-[24px] sm:text-[28px] text-[#14294B] leading-tight">
                Nezávazná poptávka pro město, obec či region
              </h3>
              <p className="font-['Atkinson_Hyperlegible_Next',sans-serif] text-[16px] text-slate-700 mt-1 font-medium">
                Cenovou nabídku pošleme do 2 pracovních dnů. Připravíme pro vás konkrétní analýzu potenciálu toalet ve vaší lokalitě.
              </p>
            </div>

            {citySubmitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-300 rounded-[6px] space-y-2 text-left">
                <div className="flex items-center gap-2 font-['Overpass',sans-serif] font-[900] text-emerald-800 text-lg">
                  <CheckCircle2 size={24} className="text-emerald-600" />
                  <span>Děkujeme! Poptávka byla úspěšně odeslána.</span>
                </div>
                <p className="text-sm text-slate-700">
                  Pro zástupce města či regionu <strong>{cityMunicipality}</strong> připravujeme cenovou nabídku a ozveme se na e-mail {cityEmail} nejpozději do 2 pracovních dnů.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCitySubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city-municipality" className="block text-xs font-bold text-slate-800 uppercase mb-1">
                      Obec nebo region *
                    </label>
                    <input
                      id="city-municipality"
                      required
                      type="text"
                      value={cityMunicipality}
                      onChange={(e) => setCityMunicipality(e.target.value)}
                      placeholder="např. město Opava, DSO Hlučínsko, MAS..."
                      className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-[4px] focus:border-[#14294B] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="city-person" className="block text-xs font-bold text-slate-800 uppercase mb-1">
                      Jméno a příjmení *
                    </label>
                    <input
                      id="city-person"
                      required
                      type="text"
                      value={cityNamePerson}
                      onChange={(e) => setCityNamePerson(e.target.value)}
                      placeholder="např. Ing. Petr Novák"
                      className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-[4px] focus:border-[#14294B] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="city-role" className="block text-xs font-bold text-slate-800 uppercase mb-1">
                      Funkce *
                    </label>
                    <input
                      id="city-role"
                      required
                      type="text"
                      value={cityRole}
                      onChange={(e) => setCityRole(e.target.value)}
                      placeholder="Starosta / Místostarosta / Vedoucí odboru"
                      className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-[4px] focus:border-[#14294B] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="city-email" className="block text-xs font-bold text-slate-800 uppercase mb-1">
                      E-mail *
                    </label>
                    <input
                      id="city-email"
                      required
                      type="email"
                      value={cityEmail}
                      onChange={(e) => setCityEmail(e.target.value)}
                      placeholder="starosta@mesto.cz"
                      className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-[4px] focus:border-[#14294B] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="city-phone" className="block text-xs font-bold text-slate-800 uppercase mb-1">
                      Telefon *
                    </label>
                    <input
                      id="city-phone"
                      required
                      type="tel"
                      value={cityPhone}
                      onChange={(e) => setCityPhone(e.target.value)}
                      placeholder="+420 553 000 000"
                      className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-[4px] focus:border-[#14294B] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Povinné zaškrtávátko souhlasu */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] text-xs">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      required
                      type="checkbox"
                      checked={cityConsent}
                      onChange={(e) => setCityConsent(e.target.checked)}
                      className="mt-0.5 accent-[#14294B]"
                    />
                    <span className="text-slate-800 leading-snug">
                      Souhlasím se zpracováním osobních údajů společností <strong>Groovy Company s.r.o.</strong> za účelem zaslání cenové nabídky a navázání spolupráce se samosprávou.{' '}
                      <button
                        type="button"
                        onClick={() => setPrivacyOpen(true)}
                        className="text-[#14294B] underline font-bold inline"
                      >
                        Ochrana osobních údajů
                      </button>
                    </span>
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={citySubmitting}
                    className="h-12 px-8 bg-[#F5B700] hover:bg-[#E0A600] active:bg-[#C99500] text-[#14294B] font-['Overpass',sans-serif] font-[900] text-[16px] rounded-[4px] inline-flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
                  >
                    <Send size={18} />
                    <span>{citySubmitting ? 'Odesílám...' : 'Vyžádat cenovou nabídku'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. PRO KAVÁRNY A RESTAURACE                                */}
      {/* ========================================================= */}
      <section
        id="pro-podniky"
        className="scroll-mt-14 bg-slate-50 py-16 sm:py-24 px-5 sm:px-8 border-b-2 border-[#14294B]"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left: Info, Numbers and Benefits */}
          <div className="lg:col-span-6 space-y-6">
            <div className="text-xs font-['Overpass',sans-serif] font-[900] text-[#14294B] uppercase tracking-wider">
              Předregistrace provozoven
            </div>

            {/* Velké číslo a tarif Komfort */}
            <div className="space-y-2">
              <div className="font-['Overpass',sans-serif] font-[900] text-[42px] sm:text-[56px] text-[#14294B] leading-none tracking-tight">
                2 000 Kč <span className="text-[24px] sm:text-[28px] font-bold text-slate-700">měsíčně</span>
              </div>
              <div className="inline-block bg-[#F5B700]/30 border border-[#F5B700] text-[#14294B] px-3 py-1.5 rounded-[6px] text-sm font-semibold">
                Komfort s bezbariérovým WC nebo přebalovacím pultem: <strong>2 600 Kč měsíčně</strong>
              </div>
              <p className="font-['Atkinson_Hyperlegible_Next',sans-serif] text-[17px] text-slate-800 leading-[1.5] pt-1">
                Za to, že pustíte na toaletu i lidi bez nákupu. Vyplácíme jako nájem, každý měsíc.
              </p>
            </div>

            {/* Čtyři hlavní body dle zadání */}
            <ul className="space-y-2.5 text-[16px] text-slate-800 list-none p-0 font-medium">
              <li className="flex items-start gap-2.5">
                <span className="text-[#F5B700] text-lg font-black leading-none mt-0.5">•</span>
                <span>Peníze chodí každý měsíc do 20. dne, jako nájem.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#F5B700] text-lg font-black leading-none mt-0.5">•</span>
                <span>Nálepku, směrovku a zápis do map zařídíme my.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#F5B700] text-lg font-black leading-none mt-0.5">•</span>
                <span>Drobné škody na WC nahradíme.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#F5B700] text-lg font-black leading-none mt-0.5">•</span>
                <span>Můžete kdykoli skončit.</span>
              </li>
            </ul>

            {/* Ukázka nálepky v sekci pro podniky: /odskoc-si-nalepka.webp (fallback .png), max. šířka 360 px */}
            <div className="pt-2">
              <div className="text-xs font-['Overpass',sans-serif] font-[900] text-slate-600 uppercase tracking-wider mb-2">
                Ukázka označení provozovny:
              </div>
              <picture className="block">
                <source srcSet="/odskoc-si-nalepka.webp" type="image/webp" />
                <img
                  src="/odskoc-si-nalepka.png"
                  alt="Ukázka nálepky Odskoč si na dveřích provozovny"
                  className="w-full max-w-[360px] rounded-[12px] shadow-lg border border-slate-200 block"
                />
              </picture>
            </div>

            {/* Samostatný zvýrazněný box „Vaše pravidla platí“ */}
            <div className="p-5 bg-[#14294B] text-white rounded-[8px] border-l-4 border-[#F5B700] space-y-2 shadow-sm">
              <div className="font-['Overpass',sans-serif] font-[900] text-[18px] text-[#F5B700]">
                Vaše pravidla platí
              </div>
              <p className="text-[15px] text-slate-100 leading-relaxed font-normal">
                Podnik může odmítnout osoby pod vlivem alkoholu či drog a osoby, které narušují provoz. Klíč od WC můžete mít na baru a půjčovat ho na požádání.
              </p>
            </div>
          </div>

          {/* Right: Předregistrační formulář podniku */}
          <div className="lg:col-span-6 bg-white border-2 border-[#14294B] rounded-[8px] p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="font-['Overpass',sans-serif] font-[900] text-[22px] text-[#14294B] leading-tight">
                Nezávazná předregistrace podniku
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Zajistěte si místo v síti před spuštěním na jaře 2027. Ozveme se vám s podrobnostmi a návrhem smlouvy.
              </p>
            </div>

            {businessSubmitted ? (
              <div className="p-5 bg-emerald-50 border border-emerald-300 rounded-[6px] space-y-2">
                <div className="flex items-center gap-2 font-['Overpass',sans-serif] font-[900] text-emerald-800 text-base">
                  <CheckCircle2 size={20} className="text-emerald-600" />
                  <span>Děkujeme! Váš podnik byl zaevidován.</span>
                </div>
                <p className="text-sm text-slate-700">
                  Podnik <strong>{businessName}</strong> v obci <strong>{businessCity}</strong> evidujeme v předregistraci. Spojíme se s vámi před zahájením provozu.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBusinessSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label htmlFor="biz-name" className="block text-xs font-bold text-slate-800 uppercase mb-1">
                      Název podniku *
                    </label>
                    <input
                      id="biz-name"
                      required
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="např. Kavárna U Věže"
                      className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-[4px] focus:border-[#14294B] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="biz-city" className="block text-xs font-bold text-slate-800 uppercase mb-1">
                      Město *
                    </label>
                    <input
                      id="biz-city"
                      required
                      type="text"
                      value={businessCity}
                      onChange={(e) => setBusinessCity(e.target.value)}
                      placeholder="např. Ostrava, Opava, Krnov..."
                      className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-[4px] focus:border-[#14294B] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="biz-address" className="block text-xs font-bold text-slate-800 uppercase mb-1">
                    Adresa provozovny *
                  </label>
                  <input
                    id="biz-address"
                    required
                    type="text"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    placeholder="Ulice a orientační číslo"
                    className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-[4px] focus:border-[#14294B] focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="biz-contact" className="block text-xs font-bold text-slate-800 uppercase mb-1">
                    Kontaktní osoba *
                  </label>
                  <input
                    id="biz-contact"
                    required
                    type="text"
                    value={businessContactPerson}
                    onChange={(e) => setBusinessContactPerson(e.target.value)}
                    placeholder="Jméno a příjmení"
                    className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-[4px] focus:border-[#14294B] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label htmlFor="biz-phone" className="block text-xs font-bold text-slate-800 uppercase mb-1">
                      Telefon *
                    </label>
                    <input
                      id="biz-phone"
                      required
                      type="tel"
                      value={businessPhone}
                      onChange={(e) => setBusinessPhone(e.target.value)}
                      placeholder="+420 777 000 000"
                      className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-[4px] focus:border-[#14294B] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="biz-email" className="block text-xs font-bold text-slate-800 uppercase mb-1">
                      E-mail *
                    </label>
                    <input
                      id="biz-email"
                      required
                      type="email"
                      value={businessEmail}
                      onChange={(e) => setBusinessEmail(e.target.value)}
                      placeholder="kavarna@email.cz"
                      className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-[4px] focus:border-[#14294B] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Vybavení toalety */}
                <div className="pt-1 space-y-2">
                  <div className="text-xs font-bold text-slate-800 uppercase">Vybavení toalety:</div>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-800">
                    <input
                      type="checkbox"
                      checked={businessBarrierFree}
                      onChange={(e) => setBusinessBarrierFree(e.target.checked)}
                      className="accent-[#14294B]"
                    />
                    <span>Máme bezbariérové WC</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-800">
                    <input
                      type="checkbox"
                      checked={businessChangingTable}
                      onChange={(e) => setBusinessChangingTable(e.target.checked)}
                      className="accent-[#14294B]"
                    />
                    <span>Máme přebalovací pult</span>
                  </label>
                </div>

                {/* Povinné zaškrtávátko souhlasu */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] text-xs">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      required
                      type="checkbox"
                      checked={businessConsent}
                      onChange={(e) => setBusinessConsent(e.target.checked)}
                      className="mt-0.5 accent-[#14294B]"
                    />
                    <span className="text-slate-800 leading-snug">
                      Souhlasím se zpracováním osobních údajů společností <strong>Groovy Company s.r.o.</strong> za účelem navázání spolupráce a informování o spuštění sítě.{' '}
                      <button
                        type="button"
                        onClick={() => setPrivacyOpen(true)}
                        className="text-[#14294B] underline font-bold inline"
                      >
                        Ochrana osobních údajů
                      </button>
                    </span>
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={businessSubmitting}
                    className="w-full h-12 bg-[#14294B] hover:bg-[#1E3A67] active:bg-[#0D1C34] text-white font-['Overpass',sans-serif] font-[900] text-[15px] rounded-[4px] transition-colors cursor-pointer"
                  >
                    {businessSubmitting ? 'Odesílám...' : 'Odeslat nezávaznou předregistraci'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. FAQ (Rozbalovací otázky)                               */}
      {/* ========================================================= */}
      <section
        id="faq"
        className="scroll-mt-14 bg-white py-16 sm:py-24 px-5 sm:px-8 border-b-2 border-slate-200"
      >
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h2 className="font-['Overpass',sans-serif] font-[900] text-[34px] sm:text-[44px] text-[#14294B] leading-[1.0] tracking-[-0.5px] mb-3 text-left">
              Časté dotazy (FAQ)
            </h2>
            <p className="font-['Atkinson_Hyperlegible_Next',sans-serif] text-[18px] text-slate-700">
              Vše, co potřebujete vědět o přípravě sítě toalet a spuštění na jaře 2027.
            </p>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-[6px] bg-slate-50 border border-slate-300 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus-visible:bg-slate-100"
                    aria-expanded={isOpen}
                  >
                    <span className="font-['Overpass',sans-serif] font-[800] text-[17px] text-[#14294B] leading-[1.2]">
                      {item.q}
                    </span>
                    <ChevronDown
                      size={20}
                      className={`text-[#14294B] transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-[17px] text-slate-800 leading-[1.5] border-t border-slate-200 pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. FOOTER                                                 */}
      {/* ========================================================= */}
      <footer className="bg-[#14294B] text-white py-14 px-5 sm:px-8 border-t-2 border-[#1E3A67] select-none text-left">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left: Logo */}
            <div className="md:col-span-6 space-y-4">
              <Logo variant="dark" height={40} />
              <p className="font-['Atkinson_Hyperlegible_Next',sans-serif] text-[16px] text-slate-200 max-w-sm leading-[1.5]">
                WC zdarma. Bez nákupu v kavárnách a restauracích. Připravujeme první města a regiony, spouštíme na jaře 2027.
              </p>
            </div>

            {/* Contact info */}
            <div className="md:col-span-3 space-y-2 text-sm text-slate-200">
              <div className="font-['Overpass',sans-serif] font-[900] text-white text-sm uppercase tracking-wider mb-2">
                Kontakt
              </div>
              <div>E-mail: <a href="mailto:info@odskoc-si.cz" className="hover:text-[#F5B700] transition-colors underline">info@odskoc-si.cz</a></div>
              <div>Telefon: <a href="tel:+420553000000" className="hover:text-[#F5B700] transition-colors">+420 553 000 000</a></div>
              <div className="pt-1 text-slate-300">Správce sítě: <strong>Groovy Company s.r.o.</strong></div>
            </div>

            {/* Legal and Privacy */}
            <div className="md:col-span-3 space-y-2 text-sm text-slate-200">
              <div className="font-['Overpass',sans-serif] font-[900] text-white text-sm uppercase tracking-wider mb-2">
                Informace
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => setPrivacyOpen(true)}
                  className="hover:text-[#F5B700] transition-colors underline cursor-pointer text-left focus:outline-none"
                >
                  Ochrana osobních údajů (GDPR)
                </button>
              </div>
              <div className="text-[#F5B700] font-['Overpass',sans-serif] font-[800] pt-1">
                Zahájení zkušebního provozu: jaro 2027
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#1E3A67] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 gap-2">
            <div>
              © 2026 <strong>Odskoč si</strong> · Všechna práva vyhrazena.
            </div>
            <div>
              Projekt provozuje <strong>Groovy Company s.r.o.</strong>
            </div>
          </div>
        </div>
      </footer>

      {/* Privacy modal */}
      <PrivacyModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </div>
  );
};
