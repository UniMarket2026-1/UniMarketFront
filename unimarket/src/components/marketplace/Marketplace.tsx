"use client";

import React, { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Heart, Star, Info } from "lucide-react";
import { Product } from "@/lib/types";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";
import { motion, AnimatePresence } from "motion/react";
import { useLang } from "@/i18n/LanguageContext";
import { useFilters } from "@/hooks/useFilters";
import { useFavorites } from "@/hooks/useFavorites";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

interface MarketplaceProps {
  products: Product[];
  currentUserId: string;
}

/**
 * Marketplace view with product grid, search, and filters — HU-01, HU-02, HU-09
 */
export function Marketplace({ products, currentUserId }: MarketplaceProps) {
  const { t } = useLang();
  const { favorites, isFavorite, toggle } = useFavorites();
  const { refreshProducts } = useApp();
  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedCondition,
    setSelectedCondition,
    maxPrice,
    setMaxPrice,
    filteredProducts,
    clearFilters,
    hasActiveFilters,
  } = useFilters(products);

  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");
  const [showFilters, setShowFilters] = useState(false);

  // Auto-refresh products when filters change
  useEffect(() => {
    refreshProducts();
  }, [searchTerm, selectedCategory, selectedCondition, maxPrice, refreshProducts]);

  const categories = ["Todos", ...PRODUCT_CATEGORIES] as const;
  const conditions = ["Todos", "Nuevo", "Poco usado", "Usado"] as const;

  const favoriteProducts = filteredProducts.filter((p) => favorites.includes(p.id));
  const displayedProducts = activeTab === "all" ? filteredProducts : favoriteProducts;

  return (
    <div className="flex flex-col gap-4 pb-24">
      <h1 className="text-2xl font-bold text-slate-900">{t.marketplace.title}</h1>

      {/* Tabs — HU-01 */}
      <div
        className="flex bg-slate-100 p-1 rounded-xl gap-1"
        role="tablist"
        aria-label="Secciones del marketplace"
      >
        <button
          role="tab"
          aria-selected={activeTab === "all"}
          aria-controls="tab-panel"
          id="tab-all"
          onClick={() => setActiveTab("all")}
          className={cn(
            "flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1.5",
            activeTab === "all"
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-slate-500"
          )}
        >
          <Search size={15} aria-hidden="true" />
          {t.marketplace.tabAll}
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "favorites"}
          aria-controls="tab-panel"
          id="tab-favorites"
          onClick={() => setActiveTab("favorites")}
          className={cn(
            "flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1.5",
            activeTab === "favorites"
              ? "bg-white text-rose-600 shadow-sm"
              : "text-slate-500"
          )}
        >
          <Heart
            size={15}
            fill={activeTab === "favorites" ? "currentColor" : "none"}
            aria-hidden="true"
          />
          {t.marketplace.tabFavorites}
          {favorites.length > 0 && (
            <span
              className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                activeTab === "favorites"
                  ? "bg-rose-100 text-rose-600"
                  : "bg-slate-200 text-slate-500"
              )}
            >
              {favorites.length}
            </span>
          )}
        </button>
      </div>

      {/* Search + Filter — HU-02 */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder={t.marketplace.search}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label={t.marketplace.search}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          aria-expanded={showFilters}
          aria-label={t.marketplace.filters}
          className={cn(
            "p-3 rounded-xl border transition-all",
            showFilters
              ? "bg-indigo-50 border-indigo-200 text-indigo-600"
              : hasActiveFilters
              ? "bg-amber-50 border-amber-200 text-amber-600"
              : "bg-white border-slate-200 text-slate-600"
          )}
        >
          <SlidersHorizontal size={24} aria-hidden="true" />
        </button>
      </div>

      {/* Filters HUD */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-slate-50 rounded-2xl border border-slate-200"
          >
            <div className="p-4 flex flex-col gap-4">
              <fieldset>
                <legend className="text-sm font-semibold text-slate-700 mb-2">
                  {t.marketplace.category}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() =>
                        setSelectedCategory(cat as typeof selectedCategory)
                      }
                      aria-pressed={selectedCategory === cat}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm transition-all",
                        selectedCategory === cat
                          ? "bg-indigo-600 text-white"
                          : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-semibold text-slate-700 mb-2">
                  {t.marketplace.condition}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {conditions.map((cond) => (
                    <button
                      key={cond}
                      onClick={() =>
                        setSelectedCondition(cond as typeof selectedCondition)
                      }
                      aria-pressed={selectedCondition === cond}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm transition-all",
                        selectedCondition === cond
                          ? "bg-indigo-600 text-white"
                          : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300"
                      )}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-700">
                    {t.marketplace.maxPrice}: ${maxPrice.toLocaleString()}
                  </span>
                  <button
                    onClick={clearFilters}
                    className="text-xs text-indigo-600 font-medium hover:underline"
                  >
                    {t.marketplace.clearFilters}
                  </button>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000000"
                  step="5000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  aria-label={`${t.marketplace.maxPrice}: ${maxPrice}`}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Grid */}
      <div
        id="tab-panel"
        role="tabpanel"
        aria-labelledby={activeTab === "all" ? "tab-all" : "tab-favorites"}
      >
        {activeTab === "favorites" && favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
            <Heart size={48} className="opacity-20" aria-hidden="true" />
            <p className="font-bold">{t.marketplace.noFavorites}</p>
            <p className="text-sm text-center px-6">{t.marketplace.noFavoritesDesc}</p>
            <button
              onClick={() => setActiveTab("all")}
              className="text-indigo-600 font-semibold hover:underline"
            >
              {t.marketplace.tabAll}
            </button>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
            <Search size={48} className="opacity-20" aria-hidden="true" />
            <p className="font-medium">{t.marketplace.noProducts}</p>
            <button
              onClick={clearFilters}
              className="text-indigo-600 font-semibold hover:underline"
            >
              {t.marketplace.seeAll}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={isFavorite(product.id)}
                onToggleFavorite={() => toggle(product.id)}
                currentUserId={currentUserId}
                prevUseLabel={t.marketplace.prevUse}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  currentUserId: string;
  prevUseLabel: string;
}

function ProductCard({
  product,
  isFavorite,
  onToggleFavorite,
  currentUserId,
  prevUseLabel,
}: ProductCardProps) {
  const conditionColor =
    product.condition === "Nuevo"
      ? "bg-emerald-500"
      : product.condition === "Poco usado"
      ? "bg-amber-500"
      : "bg-slate-500";

  return (
    <motion.article
      layout
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
      aria-label={`${product.name}, $${product.price.toLocaleString()}, condición: ${product.condition}`}
    >
      {/* Image area — relative container for badges + favorite button */}
      <div className="relative aspect-square overflow-hidden">
        <Link
          href={`/product/${product.id}`}
          className="block w-full h-full"
          tabIndex={-1}
          aria-hidden="true"
        >
          <ImageWithFallback
            src={product.imageUrl}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2 pointer-events-none" aria-hidden="true">
          <span
            className={cn(
              "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-white shadow-sm",
              conditionColor
            )}
          >
            {product.condition}
          </span>
          <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold text-slate-700 uppercase tracking-wider shadow-sm">
            {product.category}
          </span>
        </div>

        {/* Favorite button — HU-01, positioned bottom-right to avoid badge overlap */}
        {product.sellerId !== currentUserId && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            aria-label={
              isFavorite
                ? `Quitar ${product.name} de favoritos`
                : `Guardar ${product.name} en favoritos`
            }
            aria-pressed={isFavorite}
            className={cn(
              "absolute bottom-3 right-3 p-2.5 rounded-full shadow-md transition-all z-10",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
              isFavorite
                ? "bg-rose-500 text-white scale-110"
                : "bg-white/90 backdrop-blur-sm text-slate-400 hover:text-rose-500 hover:bg-white"
            )}
          >
            <Heart
              size={18}
              fill={isFavorite ? "currentColor" : "none"}
              aria-hidden="true"
            />
          </button>
        )}
      </div>

      {/* Card content */}
      <Link
        href={`/product/${product.id}`}
        className="flex flex-col gap-2 p-4 flex-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
        aria-label={`Ver detalle de ${product.name}, $${product.price.toLocaleString()}`}
      >
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors min-w-0">
            {product.name}
          </h3>
          <span className="font-bold text-indigo-700 whitespace-nowrap shrink-0">
            ${product.price.toLocaleString()}
          </span>
        </div>
        <p className="text-xs text-slate-500 line-clamp-2">{product.description}</p>

        {/* Condition Detail — HU-09 */}
        <div className="mt-1 p-2 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-start gap-1.5">
            <Info size={12} className="text-indigo-500 mt-0.5 shrink-0" aria-hidden="true" />
            <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
              <span className="font-bold text-slate-700">{prevUseLabel}</span>{" "}
              {product.conditionDetail}
            </p>
          </div>
        </div>

        <div className="pt-2 mt-auto border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div
              className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600"
              aria-hidden="true"
            >
              {product.sellerName.charAt(0)}
            </div>
            <span className="text-xs text-slate-600 font-medium">{product.sellerName}</span>
          </div>
          <div
            className="flex items-center gap-0.5 text-amber-500"
            aria-label={`Calificación: ${product.sellerRating}`}
          >
            <Star size={12} fill="currentColor" aria-hidden="true" />
            <span className="text-xs font-bold">{product.sellerRating}</span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
