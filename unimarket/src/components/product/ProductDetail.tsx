"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MessageCircle,
  Heart,
  Share2,
  Info,
  Star,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Flag,
} from "lucide-react";
import { Product, Rating } from "@/lib/types";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";
import { motion } from "motion/react";
import { useLang } from "@/i18n/LanguageContext";
import { useFavorites } from "@/hooks/useFavorites";
import { useStartChat } from "@/hooks/useChat";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";

interface ProductDetailProps {
  product: Product;
  sellerRatings: Rating[];
  currentUserId: string;
}

/**
 * Full product detail view — HU-01, HU-03, HU-06, HU-09, HU-12
 */
export function ProductDetail({ product, sellerRatings, currentUserId }: ProductDetailProps) {
  const router = useRouter();
  const { t } = useLang();
  const { isFavorite, toggle } = useFavorites();
  const { startChat } = useStartChat();
  const { openReport } = useApp();

  const isOwnProduct = product.sellerId === currentUserId;
  const favored = isFavorite(product.id);

  const handleContactSeller = () => {
    const chatId = startChat(product);
    if (chatId) {
      router.push(`/chat?chatId=${chatId}`);
    }
  };

  const conditionStyle =
    product.condition === "Nuevo"
      ? {
          bg: "bg-emerald-50 border-emerald-200",
          icon: "bg-emerald-100",
          iconColor: "text-emerald-600",
          text: "text-emerald-600",
        }
      : product.condition === "Poco usado"
      ? {
          bg: "bg-amber-50 border-amber-200",
          icon: "bg-amber-100",
          iconColor: "text-amber-600",
          text: "text-amber-600",
        }
      : {
          bg: "bg-slate-50 border-slate-200",
          icon: "bg-slate-100",
          iconColor: "text-slate-600",
          text: "text-slate-600",
        };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col pb-24"
    >
      {/* Navigation */}
      <div className="fixed top-0 left-0 right-0 z-10 p-4 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-100">
        <button
          onClick={() => router.back()}
          className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition-colors"
          aria-label={t.product.back}
        >
          <ArrowLeft size={20} aria-hidden="true" />
        </button>
        <div className="flex gap-2">
          {!isOwnProduct && (
            <button
              onClick={() => openReport(product.id)}
              className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all"
              title={t.product.report}
              aria-label={t.product.report}
            >
              <Flag size={20} aria-hidden="true" />
            </button>
          )}
          <button
            className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition-colors"
            aria-label={t.product.share}
          >
            <Share2 size={20} aria-hidden="true" />
          </button>
          {!isOwnProduct && (
            <button
              onClick={() => toggle(product.id)}
              className={cn(
                "p-2 rounded-full transition-all shadow-sm",
                favored ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-600"
              )}
              aria-label={
                favored ? `Quitar de favoritos` : t.product.favorite
              }
              aria-pressed={favored}
            >
              <Heart
                size={20}
                fill={favored ? "currentColor" : "none"}
                aria-hidden="true"
              />
            </button>
          )}
        </div>
      </div>

      {/* Image */}
      <div className="mt-16 aspect-square w-full">
        <ImageWithFallback
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-bold tracking-wide uppercase">
              {product.category}
            </span>
            <span
              className={cn(
                "px-2 py-0.5 rounded text-xs font-bold tracking-wide uppercase",
                conditionStyle.text,
                conditionStyle.bg.split(" ")[0]
              )}
            >
              {product.condition}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">{product.name}</h1>
          <span className="text-3xl font-extrabold text-indigo-600">
            ${product.price.toLocaleString()}
          </span>
        </div>

        {/* Condition Detail — HU-09 */}
        <div className={cn("p-4 rounded-2xl border-2", conditionStyle.bg)}>
          <div className="flex items-center gap-2 mb-3">
            <div className={cn("p-2 rounded-lg", conditionStyle.icon)}>
              <Info size={18} className={conditionStyle.iconColor} aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <h3 className="font-bold text-slate-900 text-sm">{t.product.status}</h3>
              <span className={cn("text-xs font-bold uppercase tracking-wide", conditionStyle.text)}>
                {product.condition}
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            {product.conditionDetail}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-bold text-slate-800">{t.product.description}</h3>
          <p className="text-slate-600 leading-relaxed">{product.description}</p>
        </div>

        {/* Seller Info */}
        <div className="flex flex-col gap-3 p-4 border border-slate-100 rounded-2xl">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {t.product.sellerInfo}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg"
                aria-hidden="true"
              >
                {product.sellerName.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900">{product.sellerName}</span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star size={14} fill="currentColor" aria-hidden="true" />
                  <span className="text-sm font-bold text-slate-600">
                    {product.sellerRating} / 5.0
                  </span>
                  {sellerRatings.length > 0 && (
                    <span className="text-xs text-slate-400 ml-1">
                      ({sellerRatings.length})
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-slate-400">{t.product.since}</span>
              <div
                className={cn(
                  "flex items-center gap-1",
                  product.sellerVerified ? "text-emerald-600" : "text-amber-600"
                )}
              >
                {product.sellerVerified ? (
                  <ShieldCheck size={14} aria-hidden="true" />
                ) : (
                  <ShieldAlert size={14} aria-hidden="true" />
                )}
                <span className="text-xs font-medium">
                  {product.sellerVerified ? t.product.verified : t.product.notVerified}
                </span>
              </div>
            </div>
          </div>

          {/* Seller Ratings — HU-03 */}
          {sellerRatings.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {t.product.recentRatings}
              </h4>
              {sellerRatings.slice(0, 3).map((rating) => (
                <div key={rating.id} className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600"
                        aria-hidden="true"
                      >
                        {rating.buyerName.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-slate-700">{rating.buyerName}</span>
                    </div>
                    <div className="flex items-center gap-0.5" aria-label={`${rating.rating} de 5 estrellas`}>
                      {[...Array(5)].map((_, idx) => (
                        <Star
                          key={idx}
                          size={12}
                          className={idx < rating.rating ? "text-amber-400" : "text-slate-200"}
                          fill={idx < rating.rating ? "currentColor" : "none"}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                  </div>
                  {rating.comment && (
                    <p className="text-xs text-slate-600 leading-relaxed italic">
                      &ldquo;{rating.comment}&rdquo;
                    </p>
                  )}
                  <span className="text-[10px] text-slate-400">
                    {rating.productName} •{" "}
                    {new Date(rating.date).toLocaleDateString("es-ES", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              ))}
              {sellerRatings.length > 3 && (
                <button className="text-xs text-indigo-600 font-bold hover:underline text-center">
                  {t.product.seeAll} ({sellerRatings.length})
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-slate-500 text-sm italic">
          <MapPin size={16} aria-hidden="true" />
          <span>{product.meetingPoint || t.product.locationFallback}</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-100 flex gap-4">
        {!isOwnProduct ? (
          <button
            onClick={handleContactSeller}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
            aria-label={t.product.contactSeller}
          >
            <MessageCircle size={20} aria-hidden="true" />
            {t.product.contactSeller}
          </button>
        ) : (
          <div className="flex-1 py-3 text-center text-slate-400 italic font-medium bg-slate-50 rounded-xl">
            {t.product.ownProduct}
          </div>
        )}
      </div>
    </motion.div>
  );
}
