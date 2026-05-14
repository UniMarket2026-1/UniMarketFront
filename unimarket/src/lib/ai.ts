import { Category, ProductCondition } from "./types";
import { apiClient } from "./api";

export interface ProductSuggestion {
  name: string;
  description: string;
  category: Category;
  condition: ProductCondition;
  conditionDetail: string;
  price: number;
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
  imageUrl: string,
  productName?: string,
  category?: string,
  condition?: string,
  price?: number,
): Promise<ProductSuggestion> {
  try {
    // Use the backend API to generate AI-powered description
    const suggestions = await apiClient.generateProductDescription(
      productName || "Producto",
      category || "Otros",
      condition || "Poco usado",
      price || 0,
    );

    return {
      name: productName || "Producto",
      description: suggestions.description,
      category: (category as Category) || "Otros",
      condition: (condition as ProductCondition) || "Poco usado",
      conditionDetail: suggestions.conditionDetail,
      price: price || 0,
    };
  } catch (error) {
    console.error("Error analyzing image with AI:", error);

    // Fallback to default suggestion
    return {
      name: productName || "Producto",
      description: `Producto en buenas condiciones disponible en la plataforma.`,
      category: (category as Category) || "Otros",
      condition: (condition as ProductCondition) || "Poco usado",
      conditionDetail: `Este producto ${condition?.toLowerCase() || "poco usado"} está listo para usar.`,
      price: price || 0,
    };
  }
}
