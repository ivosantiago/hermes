interface GoogleFontEntry {
  family: string;
  category: string;
}

let cachedFonts: GoogleFontEntry[] | null = null;
let fetchPromise: Promise<GoogleFontEntry[]> | null = null;

async function fetchFontList(): Promise<GoogleFontEntry[]> {
  if (cachedFonts) return cachedFonts;
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    try {
      const res = await fetch("https://fonts.google.com/metadata/fonts");
      if (!res.ok) return [];
      let text = await res.text();
      // Strip XSSI prefix
      if (text.startsWith(")]}'")) {
        text = text.slice(4);
      }
      const data = JSON.parse(text);
      const fonts: GoogleFontEntry[] = (data.familyMetadataList ?? []).map(
        (entry: { family: string; category: string }) => ({
          family: entry.family,
          category: entry.category,
        })
      );
      cachedFonts = fonts;
      return fonts;
    } catch {
      return [];
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

export async function searchGoogleFonts(
  query: string
): Promise<{ family: string; category: string }[]> {
  if (!query.trim()) return [];

  const fonts = await fetchFontList();
  if (fonts.length === 0) return [];

  const lower = query.toLowerCase();
  return fonts
    .filter((f) => f.family.toLowerCase().includes(lower))
    .slice(0, 20);
}
