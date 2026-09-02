type FieldMessageProps = {
  id?: string;
  error?: string;
  hint?: string;
};

export function FieldMessage({ id, error, hint }: FieldMessageProps) {
  if (error) {
    return (
      <p id={id} className="mt-2 text-sm text-error-content" role="alert">
        {error}
      </p>
    );
  }

  if (hint) {
    return (
      <p id={id} className="mt-2 text-sm leading-5 text-muted-foreground">
        {hint}
      </p>
    );
  }

  return null;
}
