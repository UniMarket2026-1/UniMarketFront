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
  handleStartChat: (product: Product) => Promise<string | null>; // returns chatId

  // Actions – Notifications
  handleMarkAllRead: () => void;
  handleMarkRead: (id: string) => void;

  // Actions – HU-05 Profile/interests
  handleToggleNotification: () => void;
  handleUpdateInterests: (interests: Category[]) => void;

  // Actions – Refresh/Reload
  refreshProducts: () => Promise<void>;
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
  const [inFlightActions, setInFlightActions] = useState<Record<string, boolean>>({});

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
      description: apiUser.description ?? "",
      profileImageUrl: apiUser.profileImageUrl ?? "",
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
        let resolvedUserId = user.id;
        try {
          const currentUser = await apiClient.getCurrentUser();
          const normalizedCurrentUser = normalizeUser(currentUser);
          resolvedUserId = normalizedCurrentUser.id;
          setUser(normalizedCurrentUser);
        } catch {
          // If API fails, try to restore user from localStorage
          const savedUser = typeof window !== "undefined" ? localStorage.getItem("user_data") : null;
          if (savedUser) {
            try {
              const normalizedSavedUser = normalizeUser(JSON.parse(savedUser));
              resolvedUserId = normalizedSavedUser.id;
              setUser(normalizedSavedUser);
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

        try {
          const remoteChats = await apiClient.getUserChats(resolvedUserId);
          const normalizedChats: Chat[] = Array.isArray(remoteChats)
            ? remoteChats
            : (remoteChats?.data ?? []);
          setChats(normalizedChats);

          const messagesByChat: Record<string, Message[]> = {};
          await Promise.all(
            normalizedChats.map(async (chat: Chat) => {
              try {
                const chatMessages = await apiClient.getChatMessages(chat.id);
                messagesByChat[chat.id] = Array.isArray(chatMessages)
                  ? chatMessages
                  : chatMessages?.data ?? [];
              } catch {
                messagesByChat[chat.id] = [];
              }
            })
          );
          setMessages(messagesByChat);
        } catch {
          setChats([]);
          setMessages({});
        }
      }
    } catch {
      // Fall back to the bundled demo data when the API is unavailable.
    }
  }, [normalizeUser, user.id]);

  useEffect(() => {
    loadRemoteState();
  }, [loadRemoteState]);

  // Polling for near-real-time updates: chats, messages, purchase requests, and products
  useEffect(() => {
    let chatInterval: number | undefined;
    let productInterval: number | undefined;
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    if (token && user.id) {
      // chats & requests every 5s
      chatInterval = window.setInterval(async () => {
        try {
          const remoteChats = await apiClient.getUserChats(user.id);
          const normalizedChats: Chat[] = Array.isArray(remoteChats) ? remoteChats : (remoteChats?.data ?? []);

          // update chats list and fetch messages for changed chats
          setChats((prevChats) => {
            const merged = normalizedChats;
            return merged;
          });

          // fetch messages per chat and detect new ones
          const messagesByChat: Record<string, Message[]> = { ...messages };
          await Promise.all(
            normalizedChats.map(async (chat) => {
              try {
                const chatMessages = await apiClient.getChatMessages(chat.id);
                const remoteMessages: Message[] = Array.isArray(chatMessages)
                  ? chatMessages
                  : chatMessages?.data ?? [];

                const existing = messages[chat.id] ?? [];
                if (remoteMessages.length > existing.length) {
                  // new messages arrived
                  messagesByChat[chat.id] = remoteMessages;
                  // add a simple notification
                  setNotifications((prev) => [
                    {
                      id: `n_msg_${chat.id}_${Date.now()}`,
                      type: "message",
                      title: `Nuevo mensaje de ${chat.otherPartyName}`,
                      body: remoteMessages[remoteMessages.length - 1]?.text ?? "",
                      timestamp: new Date().toISOString(),
                      read: false,
                    },
                    ...prev,
                  ]);
                } else {
                  messagesByChat[chat.id] = existing;
                }
              } catch {
                // ignore per-chat failures
              }
            })
          );
          setMessages(messagesByChat);

          // purchase requests
          try {
            const requests = await apiClient.getMyPurchaseRequests();
            const remoteRequests = Array.isArray(requests) ? requests : requests?.data ?? [];
            // detect newly created or changed requests
            const prevMap = Object.fromEntries(purchaseRequests.map((r) => [r.id, r]));
            remoteRequests.forEach((r: PurchaseRequest) => {
              const prev = prevMap[r.id];
              if (!prev) {
                setNotifications((prevN) => [
                  {
                    id: `n_req_${r.id}_${Date.now()}`,
                    type: "sale",
                    title: "Nueva solicitud de compra",
                    body: `${r.buyerName} solicitó ${r.productName}`,
                    timestamp: new Date().toISOString(),
                    read: false,
                    linkProductId: r.productId,
                  },
                  ...prevN,
                ]);
              } else if (prev.status !== r.status) {
                setNotifications((prevN) => [
                  {
                    id: `n_req_change_${r.id}_${Date.now()}`,
                    type: "system",
                    title: "Cambio en solicitud",
                    body: `${r.productName} cambió a ${r.status}`,
                    timestamp: new Date().toISOString(),
                    read: false,
                  },
                  ...prevN,
                ]);
              }
            });
            setPurchaseRequests(remoteRequests);
          } catch {
            // ignore
          }
        } catch {
          // ignore polling errors
        }
      }, 5000) as unknown as number;

      // products every 10s to refresh listings when filters change elsewhere
      productInterval = window.setInterval(async () => {
        try {
          const productsResponse = await apiClient.getProducts(1, 100);
          const remoteProducts = Array.isArray(productsResponse?.data)
            ? productsResponse.data
            : Array.isArray(productsResponse)
            ? productsResponse
            : [];
          if (remoteProducts.length > 0) setProducts(remoteProducts);
        } catch {
          // ignore
        }
      }, 10000) as unknown as number;
    }

    return () => {
      if (chatInterval) window.clearInterval(chatInterval);
      if (productInterval) window.clearInterval(productInterval);
    };
  }, [user.id, messages, purchaseRequests]);

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
    async (product: Product): Promise<string | null> => {
      const existing = chats.find(
        (c) => c.productId === product.id || c.sellerId === product.sellerId
      );
      if (existing) return existing.id;

      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      if (token && user.id) {
        try {
          const remoteChat = await apiClient.createOrGetChat(product.id, user.id, product.sellerId);
          const normalizedChat: Chat = {
            ...remoteChat,
            otherPartyName: product.sellerName,
            productName: product.name,
            lastMessage: remoteChat.lastMessage ?? "",
          };
          setChats((prev) => {
            const withoutDuplicate = prev.filter((chat) => chat.id !== normalizedChat.id);
            return [normalizedChat, ...withoutDuplicate];
          });
          return normalizedChat.id;
        } catch {
          // fall back to local chat creation below
        }
      }

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

  // ── Refresh/Reload ────────────────────────────────────────────────────────
  const refreshProducts = useCallback(async () => {
    try {
      const productsResponse = await apiClient.getProducts(1, 100);
      const normalizedProducts: Product[] = Array.isArray(productsResponse)
        ? productsResponse
        : productsResponse?.data ?? [];
      setProducts(normalizedProducts);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[refreshProducts] Error:', error);
    }
  }, []);

  // Compute sales from completed purchase requests
  const computedSales = purchaseRequests
    .filter((request) => request.status === "completed")
    .map((request) => ({
      id: request.id,
      sellerId: request.sellerId,
      productId: request.productId,
      productName: request.productName,
      price: request.productPrice,
      date: request.completedAt || request.updatedAt || request.createdAt,
      buyerName: request.buyerName,
    }));

  // Compute purchase history from completed purchase requests (for buyer)
  useEffect(() => {
    setPurchaseHistory((prevHistory) => {
      const byPurchaseId = new Map(prevHistory.map((item) => [item.purchaseId, item]));

      return purchaseRequests
        .filter((request) => request.status === "completed" && request.buyerId === user.id)
        .map((request) => {
          const existing = byPurchaseId.get(request.id);
          const product = products.find((p) => p.id === request.productId);

          return {
            id: request.productId,
            purchaseId: request.id,
            name: request.productName,
            price: request.productPrice,
            category: product?.category ?? "Otros",
            description: product?.description ?? "",
            condition: product?.condition ?? "Usado",
            conditionDetail: product?.conditionDetail ?? "",
            imageUrl: request.productImageUrl || product?.imageUrl || "",
            sellerId: request.sellerId,
            sellerName: request.sellerName,
            sellerRating: product?.sellerRating ?? 0,
            active: false,
            createdAt: request.createdAt,
            date: request.completedAt || request.updatedAt || request.createdAt,
            rated: existing?.rated ?? false,
          };
        });
    });
  }, [products, purchaseRequests, user.id]);

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
    sales: computedSales,
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
    refreshProducts,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
