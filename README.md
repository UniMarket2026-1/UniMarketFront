# UniMarket — Marketplace Universitario

Plataforma de compra-venta entre estudiantes universitarios. Permite publicar, buscar, comprar y calificar productos dentro de la comunidad académica.

## Equipo

| Integrante | HUs asignadas |
|---|---|
| Sofia Morato | HU-01 (Favoritos), HU-02 (Búsqueda/Filtros), HU-03 (Calificaciones) |
| Juan David Torres| HU-04 (Reventa), HU-05 (Notificaciones), HU-06 (Chat) |
| Jhon Vega | HU-07 (Publicar), HU-08 (Historial ventas), HU-09 (Detalle condición) |
| Alejandro Abril | HU-10 (Activar/desactivar), HU-11 (Métricas admin), HU-12 (Moderación) |

## Stack Técnico

- **Next.js 16 (App Router)** — Enrutamiento por archivos, Server/Client components
- **React 19 + TypeScript** — UI declarativa con tipado estático
- **Tailwind CSS v4** — Estilos utility-first
- **Framer Motion (motion/react)** — Animaciones fluidas
- **Recharts** — Gráficos de métricas para administradores
- **Sonner** — Notificaciones toast
- **Jest 30 + @testing-library/react** — Pruebas unitarias

## Decisiones Arquitectónicas

### Next.js App Router
Se eligió App Router sobre Pages Router para aprovechar React Server Components, layouts anidados y el sistema de rutas con carpetas. Cada vista principal es una ruta independiente (`/`, `/product/[id]`, `/publish`, `/chat`, `/profile`, `/purchases`, `/seller`, `/admin`), lo que mejora la navegabilidad y el SEO.

### Estado Global con React Context (AppContext)
Toda la lógica de estado (productos, usuario, chats, notificaciones, reportes) se centraliza en `AppContext` envuelto en el `layout.tsx` raíz. Esto garantiza que el estado persiste entre navegaciones de página sin rerenders innecesarios. Los handlers usan `useCallback` para estabilizar referencias.

### Custom Hooks por Dominio
Cada HU tiene su propio hook para separar lógica de presentación:
- `useFavorites` (HU-01) — Toggle favoritos con toast feedback
- `useFilters` (HU-02) — `useMemo` para filtrado eficiente
- `useNotifications` (HU-05) — Navegación al hacer clic en notificaciones
- `useChat` / `useStartChat` (HU-06) — Mensajería con URL params
- `useProducts` (HU-07/10) — CRUD de productos con toasts

### Navegación de Notificaciones (HU-05 + HU-06)
Las notificaciones de tipo `message` incluyen el campo `linkChatId`. Al hacer clic, `useNotifications` usa `useRouter.push(`/chat?chatId=${linkChatId}`)` para abrir directamente el chat específico. La página `/chat` usa `useSearchParams()` envuelto en `<Suspense>` (requerimiento de App Router).

### AI Auto-fill Stub (Bonus)
La función `analyzeImageWithAI(imageUrl)` en `src/lib/ai.ts` simula análisis de imagen con un delay de 1.5-2.5s y devuelve datos predeterminados. Para Ciclo 2, **solo hay que reemplazar el cuerpo de esta función** con la llamada real (OpenAI Vision, Gemini Pro Vision, etc.) — la firma y la UI permanecen intactas.

## Correr localmente

**Requisitos previos:** Node.js 20+, npm 10+

**1. Instalar dependencias**

```bash
npm install
```

**2. Iniciar el servidor de desarrollo**

```bash
npm run dev
```

**3. Abrir en el navegador**

```
http://localhost:3000
```

**Otros comandos útiles**

```bash
npm run build    # Compilar para producción
npm run start    # Iniciar servidor de producción (requiere build previo)
npm test         # Ejecutar las 105 pruebas unitarias
```

## Correr con Docker

**Requisitos previos:** Docker instalado y corriendo.

**1. Construir la imagen**

```bash
docker build -t unimarket .
```

> La primera vez puede tardar unos minutos. El proceso tiene 3 etapas: instalar dependencias, compilar la app, y ensamblar la imagen final liviana.

**2. Ejecutar el contenedor**

```bash
docker run -p 3000:3000 unimarket
```

**3. Abrir en el navegador**

```
http://localhost:3000
```

**Parar el contenedor**

```bash
# Listar contenedores en ejecución
docker ps

# Detener por ID o nombre
docker stop <container_id>
```

> La imagen usa **multi-stage build** (deps → builder → runner) con salida `standalone` de Next.js, lo que reduce el tamaño final aproximadamente un 80% respecto a una imagen estándar. El proceso runner corre con usuario no-root por seguridad.

## Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (providers + nav)
│   ├── page.tsx            # / → Marketplace
│   ├── product/[id]/       # /product/:id → ProductDetail
│   ├── publish/            # /publish → PublishProduct (+ AI)
│   ├── chat/               # /chat → ChatView
│   ├── purchases/          # /purchases → PurchaseHistory
│   ├── profile/            # /profile → Profile
│   ├── seller/             # /seller → SellerDashboard
│   └── admin/              # /admin → AdminDashboard
├── components/
│   ├── layout/             # Header, BottomNav
│   ├── shared/             # NotificationsPanel, ReportModal, ImageWithFallback
│   ├── marketplace/        # Marketplace + ProductCard
│   ├── product/            # ProductDetail
│   ├── publish/            # PublishProduct (AI autofill)
│   ├── seller/             # SellerDashboard
│   ├── admin/              # AdminDashboard (recharts)
│   ├── chat/               # ChatView
│   ├── purchases/          # PurchaseHistory (rating modal)
│   └── profile/            # Profile (favorites, settings)
├── contexts/
│   └── AppContext.tsx      # Global state provider
├── hooks/
│   ├── useFavorites.ts     # HU-01
│   ├── useFilters.ts       # HU-02
│   ├── useNotifications.ts # HU-05
│   ├── useChat.ts          # HU-06
│   └── useProducts.ts      # HU-07/10
├── i18n/
│   ├── translations.ts     # ES/EN strings
│   └── LanguageContext.tsx # Language provider
├── lib/
│   ├── types.ts            # TypeScript interfaces
│   ├── mockData.ts         # Datos de prueba
│   ├── utils.ts            # cn, formatCurrency, timeAgo
│   └── ai.ts               # AI stub (analyzeImageWithAI)
└── __tests__/              # Jest tests (36+ tests, 12 HUs)
```

## Internacionalización (i18n)

La app soporta **Español** (por defecto) e **Inglés**. El idioma se controla desde el header. Todos los textos visibles al usuario pasan por `useLang()` → `t.namespace.key` sin texto hardcoded en componentes.

## Accesibilidad (a11y)

- Todos los botones interactivos tienen `aria-label`
- Formularios usan `<label>` o `aria-label` en inputs
- Listas usan `role="list"` + `role="listitem"`
- Tabs usan `role="tab"`, `aria-selected`, `role="tablist"`
- Modales usan `role="dialog"`, `aria-modal`
- Switches de toggle usan `role="switch"`, `aria-checked`
- Regiones dinámicas usan `aria-live="polite"` o `"assertive"`
- Íconos decorativos tienen `aria-hidden="true"`

## Bono IA — Autocompletado de Publicaciones

### Qué hace

En la pantalla de **Nueva Publicación** (`/publish`), después de subir una foto del producto, aparece el botón **"Autocompletar con IA"**. Al pulsarlo, la app analiza la imagen y rellena automáticamente los campos del formulario:

- Nombre del producto
- Descripción
- Categoría
- Condición y detalle de condición
- Precio sugerido

Mientras el análisis está en curso se muestra un spinner con el texto *"Analizando imagen..."*. Al terminar, los campos quedan prellenados y el usuario puede ajustarlos antes de publicar.

### Cómo está implementado (Ciclo 1)

La lógica de IA está encapsulada en una única función en `src/lib/ai.ts`:

```ts
export async function analyzeImageWithAI(imageUrl: string): Promise<ProductSuggestion>
```

En Ciclo 1 esta función es un **stub**: espera entre 1.5 y 2.5 segundos (simulando la latencia de una API real) y devuelve valores predeterminados. El resto de la app —el botón, el spinner, el relleno del formulario— ya está completamente implementado y funciona de extremo a extremo.

### Cómo conectar la IA real (Ciclo 2)

Solo hay que reemplazar el cuerpo de `analyzeImageWithAI` con la llamada al servicio de visión que se elija. La firma y el tipo de retorno no cambian, por lo que la UI no requiere ninguna modificación:

```ts
// src/lib/ai.ts
export async function analyzeImageWithAI(imageUrl: string): Promise<ProductSuggestion> {
  // Ejemplo con OpenAI Vision:
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: [
      { type: "image_url", image_url: { url: imageUrl } },
      { type: "text", text: "Describe este producto universitario en JSON: name, description, category, condition, conditionDetail, price." },
    ]}],
  });
  return JSON.parse(response.choices[0].message.content);
}
```

### Archivos relevantes

| Archivo | Rol |
|---|---|
| `src/lib/ai.ts` | Función `analyzeImageWithAI` — único archivo a modificar en Ciclo 2 |
| `src/components/publish/PublishProduct.tsx` | Botón, spinner y lógica de relleno del formulario |
| `src/i18n/translations.ts` | Textos del botón y estados (`ai.autofill`, `ai.analyzing`, `ai.filled`) |
| `src/__tests__/ai.test.ts` | 5 pruebas unitarias que verifican el contrato de la función |

