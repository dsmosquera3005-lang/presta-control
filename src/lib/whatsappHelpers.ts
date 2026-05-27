export const normalizePhoneNumber = (phone: string): string | null => {
  const digits = phone.replace(/\D+/g, "");
  if (!digits) return null;

  if (digits.length === 8) {
    return `507${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("507")) {
    return digits;
  }

  if (digits.length === 10 && digits.startsWith("57")) {
    return digits;
  }

  if (digits.length === 12 && digits.startsWith("57")) {
    return digits;
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    return `57${digits.slice(1)}`;
  }

  return null;
};

export const buildWhatsAppMessage = (
  payment: { amount: number; payment_type: string; notes: string | null },
  client: { full_name: string },
  receiptUrl?: string,
): string => {
  const fmt = (n: number) =>
    new Intl.NumberFormat("es", { style: "currency", currency: "USD" }).format(n);

  const amount = Number(payment.amount);
  const base = `Hola ${client.full_name}, hemos registrado su `;

  let message = "";
  switch (payment.payment_type) {
    case "interes":
      message = `${base}pago de interés por ${fmt(amount)}.`;
      break;
    case "total":
      message = `${base}pago total por ${fmt(amount)}.`;
      break;
    case "abono":
      message = `${base}abono por ${fmt(amount)}.`;
      break;
    case "renovacion":
      message = `${base}pago de renovación por ${fmt(amount)}.`;
      break;
    case "adicional":
      message = `${base}pago adicional por ${fmt(amount)}.`;
      break;
    default:
      message = `${base}pago por ${fmt(amount)}.`;
  }

  if (payment.notes) {
    message += `\nNota: ${payment.notes}.`;
  }

  message += " Gracias por su pago.";

  if (receiptUrl) {
    message += `\n\nPuede ver su comprobante aquí: ${receiptUrl}`;
  }

  return message;
};
