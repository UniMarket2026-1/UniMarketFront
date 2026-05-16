"use client";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { UserProfile } from "@/components/profile/UserProfile";

export default function UserProfilePage() {
  const params = useParams();
  const userId = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const { products } = useApp();

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <p className="font-bold text-lg">Usuario no encontrado</p>
      </div>
    );
  }

  const userProducts = products.filter((p) => p.sellerId === userId && p.active);

  return <UserProfile userId={userId} products={userProducts} />;
}
