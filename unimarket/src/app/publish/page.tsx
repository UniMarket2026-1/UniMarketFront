"use client";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { useProducts } from "@/hooks/useProducts";
import { PublishProduct } from "@/components/publish/PublishProduct";

export default function PublishPage() {
  const { pendingEdit } = useApp();
  const { saveProduct } = useProducts();
  const router = useRouter();

  const handleSave = async (data: Parameters<typeof saveProduct>[0]) => {
    await saveProduct(data);
    router.push("/seller");
  };

  return (
    <PublishProduct
      initialData={pendingEdit ?? undefined}
      isEditing={!!pendingEdit?.id}
      onSave={handleSave}
    />
  );
}
