import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <div className="grid w-full place-items-center gap-5">
      <AuthForm mode="signup" />
      <p className="text-sm text-[hsl(var(--muted))]">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[hsl(var(--primary))]">
          Login
        </Link>
      </p>
    </div>
  );
}
