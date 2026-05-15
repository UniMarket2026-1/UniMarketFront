"use client";
import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { ProductDetail } from "@/components/product/ProductDetail";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import { Rating } from "@/lib/types";

export default function ProductPage() {
  const { products, user } = useApp();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const product = products.find((p) => p.id === id);
  const [sellerRatings, setSellerRatings] = useState<Rating[]>([]);

  useEffect(() => {
    const loadRatings = async () => {
      if (!product?.sellerId) return;

      try {
        const response = await apiClient.getSellerRatings(product.sellerId);
        setSellerRatings(Array.isArray(response) ? response : response.data ?? []);
      } catch {
        setSellerRatings([]);
      }
    };

    loadRatings();
  }, [product?.sellerId]);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <p className="font-bold text-lg">Producto no encontrado</p>
      </div>
    );
  }

  return (
    <ProductDetail
      product={product}
      sellerRatings={sellerRatings}
      currentUserId={user.id}
    />
  );
}
