import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SellerDashboard } from "@/components/seller/SellerDashboard";
import { Product, Sale } from "@/lib/types";

// HU-07, HU-08, HU-10 — Seller Dashboard

jest.mock("motion/react", () => {
  const mockReact = require("react");
  return {
    motion: {
      button: ({ children, ...props }) => mockReact.createElement("button", props, children),
      div: ({ children, ...props }) => mockReact.createElement("div", props, children),
    },
    AnimatePresence: ({ children }) => children,
  };
});

jest.mock("@/components/shared/ImageWithFallback", () => {
  const mockReact = require("react");
  return {
    ImageWithFallback: ({ alt }) => mockReact.createElement("img", { alt }),
  };
});

jest.mock("@/i18n/LanguageContext", () => ({
  useLang: () => ({
    t: {
      seller: {
        title: "Panel de Vendedor",
        newProduct: "Nueva Publicación",
        listings: "Publicaciones",
        sales: "Ventas",
        active: "Activas",
        sold: "Vendidos",
        active_badge: "Activo",
        paused_badge: "Pausado",
        delete: "Eliminar",
        activate: "Activar",
        empty: "Sin publicaciones aún",
        emptyDesc: "Publica tu primer producto.",
        publishFirst: "Publicar ahora",
        totalRevenue: "Ingresos Totales",
        salesHistory: "Historial de Ventas",
        last30: "Últimos 30 días",
        buyer: "Comprador",
        noSales: "Aún no has realizado ventas",
      },
      common: { edit: "Editar" },
    },
  }),
}));

const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Diccionario Inglés",
    description: "Inglés-Español",
    price: 25000,
    category: "Libros",
    condition: "Nuevo",
    conditionDetail: "Nunca usado",
    imageUrl: "/d.jpg",
    sellerId: "u1",
    sellerName: "Ana",
    sellerRating: 4.7,
    active: true,
  },
  {
    id: "p2",
    name: "Calculadora Científica",
    description: "Muy útil",
    price: 80000,
    category: "Tecnología",
    condition: "Poco usado",
    conditionDetail: "Buen estado",
    imageUrl: "/c.jpg",
    sellerId: "u1",
    sellerName: "Ana",
    sellerRating: 4.7,
    active: false,
  },
];

const SALES: Sale[] = [
  {
    id: "s1",
    productId: "p3",
    productName: "Atlas de Colombia",
    price: 35000,
    buyerId: "u2",
    buyerName: "Carlos López",
    sellerId: "u1",
    date: "2024-03-01",
  },
  {
    id: "s2",
    productId: "p4",
    productName: "Física Universitaria",
    price: 45000,
    buyerId: "u3",
    buyerName: "Maria García",
    sellerId: "u1",
    date: "2024-02-15",
  },
];

const onEdit = jest.fn();
const onDelete = jest.fn();
const onActivate = jest.fn();
const onNew = jest.fn();

function renderDashboard() {
  return render(
    <SellerDashboard
      myProducts={PRODUCTS}
      sales={SALES}
      onEdit={onEdit}
      onDelete={onDelete}
      onActivate={onActivate}
      onNewProduct={onNew}
    />
  );
}

describe("SellerDashboard listings — HU-07, HU-10", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders panel title", () => {
    renderDashboard();
    expect(screen.getByText("Panel de Vendedor")).toBeInTheDocument();
  });

  it("renders all seller products", () => {
    renderDashboard();
    expect(screen.getByText("Diccionario Inglés")).toBeInTheDocument();
    expect(screen.getByText("Calculadora Científica")).toBeInTheDocument();
  });

  it("shows active/paused badges correctly", () => {
    renderDashboard();
    expect(screen.getByText("Activo")).toBeInTheDocument();
    expect(screen.getByText("Pausado")).toBeInTheDocument();
  });

  it("calls onDelete when Eliminar is clicked — HU-10", () => {
    renderDashboard();
    fireEvent.click(screen.getByText("Eliminar"));
    expect(onDelete).toHaveBeenCalledWith("p1");
  });

  it("calls onActivate when Activar is clicked — HU-10", () => {
    renderDashboard();
    fireEvent.click(screen.getByText("Activar"));
    expect(onActivate).toHaveBeenCalledWith("p2");
  });

  it("calls onNewProduct when Nueva Publicación is clicked — HU-07", () => {
    renderDashboard();
    // Multiple buttons with this text — click the first
    fireEvent.click(screen.getAllByText("Nueva Publicación")[0]);
    expect(onNew).toHaveBeenCalled();
  });

  it("shows stats (active count and sold count)", () => {
    renderDashboard();
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument(); // sold count
  });
});

describe("SellerDashboard sales history — HU-08", () => {
  beforeEach(() => jest.clearAllMocks());

  it("switches to Ventas tab", () => {
    renderDashboard();
    fireEvent.click(screen.getByText("Ventas"));
    expect(screen.getByText("Ingresos Totales")).toBeInTheDocument();
  });

  it("shows total revenue correctly — HU-08", () => {
    renderDashboard();
    fireEvent.click(screen.getByText("Ventas"));
    // Total should be 35000 + 45000 = 80000, locale may vary
    const revenueEl = screen.getByText(/80/);
    expect(revenueEl).toBeInTheDocument();
  });

  it("shows sale items in history", () => {
    renderDashboard();
    fireEvent.click(screen.getByText("Ventas"));
    expect(screen.getByText("Atlas de Colombia")).toBeInTheDocument();
    expect(screen.getByText("Física Universitaria")).toBeInTheDocument();
  });

  it("shows buyer names in history", () => {
    renderDashboard();
    fireEvent.click(screen.getByText("Ventas"));
    expect(screen.getByText(/Carlos López/)).toBeInTheDocument();
  });

  it("shows empty state when no sales", () => {
    render(
      <SellerDashboard
        myProducts={PRODUCTS}
        sales={[]}
        onEdit={onEdit}
        onDelete={onDelete}
        onActivate={onActivate}
        onNewProduct={onNew}
      />
    );
    fireEvent.click(screen.getByText("Ventas"));
    expect(screen.getByText("Aún no has realizado ventas")).toBeInTheDocument();
  });
});
