const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Validazione strutturale (pre-R2): campi obbligatori, ID/slug unici e
 * ben formati, coerenza prezzo/canone. Le righe completamente vuote
 * (nessun ID, nessun titolo, nessuno slug) sono ignorate in silenzio —
 * sono normali righe di coda in un foglio Google.
 */
export function validateDataset(records) {
  const errors = [];
  const warnings = [];
  const seenIds = new Map();
  const seenSlugs = new Map();

  const rows = records.filter(({ property }) => {
    const blank = !property.id && !property.title && !property.slug;
    return !blank;
  });

  for (const { rowIndex, property } of rows) {
    const where = `riga ${rowIndex} (${property.id || property.slug || 'senza ID'})`;

    if (!property.id) {
      errors.push(`${where}: ID mancante`);
    } else if (seenIds.has(property.id)) {
      errors.push(`ID duplicato "${property.id}" (righe ${seenIds.get(property.id)} e ${rowIndex})`);
    } else {
      seenIds.set(property.id, rowIndex);
    }

    if (!property.slug) {
      errors.push(`${where}: Slug mancante`);
    } else {
      if (!SLUG_RE.test(property.slug)) {
        errors.push(
          `${where}: slug "${property.slug}" non è url-safe (solo lettere minuscole, numeri e trattini)`
        );
      }
      if (seenSlugs.has(property.slug)) {
        errors.push(`Slug duplicato "${property.slug}" (righe ${seenSlugs.get(property.slug)} e ${rowIndex})`);
      } else {
        seenSlugs.set(property.slug, rowIndex);
      }
    }

    if (property.visible) {
      if (!property.title) errors.push(`${where}: Titolo mancante (obbligatorio se Visibile=SI)`);
      if (!property.location.comune) errors.push(`${where}: Comune mancante (obbligatorio se Visibile=SI)`);
      if (!property.propertyType) errors.push(`${where}: Tipologia mancante (obbligatorio se Visibile=SI)`);
      if (!property.transactionType)
        errors.push(`${where}: Contratto mancante o non valido (deve essere "Vendita" o "Affitto")`);
      if (!property.status) errors.push(`${where}: Stato mancante (obbligatorio se Visibile=SI)`);

      if (
        property.transactionType === 'vendita' &&
        property.price === null &&
        !property.priceOnRequest
      ) {
        errors.push(`${where}: in vendita senza Prezzo e senza Prezzo su richiesta`);
      }
      if (
        property.transactionType === 'affitto' &&
        property.monthlyRent === null &&
        !property.priceOnRequest
      ) {
        errors.push(`${where}: in affitto senza Canone mensile e senza Prezzo su richiesta`);
      }
    }
  }

  return { errors, warnings, rows };
}

/** Da chiamare dopo la discovery R2: un immobile visibile senza foto è un errore critico. */
export function validateImages(rows) {
  const errors = [];
  for (const { rowIndex, property } of rows) {
    if (property.visible && property.images.length === 0) {
      errors.push(
        `riga ${rowIndex} (${property.slug}): visibile ma nessuna fotografia trovata su R2 in immobili/${property.slug}/`
      );
    }
  }
  return errors;
}
