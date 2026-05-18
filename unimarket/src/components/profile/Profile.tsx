"use client";

import React, { useEffect, useState } from "react";
import {
  Bell,
  Heart,
  Shield,
  BookOpen,
  Laptop,
  Sofa,
  Shirt,
  Package,
  Monitor,
  Dumbbell,
  Palette,
  Music,
  Utensils,
  Gem,
  CheckCircle2,
  AlertCircle,
  BadgeCheck,
  ChevronRight,
  LogOut,
  Edit2,
  Camera,
  Save,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Category } from "@/lib/types";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";
import { useLang } from "@/i18n/LanguageContext";
import { useApp } from "@/contexts/AppContext";
import { apiClient } from "@/lib/api";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

/**
 * User profile with favorites, notification settings, and interests — HU-01, HU-05
 */
export function Profile() {
  const { t } = useLang();
  const router = useRouter();
  const { user, handleToggleNotification, handleUpdateInterests, setUser } = useApp();
  const [activeTab, setActiveTab] = useState<"profile" | "favorites" | "settings">("profile");
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editDescription, setEditDescription] = useState(user.description || "");
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    setEditDescription(user.description || "");
  }, [user.description]);

  const iconByCategory: Record<Category, React.ReactNode> = {
    Libros: <BookOpen size={16} aria-hidden="true" />,
    "Tecnología": <Laptop size={16} aria-hidden="true" />,
    Muebles: <Sofa size={16} aria-hidden="true" />,
    Ropa: <Shirt size={16} aria-hidden="true" />,
    Electrónica: <Monitor size={16} aria-hidden="true" />,
    Deportes: <Dumbbell size={16} aria-hidden="true" />,
    Arte: <Palette size={16} aria-hidden="true" />,
    "Instrumentos Musicales": <Music size={16} aria-hidden="true" />,
    Cocina: <Utensils size={16} aria-hidden="true" />,
    Accesorios: <Gem size={16} aria-hidden="true" />,
    Otros: <Package size={16} aria-hidden="true" />,
  };

  const categories: { id: Category; icon: React.ReactNode; label: string }[] = PRODUCT_CATEGORIES.map((id) => ({
    id,
    icon: iconByCategory[id],
    label: id,
  }));

  const isUniandes = !!user.uniandesVerified;

  const handleToggleInterest = (cat: Category) => {
    if (user.interests.includes(cat)) {
      handleUpdateInterests(user.interests.filter((i) => i !== cat));
    } else {
      handleUpdateInterests([...user.interests, cat]);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError("Todos los campos son requeridos");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas nuevas no coinciden");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      setPasswordLoading(true);
      await apiClient.changePassword(oldPassword, newPassword);
      setShowChangePasswordModal(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      // Show success notification
      alert("Contraseña actualizada exitosamente");
    } catch (error: any) {
      setPasswordError(error.message || "Error al cambiar la contraseña");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSendVerificationCode = async () => {
    try {
      setVerificationLoading(true);
      setVerificationMessage("");
      const response = await apiClient.sendVerificationCode();
      setVerificationMessage(response.message || "Código enviado");
    } catch (error: any) {
      setVerificationMessage(error.message || "No se pudo enviar el código");
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (verificationCode.trim().length < 4) {
      setVerificationMessage("Ingresa el código que llegó a tu correo");
      return;
    }

    try {
      setVerificationLoading(true);
      setVerificationMessage("");
      const updatedUser = await apiClient.verifyEmailCode(verificationCode.trim());
      setUser((prev) => ({
        ...prev,
        ...updatedUser,
        emailVerified: updatedUser.emailVerified ?? true,
        uniandesVerified:
          updatedUser.uniandesVerified ?? (updatedUser.emailVerified && updatedUser.email ? updatedUser.email.toLowerCase().endsWith("@uniandes.edu.co") : false),
      }));
      setVerificationCode("");
      setVerificationMessage("Correo verificado correctamente");
    } catch (error: any) {
      setVerificationMessage(error.message || "Código inválido");
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleLogout = () => {
    apiClient.clearToken();
    setUser({
      id: "",
      name: "Invitado",
      email: "",
      role: "student",
      emailVerified: false,
      favorites: [],
      interests: [],
      notificationsEnabled: true,
      totalRating: 0,
      ratingCount: 0,
      ratings: [],
    });
    router.push("/");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfileEdit = async () => {
    try {
      setIsSavingProfile(true);
      let profileImageUrl = user.profileImageUrl;

      // If there's a new image, upload it (for now we'll just use data URL)
      if (profileImagePreview && profileImageFile) {
        // In production, upload to cloud storage (S3, Cloudinary, etc.)
        // For now, store as data URL (not ideal for production)
        profileImageUrl = profileImagePreview;
      }

      const updatedUser = await apiClient.updateUser(user.id, {
        description: editDescription,
        profileImageUrl,
      });

      setUser((prev) => ({
        ...prev,
        ...updatedUser,
      }));

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "user_data",
          JSON.stringify({
            ...user,
            ...updatedUser,
          })
        );
      }

      setIsEditingProfile(false);
      setProfileImagePreview(null);
      setProfileImageFile(null);
    } catch (error: any) {
      alert("Error al guardar el perfil: " + (error.message || "Unknown error"));
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Products favorited by the user (from context products list)
  const { products } = useApp();
  const favoriteProducts = products.filter((p) => user.favorites.includes(p.id));

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* User Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center gap-4">
        {isEditingProfile ? (
          <>
            {/* Profile Picture Upload */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-3xl font-bold border-4 border-white shadow-md overflow-hidden">
                {profileImagePreview ? (
                  <img src={profileImagePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : user.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition-colors">
                <Camera size={16} aria-hidden="true" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  aria-label="Cambiar foto de perfil"
                />
              </label>
            </div>

            <div className="flex flex-col items-center w-full gap-4">
              <div className="flex flex-col items-center">
                <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
                <span className="text-sm text-slate-500 font-medium">{user.email}</span>
              </div>

              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Escribe una descripción de ti (máx 200 caracteres)"
                maxLength={200}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                rows={3}
              />

              <div className="flex gap-2 w-full">
                <button
                  onClick={() => {
                    setIsEditingProfile(false);
                    setEditDescription(user.description || "");
                    setProfileImagePreview(null);
                    setProfileImageFile(null);
                  }}
                  disabled={isSavingProfile}
                  className="flex-1 px-4 py-2 rounded-xl bg-slate-100 text-slate-800 font-bold hover:bg-slate-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <X size={16} aria-hidden="true" />
                  Cancelar
                </button>
                <button
                  onClick={handleSaveProfileEdit}
                  disabled={isSavingProfile}
                  className="flex-1 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save size={16} aria-hidden="true" />
                  {isSavingProfile ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Profile Picture Display */}
            <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-3xl font-bold border-4 border-white shadow-md overflow-hidden">
              {user.profileImageUrl ? (
                <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <div className="flex flex-col items-center">
              <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
              <span className="text-sm text-slate-500 font-medium">{user.email}</span>
            </div>

            {user.description && (
              <p className="text-sm text-slate-600 text-center italic">{user.description}</p>
            )}

            <button
              onClick={() => setIsEditingProfile(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-600 font-semibold hover:bg-indigo-100 transition-colors"
            >
              <Edit2 size={16} aria-hidden="true" />
              Editar perfil
            </button>
          </>
        )}

        {/* Tab Buttons */}
        {!isEditingProfile && (
          <div className="flex gap-2 w-full mt-2" role="tablist" aria-label="Secciones del perfil">
            <button
              role="tab"
              aria-selected={activeTab === "profile"}
              onClick={() => setActiveTab("profile")}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all",
                activeTab === "profile"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                  : "bg-slate-50 text-slate-500"
              )}
            >
              {t.profile.myProfile}
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "favorites"}
              onClick={() => setActiveTab("favorites")}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                activeTab === "favorites"
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-100"
                  : "bg-slate-50 text-slate-500"
              )}
            >
              <Heart size={14} fill={activeTab === "favorites" ? "currentColor" : "none"} aria-hidden="true" />
              {t.profile.favorites}
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "settings"}
              onClick={() => setActiveTab("settings")}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all",
                activeTab === "settings"
                  ? "bg-slate-800 text-white shadow-lg shadow-slate-200"
                  : "bg-slate-50 text-slate-500"
              )}
            >
              {t.profile.settings}
            </button>
          </div>
        )}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="flex flex-col gap-4" role="tabpanel" aria-label={t.profile.myProfile}>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Shield size={18} className="text-indigo-600" aria-hidden="true" />
              {t.profile.verification}
            </h3>
            <div
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border",
                user.emailVerified
                  ? "bg-emerald-50 border-emerald-100"
                  : "bg-amber-50 border-amber-100"
              )}
            >
              {user.emailVerified ? (
                <CheckCircle2 className="text-emerald-600 shrink-0" size={24} aria-hidden="true" />
              ) : (
                <AlertCircle className="text-amber-600 shrink-0" size={24} aria-hidden="true" />
              )}
              <div className="flex flex-col">
                <span
                  className={cn(
                    "text-sm font-bold",
                    user.emailVerified ? "text-emerald-800" : "text-amber-800"
                  )}
                >
                  {user.emailVerified ? t.profile.verified : t.profile.notVerified}
                </span>
                <span
                  className={cn(
                    "text-xs font-medium",
                    user.emailVerified ? "text-emerald-600" : "text-amber-700"
                  )}
                >
                  {user.emailVerified ? t.profile.verifiedDesc : t.profile.notVerifiedDesc}
                </span>
              </div>
            </div>

            {isUniandes && (
              <div className="flex items-center gap-3 p-3 rounded-xl border bg-amber-50 border-amber-100">
                <BadgeCheck className="text-amber-600 shrink-0" size={24} aria-hidden="true" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-amber-800">{t.profile.uniandesBadge}</span>
                  <span className="text-xs text-amber-700 font-medium">{t.profile.uniandesDesc}</span>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2 border-t border-slate-100">
              <p className="text-sm font-semibold text-slate-700">{t.profile.verificationFlow}</p>
              <p className="text-xs text-slate-500">{t.profile.codeHint}</p>
              {verificationMessage && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700">
                  {verificationMessage}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={verificationCode}
                  onChange={(event) => setVerificationCode(event.target.value)}
                  placeholder={t.profile.verificationPlaceholder}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all tracking-[0.3em] text-center font-bold"
                  maxLength={6}
                  disabled={verificationLoading || user.emailVerified}
                />
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleSendVerificationCode}
                    disabled={verificationLoading || user.emailVerified}
                    className="px-4 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm disabled:opacity-60"
                  >
                    {verificationLoading ? "Enviando..." : user.emailVerified ? "Ya verificado" : t.profile.sendCode}
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyEmail}
                    disabled={verificationLoading || user.emailVerified}
                    className="px-4 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm disabled:opacity-60"
                  >
                    {verificationLoading ? "Verificando..." : t.profile.verifyCode}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <LogOut size={18} className="text-slate-400" aria-hidden="true" />
              {t.profile.account}
            </h3>
            <button 
              onClick={() => setShowChangePasswordModal(true)}
              className="w-full text-left py-3 border-b border-slate-50 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors flex justify-between items-center"
            >
              {t.profile.changePassword}
              <ChevronRight size={16} aria-hidden="true" />
            </button>
            <button 
              onClick={handleLogout}
              className="w-full text-left py-3 text-sm font-medium text-rose-600 hover:text-rose-700 transition-colors flex justify-between items-center"
            >
              {t.profile.logOut}
              <LogOut size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Favorites Tab — HU-01 */}
      {activeTab === "favorites" && (
        <div className="flex flex-col gap-3" role="tabpanel" aria-label={t.profile.favorites}>
          {favoriteProducts.map((item) => (
            <Link
              key={item.id}
              href={`/product/${item.id}`}
              className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex gap-3 hover:border-indigo-200 transition-all"
              aria-label={`Ver ${item.name}, $${item.price.toLocaleString()}`}
            >
              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                <ImageWithFallback
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 flex flex-col justify-between py-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{item.name}</h3>
                  <Heart size={16} className="text-rose-500 shrink-0 ml-1" fill="currentColor" aria-hidden="true" />
                </div>
                <span className="font-extrabold text-indigo-600 text-base">
                  ${item.price.toLocaleString()}
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">{item.sellerName}</span>
                  <span
                    className={cn(
                      "text-[8px] font-bold px-1.5 py-0.5 rounded uppercase",
                      item.active
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-rose-50 text-rose-600"
                    )}
                  >
                    {item.active ? t.profile.available : t.profile.outOfStock}
                  </span>
                </div>
              </div>
            </Link>
          ))}

          {favoriteProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Heart size={48} className="opacity-20 mb-4" aria-hidden="true" />
              <p className="font-bold">{t.profile.favEmpty}</p>
              <p className="text-sm text-center">{t.profile.favEmptyDesc}</p>
            </div>
          )}
        </div>
      )}

      {/* Settings Tab — HU-05 */}
      {activeTab === "settings" && (
        <div className="flex flex-col gap-6" role="tabpanel" aria-label={t.profile.settings}>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-5">
            {/* Notification Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg" aria-hidden="true">
                  <Bell size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800">{t.profile.notifications}</span>
                  <span className="text-xs text-slate-500 font-medium">{t.profile.notifDesc}</span>
                </div>
              </div>
              <button
                role="switch"
                aria-checked={user.notificationsEnabled}
                aria-label={`${t.profile.notifications}: ${user.notificationsEnabled ? "activadas" : "desactivadas"}`}
                onClick={handleToggleNotification}
                className={cn(
                  "w-12 h-6 rounded-full relative transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500",
                  user.notificationsEnabled ? "bg-indigo-600" : "bg-slate-200"
                )}
              >
                <div
                  className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                    user.notificationsEnabled ? "left-7" : "left-1"
                  )}
                />
              </button>
            </div>

            {/* Interests */}
            <div className="flex flex-col gap-4 pt-4 border-t border-slate-50">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {t.profile.interests}
              </span>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Categorías de interés">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleToggleInterest(cat.id)}
                    aria-pressed={user.interests.includes(cat.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border",
                      user.interests.includes(cat.id)
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100"
                        : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"
                    )}
                  >
                    {cat.icon}
                    {cat.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 font-medium italic">
                {t.profile.interestsNote}
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-slate-900">Cambiar Contraseña</h2>
            
            {passwordError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
                {passwordError}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">Contraseña Actual</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña actual"
                  className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={passwordLoading}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">Nueva Contraseña</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ingresa una nueva contraseña"
                  className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={passwordLoading}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma tu nueva contraseña"
                  className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={passwordLoading}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowChangePasswordModal(false)}
                disabled={passwordLoading}
                className="flex-1 px-4 py-2 rounded-lg bg-slate-100 text-slate-800 font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleChangePassword}
                disabled={passwordLoading}
                className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {passwordLoading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
