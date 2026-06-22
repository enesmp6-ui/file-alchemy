import { AnimatePresence, motion } from "framer-motion";

export function LimitModal({
  open,
  onClose,
  onUpgrade,
  message,
}: {
  open: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  message?: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-xl"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="relative z-10 w-full max-w-md glass-card p-8 text-center"
          >
            <h3 className="text-2xl font-semibold tracking-tight">
              Haftalık limitine ulaştın.
            </h3>
            <p className="mt-3 text-sm text-muted-foreground">
              {message ?? "Ücretsiz üye ol veya Pro'yu dene."}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={onUpgrade}
                className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90"
              >
                Pro'yu Dene
              </button>
              <button
                onClick={onClose}
                className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white/80 transition hover:bg-white/5"
              >
                Vazgeç
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
