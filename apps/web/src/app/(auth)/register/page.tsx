import type { Metadata } from "next";
import { RegisterForm } from "@/app/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create an account for Your Shadow.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
