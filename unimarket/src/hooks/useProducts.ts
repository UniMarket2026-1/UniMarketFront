"use client";

import { useCallback } from "react";
import { useApp } from "@/contexts/AppContext";
import { Product } from "@/lib/types";
import { toast } from "sonner";

/**
 * Custom hook for product management actions — HU-07, HU-10
 * Provides activate, deactivate, and save handlers with toast feedback
 */
export function useProducts() {
  const {
    products,
    user,
    handleSaveProduct,
    handleDeactivate,
    handleActivate,
    setPendingEdit,
  } = useApp();

  const myProducts = products.filter((p) => p.sellerId === user.id);

  const saveProduct = useCallback(
    async (data: Partial<Product>) => {
      await handleSaveProduct(data);
    },
    [handleSaveProduct]
  );

  const deactivateProduct = useCallback(
    (id: string) => {
      handleDeactivate(id);
      toast.info("Publicación desactivada");
    },
    [handleDeactivate]
  );

  const activateProduct = useCallback(
    (id: string) => {
      handleActivate(id);
      toast.success("Publicación reactivada");
    },
    [handleActivate]
  );

  const prepareEdit = useCallback(
    (product: Product) => {
      setPendingEdit(product);
    },
    [setPendingEdit]
  );

  const prepareNew = useCallback(() => {
    setPendingEdit(null);
  }, [setPendingEdit]);

  return {
    products,
    myProducts,
    saveProduct,
    deactivateProduct,
    activateProduct,
    prepareEdit,
    prepareNew,
  };
}
