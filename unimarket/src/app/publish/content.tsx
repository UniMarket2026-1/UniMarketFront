"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { useProducts } from "@/hooks/useProducts";
import { PublishProduct } from "@/components/publish/PublishProduct";
import { useEffect, useState } from "react";
import { Product } from "@/lib/types";

export default function PublishContent() {
  const { pendingEdit, products, setPendingEdit } = useApp();
  const { saveProduct } = useProducts();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [initialData, setInitialData] = useState<Partial<Product> | undefined>(undefined);

  useEffect(() => {
    const editId = searchParams.get("edit");
    if (editId) {
      const product = products.find(p => p.id === editId);
      setInitialData(product);
      setPendingEdit(product ?? null);
    } else if (pendingEdit) {
      setInitialData(pendingEdit);
    }
  }, [searchParams, pendingEdit, products]);

  const handleSave = async (data: Parameters<typeof saveProduct>[0]) => {
    await saveProduct(data);
    router.push("/seller");
  };

  return (
    <PublishProduct
      initialData={initialData}
      isEditing={!!initialData?.id}
      onSave={handleSave}
    />
  );
}
