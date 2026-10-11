import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs text-left font-['Archivo',sans-serif]">
      <div className="bg-white text-[#14294B] rounded-[8px] max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 border-2 border-[#14294B]">
        {/* Header */}
        <div className="h-14 bg-[#14294B] text-white px-5 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 font-['Archivo',sans-serif] font-[900] text-base">
            <ShieldCheck size={20} className="text-[#F5B700]" />
            <span>Ochrana osobních údajů</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-[4px] hover:bg-[#1E3A67] text-white transition-colors cursor-pointer"
            aria-label="Zavřít"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-[16px] text-slate-700 leading-relaxed">
          <div>
            <h4 className="font-['Archivo',sans-serif] font-[900] text-[#14294B] text-lg mb-1">
              Správce osobních údajů
            </h4>
            <p>
              Správcem osobních údajů zpracovávaných v&nbsp;rámci projektu „Odskoč si“ je společnost:
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] mt-2 font-bold text-[#14294B]">
              Groovy Company s.r.o.
            </div>
          </div>

          <div>
            <h4 className="font-['Archivo',sans-serif] font-[900] text-[#14294B] text-lg mb-1">
              Účel zpracování údajů
            </h4>
            <p>
              Vaše osobní údaje (zejména e-mail, telefon, jméno, název podniku nebo města) shromažďujeme a&nbsp;zpracováváme výhradně za těmito účely:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 mt-2">
              <li>
                <strong>Informování o&nbsp;spuštění sítě:</strong> Zaslání jednorázového či občasného oznámení, jakmile síť „Odskoč si“ zahájí provoz ve vašem městě nebo lokalitě, kterou jste označili na mapě zájmu.
              </li>
              <li>
                <strong>Navázání spolupráce:</strong> Komunikace s&nbsp;provozovateli kaváren a&nbsp;restaurací k&nbsp;předregistraci a&nbsp;dojednání podmínek zapojení do sítě.
              </li>
              <li>
                <strong>Příprava zkušebního provozu s&nbsp;městy:</strong> Komunikace se zástupci obcí a&nbsp;městských částí k&nbsp;představení systému a&nbsp;přípravě vzorové smlouvy pro samosprávu.
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-['Archivo',sans-serif] font-[900] text-[#14294B] text-lg mb-1">
              Rozsah a&nbsp;doba uchování
            </h4>
            <p>
              Údaje zpracováváme na základě vašeho dobrovolného souhlasu uděleného odesláním formuláře či hlasu. Údaje neposkytujeme žádným neoprávněným třetím stranám a&nbsp;uchováváme je po dobu přípravy a&nbsp;zkušebního provozu sítě (nejdéle do odvolání vašeho souhlasu).
            </p>
          </div>

          <div>
            <h4 className="font-['Archivo',sans-serif] font-[900] text-[#14294B] text-lg mb-1">
              Vaše práva
            </h4>
            <p>
              Máte právo svůj souhlas kdykoliv odvolat, požadovat informaci o&nbsp;zpracovávaných údajích, jejich opravu či výmaz. V&nbsp;případě dotazů nás kontaktujte na e-mailu: <strong>info@odskocsi.cz</strong>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 bg-[#14294B] hover:bg-[#1E3A67] text-white font-['Archivo',sans-serif] font-[900] text-xs rounded-[4px] transition-colors cursor-pointer"
          >
            Rozumím a&nbsp;zavřít
          </button>
        </div>
      </div>
    </div>
  );
};
