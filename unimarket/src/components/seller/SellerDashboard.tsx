"use client";

import React, { useState } from "react";
import { List, History, DollarSign, Package, CheckCircle2, XCircle, Edit3, TrendingUp, Calendar, Plus } from "lucide-react";
import { Product, Sale } from "@/lib/types";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";
import { motion } from "motion/react";
import { useLang } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

interface SellerDashboardProps {
  myProducts: Product[];
  sales: Sale[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onActivate: (id: string) => void;
  onNewProduct: () => void;
}

/**
 * Seller management panel — HU-07, HU-08, HU-10
 */
export function SellerDashboard({
  myProducts,
  sales,
  onEdit,
  onDelete,
  onActivate,
  onNewProduct,
}: SellerDashboardProps) {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState<"listings" | "history">("listings");

  const totalRevenue = sales.reduce((acc, sale) => acc + sale.price, 0);
  const activeCount = myProducts.filter((p) => p.active).length;

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{t.seller.title}</h1>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onNewProduct}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-full font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          aria-label={t.seller.newProduct}
        >
          <Plus size={20} aria-hidden="true" />
          <span>{t.seller.newProduct}</span>
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === "listings"}
          onClick={() => setActiveTab("listings")}
          className={cn(
            "flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
            activeTab === "listings" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"
          )}
        >
          <List size={16} aria-hidden="true" />
          {t.seller.listings}
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "history"}
          onClick={() => setActiveTab("history")}
          className={cn(
            "flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
            activeTab === "history" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"
          )}
        >
          <History size={16} aria-hidden="true" />
          {t.seller.sales}
        </button>
      </div>

      {activeTab === "listings" ? (
        <div className="flex flex-col gap-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-indigo-600 p-4 rounded-2xl text-white shadow-lg shadow-indigo-100 flex flex-col gap-1">
              <span className="text-xs font-medium opacity-80 uppercase tracking-wider">
                {t.seller.active}
              </span>
              <span className="text-2xl font-bold">
                {activeCount} / {myProducts.length}
              </span>
            </div>
            <div className="bg-emerald-500 p-4 rounded-2xl text-white shadow-lg shadow-emerald-100 flex flex-col gap-1">
              <span className="text-xs font-medium opacity-80 uppercase tracking-wider">
                {t.seller.sold}
              </span>
              <span className="text-2xl font-bold">{sales.length}</span>
            </div>
          </div>

          {/* CTA Banner when empty */}
          {myProducts.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-12 gap-4 bg-indigo-50 rounded-2xl border-2 border-dashed border-indigo-200"
            >
              <Package size={48} className="text-indigo-300" aria-hidden="true" />
              <div className="text-center">
                <p className="font-bold text-slate-700">{t.seller.empty}</p>
                <p className="text-sm text-slate-500 mt-1">{t.seller.emptyDesc}</p>
              </div>
              <button
                onClick={onNewProduct}
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-full font-bold hover:bg-indigo-700 transition-colors"
              >
                <Plus size={18} aria-hidden="true" />
                {t.seller.publishFirst}
              </button>
            </motion.div>
          )}

          {/* Product List */}
          <div className="flex flex-col gap-3">
            {myProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex gap-3"
              >
                <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
                  <ImageWithFallback
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-slate-800 line-clamp-1 text-sm">
                        {product.name}
                      </h3>
                      <span
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase",
                          product.active
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-slate-100 text-slate-500"
                        )}
                      >
                        {product.active ? t.seller.active_badge : t.seller.paused_badge}
                      </span>
                    </div>
                    <span className="font-extrabold text-indigo-600 text-base">
                      ${product.price.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(product)}
                      className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      aria-label={`${t.common.edit} ${product.name}`}
                    >
                      <Edit3 size={16} aria-hidden="true" />
                    </button>
                    {product.active ? (
                      <button
                        onClick={() => onDelete(product.id)}
                        className="flex-1 bg-slate-50 text-slate-500 text-xs font-bold py-2 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors flex items-center justify-center gap-1.5"
                        aria-label={`${t.seller.delete} ${product.name}`}
                      >
                        <XCircle size={16} aria-hidden="true" />
                        {t.seller.delete}
                      </button>
                    ) : (
                      <button
                        onClick={() => onActivate(product.id)}
                        className="flex-1 bg-indigo-50 text-indigo-600 text-xs font-bold py-2 rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1.5"
                        aria-label={`${t.seller.activate} ${product.name}`}
                      >
                        <CheckCircle2 size={16} aria-hidden="true" />
                        {t.seller.activate}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Sales History — HU-08 */
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {t.seller.totalRevenue}
                </span>
                <span className="text-3xl font-extrabold text-indigo-600">
                  ${totalRevenue.toLocaleString()}
                </span>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                <TrendingUp size={24} aria-hidden="true" />
              </div>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden" aria-hidden="true">
              <div className="h-full bg-emerald-500 w-[70%]" />
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <History size={18} className="text-slate-400" aria-hidden="true" />
              {t.seller.salesHistory}
            </h3>
            <button className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">
              <Calendar size={14} aria-hidden="true" />
              {t.seller.last30}
            </button>
          </div>

          <div className="flex flex-col gap-3" role="list" aria-label="Historial de ventas">
            {sales.map((sale) => (
              <div
                key={sale.id}
                role="listitem"
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-slate-800">{sale.productName}</span>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{sale.date}</span>
                    <span aria-hidden="true">•</span>
                    <span>
                      {t.seller.buyer}: {sale.buyerName}
                    </span>
                  </div>
                </div>
                <span className="font-extrabold text-emerald-600">
                  +${sale.price.toLocaleString()}
                </span>
              </div>
            ))}
            {sales.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <DollarSign size={48} className="opacity-20 mb-4" aria-hidden="true" />
                <p>{t.seller.noSales}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
