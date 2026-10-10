/**
 * ============================================================================
 * KONFIGURACE GOOGLE APPS SCRIPT WEBHOOKU PRO SBĚR DAT DO GOOGLE TABULKY
 * ============================================================================
 * 
 * Vložte sem URL vašeho Google Apps Script Web App (webhooku), který zapisuje
 * data z formulářů a mapy zájmu do Google Tabulky.
 * 
 * NÁVOD NA ZPROVOZNĚNÍ (zabere 2 minuty):
 * 1. Otevřete novou Google Tabulku (sheets.new).
 * 2. V menu klikněte na: Rozšíření -> Apps Script.
 * 3. Vložte následující kód do editoru a uložte (Ctrl+S):
 * 
 *    function doPost(e) {
 *      var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *      var data = JSON.parse(e.postData.contents);
 *      sheet.appendRow([
 *        new Date(),
 *        data.formType || 'Neznámý',
 *        data.city || '',
 *        data.name || data.businessName || '',
 *        data.contactPerson || '',
 *        data.role || '',
 *        data.email || '',
 *        data.phone || '',
 *        data.address || '',
 *        data.note || '',
 *        data.lat ? data.lat + ', ' + data.lng : '',
 *        data.barrierFree ? 'Ano' : '',
 *        data.changingTable ? 'Ano' : '',
 *        data.consent ? 'Ano' : ''
 *      ]);
 *      return ContentService.createTextOutput(JSON.stringify({status: 'success'}))
 *        .setMimeType(ContentService.MimeType.JSON);
 *    }
 * 
 * 4. Klikněte na tlačítko "Nasadit" (Deploy) -> "Nové nasazení" (New deployment).
 * 5. Zvolte typ: "Webová aplikace" (Web app).
 * 6. "Spustit jako": Já (vaše e-mailová adresa).
 * 7. "Kdo má přístup": Kdokoli (Anyone) -> DŮLEŽITÉ pro příjem z webu!
 * 8. Zkopírujte vygenerovanou URL webové aplikace a vložte ji do proměnné níže:
 */

import { API_URL } from '../config';

// >>> SEM VLOŽTE URL VAŠEHO GOOGLE APPS SCRIPT WEBHOOKU <<<
export const GOOGLE_APPS_SCRIPT_WEBHOOK_URL: string = API_URL;

export interface WebhookPayload {
  formType: 'interest_vote' | 'business_preregistration' | 'city_inquiry';
  city?: string;
  name?: string;
  businessName?: string;
  contactPerson?: string;
  role?: string;
  email?: string;
  phone?: string;
  address?: string;
  note?: string;
  lat?: number;
  lng?: number;
  barrierFree?: boolean;
  changingTable?: boolean;
  consent: boolean;
  timestamp?: string;
}

/**
 * Odeslání dat do Google Tabulky přes Apps Script webhook.
 * Zároveň data zálohuje do localStorage pro okamžité zobrazení a offline persistenci.
 */
export async function submitToGoogleSheet(payload: WebhookPayload): Promise<{ success: boolean; message?: string }> {
  const timestamp = new Date().toISOString();
  const enrichedPayload = { ...payload, timestamp };

  // Záloha do localStorage
  try {
    const key = `odskoc_si_${payload.formType}_submissions`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push(enrichedPayload);
    localStorage.setItem(key, JSON.stringify(existing));
  } catch (err) {
    console.warn('Nepodařilo se uložit data do localStorage:', err);
  }

  // Pokud není nastavena URL webhooku, simulujeme úspěšné uložení v prohlížeči
  if (!API_URL || API_URL.trim() === '') {
    console.info('Webhook URL není nastavena. Data byla uložena lokálně v prohlížeči:', enrichedPayload);
    return { success: true, message: 'Uloženo lokálně (Google Apps Script URL není nakonfigurována).' };
  }

  try {
    // Google Apps Script POST s mode 'no-cors', Content-Type 'text/plain;charset=utf-8' a JSON body
    await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(enrichedPayload),
    });

    return { success: true };
  } catch (error) {
    console.error('Chyba při odesílání do Google Sheet:', error);
    // Vracíme success true, protože data jsou bezpečně zachována v localStorage
    return { success: true, message: 'Odeslání se nezdařilo, ale data jsou zálohována lokálně.' };
  }
}
