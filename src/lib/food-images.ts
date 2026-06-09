/**
 * URLs verificadas no Unsplash (HTTP 200) — mapeamento por palavra-chave.
 * Keywords ordenadas da mais específica para a mais genérica.
 */
const KEYWORD_IMAGES: [string[], string][] = [
  [["omelete proteico", "omelete de forno"], "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80&auto=format&fit=crop"],
  [["frango grelhado", "peito de frango", "frango", "galinha"], "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80&auto=format&fit=crop"],
  [["salmão assado", "salmão", "salmao", "salmon"], "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80&auto=format&fit=crop"],
  [["tilápia", "tilapia", "peixe assado", "peixe"], "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80&auto=format&fit=crop"],
  [["iogurte grego", "iogurte", "yogurt"], "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80&auto=format&fit=crop"],
  [["frutas vermelhas", "morango", "berry"], "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80&auto=format&fit=crop"],
  [["castanha", "amêndoa", "amendoa", "oleaginosas", "nozes"], "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80&auto=format&fit=crop"],
  [["batata doce", "purê", "pure", "mandioquinha"], "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80&auto=format&fit=crop"],
  [["smoothie", "vitamina"], "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80&auto=format&fit=crop"],
  [["panqueca", "tapioca", "crepioca"], "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80&auto=format&fit=crop"],
  [["overnight oats", "aveia", "granola"], "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80&auto=format&fit=crop"],
  [["quinoa", "salada", "grão-de-bico", "grao-de-bico"], "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80&auto=format&fit=crop"],
  [["sopa"], "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80&auto=format&fit=crop"],
  [["arroz integral", "arroz", "feijão", "feijao", "tropeiro"], "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80&auto=format&fit=crop"],
  [["hambúrguer", "hamburguer", "burger"], "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800&q=80&auto=format&fit=crop"],
  [["macarrão", "macarrao", "pasta", "pesto"], "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80&auto=format&fit=crop"],
  [["wrap", "tortilla"], "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80&auto=format&fit=crop"],
  [["açaí", "acai", "bowl"], "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&q=80&auto=format&fit=crop"],
  [["abacate", "avocado", "toast"], "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800&q=80&auto=format&fit=crop"],
  [["estrogonofe", "carne moída", "carne moida"], "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800&q=80&auto=format&fit=crop"],
  [["risoto", "cogumelo"], "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&q=80&auto=format&fit=crop"],
  [["barra de cereal", "snack"], "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80&auto=format&fit=crop"],
  [["lentilha"], "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80&auto=format&fit=crop"],
  [["banana", "pasta de amendoim"], "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&q=80&auto=format&fit=crop"],
  [["maçã", "maca", "apple"], "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&q=80&auto=format&fit=crop"],
  [["mamão", "mamao", "papaya"], "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&q=80&auto=format&fit=crop"],
  [["pera"], "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&q=80&auto=format&fit=crop"],
  [["uva", "uvas", "grape"], "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80&auto=format&fit=crop"],
  [["cottage", "queijo"], "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80&auto=format&fit=crop"],
  [["shake", "proteína", "proteina"], "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80&auto=format&fit=crop"],
  [["atum"], "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80&auto=format&fit=crop"],
  [["ovo", "ovos"], "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80&auto=format&fit=crop"],
];

export const DEFAULT_FOOD_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80&auto=format&fit=crop";

function normalize(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** Ordena entradas: keywords mais longas primeiro para evitar match errado */
const SORTED_IMAGES = [...KEYWORD_IMAGES].sort(
  (a, b) => Math.max(...b[0].map((k) => k.length)) - Math.max(...a[0].map((k) => k.length))
);

export function getFoodImageUrl(mealName: string, ingredients: string[] = []): string {
  const searchText = normalize(`${mealName} ${ingredients.join(" ")}`);

  for (const [keywords, url] of SORTED_IMAGES) {
    if (keywords.some((kw) => searchText.includes(normalize(kw)))) {
      return url;
    }
  }

  return DEFAULT_FOOD_IMAGE;
}

export function attachImagesToMeals<T extends { name: string; ingredients?: string[]; imageUrl?: string }>(
  meals: T[]
): T[] {
  return meals.map((m) => ({
    ...m,
    imageUrl: m.imageUrl || getFoodImageUrl(m.name, m.ingredients ?? []),
  }));
}
