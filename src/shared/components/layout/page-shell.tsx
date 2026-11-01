import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export function PageShell({ children, className }: PageShellProps) {
  return (
    <main
      className={`relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-16 ${className ?? ""}`}
    >
      <div
        aria-hidden="true"
        className="surface-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-1/4 size-72 rounded-full bg-indigo-500/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-1/4 size-80 rounded-full bg-fuchsia-500/10 blur-3xl"
      />
      <div className="relative flex w-full flex-1 flex-col items-center justify-center">
        {children}
      </div>
    </main>
  );
}
