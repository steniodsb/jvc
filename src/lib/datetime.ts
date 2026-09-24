// O painel trabalha no horário de Brasília (UTC-3, sem horário de verão desde 2019).
const OFFSET = "-03:00";

/** "2026-09-24T10:30" (input datetime-local) → ISO UTC */
export function localInputToIso(value: string | null | undefined): string | null {
  if (!value) return null;
  const d = new Date(`${value}:00${OFFSET}`);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

/** ISO UTC → "2026-09-24T10:30" para preencher datetime-local */
export function isoToLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(new Date(iso).getTime() - 3 * 3600 * 1000);
  return d.toISOString().slice(0, 16);
}

export function daysAgoIso(days: number) {
  return new Date(Date.now() - days * 864e5).toISOString();
}
