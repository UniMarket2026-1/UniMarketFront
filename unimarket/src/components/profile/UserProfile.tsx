"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Star, MessageCircle, BadgeCheck, ShieldCheck, ShieldAlert, Star as StarIcon } from "lucide-react";
import { Product, Rating } from "@/lib/types";
import { apiClient } from "@/lib/api";
import { useApp } from "@/contexts/AppContext";
import { useLang } from "@/i18n/LanguageContext";
import Link from "next/link";
import { useStartChat } from "@/hooks/useChat";
import { toast } from "sonner";

interface UserProfileProps {
  userId: string;
  products: Product[];
}

/**
 * View another user's profile with their products and ratings
 */
export function UserProfile({ userId, products }: UserProfileProps) {
  const router = useRouter();
  const { t } = useLang();
  const { user: currentUser } = useApp();
  const { startChat } = useStartChat();
  const [userData, setUserData] = useState<any>(null);
  const [sellerRatings, setSellerRatings] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await apiClient.findUserById(userId);
        setUserData(response);

        const ratings = await apiClient.getSellerRatings(userId);
        setSellerRatings(Array.isArray(ratings) ? ratings : ratings.data ?? []);
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [userId]);

  const handleContactSeller = async () => {
    if (currentUser.id === userId) {
      toast.error("No puedes iniciar chat contigo mismo");
      return;
    }
    const chatId = await startChat(products[0]);
    if (chatId) {
      router.push(`/chat?chatId=${chatId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <p className="font-bold text-lg">Usuario no encontrado</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-indigo-600 hover:text-indigo-700 font-semibold"
        >
          Volver atrás
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-24">
      {/* Navigation */}
      <div className="fixed top-0 left-0 right-0 z-10 p-4 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* Profile Header */}
      <div className="mt-16 p-6 bg-gradient-to-br from-slate-50 to-slate-100 border-b border-slate-200">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl">
              {userData.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-black text-slate-900">{userData.name}</h1>
              <p className="text-sm text-slate-600">{userData.email}</p>
              <div className="flex items-center gap-2 mt-2">
                {userData.uniandesVerified && (
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
                    <BadgeCheck size={12} />
                    UniAndes Verificado
                  </div>
                )}
              </div>
            </div>
          </div>

          {currentUser.id !== userId && (
            <button
              onClick={handleContactSeller}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all"
            >
              <MessageCircle size={18} />
              Contactar
            </button>
          )}
        </div>

        {/* Ratings Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Calificación</p>
            <div className="flex items-center gap-2 mt-2">
              <StarIcon size={18} className="text-amber-500" fill="currentColor" />
              <span className="text-xl font-bold text-slate-900">
                {userData.totalRating.toFixed(1)}
              </span>
              <span className="text-sm text-slate-500">/ 5.0</span>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Valoraciones</p>
            <p className="text-xl font-bold text-slate-900 mt-2">{sellerRatings.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Productos</p>
            <p className="text-xl font-bold text-slate-900 mt-2">{products.length}</p>
          </div>
        </div>

        {/* Verification Status */}
        <div className="mt-4 flex items-center gap-4">
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              userData.emailVerified
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            {userData.emailVerified ? (
              <ShieldCheck size={16} />
            ) : (
              <ShieldAlert size={16} />
            )}
            <span className="text-sm font-semibold">
              {userData.emailVerified ? "Correo verificado" : "Correo no verificado"}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Ratings */}
      {sellerRatings.length > 0 && (
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Valoraciones recientes</h2>
          <div className="space-y-3">
            {sellerRatings.slice(0, 3).map((rating) => (
              <div key={rating.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-sm font-bold text-slate-700">
                      {rating.buyerName.charAt(0)}
                    </div>
                    <span className="font-semibold text-slate-900">{rating.buyerName}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, idx) => (
                      <StarIcon
                        key={idx}
                        size={14}
                        className={idx < rating.rating ? "text-amber-400" : "text-slate-300"}
                        fill={idx < rating.rating ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                </div>
                {rating.comment && (
                  <p className="text-sm text-slate-700 italic mb-2">"{rating.comment}"</p>
                )}
                <p className="text-xs text-slate-500">
                  {rating.productName} • {new Date(rating.date).toLocaleDateString("es-ES")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products Listing */}
      <div className="p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          Productos ({products.length})
        </h2>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Este usuario no tiene productos activos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="group rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="aspect-square bg-slate-100 overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23e2e8f0'/%3E%3C/svg%3E";
                    }}
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition">
                    {product.name}
                  </h3>
                  <p className="text-sm text-amber-600 font-bold mt-1">
                    ${product.price.toLocaleString()}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
                      {product.category}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                      {product.condition}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
