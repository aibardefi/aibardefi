export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-4 px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        website1
      </h1>
      <p className="text-base opacity-70">
        Blank Next.js + Tailwind starter. Edit{" "}
        <code className="rounded bg-foreground/10 px-1.5 py-0.5 text-sm">
          src/app/page.tsx
        </code>{" "}
        to start building.
      </p>
    </main>
  );
}
