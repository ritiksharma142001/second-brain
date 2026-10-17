import { SiteHeader } from "@/components/layout/SiteHeader";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center">
        {children}
      </main>
    </div>
  );
}
