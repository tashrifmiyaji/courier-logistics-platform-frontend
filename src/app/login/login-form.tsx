"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Eye, EyeOff, LoaderCircle, ShieldCheck, Truck, UserRound, Wrench } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ApiError, apiRequest, type Role, type User } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});
const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(100),
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters.").max(72),
  phone: z.string().trim().min(8, "Enter a valid phone number.").max(20).optional().or(z.literal("")),
});
type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

const demoOptions: { role: Role; label: string; icon: typeof UserRound; tone: string }[] = [
  { role: "CUSTOMER", label: "Customer", icon: UserRound, tone: "bg-[#e9f3eb] text-[#39724f]" },
  { role: "COURIER", label: "Courier", icon: Truck, tone: "bg-[#f7efe2] text-[#9c743e]" },
  { role: "ADMIN", label: "Admin", icon: Wrench, tone: "bg-[#edf0f8] text-[#63739e]" },
];

function ErrorMessage({ children }: { children?: string }) {
  return children ? <p role="alert" className="mt-1.5 text-xs font-medium text-[#b4473f]">{children}</p> : null;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);
  const [register, setRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [demoLoading, setDemoLoading] = useState<Role | null>(null);
  const loginForm = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const finishLogin = (user: User) => {
    setUser(user);
    const next = searchParams.get("next");
    router.replace(next?.startsWith("/dashboard") ? next : "/dashboard");
  };

  const loginMutation = useMutation({
    mutationFn: async (values: LoginValues) => {
      const response = await apiRequest<{ user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(values),
      });
      return response.data.user;
    },
    onSuccess: finishLogin,
    onError: (cause) => setError(cause instanceof Error ? cause.message : "Login failed."),
  });
  const registerMutation = useMutation({
    mutationFn: async (values: RegisterValues) => {
      const response = await apiRequest<User>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ ...values, phone: values.phone || undefined }),
      });
      return response.data;
    },
    onSuccess: () => {
      setRegister(false);
      setNotice("Account created. Sign in to get started.");
      loginForm.setValue("email", registerForm.getValues("email"));
      registerForm.reset();
    },
    onError: (cause) => setError(cause instanceof Error ? cause.message : "Registration failed."),
  });

  async function demoLogin(role: Role) {
    if (demoLoading) return;
    setError("");
    setNotice("");
    setDemoLoading(role);
    try {
      const response = await fetch("/api/demo-login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(body.message || `Demo ${role.toLowerCase()} login failed.`);
        return;
      }
      finishLogin(body.data.user as User);
    } catch {
      setError("The courier API is unavailable. Please try again.");
    } finally {
      setDemoLoading(null);
    }
  }

  const submitting = loginMutation.isPending || registerMutation.isPending;

  return (
    <>
      <div className="mb-6 grid grid-cols-2 rounded-xl bg-[#f1f4ef] p-1" role="tablist" aria-label="Account action">
        <button type="button" role="tab" aria-selected={!register} onClick={() => { setRegister(false); setError(""); setNotice(""); }} className={`rounded-lg py-2 text-xs font-extrabold transition ${!register ? "bg-white text-[#23352b] shadow-sm" : "text-[#78857d]"}`}>Log in</button>
        <button type="button" role="tab" aria-selected={register} onClick={() => { setRegister(true); setError(""); setNotice(""); }} className={`rounded-lg py-2 text-xs font-extrabold transition ${register ? "bg-white text-[#23352b] shadow-sm" : "text-[#78857d]"}`}>Create account</button>
      </div>

      {notice ? <p role="status" className="mb-4 rounded-xl border border-[#cae6d3] bg-[#eff9f1] px-3.5 py-3 text-xs font-semibold text-[#36724d]">{notice}</p> : null}
      {error ? <p role="alert" className="mb-4 rounded-xl border border-[#f1d5d1] bg-[#fff5f3] px-3.5 py-3 text-xs font-semibold text-[#a54037]">{error}</p> : null}

      {register ? (
        <form onSubmit={registerForm.handleSubmit((values) => { setError(""); registerMutation.mutate(values); })} className="space-y-4" noValidate>
          <label className="block text-xs font-bold text-[#526259]">Full name
            <input {...registerForm.register("name")} autoComplete="name" className="mt-2 h-11 w-full rounded-xl border border-[#dfe6de] bg-white px-3.5 text-sm font-medium outline-none transition placeholder:text-[#a2ada4] focus:border-[#70a888] focus:ring-4 focus:ring-[#176b4d]/[.08]" placeholder="How should we address you?" />
            <ErrorMessage>{registerForm.formState.errors.name?.message}</ErrorMessage>
          </label>
          <label className="block text-xs font-bold text-[#526259]">Email
            <input {...registerForm.register("email")} type="email" autoComplete="email" className="mt-2 h-11 w-full rounded-xl border border-[#dfe6de] bg-white px-3.5 text-sm font-medium outline-none transition placeholder:text-[#a2ada4] focus:border-[#70a888] focus:ring-4 focus:ring-[#176b4d]/[.08]" placeholder="you@example.com" />
            <ErrorMessage>{registerForm.formState.errors.email?.message}</ErrorMessage>
          </label>
          <label className="block text-xs font-bold text-[#526259]">Phone <span className="font-normal text-[#89958d]">— optional</span>
            <input {...registerForm.register("phone")} type="tel" autoComplete="tel" className="mt-2 h-11 w-full rounded-xl border border-[#dfe6de] bg-white px-3.5 text-sm font-medium outline-none transition placeholder:text-[#a2ada4] focus:border-[#70a888] focus:ring-4 focus:ring-[#176b4d]/[.08]" placeholder="+880 1XXX XXXXXX" />
            <ErrorMessage>{registerForm.formState.errors.phone?.message}</ErrorMessage>
          </label>
          <label className="block text-xs font-bold text-[#526259]">Password
            <span className="relative mt-2 block">
              <input {...registerForm.register("password")} type={showPassword ? "text" : "password"} autoComplete="new-password" className="h-11 w-full rounded-xl border border-[#dfe6de] bg-white px-3.5 pr-11 text-sm font-medium outline-none transition placeholder:text-[#a2ada4] focus:border-[#70a888] focus:ring-4 focus:ring-[#176b4d]/[.08]" placeholder="At least 8 characters" />
              <button type="button" onClick={() => setShowPassword((show) => !show)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#859188]">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
            </span>
            <ErrorMessage>{registerForm.formState.errors.password?.message}</ErrorMessage>
          </label>
          <button type="submit" disabled={submitting} className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#176b4d] text-sm font-extrabold text-white transition hover:bg-[#10563d] disabled:cursor-not-allowed disabled:opacity-60">{submitting ? <LoaderCircle className="animate-spin" size={17} /> : "Create customer account"}{!submitting ? <ArrowRight size={16} /> : null}</button>
        </form>
      ) : (
        <form onSubmit={loginForm.handleSubmit((values) => { setError(""); setNotice(""); loginMutation.mutate(values); })} className="space-y-4" noValidate>
          <label className="block text-xs font-bold text-[#526259]">Email address
            <input {...loginForm.register("email")} type="email" autoComplete="email" className="mt-2 h-11 w-full rounded-xl border border-[#dfe6de] bg-white px-3.5 text-sm font-medium outline-none transition placeholder:text-[#a2ada4] focus:border-[#70a888] focus:ring-4 focus:ring-[#176b4d]/[.08]" placeholder="you@example.com" />
            <ErrorMessage>{loginForm.formState.errors.email?.message}</ErrorMessage>
          </label>
          <label className="block text-xs font-bold text-[#526259]">Password
            <span className="relative mt-2 block">
              <input {...loginForm.register("password")} type={showPassword ? "text" : "password"} autoComplete="current-password" className="h-11 w-full rounded-xl border border-[#dfe6de] bg-white px-3.5 pr-11 text-sm font-medium outline-none transition placeholder:text-[#a2ada4] focus:border-[#70a888] focus:ring-4 focus:ring-[#176b4d]/[.08]" placeholder="Your password" />
              <button type="button" onClick={() => setShowPassword((show) => !show)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#859188]">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
            </span>
            <ErrorMessage>{loginForm.formState.errors.password?.message}</ErrorMessage>
          </label>
          <button type="submit" disabled={submitting} className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#176b4d] text-sm font-extrabold text-white transition hover:bg-[#10563d] disabled:cursor-not-allowed disabled:opacity-60">{submitting ? <LoaderCircle className="animate-spin" size={17} /> : "Log in securely"}{!submitting ? <ArrowRight size={16} /> : null}</button>
        </form>
      )}

      <div className="my-6 flex items-center gap-3"><span className="h-px flex-1 bg-[#e9ede7]" /><span className="text-[10px] font-bold uppercase tracking-[.13em] text-[#9aa49c]">or try a demo account</span><span className="h-px flex-1 bg-[#e9ede7]" /></div>
      <div className="grid grid-cols-3 gap-2">
        {demoOptions.map(({ role, label, icon: Icon, tone }) => (
          <button key={role} type="button" onClick={() => void demoLogin(role)} disabled={submitting || demoLoading !== null} className="group flex flex-col items-center gap-2 rounded-xl border border-[#e6ebe4] bg-white py-3 text-[10px] font-extrabold text-[#59675e] transition hover:-translate-y-0.5 hover:border-[#cadbce] hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50">
            <span className={`grid size-8 place-items-center rounded-xl ${tone}`}>{demoLoading === role ? <LoaderCircle className="animate-spin" size={16} /> : <Icon size={16} />}</span>{label}
          </button>
        ))}
      </div>
      <p className="mt-5 flex items-start gap-2 text-[10px] leading-4 text-[#8b978e]"><ShieldCheck size={14} className="mt-0.5 shrink-0 text-[#6b9f7d]" /> Your session is secured with an HTTP-only login cookie.</p>
    </>
  );
}
