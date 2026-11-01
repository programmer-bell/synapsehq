import Image from "next/image";
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
    <section className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-2xl shadow-slate-950/10">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-gradient-to-br from-indigo-500/15 to-fuchsia-500/10 blur-2xl"
      />
      <div className="relative space-y-3">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="SynapseHQ"
            width={40}
            height={40}
            className="size-10 rounded-xl object-cover shadow-sm ring-1 ring-border"
            priority
          />
          <div>
            <p className="text-sm font-semibold tracking-tight text-foreground">
              SynapseHQ
            </p>
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-accent">
              Engineering workspace
            </p>
          </div>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <div className="relative mt-7">{children}</div>
      {footer ? (
        <div className="relative mt-6 border-t border-border pt-6 text-sm text-muted-foreground">
          {footer}
        </div>
      ) : null}
    </section>
  );
}
