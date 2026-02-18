export type Locale = "en" | "pt-BR";

const translations = {
  en: {
    "completion.title": "Amazing Work!",
    "completion.subtitle": "You traced every letter and number!",
    "completion.detail": "A\u2013Z, a\u2013z, and 0\u20139 \u2014 all 62 characters!",
    "completion.restart": "Start Over",
    "celebration.title": "Amazing!",
    "celebration.next": "Next",
    "celebration.finish": "Celebrate!",
    "settings.ariaLabel": "Settings",
    "settings.font": "Font",
    "settings.size": "Size: {{value}}px",
    "settings.weight": "Weight: {{value}}",
    "settings.brush": "Brush: {{value}}",
    "settings.goal": "Goal: {{value}}%",
    "settings.color": "Color",
    "settings.jumpToLetter": "Jump to Letter",
    "settings.language": "Language",
    "color.coral": "Coral",
    "color.blue": "Blue",
    "color.teal": "Teal",
    "color.purple": "Purple",
    "color.orange": "Orange",
    "color.pink": "Pink",
    "color.navy": "Navy",
    "progress.coverage": "Coverage",
    "clear.ariaLabel": "Clear drawing",
    "font.search": "Search fonts...",
    "font.category.handwriting": "Handwriting",
    "font.category.sans-serif": "Sans Serif",
    "font.category.serif": "Serif",
    "font.category.display": "Display",
    "font.searchResults": "Google Fonts",
    "font.noResults": "No fonts found",
    "font.loadError": "Could not search fonts",
  },
  "pt-BR": {
    "completion.title": "Trabalho Incrível!",
    "completion.subtitle": "Você traçou todas as letras e números!",
    "completion.detail": "A\u2013Z, a\u2013z e 0\u20139 \u2014 todos os 62 caracteres!",
    "completion.restart": "Começar de Novo",
    "celebration.title": "Incrível!",
    "celebration.next": "Próximo",
    "celebration.finish": "Celebrar!",
    "settings.ariaLabel": "Configurações",
    "settings.font": "Fonte",
    "settings.size": "Tamanho: {{value}}px",
    "settings.weight": "Peso: {{value}}",
    "settings.brush": "Pincel: {{value}}",
    "settings.goal": "Meta: {{value}}%",
    "settings.color": "Cor",
    "settings.jumpToLetter": "Ir para Letra",
    "settings.language": "Idioma",
    "color.coral": "Coral",
    "color.blue": "Azul",
    "color.teal": "Verde-azulado",
    "color.purple": "Roxo",
    "color.orange": "Laranja",
    "color.pink": "Rosa",
    "color.navy": "Marinho",
    "progress.coverage": "Cobertura",
    "clear.ariaLabel": "Limpar desenho",
    "font.search": "Buscar fontes...",
    "font.category.handwriting": "Manuscrita",
    "font.category.sans-serif": "Sem Serifa",
    "font.category.serif": "Serifada",
    "font.category.display": "Decorativa",
    "font.searchResults": "Google Fonts",
    "font.noResults": "Nenhuma fonte encontrada",
    "font.loadError": "Não foi possível buscar fontes",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["en"];

export function t(
  locale: Locale,
  key: TranslationKey,
  params?: Record<string, string | number>
): string {
  const value = translations[locale][key] ?? translations.en[key] ?? key;
  if (!params) return value;
  return value.replace(/\{\{(\w+)\}\}/g, (_, k) =>
    params[k] !== undefined ? String(params[k]) : `{{${k}}}`
  );
}

export function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "pt-BR";
  return navigator.language.startsWith("pt") ? "pt-BR" : "en";
}
