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
      { title: "iFlexi — Nocteria Tarzı Modern Dönüştürücü" },
      {
        name: "description",
        content: "Dosyalarınızı tamamen tarayıcınızda, en hızlı ve modern şekilde dönüştürün.",
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
      
      <main className="relative overflow-hidden">
        {/* Hero Spotlight */}
        <div className="absolute inset-0 hero-spotlight pointer-events-none" />
        
        <section className="mx-auto max-w-7xl px-6 pt-40 pb-32 sm:px-10 sm:pt-56">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400"
            >
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              {t("hero.eyebrow")}
            </motion.div>
            
            <h1 className="mt-12 text-nocteria">
              <span className="block">{t("hero.titleA")}</span>
              <span className="block opacity-40">
                {t("hero.titleB")}
              </span>
            </h1>
            
            <p className="mx-auto mt-12 max-w-2xl subtext-nocteria">
              {t("hero.subtitle")}
            </p>
            
            <div className="mt-16 flex flex-wrap items-center justify-center gap-6">
              <a href="#converter" className="nocteria-btn-primary flex items-center gap-2">
                {t("hero.primary")}
                <ArrowRight size={18} />
              </a>
              <Link to="/pricing" className="nocteria-btn-secondary">
                {t("hero.secondary")}
              </Link>
            </div>

            {/* Trusted By */}
            <div className="mt-24 flex flex-col items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <img 
                    key={i}
                    src={`https://i.pravatar.cc/100?img=${i+10}`} 
                    className="h-10 w-10 rounded-full border-2 border-black object-cover"
                    alt="user"
                  />
                ))}
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-zinc-900 text-[10px] font-bold">
                  +
                </div>
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                1.200'den fazla kullanıcı arasına katıl.
              </p>
            </div>
          </motion.div>
        </section>

        {/* Converter Section */}
        <section id="converter" className="mx-auto max-w-7xl px-6 py-32 sm:px-10 scroll-mt-24">
          <motion.div 
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="nocteria-card border-white/10 bg-[#050505]"
          >
            <Converter
              maxBytes={limit.maxBytes}
              canConsume={limit.canConsume}
              consumeOne={limit.consumeOne}
              onBlocked={(msg) => setModal({ open: true, msg })}
            />
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="mx-auto max-w-7xl px-6 py-32 sm:px-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { icon: Zap, title: "Işık Hızında", body: "Tüm işlemler tarayıcınızda, anında gerçekleşir." },
              { icon: Shield, title: "Tam Güvenlik", body: "Dosyalarınız asla sunucuya yüklenmez, cihazınızda kalır." },
              { icon: Sparkles, title: "Premium Kalite", body: "En modern algoritmalarla kayıpsız dönüşüm sağlar." }
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="nocteria-card border-white/5 bg-zinc-900/20"
              >
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-white">
                  <f.icon size={24} />
                </div>
                <h3 className="text-xl font-bold tracking-tight">{f.title}</h3>
                <p className="mt-4 text-sm font-medium leading-relaxed text-zinc-500">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Cards */}
        <section className="mx-auto max-w-7xl px-6 py-32 sm:px-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <Link to="/limits" className="group">
              <div className="nocteria-card h-full border-white/5 bg-gradient-to-br from-zinc-900/50 to-transparent p-12 transition-all group-hover:border-white/20">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">{t("nav.usage")}</p>
                <h3 className="mt-8 text-4xl font-extrabold tracking-tighter sm:text-5xl">{t("hero.usageCta.title")}</h3>
                <p className="mt-6 text-base font-medium text-zinc-400 leading-relaxed">{t("hero.usageCta.body")}</p>
                <div className="mt-12 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-transform group-hover:translate-x-2">
                  {t("hero.usageCta.link")} <ArrowRight size={16} />
                </div>
              </div>
            </Link>
            <Link to="/pricing" className="group">
              <div className="nocteria-card h-full border-white/5 bg-gradient-to-br from-zinc-900/50 to-transparent p-12 transition-all group-hover:border-white/20">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">{t("nav.pricing")}</p>
                <h3 className="mt-8 text-4xl font-extrabold tracking-tighter sm:text-5xl">{t("hero.pricingCta.title")}</h3>
                <p className="mt-6 text-base font-medium text-zinc-400 leading-relaxed">{t("hero.pricingCta.body")}</p>
                <div className="mt-12 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-transform group-hover:translate-x-2">
                  {t("hero.pricingCta.link")} <ArrowRight size={16} />
                </div>
              </div>
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
