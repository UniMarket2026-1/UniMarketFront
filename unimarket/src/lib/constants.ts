import { Category, ProductCondition } from "./types";

export const PRODUCT_CATEGORIES: Category[] = [
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

export const PRODUCT_CONDITIONS: ProductCondition[] = ["Nuevo", "Poco usado", "Usado"];

export const MAX_IMAGE_SIZE_MB = 50;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

export const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyDFnzboMQpxThXUakePoadk8EgbUnq1kGI";
