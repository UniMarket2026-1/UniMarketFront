import { Product, Sale, Report, Chat, User, Rating, AppNotification, PurchaseItem } from "./types";

export const MOCK_USER: User = {
  id: "u1",
  name: "Alex Estudiante",
  email: "alex@universidad.edu",
  role: "student",
  favorites: ["p2"],
  interests: ["Libros", "Tecnología"],
  notificationsEnabled: true,
  ratings: [],
  totalRating: 5.0,
  ratingCount: 0,
};

export const MOCK_RATINGS: Rating[] = [
  {
    id: "rt1",
    sellerId: "u2",
    buyerId: "u6",
    buyerName: "Roberto Gomez",
    productId: "p1",
    productName: "Libro Cálculo de Stewart 8va Ed.",
    rating: 5,
    comment: "Excelente vendedor, el libro llegó en perfecto estado. Totalmente recomendado.",
    date: "2025-01-15T10:00:00Z",
  },
  {
    id: "rt2",
    sellerId: "u3",
    buyerId: "u7",
    buyerName: "Ana Maria",
    productId: "p2",
    productName: "Calculadora Científica Casio",
    rating: 4,
    comment: "Buena transacción. El producto llegó como se describió.",
    date: "2025-01-20T14:30:00Z",
  },
  {
    id: "rt3",
    sellerId: "u2",
    buyerId: "u8",
    buyerName: "Felipe L.",
    productId: "p6",
    productName: "Apuntes de Programación",
    rating: 5,
    comment: "Muy útiles los apuntes, quedé muy satisfecho con la compra.",
    date: "2025-02-01T09:00:00Z",
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Libro Cálculo de Stewart 8va Ed.",
    price: 45000,
    description: "Libro en excelente estado, sin rayones ni hojas dobladas.",
    category: "Libros",
    condition: "Poco usado",
    conditionDetail: "Solo se usó durante un semestre. Está forrado en plástico.",
    imageUrl:
      "https://images.unsplash.com/photo-1741795822013-570c944ac5bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
    sellerId: "u2",
    sellerName: "Maria Garcia",
    sellerRating: 4.8,
    active: true,
    createdAt: "2025-02-10T10:00:00Z",
  },
  {
    id: "p2",
    name: "Calculadora Científica Casio FX-991LAX",
    price: 35000,
    description: "Calculadora solar y a batería. Ideal para ingeniería.",
    category: "Tecnología",
    condition: "Nuevo",
    conditionDetail: "Nueva en su caja sellada. Nunca se abrió.",
    imageUrl:
      "https://images.unsplash.com/photo-1761821170104-ccd3e3e21318?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
    sellerId: "u3",
    sellerName: "Juan Perez",
    sellerRating: 4.5,
    active: true,
    createdAt: "2025-02-12T14:30:00Z",
  },
  {
    id: "p3",
    name: "Lámpara de Escritorio LED",
    price: 15000,
    description: "Lámpara con 3 niveles de brillo y cargador USB.",
    category: "Muebles",
    condition: "Usado",
    conditionDetail: "Tiene algunos rayones cosméticos pero funciona perfectamente.",
    imageUrl:
      "https://images.unsplash.com/photo-1570570665905-346e1b6be193?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
    sellerId: "u1",
    sellerName: "Alex Estudiante",
    sellerRating: 5.0,
    active: true,
    createdAt: "2025-02-14T09:00:00Z",
  },
  {
    id: "p4",
    name: "Hoodie Universitario XL",
    price: 25000,
    description: "Hoodie azul marino de la facultad de ingeniería.",
    category: "Ropa",
    condition: "Poco usado",
    conditionDetail: "Lavado un par de veces. Sin manchas.",
    imageUrl:
      "https://images.unsplash.com/photo-1648218943004-5ec604ef627a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
    sellerId: "u4",
    sellerName: "Carlos Ruiz",
    sellerRating: 4.2,
    active: true,
    createdAt: "2025-02-15T08:00:00Z",
  },
  {
    id: "p5",
    name: "MacBook Air M1 2020",
    price: 650000,
    description: "8GB RAM, 256GB SSD. Color gris espacial.",
    category: "Tecnología",
    condition: "Usado",
    conditionDetail: "Batería al 88%. Incluye cargador original.",
    imageUrl:
      "https://images.unsplash.com/photo-1713557670055-7df8d5502a51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
    sellerId: "u5",
    sellerName: "Elena Soto",
    sellerRating: 4.9,
    active: true,
    createdAt: "2025-02-01T12:00:00Z",
  },
];

export const MOCK_SALES: Sale[] = [
  {
    id: "s1",
    sellerId: "u1",
    productId: "p10",
    productName: "Libro de Física I",
    price: 20000,
    date: "2025-01-20",
    buyerName: "Roberto Gomez",
  },
  {
    id: "s2",
    sellerId: "u1",
    productId: "p11",
    productName: "Mouse Logitech",
    price: 12000,
    date: "2025-01-25",
    buyerName: "Ana Maria",
  },
  {
    id: "s3",
    sellerId: "u1",
    productId: "p12",
    productName: "Escritorio Madera",
    price: 50000,
    date: "2025-02-05",
    buyerName: "Felipe L.",
  },
];

export const MOCK_CHATS: Chat[] = [
  {
    id: "c1",
    productId: "p1",
    productName: "Libro Cálculo de Stewart",
    buyerId: "u1",
    sellerId: "u2",
    otherPartyName: "Maria Garcia",
    lastMessage: "Hola, ¿sigue disponible?",
  },
  {
    id: "c2",
    productId: "p2",
    productName: "Calculadora Científica",
    buyerId: "u1",
    sellerId: "u3",
    otherPartyName: "Juan Perez",
    lastMessage: "Mañana a las 2pm en la biblioteca.",
  },
];

export const MOCK_REPORTS: Report[] = [
  {
    id: "r1",
    itemId: "p5",
    itemType: "product",
    reporterId: "u6",
    reporterName: "Usuario Anónimo",
    reason: "Precio excesivo comparado con el estado del producto",
    category: "fraud",
    description:
      "El vendedor está cobrando $650,000 por un MacBook M1 usado con batería al 88%. En el mercado se encuentran más baratos.",
    date: "2025-02-14T10:30:00Z",
    status: "pending",
  },
  {
    id: "r2",
    itemId: "u4",
    itemType: "user",
    reporterId: "u7",
    reporterName: "Pedro Pascal",
    reason: "No llegó a la cita de entrega en 2 ocasiones",
    category: "inappropriate",
    description:
      "Acordamos dos veces encontrarnos para la entrega y nunca apareció. No responde mensajes.",
    date: "2025-02-13T16:00:00Z",
    status: "pending",
  },
  {
    id: "r3",
    itemId: "p1",
    itemType: "product",
    reporterId: "u8",
    reporterName: "Carolina Torres",
    reason: "Contenido engañoso en la descripción",
    category: "fraud",
    description:
      "La descripción dice 'sin rayones' pero en las fotos se ven marcas visibles en la portada del libro.",
    date: "2025-02-15T09:15:00Z",
    status: "pending",
  },
  {
    id: "r4",
    itemId: "p4",
    itemType: "product",
    reporterId: "u9",
    reporterName: "Miguel Ángel",
    reason: "Posible producto falsificado",
    category: "spam",
    description:
      "El hoodie no parece ser original de la universidad. La etiqueta se ve diferente a las oficiales.",
    date: "2025-02-16T11:00:00Z",
    status: "pending",
  },
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    type: "message",
    title: "Nuevo mensaje de Maria Garcia",
    body: '"¿Puedes bajar un poco el precio del libro?"',
    timestamp: "2026-03-02T10:30:00Z",
    read: false,
    linkProductId: "p1",
    linkChatId: "c1",
  },
  {
    id: "n2",
    type: "favorite_price",
    title: "¡Bajó el precio de tu favorito!",
    body: "Calculadora Científica Casio pasó de $40.000 a $35.000",
    timestamp: "2026-03-02T09:00:00Z",
    read: false,
    linkProductId: "p2",
  },
  {
    id: "n3",
    type: "sale",
    title: "¡Vendiste un producto!",
    body: "Lámpara de Escritorio LED — $15.000 recibidos",
    timestamp: "2026-03-01T18:45:00Z",
    read: true,
    linkProductId: "p3",
  },
  {
    id: "n4",
    type: "system",
    title: "Bienvenido a UniMarket",
    body: "Completa tu perfil para generar más confianza entre compradores.",
    timestamp: "2026-02-28T08:00:00Z",
    read: true,
  },
];

export const MOCK_PURCHASE_HISTORY: PurchaseItem[] = [
  {
    ...MOCK_PRODUCTS[0],
    date: "2025-02-01",
    rated: false,
    purchaseId: "ph1",
  },
  {
    ...MOCK_PRODUCTS[1],
    date: "2025-01-15",
    rated: false,
    purchaseId: "ph2",
  },
];

export const INITIAL_MESSAGES: Record<string, import("./types").Message[]> = {
  c1: [
    {
      id: "m1",
      chatId: "c1",
      senderId: "u1",
      text: "Hola, ¿sigue disponible?",
      timestamp: "10:00",
    },
    {
      id: "m2",
      chatId: "c1",
      senderId: "u2",
      text: "Hola! Sí, aún lo tengo.",
      timestamp: "10:05",
    },
  ],
  c2: [
    {
      id: "m3",
      chatId: "c2",
      senderId: "u3",
      text: "Mañana a las 2pm en la biblioteca.",
      timestamp: "09:00",
    },
  ],
};
