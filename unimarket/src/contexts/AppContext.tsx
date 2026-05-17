"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  Product,
  User,
  Report,
  Rating,
  Chat,
  AppNotification,
  PurchaseItem,
  PurchaseRequest,
  Message,
  Category,
} from "@/lib/types";
// import {
//   MOCK_PRODUCTS,
//   MOCK_USER,
//   MOCK_SALES,
//   MOCK_CHATS,
//   MOCK_REPORTS,
//   MOCK_RATINGS,
//   MOCK_NOTIFICATIONS,
//   MOCK_PURCHASE_HISTORY,
//   INITIAL_MESSAGES,
// } from "@/lib/mockData";
import { Sale } from "@/lib/types";
import { apiClient } from "@/lib/api";

// ─── Shape ───────────────────────────────────────────────────────────────────

interface AppContextType {
  // Data
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  reports: Report[];
  setReports: React.Dispatch<React.SetStateAction<Report[]>>;
  allRatings: Rating[];
  setAllRatings: React.Dispatch<React.SetStateAction<Rating[]>>;
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  messages: Record<string, Message[]>;
  setMessages: React.Dispatch<React.SetStateAction<Record<string, Message[]>>>;
  notifications: AppNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  purchaseHistory: PurchaseItem[];
  setPurchaseHistory: React.Dispatch<React.SetStateAction<PurchaseItem[]>>;
  purchaseRequests: PurchaseRequest[];
  setPurchaseRequests: React.Dispatch<React.SetStateAction<PurchaseRequest[]>>;
  sales: Sale[];

  // Role toggle (student / admin)
  userRole: "student" | "admin";
  setUserRole: React.Dispatch<React.SetStateAction<"student" | "admin">>;

  // Editing state (for publish page)
  pendingEdit: Partial<Product> | null;
  setPendingEdit: React.Dispatch<React.SetStateAction<Partial<Product> | null>>;

  // Report modal state
  reportModalOpen: boolean;
  setReportModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  reportingItemId: string;
  reportingItemType: "product" | "user";
  reportingItemName: string;

  // Notification panel
  notifPanelOpen: boolean;
  setNotifPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  unreadCount: number;

  // Actions – HU-01 Favorites
  toggleFavorite: (productId: string) => void;

  // Actions – HU-03 Ratings
  handleRate: (purchaseId: string, rating: number, comment: string) => void;

  // Actions – HU-04 Resell
  handleResell: (boughtProduct: PurchaseItem) => void;

  // Actions – Products
  handleSaveProduct: (data: Partial<Product>) => void;
  handleDeleteProduct: (id: string) => Promise<void>;
  handleActivate: (id: string) => void;

  // Actions – HU-12 Reports
  openReport: (productId: string) => void;
  handleSubmitReport: (category: string, reason: string, description: string) => void;
  handleResolveReport: (
    id: string,
    action: "warning" | "suspension" | "removal" | "dismiss"
  ) => void;

  // Actions – HU-06 Chat
  handleStartChat: (product: Product) => string | null; // returns chatId

  // Actions – Notifications
  handleMarkAllRead: () => void;
  handleMarkRead: (id: string) => void;

  // Actions – HU-05 Profile/interests
  handleToggleNotification: () => void;
  handleUpdateInterests: (interests: Category[]) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<User>({
    id: "",
    name: "Invitado",
    email: "",
    role: "student",
    emailVerified: false,
    favorites: [],
    interests: [],
    notificationsEnabled: true,
    totalRating: 0,
    ratingCount: 0,
    ratings: [],
  });
  const [reports, setReports] = useState<Report[]>([]);
  const [allRatings, setAllRatings] = useState<Rating[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseItem[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [userRole, setUserRole] = useState<"student" | "admin">("student");
  const [pendingEdit, setPendingEdit] = useState<Partial<Product> | null>(null);

  // Report modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportingItemId, setReportingItemId] = useState("");
  const [reportingItemType, setReportingItemType] = useState<"product" | "user">("product");
  const [reportingItemName, setReportingItemName] = useState("");

  // Notifications panel
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const normalizeUser = useCallback(
    (apiUser: Partial<User>) => ({
      id: apiUser.id ?? "",
      name: apiUser.name ?? "Invitado",
      email: apiUser.email ?? "",
      role: apiUser.role ?? "student",
      emailVerified: apiUser.emailVerified ?? false,
      ratings: apiUser.ratings ?? [],
      favorites: apiUser.favorites ?? [],
      interests: apiUser.interests ?? [],
      notificationsEnabled: apiUser.notificationsEnabled ?? true,
      totalRating: apiUser.totalRating ?? 0,
      ratingCount: apiUser.ratingCount ?? 0,
      uniandesVerified:
        apiUser.uniandesVerified ?? (apiUser.emailVerified && apiUser.email ? apiUser.email.toLowerCase().endsWith("@uniandes.edu.co") : false),
    }),
    []
  );

  const loadRemoteState = useCallback(async () => {
    try {
      const productsResponse = await apiClient.getProducts(1, 100);
      const remoteProducts = Array.isArray(productsResponse?.data)
        ? productsResponse.data
        : Array.isArray(productsResponse)
        ? productsResponse
        : [];

      if (remoteProducts.length > 0) {
        setProducts(remoteProducts);
      }

      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      if (token) {
        try {
          const currentUser = await apiClient.getCurrentUser();
          setUser(normalizeUser(currentUser));
        } catch {
          // If API fails, try to restore user from localStorage
          const savedUser = typeof window !== "undefined" ? localStorage.getItem("user_data") : null;
          if (savedUser) {
            try {
              setUser(normalizeUser(JSON.parse(savedUser)));
            } catch {
              // Clear invalid data
              localStorage.removeItem("user_data");
              localStorage.removeItem("auth_token");
            }
          }
        }
        try {
          const requests = await apiClient.getMyPurchaseRequests();
          setPurchaseRequests(Array.isArray(requests) ? requests : requests?.data ?? []);
        } catch {
          setPurchaseRequests([]);
        }
      }
    } catch {
      // Fall back to the bundled demo data when the API is unavailable.
    }
  }, [normalizeUser]);

  useEffect(() => {
    loadRemoteState();
  }, [loadRemoteState]);

  // ── HU-01: Persist favorites in localStorage ──────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("uni_market_favs");
    if (saved) {
      setUser((prev) => ({ ...prev, favorites: JSON.parse(saved) }));
    }
  }, []);

  const toggleFavorite = useCallback(
    async (productId: string) => {
      const newFavs = user.favorites.includes(productId)
        ? user.favorites.filter((f) => f !== productId)
        : [...user.favorites, productId];
      setUser((prev) => ({ ...prev, favorites: newFavs }));
      localStorage.setItem("uni_market_favs", JSON.stringify(newFavs));

      if (typeof window !== "undefined" && localStorage.getItem("auth_token")) {
        try {
          await apiClient.toggleFavorite(user.id, productId);
        } catch {
          // Keep the optimistic local state if the backend is temporarily unavailable.
        }
      }
    },
    [user.favorites, user.id]
  );

  // ── HU-03: Rate seller ────────────────────────────────────────────────────
  const handleRate = useCallback(
    async (purchaseId: string, rating: number, comment: string) => {
      const purchase = purchaseHistory.find((p) => p.purchaseId === purchaseId);
      if (!purchase) return;

      const newRating: Rating = {
        id: `rt${allRatings.length + 1}`,
        sellerId: purchase.sellerId,
        buyerId: user.id,
        buyerName: user.name,
        productId: purchase.id,
        productName: purchase.name,
        rating,
        comment,
        date: new Date().toISOString(),
      };

      const updatedRatings = [...allRatings, newRating];
      setAllRatings(updatedRatings);

      const sellerRatings = updatedRatings.filter((r) => r.sellerId === purchase.sellerId);
      const avg = sellerRatings.reduce((s, r) => s + r.rating, 0) / sellerRatings.length;

      setProducts((prev) =>
        prev.map((p) =>
          p.sellerId === purchase.sellerId
            ? { ...p, sellerRating: Math.round(avg * 10) / 10 }
            : p
        )
      );

      setPurchaseHistory((prev) =>
        prev.map((p) => (p.purchaseId === purchaseId ? { ...p, rated: true } : p))
      );

      if (typeof window !== "undefined" && localStorage.getItem("auth_token")) {
        try {
          await apiClient.createRating(purchase.id, purchase.sellerId, rating, comment);
          await loadRemoteState();
        } catch {
          // Local UI already updated; backend sync will happen on the next successful request.
        }
      }
    },
    [allRatings, loadRemoteState, purchaseHistory, user.id, user.name]
  );

  // ── HU-04: Pre-fill publish form for resell ───────────────────────────────
  const handleResell = useCallback((boughtProduct: PurchaseItem) => {
    setPendingEdit({
      name: boughtProduct.name,
      price: boughtProduct.price,
      description: boughtProduct.description,
      category: boughtProduct.category,
      imageUrl: boughtProduct.imageUrl,
      condition: "Usado",
      conditionDetail: "Comprado anteriormente en la plataforma. Sigue en buen estado.",
    });
  }, []);

  // ── HU-07/10: Save (create or update) product ─────────────────────────────
  const handleSaveProduct = useCallback(
    async (data: Partial<Product>) => {
      const editId = data.id ?? pendingEdit?.id;
      if (editId) {
        if (typeof window !== "undefined" && localStorage.getItem("auth_token")) {
          try {
            const updated = await apiClient.updateProduct(editId as string, data);
            setProducts((prev) => prev.map((p) => (p.id === (editId as string) ? updated : p)));
          } catch {
            setProducts((prev) =>
              prev.map((p) => (p.id === (editId as string) ? ({ ...p, ...data } as Product) : p))
            );
          }
        } else {
          setProducts((prev) =>
            prev.map((p) => (p.id === (editId as string) ? ({ ...p, ...data } as Product) : p))
          );
        }
      } else {
        if (typeof window !== "undefined" && localStorage.getItem("auth_token")) {
          try {
            const created = await apiClient.createProduct(data);
            setProducts((prev) => [created, ...prev]);
          } catch {
            const newProduct: Product = {
              ...data,
              id: `p${Date.now()}`,
              sellerId: user.id,
              sellerName: user.name,
              sellerRating: 5.0,
              active: true,
              createdAt: new Date().toISOString(),
            } as Product;
            setProducts((prev) => [newProduct, ...prev]);
          }
        } else {
          const newProduct: Product = {
            ...data,
            id: `p${Date.now()}`,
            sellerId: user.id,
            sellerName: user.name,
            sellerRating: 5.0,
            active: true,
            createdAt: new Date().toISOString(),
          } as Product;
          setProducts((prev) => [newProduct, ...prev]);
        }
      }
      setPendingEdit(null);
    },
    [pendingEdit, user.id, user.name]
  );

  const handleDeleteProduct = useCallback(async (id: string) => {
    const prevProducts = products;
    setProducts((current) => current.filter((p) => p.id !== id));

    if (typeof window !== "undefined" && localStorage.getItem("auth_token")) {
      try {
        await apiClient.deleteProduct(id);
      } catch {
        setProducts(prevProducts);
      }
    }
  }, [products]);

  const handleActivate = useCallback((id: string) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, active: true } : p)));
  }, []);

  // ── HU-12: Reports ────────────────────────────────────────────────────────
  const openReport = useCallback(
    (productId: string) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return;
      setReportingItemId(productId);
      setReportingItemType("product");
      setReportingItemName(product.name);
      setReportModalOpen(true);
    },
    [products]
  );

  const handleSubmitReport = useCallback(
    (category: string, reason: string, description: string) => {
      const newReport: Report = {
        id: `r${Date.now()}`,
        itemId: reportingItemId,
        itemType: reportingItemType,
        reporterId: user.id,
        reporterName: user.name,
        reason,
        category: category as Report["category"],
        description,
        date: new Date().toISOString(),
        status: "pending",
      };
      setReports((prev) => [...prev, newReport]);
      setReportModalOpen(false);
    },
    [reportingItemId, reportingItemType, user.id, user.name]
  );

  const handleResolveReport = useCallback(
    (id: string, action: "warning" | "suspension" | "removal" | "dismiss") => {
      const report = reports.find((r) => r.id === id);
      if (!report) return;

      const updated: Report = {
        ...report,
        status: action === "dismiss" ? "dismissed" : "resolved",
        resolution: action === "dismiss" ? "dismissed" : action,
        resolvedBy: user.name,
        resolvedAt: new Date().toISOString(),
      };

      if (action === "removal" && report.itemType === "product") {
        setProducts((prev) => prev.filter((p) => p.id !== report.itemId));
      }

      setReports((prev) => prev.map((r) => (r.id === id ? updated : r)));
    },
    [reports, user.name]
  );

  // ── HU-06: Chat ───────────────────────────────────────────────────────────
  const handleStartChat = useCallback(
    (product: Product): string | null => {
      const existing = chats.find(
        (c) => c.productId === product.id || c.sellerId === product.sellerId
      );
      if (existing) return existing.id;

      const newChat: Chat = {
        id: `c${Date.now()}`,
        productId: product.id,
        productName: product.name,
        buyerId: user.id,
        sellerId: product.sellerId,
        otherPartyName: product.sellerName,
        lastMessage: "",
      };
      setChats((prev) => [...prev, newChat]);
      return newChat.id;
    },
    [chats, user.id]
  );

  // ── Notifications ─────────────────────────────────────────────────────────
  const handleMarkAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const handleMarkRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  // ── HU-05: Profile / interests ────────────────────────────────────────────
  const handleToggleNotification = useCallback(() => {
    setUser((prev) => ({ ...prev, notificationsEnabled: !prev.notificationsEnabled }));
  }, []);

  const handleUpdateInterests = useCallback((interests: Category[]) => {
    setUser((prev) => ({ ...prev, interests }));
  }, []);

  const value: AppContextType = {
    products,
    setProducts,
    user,
    setUser,
    reports,
    setReports,
    allRatings,
    setAllRatings,
    chats,
    setChats,
    messages,
    setMessages,
    notifications,
    setNotifications,
    purchaseHistory,
    setPurchaseHistory,
    purchaseRequests,
    setPurchaseRequests,
    sales: [],
    userRole,
    setUserRole,
    pendingEdit,
    setPendingEdit,
    reportModalOpen,
    setReportModalOpen,
    reportingItemId,
    reportingItemType,
    reportingItemName,
    notifPanelOpen,
    setNotifPanelOpen,
    unreadCount,
    toggleFavorite,
    handleRate,
    handleResell,
    handleSaveProduct,
    handleDeleteProduct,
    handleActivate,
    openReport,
    handleSubmitReport,
    handleResolveReport,
    handleStartChat,
    handleMarkAllRead,
    handleMarkRead,
    handleToggleNotification,
    handleUpdateInterests,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
