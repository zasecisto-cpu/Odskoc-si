export const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzY-toW2APm9wSReLrNGAHWzvl7aG8S74TFm8987IQDfwMDUPrNn87rYXHNUhYYKQLt/exec';

export async function submitToGoogleSheet(data: Record<string, unknown>): Promise<boolean> {
  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data),
    });
    return true;
  } catch (err) {
    console.error('Odeslání formuláře selhalo', err);
    return false;
  }
}
