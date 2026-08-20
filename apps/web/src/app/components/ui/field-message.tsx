type FieldMessageProps = {
  error?: string;
  hint?: string;
};

export function FieldMessage({ error, hint }: FieldMessageProps) {
  if (error) {
    return (
      <p className="mt-1.5 text-sm text-error" role="alert">
        {error}
      </p>
    );
  }

  if (hint) {
    return <p className="mt-1.5 text-sm text-muted-foreground">{hint}</p>;
  }

  return null;
}
