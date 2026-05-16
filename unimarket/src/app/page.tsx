"use client";
import { useApp } from "@/contexts/AppContext";
import { Marketplace } from "@/components/marketplace/Marketplace";
import { NearbyListings } from "@/components/marketplace/NearbyListings";

export default function MarketplacePage() {
  const { products, user } = useApp();
  return (
    <div className="space-y-8 pb-24">
      <section className="px-4 md:px-6">
        <NearbyListings products={products} />
      </section>
      <section className="px-4 md:px-6">
        <Marketplace products={products} currentUserId={user.id} />
      </section>
    </div>
  );
}
