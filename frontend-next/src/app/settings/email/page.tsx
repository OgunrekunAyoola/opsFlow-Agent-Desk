"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAccess } from "../../../lib/auth-client";

interface MeTenant {
  supportEmail?: string;
  inboundAddress?: string;
  lastInboundAt?: string;
}

interface MeResponse {
  user?: { role?: string };
  tenant?: MeTenant;
}

export default function EmailSettingsPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [tenant, setTenant] = useState<MeTenant | null>(null);
  const [supportEmail, setSupportEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const res = await fetchWithAccess<MeResponse>("/auth/me");
      if (cancelled) return;
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
        } else {
          setError("Failed to load email settings.");
        }
        setLoading(false);
        return;
      }
      const me = res.data;
      const r = me?.user?.role || null;
      setRole(r);
      if (me?.tenant) {
        setTenant(me.tenant);
        setSupportEmail(me.tenant.supportEmail || "");
      }
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const disabled = role !== "admin";

  async function saveSupportEmail(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    const res = await fetchWithAccess<{ supportEmail?: string; error?: string }>(
      "/auth/tenant-settings",
      {
        method: "PATCH",
        body: JSON.stringify({
          supportEmail: supportEmail || null,
        }),
      },
    );
    if (!res.ok) {
      if (res.status === 401) {
        router.push("/login");
      } else {
        const msg = res.data && "error" in res.data ? res.data.error : null;
        setError(msg || "Failed to save support email.");
      }
      setSaving(false);
      return;
    }
    setMessage("Support email updated.");
    setSaving(false);
  }

  async function triggerTestEmail() {
    if (disabled || !tenant?.inboundAddress) return;
    setTesting(true);
    setError(null);
    setMessage(null);
    const res = await fetchWithAccess<{ message?: string; error?: string }>(
      "/email/inbound",
      {
        method: "POST",
        body: JSON.stringify({
          from: supportEmail || "test@example.com",
          to: tenant.inboundAddress,
          subject: "Test inbound email",
          text: "This is a test email to the OpsFlow inbound address.",
        }),
      },
    );
    if (!res.ok) {
      if (res.status === 401) {
        router.push("/login");
      } else {
        const msg = res.data && "error" in res.data ? res.data.error : null;
        setError(msg || "Failed to trigger test email.");
      }
      setTesting(false);
      return;
    }
    setMessage("Test email triggered.");
    setTesting(false);
  }

  if (!loading && role !== "admin") {
    return (
      <div className="container mx-auto px-6 py-10 text-white">
        <h1 className="text-2xl font-semibold mb-2">Email Settings</h1>
        <p className="text-sm text-white/70">
          Only admins can manage email settings.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10 text-white space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Email Settings</h1>
        <p className="text-sm text-white/70">
          Configure inbound address and support email.
        </p>
      </header>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold mb-1">Inbound address</h2>
          <p className="text-xs text-white/60">
            Forward your existing support email here to create tickets from
            email.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1">
            <span className="text-xs text-white/60">Address</span>
            <span className="text-xs font-mono text-white">
              {tenant?.inboundAddress || "Loading..."}
            </span>
          </div>
          {tenant?.lastInboundAt && (
            <p className="mt-2 text-xs text-white/60">
              Last inbound email:{" "}
              {new Date(tenant.lastInboundAt).toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={disabled || testing || !tenant?.inboundAddress}
            onClick={triggerTestEmail}
            className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-4 py-2 text-xs font-medium text-slate-950 hover:bg-cyan-400 disabled:opacity-60"
          >
            {testing ? "Sending test..." : "Send test email"}
          </button>
          {message && (
            <span className="text-xs text-emerald-300">{message}</span>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 space-y-4">
        <h2 className="text-sm font-semibold">Support email</h2>
        <p className="text-xs text-white/60">
          Optional from-address used when sending replies from OpsFlow.
        </p>
        <form onSubmit={saveSupportEmail} className="space-y-3">
          <input
            type="email"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            disabled={disabled}
            className="w-full rounded-xl border border-white/20 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 disabled:opacity-60"
            placeholder="support@yourcompany.com"
          />
          <button
            type="submit"
            disabled={disabled || saving}
            className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-4 py-2 text-xs font-medium text-slate-950 hover:bg-cyan-400 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </form>
      </section>
    </div>
  );
}

