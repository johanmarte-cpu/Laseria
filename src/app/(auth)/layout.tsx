import { Logo } from "@/components/marketing/logo";
import { Container } from "@/components/ui/container";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-beige">
      <header className="py-8">
        <Container className="flex justify-center">
          <Logo variant="full" className="h-40" />
        </Container>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 pb-16">{children}</main>
    </div>
  );
}
