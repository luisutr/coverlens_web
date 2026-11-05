type LocalizationBlock = {
  interfaceLocales?: string[];
  subtitleLocales?: string[];
  audioLocales?: string[];
  castilian?: { text?: boolean; voices?: boolean };
};

let displayNamesEs: Intl.DisplayNames | null = null;

function localeDisplayName(locale: string): string {
  const code = locale.trim();
  if (!code) return '';
  try {
    if (!displayNamesEs) {
      displayNamesEs = new Intl.DisplayNames(['es'], { type: 'language' });
    }
    const [lang, region] = code.split('-');
    const langName = displayNamesEs.of(lang) ?? lang;
    return region && region !== lang.toUpperCase() ? `${langName} (${region})` : langName;
  } catch {
    return code;
  }
}

function uniqueLocales(...lists: (string[] | undefined)[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const list of lists) {
    for (const loc of list ?? []) {
      const key = loc.trim();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(key);
    }
  }
  out.sort();
  return out;
}

/** Texto/subtítulos: todos los idiomas IGDB, o castellano si no hay lista. */
export function formatLocalizationText(localization: LocalizationBlock | null | undefined): string | null {
  if (!localization) return null;
  const locales = uniqueLocales(localization.interfaceLocales, localization.subtitleLocales);
  if (locales.length) {
    return locales.map(localeDisplayName).join(', ');
  }
  if (localization.castilian?.text) return 'Español (castellano)';
  return null;
}

/** Voces: todos los idiomas IGDB, o castellano si no hay lista. */
export function formatLocalizationVoice(localization: LocalizationBlock | null | undefined): string | null {
  if (!localization) return null;
  const locales = uniqueLocales(localization.audioLocales);
  if (locales.length) {
    return locales.map(localeDisplayName).join(', ');
  }
  if (localization.castilian?.voices) return 'Español (castellano)';
  return null;
}
