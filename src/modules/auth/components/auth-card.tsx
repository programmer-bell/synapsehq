import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthCard({
  title,
  description,
  children,
  footer,
}: AuthCardProps) {
  return (
    <section className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-sm">
      <div className="space-y-2">
        <p className="text-sm font-medium text-accent">SynapseHQ</p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <div className="mt-8">{children}</div>
      {footer ? (
        <div className="mt-6 border-t border-border pt-6 text-sm text-muted-foreground">
          {footer}
        </div>
      ) : null}
    </section>
  );
}
