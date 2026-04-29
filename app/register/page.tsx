import { AuthForm } from "@/components/auth-form";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  return <AuthForm mode="register" error={error} message={message} />;
}
