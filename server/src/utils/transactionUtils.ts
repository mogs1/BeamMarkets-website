

// Generate a unique transaction ID
export const generateTransactionId = (): string => {
  const timestamp = new Date().getTime().toString();
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `TXN${timestamp.slice(-6)}${random}`;
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(amount);
};
