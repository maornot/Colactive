export default function EntryLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grain flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
