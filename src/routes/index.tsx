import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { useWeeklyLimit } from "@/lib/useWeeklyLimit";
import { Converter } from "@/components/Converter";
import { LimitModal } from "@/components/LimitModal";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useI18n } from "@/lib/I18nContext";
import { ArrowRight, Zap, Shield, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nocteria — Oyun Sunucunu Büyütmenin En Akıllı Yolu." },
      {
        name: "description",
        content: "Market, topluluk ve yönetim tek bir yerde. Oyun ekosisteminiz için yepyeni, sade ve akıllı bir deneyim.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const limit = useWeeklyLimit();
  const { t } = useI18n();
  const [modal, setModal] = useState<{ open: boolean; msg?: string }>({ open: false });

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <Navbar />
      
      <main className="relative">
        {/* Hero Section */}
        <section className="relative mx-auto max-w-7xl px-6 pt-48 pb-32 sm:px-10 sm:pt-64">
          <div className="absolute inset-0 hero-spotlight pointer-events-none" />
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center relative z-10"
          >
            <h1 className="text-nocteria">
              <span className="block">iFlexi: Dosya</span>
              <span className="block text-zinc-800">Dönüşüm Merkezi</span>
            </h1>
            
            <p className="mt-10 subtext-nocteria">
              Hız, gizlilik ve yönetim tek bir yerde. Dosya ekosisteminiz için yepyeni, sade ve akıllı bir deneyim.
            </p>
            
            <div className="mt-16 mx-auto max-w-md">
              <div className="relative flex items-center p-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
                <input 
                  type="email" 
                  placeholder="E-posta adresiniz"
                  className="flex-1 bg-transparent px-6 py-3 text-sm font-medium outline-none placeholder:text-zinc-600"
                />
                <button className="nocteria-btn-primary !py-3 !px-6 whitespace-nowrap">
                  Hemen Kayıt Ol
                </button>
              </div>
            </div>

            <div className="mt-12 flex flex-col items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[11, 12, 13].map(i => (
                    <img 
                      key={i}
                      src={`https://i.pravatar.cc/100?img=${i}`} 
                      className="h-9 w-9 rounded-full border-2 border-black object-cover"
                      alt="avatar"
                    />
                  ))}
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-black bg-zinc-900 text-[10px] font-black">
                    +
                  </div>
                </div>
                <p className="text-[11px] font-bold text-zinc-500 tracking-tight">
                  <span className="text-white">1.200'den fazla</span> kullanıcı arasına katıl.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Converter Section - Nocteria Dashboard Style */}
        <section id="converter" className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="nocteria-card !p-2 bg-[#050505] border-white/10"
          >
            <div className="rounded-[2.2rem] bg-black p-8 sm:p-12">
              <Converter
                maxBytes={limit.maxBytes}
                canConsume={limit.canConsume}
                consumeOne={limit.consumeOne}
                onBlocked={(msg) => setModal({ open: true, msg })}
              />
            </div>
          </motion.div>
        </section>

        {/* Features - Nocteria Style */}
        <section className="mx-auto max-w-7xl px-6 py-32 sm:px-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black uppercase tracking-tighter sm:text-6xl">Her Şey Elinizin Altında</h2>
            <p className="mt-6 text-zinc-500 font-medium text-lg">Hızlı ve güvenli dönüşüm için ihtiyacınız olan tüm araçlar iFlexi ile bir arada.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { title: "Premium Dönüşüm", body: "Dosyalarınızı en yüksek kalitede ve hızda dönüştürün. Komisyon yok, beklemek yok." },
              { title: "Tam Gizlilik", body: "İşlemleriniz sadece tarayıcınızda gerçekleşir. Verileriniz asla sunucularımıza ulaşmaz." },
              { title: "Anında Erişim", body: "Üye olun veya olmayın, saniyeler içinde dönüşüm yapmaya başlayın." }
            ].map((f, i) => (
              <div key={i} className="nocteria-card group hover:border-white/20 transition-colors">
                <h3 className="text-xl font-black uppercase tracking-tight">{f.title}</h3>
                <p className="mt-4 text-sm font-medium leading-relaxed text-zinc-500">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Ready CTA */}
        <section className="mx-auto max-w-7xl px-6 py-40 sm:px-10 text-center">
          <h2 className="text-5xl font-black uppercase tracking-tighter sm:text-8xl">Hazır mısın?</h2>
          <p className="mt-8 text-zinc-500 text-lg font-medium">Saniyeler içinde dosya dönüşümünü profesyonel bir seviyeye taşı.</p>
          <div className="mt-12">
            <Link to="/pricing" className="nocteria-btn-primary inline-flex">
              Hemen Başla
            </Link>
          </div>
        </section>
      </main>

      <Footer />

      <LimitModal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        onUpgrade={() => {
          setModal({ open: false });
          window.location.href = "/pricing";
        }}
        message={modal.msg}
      />
    </div>
  );
}
