export type ProductCondition = "Nuevo" | "Poco usado" | "Usado";
export type Category =
  | "Libros"
  | "Tecnología"
  | "Muebles"
  | "Ropa"
  | "Electrónica"
  | "Deportes"
  | "Arte"
  | "Instrumentos Musicales"
  | "Cocina"
  | "Accesorios"
  | "Otros";

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: Category;
  condition: ProductCondition;
  conditionDetail: string;
  imageUrl: string;
  sellerId: string;
  sellerName: string;
  sellerEmail?: string;
  sellerRating: number;
  sellerVerified?: boolean;
  sellerUniandesVerified?: boolean;
  active: boolean;
  meetingPoint?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
  favorites: string[];
  interests: Category[];
  notificationsEnabled: boolean;
  ratings: Rating[];
  totalRating: number;
  ratingCount: number;
  emailVerified?: boolean;
  uniandesVerified?: boolean;
  suspended?: boolean;
  suspensionReason?: string;
  warnings?: number;
}

export interface Rating {
  id: string;
  sellerId: string;
  buyerId: string;
  buyerName: string;
  productId: string;
  productName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  price: number;
  date: string;
  buyerName: string;
}

export interface Report {
  id: string;
  itemId: string;
  itemType: "product" | "user";
  reporterId: string;
  reporterName: string;
  reason: string;
  category: "spam" | "inappropriate" | "fraud" | "other";
  description: string;
  date: string;
  status: "pending" | "resolved" | "dismissed";
  resolution?: "warning" | "suspension" | "removal" | "dismissed";
  resolvedBy?: string;
  resolvedAt?: string;
  notes?: string;
}

export interface ModerationAction {
  id: string;
  reportId: string;
  adminId: string;
  adminName: string;
  action: "warning" | "suspension" | "removal" | "dismissed";
  targetType: "product" | "user";
  targetId: string;
  reason: string;
  date: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  productId: string;
  productName: string;
  buyerId: string;
  sellerId: string;
  otherPartyName: string;
  lastMessage: string;
}

export interface AppNotification {
  id: string;
  type: "message" | "favorite_price" | "sale" | "report" | "system";
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  /** Product ID to navigate to on click */
  linkProductId?: string;
  /** Chat ID to open on click (for message notifications) */
  linkChatId?: string;
}

export interface PurchaseItem extends Product {
  date: string;
  rated: boolean;
  purchaseId: string;
}
