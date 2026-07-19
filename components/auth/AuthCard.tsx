interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-gray-100 p-10">
      <h1 className="text-4xl font-bold text-gray-800">{title}</h1>

      <p className="mt-3 text-gray-500">{subtitle}</p>

      <div className="mt-8">{children}</div>
    </div>
  );
}
