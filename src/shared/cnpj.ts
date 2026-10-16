const FIRST_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const SECOND_WEIGHTS = [6, ...FIRST_WEIGHTS];

function checkDigit(digits: number[], weights: number[]): number {
  const sum = weights.reduce((acc, weight, i) => acc + weight * digits[i], 0);
  const rest = sum % 11;
  return rest < 2 ? 0 : 11 - rest;
}

// Since July 2026 the Receita also issues alphanumeric CNPJs: the first 12 characters may be
// A-Z, and each character counts as its ASCII code minus 48, so digits keep their value.
// Repeated characters (00000000000000) pass the arithmetic, so they are rejected explicitly.
export function isValidCnpj(value: string): boolean {
  if (!/^[A-Z0-9]{12}\d{2}$/.test(value) || /^(.)\1{13}$/.test(value)) {
    return false;
  }

  const values = [...value].map((char) => char.charCodeAt(0) - 48);
  const first = checkDigit(values, FIRST_WEIGHTS);
  const second = checkDigit([...values.slice(0, 12), first], SECOND_WEIGHTS);

  return values[12] === first && values[13] === second;
}
