import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-4">
      <div className="text-center">
        <p className="eyebrow text-gold-700">404</p>
        <h1 className="display mt-3 text-4xl text-navy-950">Page not found</h1>
        <p className="mt-2 text-slate-500">The page you are looking for doesn&apos;t exist in the CEO Network.</p>
        <Link href="/" className="mt-6 inline-flex h-10 items-center rounded-lg bg-navy-900 px-4 text-sm font-medium text-white hover:bg-navy-800">
          Back to the network
        </Link>
      </div>
    </main>
  );
}
