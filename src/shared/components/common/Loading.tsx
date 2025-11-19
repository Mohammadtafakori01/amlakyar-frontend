interface LoadingProps {
  message?: string;
}

export default function Loading({ message = 'در حال بارگذاری...' }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      {message && <p className="text-gray-600 text-sm">{message}</p>}
    </div>
  );
}

