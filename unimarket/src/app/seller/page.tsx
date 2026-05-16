"use client";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { useProducts } from "@/hooks/useProducts";
import { SellerDashboard } from "@/components/seller/SellerDashboard";

export default function SellerPage() {
  const { sales } = useApp();
  const { myProducts, deleteProduct, activateProduct, prepareEdit, prepareNew } = useProducts();
  const router = useRouter();

  return (
    <SellerDashboard
      myProducts={myProducts}
      sales={sales}
      onEdit={(product) => {
        prepareEdit(product);
        router.push("/publish");
      }}
      onDelete={deleteProduct}
      onActivate={activateProduct}
      onNewProduct={() => {
        prepareNew();
        router.push("/publish");
      }}
    />
  );
}
