import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
          ERPSystem
        </div>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">
            Log in
          </Link>
          <Link href="/register">
            <Button size="sm">Get Started</Button>
          </Link>
        </nav>
      </header>
      
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-muted/40">
          <div className="container px-4 md:px-6 flex flex-col items-center text-center max-w-3xl mx-auto space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                The all-in-one <span className="text-primary">ERP & POS</span> for Sri Lanka.
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Manage your inventory, process sales instantly with our beautiful POS, send invoices via WhatsApp, and track your accounting—all in one place.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto font-semibold">
                  Start your free trial
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold">
                  Log in to your account
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t mt-auto text-sm text-muted-foreground">
        <p>© 2024 ERPSystem. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
