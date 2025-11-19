interface ErrorDisplayProps {
  error: string | string[] | null | undefined;
  title?: string;
}

export default function ErrorDisplay({ error, title = 'خطا' }: ErrorDisplayProps) {
  if (!error) return null;

  const errorMessages = Array.isArray(error) ? error : [error];

  return (
    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-right">
      <h3 className="font-bold text-red-800 mb-2">{title}</h3>
      <div className="text-red-700">
        {errorMessages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
    </div>
  );
}

