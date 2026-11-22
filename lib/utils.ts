export function formatCurrency(amount: number, currency: string = 'USD') {
  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol',
  }).format(amount);

  return formatted.replace(/[\u00A0\u202F]/g, ' ');
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
