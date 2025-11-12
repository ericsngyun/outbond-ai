import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-4 text-muted-foreground">
        Welcome, {user.firstName || user.emailAddresses[0]?.emailAddress}!
      </p>
      <div className="mt-8 rounded-lg border p-6">
        <p className="text-sm text-muted-foreground">
          Dashboard content coming soon...
        </p>
      </div>
    </div>
  );
}
