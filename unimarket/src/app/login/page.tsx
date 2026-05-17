"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, UserPlus, LogIn, X } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { useApp } from "@/contexts/AppContext";
import { User } from "@/lib/types";

function normalizeUser(user: Partial<User>) {
  const isUniandes = (user.email ?? "").toLowerCase().endsWith("@uniandes.edu.co");
  return {
    id: user.id ?? "u1",
    name: user.name ?? "Usuario",
    email: user.email ?? "",
    role: user.role ?? "student",
    favorites: user.favorites ?? [],
    interests: user.interests ?? [],
    notificationsEnabled: user.notificationsEnabled ?? true,
    totalRating: user.totalRating ?? 0,
    ratingCount: user.ratingCount ?? 0,
    ratings: user.ratings ?? [],
    emailVerified: user.emailVerified ?? false,
    uniandesVerified: user.uniandesVerified ?? isUniandes,
  } as User;
}

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotStep, setForgotStep] = useState<'email' | 'code' | 'reset'>('email');
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsForgotSubmitting(true);

    try {
      if (forgotStep === 'email') {
        await apiClient.forgotPassword(forgotEmail.trim());
        toast.success('Código enviado a tu correo. Válido por 15 minutos.');
        setForgotStep('code');
      } else if (forgotStep === 'code') {
        if (!resetCode.trim()) {
          toast.error('Ingresa el código');
          return;
        }
        setForgotStep('reset');
      } else if (forgotStep === 'reset') {
        if (newPassword !== confirmPassword) {
          toast.error('Las contraseñas no coinciden');
          return;
        }
        if (newPassword.length < 6) {
          toast.error('La contraseña debe tener al menos 6 caracteres');
          return;
        }
        await apiClient.resetPassword(resetCode.trim(), newPassword);
        toast.success('Contraseña actualizada. Inicia sesión con tu nueva contraseña.');
        setShowForgotPassword(false);
        setForgotStep('email');
        setForgotEmail('');
        setResetCode('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error en el proceso');
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (isRegister) {
        await apiClient.register(name.trim(), email.trim(), password);
        await apiClient.login(email.trim(), password);
      } else {
        await apiClient.login(email.trim(), password);
      }

      const currentUser = await apiClient.getCurrentUser();
      setUser(normalizeUser(currentUser));
      toast.success(isRegister ? "Cuenta creada e inicio de sesión exitoso" : "Sesión iniciada correctamente");
      router.push("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo iniciar sesión");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 text-white p-8 lg:p-12 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.35),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(15,23,42,0.9),transparent_50%)]" />
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.08)_50%,rgba(255,255,255,0.08)_75%,transparent_75%,transparent)] bg-[length:28px_28px]" />
        <div className="relative space-y-6 max-w-2xl w-full">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-indigo-100 backdrop-blur">
            <Lock size={16} /> Acceso seguro a UniMarket
          </div>
          <h1 className="text-4xl lg:text-5xl font-black leading-tight tracking-tight">
            Compra y vende con una cuenta real, no con datos simulados.
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-lg">
            Inicia sesión para guardar productos en la base de datos, publicar desde tu dispositivo y hacer que las valoraciones y favoritos persistan en producción.
          </p>
          <div className="grid gap-3 pt-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="min-w-0 rounded-2xl bg-white/8 border border-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Comunidad</p>
              <p className="mt-2 break-words leading-relaxed font-semibold">Verificación institucional para confianza</p>
            </div>
            <div className="min-w-0 rounded-2xl bg-white/8 border border-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Sin costos</p>
              <p className="mt-2 break-words leading-relaxed font-semibold">Sin suscripciones — uso comunitario gratuito</p>
            </div>
            <div className="min-w-0 rounded-2xl bg-white/8 border border-white/10 p-4 backdrop-blur sm:col-span-2 xl:col-span-1">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Confianza</p>
              <p className="mt-2 break-words leading-relaxed font-semibold">Historial de vendedores y compradores</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-[2rem] p-6 lg:p-8 shadow-xl">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-sm font-semibold text-indigo-600">{isRegister ? "Crear cuenta" : "Bienvenido de vuelta"}</p>
            <h2 className="text-2xl font-black text-slate-900">{isRegister ? "Registrarse" : "Iniciar sesión"}</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsRegister((value) => !value)}
            className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            {isRegister ? "Ya tengo cuenta" : "Crear cuenta"}
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {isRegister && (
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Nombre</span>
              <div className="relative">
                <UserPlus className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 outline-none transition focus:border-indigo-500 focus:bg-white"
                  placeholder="Tu nombre"
                  required={isRegister}
                />
              </div>
            </label>
          )}

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Correo</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 outline-none transition focus:border-indigo-500 focus:bg-white"
                placeholder="correo@universidad.edu"
                required
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Contraseña</span>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-12 outline-none transition focus:border-indigo-500 focus:bg-white"
                placeholder="Tu contraseña"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-slate-950 px-4 py-3.5 font-bold text-white shadow-lg shadow-indigo-200 transition hover:from-indigo-700 hover:to-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Procesando..." : isRegister ? "Crear cuenta e ingresar" : "Ingresar"}
          </button>
        </form>

        {!isRegister && (
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="mt-3 w-full text-sm text-slate-600 hover:text-slate-900 font-medium transition"
          >
            ¿Olvidaste tu contraseña?
          </button>
        )}

        <p className="mt-6 text-sm text-slate-500 leading-relaxed">
          Si ya tienes una cuenta, inicia sesión para sincronizar favoritos, publicaciones y valoraciones con el backend.
        </p>

        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          <LogIn size={16} /> Volver al marketplace
        </button>
      </section>
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-sm font-semibold text-indigo-600">Recuperar acceso</p>
                <h3 className="text-xl font-black text-slate-900">Restablecer contraseña</h3>
              </div>
      );
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotStep('email');
                  setForgotEmail('');
                  setResetCode('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="p-2 hover:bg-slate-100 rounded-full transition"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleForgotPasswordSubmit}>
              {forgotStep === 'email' && (
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Correo registrado</span>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 outline-none transition focus:border-indigo-500 focus:bg-white"
                      placeholder="tu-correo@universidad.edu"
                      required
                      autoFocus
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Te enviaremos un código a tu correo</p>
                </label>
              )}

              {forgotStep === 'code' && (
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Código de recuperación</span>
                  <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.toUpperCase())}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 outline-none transition focus:border-indigo-500 focus:bg-white text-center text-lg font-bold tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    required
                    autoFocus
                  />
                  <p className="mt-2 text-xs text-slate-500">Revisa tu correo. El código expira en 15 minutos.</p>
                </label>
              )}

              {forgotStep === 'reset' && (
                <>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">Nueva contraseña</span>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 outline-none transition focus:border-indigo-500 focus:bg-white"
                        placeholder="Nueva contraseña"
                        minLength={6}
                        required
                        autoFocus
                      />
                    </div>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">Confirmar contraseña</span>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 outline-none transition focus:border-indigo-500 focus:bg-white"
                        placeholder="Confirmar contraseña"
                        minLength={6}
                        required
                      />
                    </div>
                  </label>
                </>
              )}

              <button
                type="submit"
                disabled={isForgotSubmitting}
                className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-slate-950 px-4 py-3 font-bold text-white shadow-lg shadow-indigo-200 transition hover:from-indigo-700 hover:to-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isForgotSubmitting ? "Procesando..." : "Continuar"}
              </button>
            </form>

            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false);
                setForgotStep('email');
                setForgotEmail('');
                setResetCode('');
                setNewPassword('');
                setConfirmPassword('');
              }}
              className="mt-4 w-full text-sm text-slate-600 hover:text-slate-900 font-medium transition"
            >
              Volver al login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
