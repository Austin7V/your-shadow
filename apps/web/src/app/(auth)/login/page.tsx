import type { Metadata } from "next";
import { LoginForm } from "@/app/components/auth/login-form";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your Your Shadow account.",
};

type LoginPageProps = {
  searchParams: Promise<{
    registered?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return <LoginForm registrationCompleted={params.registered === "true"} />;
}
