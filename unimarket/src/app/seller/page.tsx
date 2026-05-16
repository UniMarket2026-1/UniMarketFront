"use client";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { useProducts } from "@/hooks/useProducts";
import { SellerDashboard } from "@/components/seller/SellerDashboard";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

export default function SellerPage() {
  const { sales, purchaseRequests, setPurchaseRequests, user } = useApp();
  const { myProducts, deleteProduct, activateProduct, prepareEdit, prepareNew } = useProducts();
  const router = useRouter();

  const handleApproveRequest = async (requestId: string) => {
    try {
      const updated = await apiClient.approvePurchaseRequest(requestId);
      setPurchaseRequests((prev) => prev.map((request) => (request.id === requestId ? updated : request)));
      toast.success("Solicitud aprobada");
    } catch (error: any) {
      toast.error(error?.message || "No se pudo aprobar la solicitud");
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const updated = await apiClient.rejectPurchaseRequest(requestId);
      setPurchaseRequests((prev) => prev.map((request) => (request.id === requestId ? updated : request)));
      toast.success("Solicitud rechazada");
    } catch (error: any) {
      toast.error(error?.message || "No se pudo rechazar la solicitud");
    }
  };

  const handleConfirmRequestCode = async (requestId: string, code: string) => {
    try {
      const updated = await apiClient.confirmPurchaseCode(requestId, code);
      setPurchaseRequests((prev) => prev.map((request) => (request.id === requestId ? updated : request)));
      toast.success(updated.status === "completed" ? "Compra completada" : "Código confirmado");
    } catch (error: any) {
      toast.error(error?.message || "No se pudo confirmar el código");
    }
  };

  return (
    <SellerDashboard
      myProducts={myProducts}
      sales={sales}
      requests={purchaseRequests.filter((request) => request.sellerId === user.id)}
      onEdit={(product) => {
        prepareEdit(product);
        router.push("/publish");
      }}
      onDelete={deleteProduct}
      onActivate={activateProduct}
      onApproveRequest={handleApproveRequest}
      onRejectRequest={handleRejectRequest}
      onConfirmRequestCode={handleConfirmRequestCode}
      onNewProduct={() => {
        prepareNew();
        router.push("/publish");
      }}
    />
  );
}
