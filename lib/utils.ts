export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ar-JO", {
    style: "currency",
    currency: "JOD",
  }).format(amount);
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  // Jordan phone numbers are typically 9 digits starting with 7 (e.g., 7XXXXXXXX)
  if (cleaned.length === 9) {
    return `+962${cleaned}`;
  }
  return phone;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhoneNumber(phone: string): boolean {
  // Jordan phone regex: starts with +962 or 0, then 7, then 8 digits
  const phoneRegex = /^(\+962|0)?7[0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}
