import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export function PageShell({ children, className }: PageShellProps) {
  return (
    <main
      className={`flex flex-1 flex-col items-center justify-center px-6 py-24 ${className ?? ""}`}
    >
      {children}
    </main>
  );
}
