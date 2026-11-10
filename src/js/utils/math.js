export function getPositiveModulo(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}
