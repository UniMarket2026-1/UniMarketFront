import { Category, ProductCondition } from "./types";
import { apiClient } from "./api";

export interface ProductSuggestion {
  name: string;
  description: string;
  category: Category;
  condition: ProductCondition;
  conditionDetail: string;
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
  try {
    const suggestions = await apiClient.analyzeProductImage(imageData, {
      productName: productName || "Producto",
      category: category || "Otros",
      condition: condition || "Poco usado",
    });

    return {
      name: suggestions.name || productName || "Producto",
      description: suggestions.description,
      category: (suggestions.category as Category) || (category as Category) || "Otros",
      condition: (suggestions.condition as ProductCondition) || (condition as ProductCondition) || "Poco usado",
      conditionDetail: suggestions.conditionDetail,
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
    };
  }
}
