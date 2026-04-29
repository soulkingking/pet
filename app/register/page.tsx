import { AuthForm } from "@/components/auth-form";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return <AuthForm mode="register" error={error} />;
}
