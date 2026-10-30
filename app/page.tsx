import { PageShell } from "@/src/shared/components/layout/page-shell";

export default function Home() {
  return (
    <PageShell>
      <div className="w-full max-w-2xl">
        <p className="text-sm font-medium tracking-tight text-accent">
          SynapseHQ
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Engineering workspace foundation
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
          Projects, tasks, and team collaboration will live here. The
          application foundation is ready for authentication development.
        </p>
      </div>
    </PageShell>
  );
}
