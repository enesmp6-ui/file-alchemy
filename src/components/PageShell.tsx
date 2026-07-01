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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <Navbar />
      <main className={`mx-auto ${max} px-6 pt-28 pb-24 sm:px-8 sm:pt-40`}>
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center md:text-left"
        >
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground/80">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-6 text-[2.5rem] font-medium leading-[1.1] tracking-tight sm:text-6xl md:text-7xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:mx-0 sm:text-xl">
              {subtitle}
            </p>
          )}
        </motion.header>
        <div className="mt-20">{children}</div>
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
    <div className={`glass-card p-6 sm:p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-foreground/5 ${className}`}>
      {title && (
        <h3 className="text-xl font-medium tracking-tight sm:text-2xl">{title}</h3>
      )}
      <div className={title ? "mt-4 text-base leading-relaxed text-muted-foreground" : "w-full"}>
        {children}
      </div>
    </div>
  );
}
