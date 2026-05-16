import { analyzeImageWithAI } from "@/lib/ai";

// Bonus IA: AI auto-fill stub tests

jest.setTimeout(10000); // allow for stub delay

describe("analyzeImageWithAI — Bonus IA (HU-07 bonus)", () => {
  it("returns a ProductSuggestion with all required fields", async () => {
    const result = await analyzeImageWithAI("test-image.jpg");
    expect(result.name).toBeTruthy();
    expect(result.description).toBeTruthy();
    expect(result.category).toBeTruthy();
    expect(result.condition).toBeTruthy();
    expect(result.conditionDetail).toBeTruthy();
    expect(typeof result.price).toBe("number");
  });

  it("returns a positive price", async () => {
    const result = await analyzeImageWithAI("test.jpg");
    expect(result.price).toBeGreaterThan(0);
  });

  it("returns a valid category", async () => {
    const result = await analyzeImageWithAI("test.jpg");
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
    expect(validCategories).toContain(result.category);
  });

  it("returns a valid condition", async () => {
    const result = await analyzeImageWithAI("test.jpg");
    const validConditions = ["Nuevo", "Poco usado", "Usado"];
    expect(validConditions).toContain(result.condition);
  });

  it("resolves within 5 seconds (stub delay)", async () => {
    const start = Date.now();
    await analyzeImageWithAI("test.jpg");
    expect(Date.now() - start).toBeLessThan(5000);
  });
});
