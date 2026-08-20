/**
 * Il generatore del dataset normalizza già ogni campo assente a `null`
 * (numeri) o stringa vuota→null, quindi in teoria il frontend non dovrebbe
 * mai vedere uno "zero finto". Questo helper resta comunque il punto unico
 * di verità per "il dato c'è?", così nessun componente reinventa la regola
 * (0 / "0" / "" / null / undefined = assente) caso per caso.
 */
export function isMeaningfulValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'number') return value !== 0 && !Number.isNaN(value);
  if (typeof value === 'string') return value.trim() !== '' && value.trim() !== '0';
  if (typeof value === 'boolean') return value === true;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}
