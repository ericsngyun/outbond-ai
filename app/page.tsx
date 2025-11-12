import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="text-xl font-bold">Outrep.ai</div>
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="rounded-md px-4 py-2 text-sm font-medium hover:bg-accent">
                  Sign In
                </button>
              </SignInButton>
              <Link
                href="/sign-up"
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Get Started
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="rounded-md px-4 py-2 text-sm font-medium hover:bg-accent"
              >
                Dashboard
              </Link>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center p-24">
        <div className="z-10 max-w-5xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Outrep.ai
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Personalize 100 cold emails in 10 minutes
          </p>
          <p className="mt-4 text-base text-muted-foreground">
            AI-powered SDR personalization for agencies and SMB SaaS doing
            outbound
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <SignedOut>
              <Link
                href="/sign-up"
                className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Get started
              </Link>
              <SignInButton mode="modal">
                <button className="text-sm font-semibold leading-6 text-foreground hover:underline">
                  Sign in <span aria-hidden="true">→</span>
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Go to Dashboard
              </Link>
            </SignedIn>
          </div>
        </div>
      </main>
    </div>
  );
}
