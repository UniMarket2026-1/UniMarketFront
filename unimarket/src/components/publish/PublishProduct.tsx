"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Camera,
  Check,
  Save,
  Upload,
  Image as ImageIcon,
  Zap,
  Sparkles,
  AlertCircle,
  Wand2,
  Loader2,
} from "lucide-react";
import { Product, Category, ProductCondition } from "@/lib/types";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";
import { motion, AnimatePresence } from "motion/react";
import { useLang } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { analyzeImageWithAI } from "@/lib/ai";

interface PublishProductProps {
  initialData?: Partial<Product>;
  isEditing?: boolean;
  onSave: (data: Partial<Product>) => void;
}

const DEMO_IMAGES = [
  "https://images.unsplash.com/photo-1544928147-7972fc0390a3?auto=format&fit=crop&q=80&w=1080",
  "https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&q=80&w=1080",
  "https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&q=80&w=1080",
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=1080",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=1080",
];

/**
 * Product publish/edit form — HU-04, HU-07, HU-10
 * Includes AI auto-fill feature (stubbed, ready for real implementation)
 */
export function PublishProduct({ initialData = {}, isEditing = false, onSave }: PublishProductProps) {
  const router = useRouter();
  const { t } = useLang();

  const [formData, setFormData] = useState({
    name: initialData.name ?? "",
    price: initialData.price ?? 0,
    description: initialData.description ?? "",
    category: (initialData.category ?? "Otros") as Category,
    condition: (initialData.condition ?? "Poco usado") as ProductCondition,
    conditionDetail: initialData.conditionDetail ?? "",
    imageUrl: initialData.imageUrl ?? "",
  });

  const [quickMode, setQuickMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // AI state
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const categories: Category[] = ["Libros", "Tecnología", "Muebles", "Ropa", "Otros"];
  const conditions: ProductCondition[] = ["Nuevo", "Poco usado", "Usado"];

  // Completion progress — HU-10
  useEffect(() => {
    const fields = [
      formData.name.length > 0,
      formData.price > 0,
      formData.imageUrl.length > 0,
      formData.conditionDetail.length >= 20,
      formData.description.length > 0,
    ];
    setCompletionPercentage(Math.round((fields.filter(Boolean).length / fields.length) * 100));
  }, [formData]);

  const isValid =
    formData.name && formData.price > 0 && formData.imageUrl && formData.conditionDetail.length >= 20;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }
    onSave({ ...formData, ...(isEditing && initialData.id ? { id: initialData.id } : {}) });
    toast.success(isEditing ? "Producto actualizado correctamente" : "¡Producto publicado con éxito!");
    router.push("/seller");
  };

  // Image upload simulation — HU-10
  const handleImageUpload = (imageUrl?: string) => {
    setIsUploading(true);
    setTimeout(() => {
      const selected = imageUrl ?? DEMO_IMAGES[Math.floor(Math.random() * DEMO_IMAGES.length)];
      setFormData((prev) => ({ ...prev, imageUrl: selected }));
      setIsUploading(false);
      setShowImagePicker(false);
      toast.success("Imagen cargada correctamente");
    }, 800);
  };

  /**
   * AI Auto-fill handler — BONUS IA
   * Calls analyzeImageWithAI from @/lib/ai.ts with Gemini API integration
   */
  const handleAIAutofill = async () => {
    if (!formData.imageUrl) {
      toast.error(t.ai.uploadFirst);
      return;
    }
    setIsAnalyzing(true);
    try {
      const suggestion = await analyzeImageWithAI(
        formData.imageUrl,
        formData.name || "Producto",
        formData.category,
        formData.condition,
        formData.price
      );
      setFormData((prev) => ({
        ...prev,
        name: suggestion.name,
        description: suggestion.description,
        category: suggestion.category,
        condition: suggestion.condition,
        conditionDetail: suggestion.conditionDetail,
        price: suggestion.price,
      }));
      toast.success(t.ai.filled);
    } catch {
      toast.error("Error al analizar la imagen. Inténtalo de nuevo.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Quick templates
  const quickTemplates = [
    {
      name: "Libro de texto",
      icon: "📚",
      data: {
        category: "Libros" as Category,
        condition: "Poco usado" as ProductCondition,
        conditionDetail: "Usado durante un semestre. En buen estado, sin páginas rotas ni manchas.",
      },
    },
    {
      name: "Laptop",
      icon: "💻",
      data: {
        category: "Tecnología" as Category,
        condition: "Usado" as ProductCondition,
        conditionDetail: "Usado por 2 años. Funciona perfectamente. Batería en buen estado. Incluye cargador.",
      },
    },
    {
      name: "Calculadora",
      icon: "🔢",
      data: {
        category: "Tecnología" as Category,
        condition: "Poco usado" as ProductCondition,
        conditionDetail: "Usada ocasionalmente. En excelente estado, funciona perfectamente.",
      },
    },
    {
      name: "Ropa",
      icon: "👕",
      data: {
        category: "Ropa" as Category,
        condition: "Poco usado" as ProductCondition,
        conditionDetail: "Lavado pocas veces. Sin manchas ni desgaste visible. Como nuevo.",
      },
    },
  ];

  const applyTemplate = (template: (typeof quickTemplates)[0]) => {
    setFormData((prev) => ({ ...prev, ...template.data }));
    toast.success(`Plantilla "${template.name}" aplicada`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col pb-24 bg-slate-50 min-h-screen"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 sticky top-0 bg-white z-20 border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition-colors"
            aria-label="Cerrar"
          >
            <X size={20} aria-hidden="true" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isEditing
                ? "Editar Publicación"
                : initialData.name
                ? "Revender Producto"
                : "Nueva Publicación"}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-xs font-bold text-slate-500">{completionPercentage}%</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setQuickMode(!quickMode)}
          className={cn(
            "p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1",
            quickMode ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
          )}
          aria-pressed={quickMode}
          aria-label="Modo rápido"
        >
          <Zap size={14} aria-hidden="true" />
          Rápido
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
        {/* Quick Mode Banner */}
        <AnimatePresence>
          {quickMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 p-4 rounded-2xl"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="text-amber-600" size={20} aria-hidden="true" />
                <p className="text-sm font-bold text-amber-900">Modo Rápido Activado</p>
              </div>
              <p className="text-xs text-amber-800 mb-3 leading-relaxed">
                Usa una plantilla para completar automáticamente los campos comunes.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {quickTemplates.map((template) => (
                  <button
                    key={template.name}
                    type="button"
                    onClick={() => applyTemplate(template)}
                    className="p-3 bg-white border-2 border-amber-200 rounded-xl hover:border-amber-400 hover:shadow-md transition-all text-left"
                  >
                    <div className="text-2xl mb-1" aria-hidden="true">{template.icon}</div>
                    <div className="text-xs font-bold text-slate-700">{template.name}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Image Upload — HU-10 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <ImageIcon size={16} className="text-indigo-600" aria-hidden="true" />
              Imagen del producto *
            </label>
            {!formData.imageUrl && (
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">
                Requerido
              </span>
            )}
          </div>

          {formData.imageUrl ? (
            <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-slate-100 group">
              <ImageWithFallback
                src={formData.imageUrl}
                alt="Preview del producto"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, imageUrl: "" }))}
                className="absolute top-3 right-3 p-2 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Eliminar imagen"
              >
                <X size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setShowImagePicker(true)}
                className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-sm text-slate-700 font-bold py-2 px-4 rounded-lg opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Upload size={16} aria-hidden="true" />
                Cambiar imagen
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowImagePicker(true)}
              disabled={isUploading}
              className={cn(
                "w-full aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all",
                isUploading
                  ? "border-indigo-300 bg-indigo-50"
                  : "border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/50"
              )}
              aria-label="Subir imagen del producto"
            >
              {isUploading ? (
                <>
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" aria-hidden="true" />
                  <span className="text-sm font-bold text-indigo-600">Subiendo imagen...</span>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Camera size={28} className="text-indigo-600" aria-hidden="true" />
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-bold text-slate-700 block">
                      Añadir foto del producto
                    </span>
                    <span className="text-xs text-slate-500 mt-1 block">
                      Toca para subir o seleccionar
                    </span>
                  </div>
                </>
              )}
            </button>
          )}

          {/* AI Auto-fill button — BONUS IA */}
          {formData.imageUrl && (
            <motion.button
              type="button"
              onClick={handleAIAutofill}
              disabled={isAnalyzing}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "mt-3 w-full py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                isAnalyzing
                  ? "bg-violet-50 text-violet-400 border-2 border-violet-100 cursor-not-allowed"
                  : "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-100"
              )}
              aria-label={isAnalyzing ? t.ai.analyzing : t.ai.autofill}
              aria-busy={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                  {t.ai.analyzing}
                </>
              ) : (
                <>
                  <Wand2 size={18} aria-hidden="true" />
                  {t.ai.autofill}
                </>
              )}
            </motion.button>
          )}
        </div>

        {/* Basic Info */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="product-name" className="text-sm font-bold text-slate-800">
              Nombre del producto *
            </label>
            <input
              id="product-name"
              type="text"
              placeholder="Ej: Libro Cálculo Stewart 8va Edición"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <label htmlFor="product-price" className="text-sm font-bold text-slate-800">
                Precio ($) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  $
                </span>
                <input
                  id="product-price"
                  type="number"
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  value={formData.price || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
                  required
                  min="0"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="product-category" className="text-sm font-bold text-slate-800">
                Categoría
              </label>
              <select
                id="product-category"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white transition-all"
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value as Category }))
                }
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Condition — HU-09 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-bold text-slate-800">Estado del producto *</legend>
            <div className="grid grid-cols-3 gap-2">
              {conditions.map((c) => {
                const conditionColors: Record<ProductCondition, string> = {
                  Nuevo: "border-emerald-500 bg-emerald-50 text-emerald-700",
                  "Poco usado": "border-cyan-500 bg-cyan-50 text-cyan-700",
                  Usado: "border-amber-500 bg-amber-50 text-amber-700",
                };
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, condition: c }))}
                    aria-pressed={formData.condition === c}
                    className={cn(
                      "py-3 px-2 rounded-xl text-xs font-bold border-2 transition-all",
                      formData.condition === c
                        ? conditionColors[c]
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    )}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="flex flex-col gap-2">
            <label htmlFor="condition-detail" className="text-sm font-bold text-slate-800">
              Descripción del estado *
            </label>
            <div className="mb-1 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
              <p className="text-xs text-indigo-700 leading-relaxed">
                <span className="font-bold">💡 Tip:</span> Describe con detalle el estado actual.
                Los compradores valoran la transparencia.
              </p>
            </div>
            <textarea
              id="condition-detail"
              placeholder={
                formData.condition === "Nuevo"
                  ? "Ej: Producto sin abrir, en su empaque original sellado. Nunca se ha usado."
                  : formData.condition === "Poco usado"
                  ? "Ej: Usado solo durante un semestre. En excelente estado, sin rayones ni marcas."
                  : "Ej: Usado por 2 años. Tiene algunos rayones cosméticos pero funciona perfectamente."
              }
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-all"
              value={formData.conditionDetail}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, conditionDetail: e.target.value }))
              }
              required
              minLength={20}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs">
                {formData.conditionDetail.length < 20 ? (
                  <span className="text-amber-600 font-medium flex items-center gap-1">
                    <AlertCircle size={12} aria-hidden="true" />
                    Mínimo 20 caracteres ({20 - formData.conditionDetail.length} restantes)
                  </span>
                ) : (
                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                    <Check size={14} aria-hidden="true" /> Descripción completa
                  </span>
                )}
              </p>
              <span className="text-xs text-slate-400">{formData.conditionDetail.length}</span>
            </div>
          </div>
        </div>

        {/* Optional Description */}
        {!quickMode && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex flex-col gap-2">
              <label htmlFor="description" className="text-sm font-bold text-slate-800">
                Descripción adicional (opcional)
              </label>
              <textarea
                id="description"
                placeholder="Añade otros detalles como lugar de entrega, especificaciones técnicas, accesorios incluidos..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-all"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>
          </div>
        )}

        {/* Submit — HU-10 */}
        <div className="sticky bottom-4 pt-2">
          <button
            type="submit"
            disabled={!isValid}
            className={cn(
              "w-full font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 text-lg",
              isValid
                ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 shadow-indigo-200"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            )}
            aria-disabled={!isValid}
          >
            {isValid ? (
              <>
                {isEditing ? <Save size={24} aria-hidden="true" /> : <Check size={24} aria-hidden="true" />}
                {isEditing ? "Guardar Cambios" : "Publicar Ahora"}
              </>
            ) : (
              <>
                <AlertCircle size={20} aria-hidden="true" />
                Completa los campos requeridos
              </>
            )}
          </button>
          {isValid && (
            <p className="text-center text-xs text-emerald-600 font-medium mt-2 flex items-center justify-center gap-1">
              <Check size={14} aria-hidden="true" />
              Tu producto se publicará inmediatamente en el marketplace
            </p>
          )}
        </div>
      </form>

      {/* Image Picker Modal */}
      <AnimatePresence>
        {showImagePicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowImagePicker(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto bg-white rounded-3xl shadow-2xl z-40 overflow-hidden max-h-[80vh] flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-label="Seleccionar imagen"
            >
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-5 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Camera size={20} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Seleccionar Imagen</h3>
                    <p className="text-xs text-indigo-100">Elige una foto para tu producto</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowImagePicker(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  aria-label="Cerrar selector de imagen"
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto">
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => handleImageUpload()}
                    className="w-full p-4 border-2 border-dashed border-indigo-300 bg-indigo-50 rounded-xl hover:border-indigo-500 hover:bg-indigo-100 transition-all flex items-center justify-center gap-3 text-indigo-700 font-bold"
                  >
                    <Upload size={20} aria-hidden="true" />
                    <span>Subir desde mi dispositivo</span>
                  </button>
                  <p className="text-xs text-slate-500 text-center mt-2">
                    O selecciona una imagen de ejemplo
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {DEMO_IMAGES.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleImageUpload(img)}
                      className="aspect-square rounded-xl overflow-hidden border-2 border-slate-200 hover:border-indigo-500 hover:scale-105 transition-all"
                      aria-label={`Seleccionar imagen de ejemplo ${idx + 1}`}
                    >
                      <ImageWithFallback
                        src={img}
                        alt={`Demo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
