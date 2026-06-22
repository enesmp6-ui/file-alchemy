import type { Tier } from "@/lib/useWeeklyLimit";

export type Plan = {
  tier: Tier;
  price: string;
  priceSub?: string;
  tagline: string;
  perks: string[];
  cta: string;
  featured?: boolean;
};

export const PLANS: Plan[] = [
  {
    tier: "guest",
    price: "₺0",
    priceSub: "her zaman",
    tagline: "Hesap açmadan dene.",
    perks: [
      "Haftada 5 dosya",
      "Maks. 10MB / dosya",
      "Tarayıcıda dönüşüm",
      "Hiçbir veri sunucuya çıkmaz",
    ],
    cta: "Misafir Olarak Devam Et",
  },
  {
    tier: "free",
    price: "₺0",
    priceSub: "üyelikle ücretsiz",
    tagline: "Hafif kullanım için yeterli.",
    perks: [
      "Haftada 20 dosya",
      "Maks. 50MB / dosya",
      "Geçmiş ve tercihler",
      "Birden fazla cihazda senkron",
    ],
    cta: "Ücretsiz Üye Ol",
  },
  {
    tier: "pro",
    price: "₺149",
    priceSub: "aylık · 14 gün ücretsiz dene",
    tagline: "Sınırları kaldır.",
    perks: [
      "Haftada 200 dosya",
      "Maks. 500MB / dosya",
      "Öncelikli işleme kuyruğu",
      "Toplu ZIP indirme",
      "Premium destek",
    ],
    cta: "Pro'yu 14 Gün Dene",
    featured: true,
  },
];
