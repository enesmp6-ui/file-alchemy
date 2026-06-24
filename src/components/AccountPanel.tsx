import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import { TIERS } from "@/lib/useWeeklyLimit";

type Tab = "profile" | "billing" | "usage";

export function AccountPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user, signOut, updateUser } = useAuth();
  const [tab, setTab] = useState<Tab>("profile");

  useEffect(() => {
    if (!open) setTab("profile");
  }, [open]);

  if (!user) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-xl"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 240, damping: 30 }}
            className="relative z-10 flex h-full w-full max-w-lg flex-col border-l border-white/10 bg-black/90"
          >
            <header className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-white/30 to-white/10 text-sm font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-white/60 transition hover:bg-white/5 hover:text-white"
                aria-label="Kapat"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </header>

            <nav className="flex gap-1 border-b border-white/10 px-4 py-2">
              {([
                ["profile", "Profil"],
                ["billing", "Plan"],
                ["usage", "Kullanım"],
              ] as [Tab, string][]).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`relative rounded-full px-4 py-2 text-xs font-medium transition ${
                    tab === id ? "text-white" : "text-white/50 hover:text-white"
                  }`}
                >
                  {tab === id && (
                    <motion.span
                      layoutId="account-tab"
                      className="absolute inset-0 rounded-full bg-white/10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative">{label}</span>
                </button>
              ))}
            </nav>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {tab === "profile" && <ProfileTab />}
              {tab === "billing" && <BillingTab />}
              {tab === "usage" && <UsageTab />}
            </div>

            <footer className="border-t border-white/10 px-6 py-4">
              <button
                onClick={() => {
                  signOut();
                  onClose();
                }}
                className="w-full rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/5"
              >
                Çıkış Yap
              </button>
            </footer>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );

  function ProfileTab() {
    const [name, setName] = useState(user!.name);
    const [saving, setSaving] = useState(false);
    return (
      <div className="space-y-5">
        <SettingsCard title="Profil Bilgileri" desc="Hesabını sana özel hale getir.">
          <Field label="İsim" value={name} onChange={setName} />
          <Field label="E-posta" value={user!.email} onChange={() => {}} type="email" />
          <p className="-mt-1 text-[11px] text-white/40">
            E-posta adresin hesap güvenliği için kilitlidir.
          </p>
          <button
            onClick={async () => {
              setSaving(true);
              const res = await updateUser({ name });
              setSaving(false);
              if (res.error) toast.error(res.error);
              else toast.success("Profilin güncellendi.");
            }}
            disabled={saving}
            className="mt-2 self-start rounded-full bg-white px-5 py-2 text-xs font-medium text-black transition hover:bg-white/90 disabled:opacity-60"
          >
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </SettingsCard>
      </div>
    );
  }

  function BillingTab() {
    const plan = user!.plan;
    const cfg = TIERS[plan];
    const trialDays = user!.trialEndsAt
      ? Math.max(0, Math.ceil((user!.trialEndsAt - Date.now()) / (24 * 60 * 60 * 1000)))
      : 0;
    return (
      <div className="space-y-5">
        <SettingsCard
          title={plan === "pro" ? "Pro Üye" : "Ücretsiz Üye"}
          desc={
            plan === "pro"
              ? `Deneme bitişine ${trialDays} gün kaldı.`
              : "Daha fazla limit için Pro'ya geç."
          }
          highlight={plan === "pro"}
        >
          <div className="rounded-xl bg-white/[0.03] p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Haftalık limit</span>
              <span className="font-medium">{cfg.weekly} dosya</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span className="text-muted-foreground">Maks. dosya boyutu</span>
              <span className="font-medium">{cfg.maxMB}MB</span>
            </div>
          </div>
          <button
            onClick={() =>
              toast(
                plan === "pro"
                  ? "Plan iptali yakında ödeme sağlayıcımız ile entegre olacak."
                  : "Pro yükseltmesi yakında ödeme sağlayıcımız ile entegre olacak.",
              )
            }
            className={`self-start rounded-full px-5 py-2 text-xs font-medium transition ${
              plan === "pro"
                ? "border border-white/15 text-white/80 hover:bg-white/5"
                : "bg-[#0071e3] text-white hover:bg-[#0077ed]"
            }`}
          >
            {plan === "pro" ? "Denemeyi İptal Et" : "Pro'ya Geç"}
          </button>
        </SettingsCard>
      </div>
    );
  }

  function UsageTab() {
    const plan = user!.plan;
    const cfg = TIERS[plan];
    // Mock daily usage data
    const days = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
    const data = [12, 28, 8, 45, 22, 5, 18].map((v) =>
      Math.round((v / 50) * cfg.weekly * 0.6),
    );
    const total = data.reduce((a, b) => a + b, 0);
    const max = Math.max(...data, 1);
    const pct = Math.min(100, (total / cfg.weekly) * 100);

    return (
      <div className="space-y-5">
        <SettingsCard title="Bu hafta" desc={`${total} / ${cfg.weekly} dosya işlendi`}>
          {/* Ring chart */}
          <div className="flex items-center justify-center py-4">
            <div className="relative h-36 w-36">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="white"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={`${(pct / 100) * 264} 264`}
                  initial={{ strokeDasharray: "0 264" }}
                  animate={{ strokeDasharray: `${(pct / 100) * 264} 264` }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-thin tabular-nums">{Math.round(pct)}%</span>
                <span className="mt-1 text-[10px] uppercase tracking-widest text-white/40">
                  Kullanım
                </span>
              </div>
            </div>
          </div>
          {/* Bar chart */}
          <div className="mt-2 flex h-32 items-end justify-between gap-2">
            {data.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <motion.div
                  className="w-full rounded-t bg-gradient-to-t from-white/20 to-white/70"
                  initial={{ height: 0 }}
                  animate={{ height: `${(v / max) * 100}%` }}
                  transition={{ duration: 0.7, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                />
                <span className="text-[10px] text-white/40">{days[i]}</span>
              </div>
            ))}
          </div>
        </SettingsCard>
      </div>
    );
  }
}

function SettingsCard({
  title,
  desc,
  children,
  highlight,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-4 rounded-2xl border p-5 ${
        highlight
          ? "border-white/20 bg-gradient-to-b from-white/[0.06] to-white/[0.02]"
          : "border-white/10 bg-white/[0.02]"
      }`}
    >
      <div>
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        {desc && <p className="mt-1 text-xs text-muted-foreground">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-widest text-white/40">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none transition focus:border-[#0071e3] focus:shadow-[0_0_0_3px_rgba(0,113,227,0.25)]"
      />
    </label>
  );
}
