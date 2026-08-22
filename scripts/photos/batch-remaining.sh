#!/usr/bin/env bash
# One-off: converte + carica su R2 tutte le cartelle in originali/ non ancora
# processate. Riusa prepare-property-photos.mjs e upload-property-photos.mjs
# così com'sono (nessuna duplicazione di logica), cattura il loro output per
# stampare solo un riepilogo compatto per cartella.
set -euo pipefail

ORIGINALI="/Users/chiaracoscarella/PrataImmobiliare-foto/originali"
READY="/Users/chiaracoscarella/PrataImmobiliare-foto/ready-for-r2"
PROJECT="/Users/chiaracoscarella/PrataImmobiliare-website"
DONE_SLUGS="attico-pordenone-at-593 negozio-in-vendita-nv-259 villa-v-69"

cd "$PROJECT"

printf "%-10s %-8s %-8s %-14s %-14s %-10s\n" "CODICE" "TROVATE" "CARICATE" "PESO ORIG" "PESO FINALE" "RISPARMIO"
printf -- "-----------------------------------------------------------------------\n"

for dir in "$ORIGINALI"/*/; do
  code_raw="$(basename "$dir")"
  code="$(echo "$code_raw" | xargs)" # trim spazi
  [ "$code" = "" ] && continue

  slug="$(echo "$code" | tr '[:upper:]' '[:lower:]')"

  skip=0
  for d in $DONE_SLUGS; do
    [ "$slug" = "$d" ] && skip=1
  done
  # AT-593/NV-259/V-69 hanno slug diversi dal codice minuscolo: escludi per codice esplicito
  case "$code" in
    AT-593|NV-259|V-69) skip=1 ;;
  esac
  [ "$skip" = "1" ] && continue

  out_dir="$READY/$slug"

  prep_log=$(node scripts/photos/prepare-property-photos.mjs "$dir" "$out_dir" 2>&1) || {
    printf "%-10s ERRORE conversione — vedi log\n" "$code"
    echo "$prep_log" | tail -5
    continue
  }
  found=$(echo "$prep_log" | grep -o "Immagini trovate:[ ]*[0-9]*" | grep -o "[0-9]*")
  processed=$(echo "$prep_log" | grep -o "Immagini elaborate:[ ]*[0-9]*" | grep -o "[0-9]*")
  orig_kb=$(echo "$prep_log" | grep "Peso totale originale" | grep -o "[0-9]* KB")
  final_kb=$(echo "$prep_log" | grep "Peso totale finale" | grep -o "[0-9]* KB")
  saved=$(echo "$prep_log" | grep "Risparmio totale" | grep -o "\-[0-9]*%")

  upload_log=$(node --env-file=.env.local scripts/photos/upload-property-photos.mjs "$out_dir" "$slug" 2>&1) || {
    printf "%-10s %-8s ERRORE upload — vedi log\n" "$code" "$found"
    echo "$upload_log" | tail -8
    continue
  }
  uploaded=$(echo "$upload_log" | grep -o "Caricati [0-9]*/[0-9]*" | grep -o "^Caricati [0-9]*" | grep -o "[0-9]*")

  if echo "$upload_log" | grep -q "Esistono già oggetti"; then
    printf "%-10s %-8s %-8s %-14s %-14s %-10s  [SALTATO: oggetti già presenti su R2]\n" "$code" "$found" "0" "$orig_kb" "$final_kb" "$saved"
    continue
  fi

  printf "%-10s %-8s %-8s %-14s %-14s %-10s\n" "$code" "$found" "$uploaded" "$orig_kb" "$final_kb" "$saved"
done
