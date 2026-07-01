## Kapsam

`src/components/Converter.tsx` merkezli, backend'e ve limit motoruna dokunmadan üç yönlü genişletme.

## 1. Web Worker + dosya başı ilerleme

- `src/workers/convert.worker.ts` — OffscreenCanvas ile decode + encode, `postMessage` ile `{ id, progress, blob }` akıtır. Fallback: OffscreenCanvas yoksa ana thread'de çalışır.
- Converter içinde `Map<id, { name, status, progress, ... }>` state; her dosya için ince gradient progress bar (0–100), durum rozeti (kuyrukta / dönüşüyor / hazır / hata).
- Toplu bar: "3/12 tamamlandı" + genel yüzde.
- Cancel butonu (worker'a `abort` mesajı, `URL.revokeObjectURL` temizliği).

## 2. Gelişmiş dönüştürme paneli

Format/kalite satırının altında katlanır "Gelişmiş" bölümü:

- **Yeniden boyutlandır**: maks. genişlik/yükseklik input'ları + "en-boy oranını koru" toggle.
- **Kırp**: preset oranlar (Orijinal, 1:1, 4:3, 16:9) — merkezden kırpma; MVP için görsel kırpma UI'ı yok, oran seçimi yeterli.
- **Filigran**: metin, konum (9 nokta grid), opaklık slider, boyut (S/M/L), renk (siyah/beyaz). Canvas üstüne `fillText` ile uygulanır.

Ayarlar worker'a payload olarak gider; state Converter'da tutulur, i18n key'leri `en.json` / `tr.json`'a eklenir.

## 3. Yeni format desteği

Bağımlılık: `pdfjs-dist` (PDF → görsel decode), `jspdf` (görsel → PDF encode), `utif` (TIFF decode). GIF ve BMP için tarayıcı `Image` decode'u yeterli; encode tarafında GIF için `gifenc`, BMP için elle yazılmış küçük encoder.

- **Kaynak formatları**: PNG, JPG, WEBP, GIF, BMP, TIFF, PDF (her sayfa ayrı görsel).
- **Hedef formatları**: PNG, JPG, WEBP, GIF, BMP, PDF (çoklu dosyayı tek PDF'e birleştirme opsiyonu).
- Kabul edilen MIME/uzantı listesi ve dropzone metni güncellenir.
- PDF encode/decode ana thread'de dinamik `import()` ile lazy yüklenir; ilk sayfa Vite chunk'ı olarak ayrışır.

## 4. Sunucu tarafı hizalama (minimum)

`check-and-consume-limit` ve `guest-limit-check` `sourceFormat`/`targetFormat` alanlarını zaten serbest metin kabul ediyor — sadece yeni değerlerin sözlüğünü dokümante edeceğim, şema değişikliği yok, migration yok.

## Dokunulmayacaklar

- Auth, RLS, edge function iş mantığı, limit hesaplama, referral, API key.
- Tema, i18n altyapısı, route ağacı, footer/navbar.

## Doğrulama

- `tsgo` typecheck.
- Preview'da: PNG batch (worker + progress), 4000px görselin 1024'e resize'ı, filigranlı JPG çıktı, PDF'in sayfalara ayrılıp PNG batch'i olarak indirilmesi, PNG'lerin tek PDF'e birleştirilmesi.
