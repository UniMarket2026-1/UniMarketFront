import { Category, ProductCondition } from "./types";
import { apiClient } from "./api";
import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS } from "./constants";

export interface ProductSuggestion {
  name: string;
  description: string;
  category: Category;
  condition: ProductCondition;
  conditionDetail: string;
}

function sanitizeCategory(value: unknown, fallback: Category): Category {
  if (typeof value !== "string") return fallback;
  return (PRODUCT_CATEGORIES.includes(value as Category) ? value : fallback) as Category;
}

function sanitizeCondition(value: unknown, fallback: ProductCondition): ProductCondition {
  if (typeof value !== "string") return fallback;
  return (PRODUCT_CONDITIONS.includes(value as ProductCondition) ? value : fallback) as ProductCondition;
}

/**
 * Analyzes a product using AI and returns suggestions.
 * Now integrated with the backend Gemini API.
 *
 * @param productName - Name of the product
 * @param category - Category of the product
 * @param condition - Condition of the product
 * @param price - Price of the product
 * @returns Promise resolving to ProductSuggestion with AI-generated data
 */
export async function analyzeImageWithAI(
  imageData: string,
  productName?: string,
  category?: string,
  condition?: string,
): Promise<ProductSuggestion> {
  const safeFallbackCategory = sanitizeCategory(category, "Otros");
  const safeFallbackCondition = sanitizeCondition(condition, "Poco usado");

  try {
    const suggestions = await apiClient.analyzeProductImage(imageData, {
      productName: productName?.trim() || undefined,
      category: safeFallbackCategory,
      condition: safeFallbackCondition,
    });

    return {
      name: suggestions.name || productName || "Producto",
      description: suggestions.description || `Producto en buenas condiciones disponible en la plataforma.`,
      category: sanitizeCategory(suggestions.category, safeFallbackCategory),
      condition: sanitizeCondition(suggestions.condition, safeFallbackCondition),
      conditionDetail:
        suggestions.conditionDetail ||
        `Este producto ${safeFallbackCondition.toLowerCase()} está listo para usar.`,
    };
  } catch (error) {
    console.error("Error analyzing image with AI:", error);

    // Fallback to default suggestion
    return {
      name: productName || "Producto",
      description: `Producto en buenas condiciones disponible en la plataforma.`,
      category: safeFallbackCategory,
      condition: safeFallbackCondition,
      conditionDetail: `Este producto ${safeFallbackCondition.toLowerCase()} está listo para usar.`,
    };
  }
}
