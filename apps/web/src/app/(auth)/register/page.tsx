import type { Metadata } from "next";
import { RegisterForm } from "@/app/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your Your Shadow account.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
