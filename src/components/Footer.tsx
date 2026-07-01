import { Link } from "@tanstack/react-router";
import { useI18n, type Locale } from "@/lib/I18nContext";

export function Footer() {
  const { locale, setLocale, t } = useI18n();
  const other: Locale = locale === "en" ? "tr" : "en";

  return (
    <footer className="border-t border-white/5 bg-black py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
                <span className="text-black font-black text-lg">i</span>
              </div>
              <span className="text-lg font-black tracking-tighter uppercase">iFlexi</span>
            </Link>
            <p className="mt-10 max-w-sm text-sm font-medium leading-relaxed text-zinc-500">
              Sadece basit bir dosya dönüştürücü değil; verilerinizi anlık işleyen güvenli bir altyapı ekosistemi. Dosya yönetiminizi yeni nesil SaaS standartlarıyla geleceğe taşıyın.
            </p>
            <div className="mt-10 flex gap-6">
              <div className="h-6 w-6 rounded-lg bg-white/5 border border-white/10" />
              <div className="h-6 w-6 rounded-lg bg-white/5 border border-white/10" />
              <div className="h-6 w-6 rounded-lg bg-white/5 border border-white/10" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-12 sm:grid-cols-3">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Ürün</h4>
              <ul className="mt-8 space-y-5">
                <li><Link to="/pricing" className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">Fiyatlandırma</Link></li>
                <li><Link to="/limits" className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">Kullanım</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Destek</h4>
              <ul className="mt-8 space-y-5">
                <li><Link to="/about" className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">Hakkımızda</Link></li>
                <li><Link to="/" className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">Dökümantasyon</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Yasal</h4>
              <ul className="mt-8 space-y-5">
                <li><Link to="/" className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">Gizlilik</Link></li>
                <li><Link to="/" className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">Şartlar</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-24 border-t border-white/5 pt-12 flex flex-col sm:flex-row justify-between items-center gap-8">
          <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
            © 2024 iFlexi. Tüm hakları saklıdır.
          </p>
          <button 
            onClick={() => setLocale(other)}
            className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-colors"
          >
            {locale.toUpperCase()} / {other.toUpperCase()}
          </button>
        </div>
      </div>
    </footer>
  );
}
