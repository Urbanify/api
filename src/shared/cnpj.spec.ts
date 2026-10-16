import { isValidCnpj } from './cnpj';

describe('isValidCnpj', () => {
  it('accepts a CNPJ with correct verifier digits', () => {
    expect(isValidCnpj('11222333000181')).toBe(true);
  });

  it('rejects a CNPJ with a wrong verifier digit', () => {
    expect(isValidCnpj('11222333000182')).toBe(false);
    expect(isValidCnpj('11222333000191')).toBe(false);
  });

  it('rejects repeated digits even though they pass the arithmetic', () => {
    expect(isValidCnpj('00000000000000')).toBe(false);
  });

  it('rejects anything that is not exactly 14 digits', () => {
    expect(isValidCnpj('1122233300018')).toBe(false);
    expect(isValidCnpj('11.222.333/0001-81')).toBe(false);
    expect(isValidCnpj('')).toBe(false);
  });
});
