import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function PageShell({
  eyebrow,
  title,
  subtitle,
  children,
  max = "max-w-5xl",
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  max?: string;
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className={`mx-auto ${max} px-5 pt-32 pb-32 sm:px-8 sm:pt-40`}>
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/50">
            {eyebrow}
          </p>
          <h1 className="mt-6 text-5xl font-thin leading-[1.05] tracking-tight sm:text-7xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
              {subtitle}
            </p>
          )}
        </motion.header>
        <div className="mt-16">{children}</div>
      </main>
      <Footer />
    </div>
  );
}

export function GlassCard({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`glass-card p-6 sm:p-8 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h3>
      )}
      <div className={title ? "mt-3 text-sm leading-relaxed text-white/70" : ""}>
        {children}
      </div>
    </div>
  );
}
