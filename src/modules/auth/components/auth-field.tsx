type AuthFieldProps = {
  id: string;
  name: string;
  label: string;
  type: "text" | "email" | "password";
  autoComplete: string;
  error?: string;
  placeholder?: string;
};

export function AuthField({
  id,
  name,
  label,
  type,
  autoComplete,
  error,
  placeholder,
}: AuthFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
      {error ? (
        <p id={errorId} className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
