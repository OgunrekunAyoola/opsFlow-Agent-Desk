import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full rounded-2xl border border-white/10 bg-slate-950/80 p-8 text-center text-white space-y-4">
        <div className="text-xs font-mono text-white/40">404</div>
        <h1 className="text-xl font-semibold">Page not found</h1>
        <p className="text-sm text-white/70">
          The page you are looking for does not exist or may have moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-400"
          >
            Go to dashboard
          </Link>
          <Link
            href="/"
            className="text-xs text-white/70 hover:text-white underline-offset-4 hover:underline"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

