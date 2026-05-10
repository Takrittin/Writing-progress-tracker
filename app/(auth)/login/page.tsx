import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <div className="grid w-full place-items-center gap-5">
      <AuthForm mode="login" />
      <p className="text-sm text-[hsl(var(--muted))]">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-[hsl(var(--primary))]">
          Create an account
        </Link>
      </p>
    </div>
  );
}
