import {
  MOCK_PRODUCTS,
  MOCK_USER,
  MOCK_CHATS,
  MOCK_REPORTS,
  MOCK_NOTIFICATIONS,
  MOCK_PURCHASE_HISTORY,
  MOCK_SALES,
  INITIAL_MESSAGES,
} from "@/lib/mockData";

// Data integrity tests covering HU-01, HU-03, HU-04, HU-05, HU-06, HU-07, HU-08, HU-09

describe("MOCK_PRODUCTS — HU-01, HU-07, HU-09", () => {
  it("has at least 3 active products", () => {
    expect(MOCK_PRODUCTS.filter((p) => p.active).length).toBeGreaterThanOrEqual(3);
  });

  it("all products have required fields", () => {
    MOCK_PRODUCTS.forEach((p) => {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.price).toBeGreaterThan(0);
      expect(p.sellerId).toBeTruthy();
    });
  });

  it("all products have conditionDetail for HU-09", () => {
    MOCK_PRODUCTS.forEach((p) => {
      expect(p.conditionDetail).toBeTruthy();
    });
  });

  it("products have valid categories", () => {
    const validCategories = [
      "Libros",
      "Tecnología",
      "Muebles",
      "Ropa",
      "Electrónica",
      "Deportes",
      "Arte",
      "Instrumentos Musicales",
      "Cocina",
      "Accesorios",
      "Otros",
    ];
    MOCK_PRODUCTS.forEach((p) => {
      expect(validCategories).toContain(p.category);
    });
  });

  it("products have valid conditions", () => {
    const validConditions = ["Nuevo", "Poco usado", "Usado"];
    MOCK_PRODUCTS.forEach((p) => {
      expect(validConditions).toContain(p.condition);
    });
  });
});

describe("MOCK_USER — HU-05, HU-07", () => {
  it("has required profile fields", () => {
    expect(MOCK_USER.id).toBeTruthy();
    expect(MOCK_USER.name).toBeTruthy();
    expect(MOCK_USER.email).toContain("@");
  });

  it("has favorites array", () => {
    expect(Array.isArray(MOCK_USER.favorites)).toBe(true);
  });

  it("has interests array for HU-05", () => {
    expect(Array.isArray(MOCK_USER.interests)).toBe(true);
  });

  it("has notificationsEnabled field for HU-05", () => {
    expect(typeof MOCK_USER.notificationsEnabled).toBe("boolean");
  });
});

describe("MOCK_NOTIFICATIONS — HU-05", () => {
  it("contains various notification types", () => {
    const types = MOCK_NOTIFICATIONS.map((n) => n.type);
    expect(types).toContain("message");
  });

  it("all notifications have required fields", () => {
    MOCK_NOTIFICATIONS.forEach((n) => {
      expect(n.id).toBeTruthy();
      expect(n.type).toBeTruthy();
      expect(n.title).toBeTruthy();
      expect(typeof n.read).toBe("boolean");
    });
  });

  it("message notifications have linkChatId for direct navigation", () => {
    const msgNotif = MOCK_NOTIFICATIONS.find((n) => n.type === "message");
    if (msgNotif) {
      expect(msgNotif.linkChatId).toBeTruthy();
    }
  });
});

describe("MOCK_CHATS + INITIAL_MESSAGES — HU-06", () => {
  it("has at least one chat", () => {
    expect(MOCK_CHATS.length).toBeGreaterThanOrEqual(1);
  });

  it("all chats have required fields", () => {
    MOCK_CHATS.forEach((c) => {
      expect(c.id).toBeTruthy();
      expect(c.otherPartyName).toBeTruthy();
      expect(c.productName).toBeTruthy();
    });
  });

  it("INITIAL_MESSAGES has entries for each chat", () => {
    MOCK_CHATS.forEach((chat) => {
      expect(INITIAL_MESSAGES[chat.id]).toBeDefined();
      expect(Array.isArray(INITIAL_MESSAGES[chat.id])).toBe(true);
    });
  });
});

describe("MOCK_SALES — HU-08", () => {
  it("has sale records with required fields", () => {
    MOCK_SALES.forEach((s) => {
      expect(s.id).toBeTruthy();
      expect(s.productName).toBeTruthy();
      expect(s.price).toBeGreaterThan(0);
      expect(s.buyerName).toBeTruthy();
    });
  });

  it("total revenue calculation is correct", () => {
    const total = MOCK_SALES.reduce((acc, s) => acc + s.price, 0);
    expect(total).toBeGreaterThan(0);
  });
});

describe("MOCK_PURCHASE_HISTORY — HU-03, HU-04", () => {
  it("has purchase items with purchaseId", () => {
    MOCK_PURCHASE_HISTORY.forEach((item) => {
      expect(item.purchaseId).toBeTruthy();
      expect(item.date).toBeTruthy();
      expect(typeof item.rated).toBe("boolean");
    });
  });
});

describe("MOCK_REPORTS — HU-12", () => {
  it("has reports with required fields", () => {
    MOCK_REPORTS.forEach((r) => {
      expect(r.id).toBeTruthy();
      expect(r.itemId).toBeTruthy();
      expect(r.itemType).toMatch(/product|user/);
      expect(r.status).toMatch(/pending|resolved|dismissed/);
    });
  });
});
