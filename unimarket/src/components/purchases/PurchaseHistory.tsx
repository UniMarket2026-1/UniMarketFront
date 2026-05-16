"use client";

import React, { useEffect, useState } from "react";
import {
  History,
  Star,
  RefreshCw,
  CheckCircle2,
  MessageSquare,
  X,
  ShieldCheck,
} from "lucide-react";
import { PurchaseItem } from "@/lib/types";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";
import { motion, AnimatePresence } from "motion/react";
import { useLang } from "@/i18n/LanguageContext";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

/**
 * Purchase history with seller rating and resell — HU-03, HU-04
 */
export function PurchaseHistory() {
  const { t } = useLang();
  const { purchaseHistory, handleRate, handleResell, user, purchaseRequests, setPurchaseRequests } = useApp();
  const router = useRouter();

  const [ratingItem, setRatingItem] = useState<PurchaseItem | null>(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [comment, setComment] = useState("");
  const [codeByRequest, setCodeByRequest] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const requests = await apiClient.getMyPurchaseRequests();
        setPurchaseRequests(Array.isArray(requests) ? requests : requests?.data ?? []);
      } catch {
        // keep existing context state
      }
    };

    load();
  }, [setPurchaseRequests]);

  const handleRateSubmit = () => {
    if (ratingItem && ratingValue > 0) {
      handleRate(ratingItem.purchaseId, ratingValue, comment);
      setRatingItem(null);
      setRatingValue(0);
      setComment("");
    }
  };

  const handleResellClick = (item: PurchaseItem) => {
    handleResell(item);
    router.push("/publish");
  };

  const pendingRequests = purchaseRequests.filter((request) => request.buyerId === user.id);

  const handleConfirmCode = async (requestId: string) => {
    const code = codeByRequest[requestId]?.trim();
    if (!code) {
      toast.error("Ingresa el código compartido por el vendedor");
      return;
    }

    try {
      const updated = await apiClient.confirmPurchaseCode(requestId, code);
      setPurchaseRequests((prev) => prev.map((request) => (request.id === requestId ? updated : request)));
      toast.success(updated.status === "completed" ? "Compra completada" : "Código confirmado");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "No se pudo confirmar el código";
      toast.error(message);
    }
  };

  const ratingLabels: Record<number, string> = {
    1: t.purchases.rating1,
    2: t.purchases.rating2,
    3: t.purchases.rating3,
    4: t.purchases.rating4,
    5: t.purchases.rating5,
  };

  return (
    <div className="flex flex-col gap-6 pb-24">
      <h1 className="text-2xl font-bold text-slate-900 px-1">
        {t.purchases.title}
      </h1>

      <div className="flex flex-col gap-4" role="list" aria-label="Historial de compras">
        {purchaseHistory.map((item) => (
          <div
            key={item.purchaseId}
            role="listitem"
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="p-4 flex gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                <ImageWithFallback
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-1">
                    {item.name}
                  </h3>
                  <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ml-2">
                    {t.purchases.completed}
                  </span>
                </div>
                <span className="text-indigo-600 font-extrabold">
                  ${item.price.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {t.purchases.seller}: {item.sellerName} • {item.date}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-2 flex gap-2">
              {/* HU-04: Resell */}
              <button
                onClick={() => handleResellClick(item)}
                className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all"
                aria-label={`${t.purchases.resell} ${item.name}`}
              >
                <RefreshCw size={14} aria-hidden="true" />
                {t.purchases.resell}
              </button>

              {/* HU-03: Rate */}
              {item.rated ? (
                <div
                  className="flex-1 flex items-center justify-center gap-1.5 text-emerald-600 py-2.5 rounded-xl text-xs font-bold"
                  aria-label={`Ya calificaste a ${item.sellerName}`}
                >
                  <CheckCircle2 size={14} aria-hidden="true" />
                  {t.purchases.rated}
                </div>
              ) : (
                <button
                  onClick={() => setRatingItem(item)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm"
                  aria-label={`Calificar vendedor ${item.sellerName}`}
                >
                  <Star size={14} aria-hidden="true" />
                  {t.purchases.rate}
                </button>
              )}
            </div>
          </div>
        ))}

        {purchaseHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <History size={48} className="opacity-20 mb-4" aria-hidden="true" />
            <p className="font-bold">{t.purchases.empty}</p>
            <p className="text-sm text-center">{t.purchases.emptyDesc}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-slate-900 px-1">Solicitudes de compra</h2>
        {pendingRequests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 text-sm text-slate-500">
            Aún no has enviado solicitudes de compra.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pendingRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                    <ImageWithFallback src={request.productImageUrl} alt={request.productName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{request.productName}</h3>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                        request.status === "approved" ? "bg-emerald-50 text-emerald-600" : request.status === "completed" ? "bg-indigo-50 text-indigo-600" : "bg-amber-50 text-amber-700"
                      )}>{request.status}</span>
                    </div>
                    <p className="text-xs text-slate-500">Vendedor: {request.sellerName}</p>
                    <p className="text-xs text-slate-500">Punto de encuentro: {request.meetingPoint || t.product.locationFallback}</p>
                  </div>
                </div>

                {request.status === "pending" && (
                  <p className="text-sm text-slate-600">La solicitud está esperando aprobación del vendedor.</p>
                )}

                {request.status === "approved" && (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-slate-600 flex items-center gap-2">
                      <ShieldCheck size={16} className="text-emerald-600" />
                      El vendedor aprobó la solicitud. Ahora ambos deben ingresar el código de entrega.
                    </p>
                    <div className="flex gap-2">
                      <input
                        value={codeByRequest[request.id] || ""}
                        onChange={(event) => setCodeByRequest((prev) => ({ ...prev, [request.id]: event.target.value }))}
                        placeholder="Código de entrega"
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-center tracking-[0.3em] font-bold"
                      />
                      <button
                        onClick={() => handleConfirmCode(request.id)}
                        className="px-4 py-3 rounded-xl bg-indigo-600 text-white font-bold"
                      >
                        Confirmar
                      </button>
                    </div>
                  </div>
                )}

                {request.status === "completed" && (
                  <p className="text-sm text-emerald-700 font-medium">Compra completada por ambas partes.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rating Modal — HU-03 */}
      <AnimatePresence>
        {ratingItem && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Calificar vendedor"
            onClick={(e) => {
              if (e.target === e.currentTarget) setRatingItem(null);
            }}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full max-w-md bg-white rounded-t-3xl p-6 shadow-2xl"
            >
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-bold text-slate-900">
                      {t.purchases.rateTitle}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {t.purchases.rateDesc} {ratingItem.sellerName}?
                    </p>
                  </div>
                  <button
                    onClick={() => setRatingItem(null)}
                    className="p-2 bg-slate-100 rounded-full text-slate-400 hover:bg-slate-200 transition-colors"
                    aria-label="Cerrar modal"
                  >
                    <X size={20} aria-hidden="true" />
                  </button>
                </div>

                {/* Star Rating */}
                <div
                  className="flex justify-center gap-2"
                  role="group"
                  aria-label="Calificación de estrellas"
                >
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      onClick={() => setRatingValue(val)}
                      aria-label={`${val} ${val === 1 ? "estrella" : "estrellas"}`}
                      aria-pressed={ratingValue >= val}
                      className={cn(
                        "p-2 transition-all hover:scale-110",
                        ratingValue >= val
                          ? "text-amber-400 scale-110"
                          : "text-slate-200 hover:text-slate-300"
                      )}
                    >
                      <Star
                        size={40}
                        fill={ratingValue >= val ? "currentColor" : "none"}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </button>
                  ))}
                </div>

                {ratingValue > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                    aria-live="polite"
                  >
                    <p className="text-lg font-bold text-slate-800">
                      {ratingLabels[ratingValue]}
                    </p>
                  </motion.div>
                )}

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="rating-comment"
                    className="text-sm font-bold text-slate-700 flex items-center gap-2"
                  >
                    <MessageSquare size={16} className="text-slate-400" aria-hidden="true" />
                    {t.purchases.commentLabel}
                  </label>
                  <textarea
                    id="rating-comment"
                    rows={3}
                    placeholder={t.purchases.commentPlaceholder}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleRateSubmit}
                  disabled={ratingValue === 0}
                  className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl disabled:opacity-50 transition-all shadow-lg shadow-indigo-100 hover:bg-indigo-700"
                  aria-disabled={ratingValue === 0}
                >
                  {t.purchases.submitRating}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
