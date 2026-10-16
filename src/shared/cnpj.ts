const FIRST_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const SECOND_WEIGHTS = [6, ...FIRST_WEIGHTS];

function checkDigit(digits: number[], weights: number[]): number {
  const sum = weights.reduce((acc, weight, i) => acc + weight * digits[i], 0);
  const rest = sum % 11;
  return rest < 2 ? 0 : 11 - rest;
}

// Checks the two verifier digits of a 14-digit CNPJ. Repeated digits (00000000000000)
// pass the arithmetic, so they are rejected explicitly.
export function isValidCnpj(value: string): boolean {
  if (!/^\d{14}$/.test(value) || /^(\d)\1{13}$/.test(value)) {
    return false;
  }

  const digits = value.split('').map(Number);
  const first = checkDigit(digits, FIRST_WEIGHTS);
  const second = checkDigit([...digits.slice(0, 12), first], SECOND_WEIGHTS);

  return digits[12] === first && digits[13] === second;
}
