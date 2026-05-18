# 🎨 UniMarket Frontend

**Next.js 16** aplicación web para la plataforma de marketplace universitario UniMarket. Interfaz responsiva con TypeScript, TailwindCSS y componentes accesibles de Radix UI.

## 📋 Índice

- [Características](#características)
- [Stack Tecnológico](#stack-tecnológico)
- [Instalación y Setup](#instalación-y-setup)
- [Variables de Entorno](#variables-de-entorno)
- [Ejecutar Localmente](#ejecutar-localmente)
- [Scripts Disponibles](#scripts-disponibles)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Rutas y Páginas](#rutas-y-páginas)
- [Componentes](#componentes)
- [Contexts y Estado Global](#contexts-y-estado-global)
- [Hooks Personalizados](#hooks-personalizados)
- [Cliente API](#cliente-api)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## ✨ Características

### Públicas
- ✅ Landing page responsiva
- ✅ Marketplace con búsqueda y filtros
- ✅ Detalles de productos
- ✅ Autenticación (login/registro)
- ✅ Perfil de vendedor con calificaciones

### Autenticadas (Estudiantes)
- ✅ Crear anuncios de productos
- ✅ Editar/eliminar propios anuncios
- ✅ Gestión de favoritos
- ✅ Chat en tiempo real con compradores/vendedores
- ✅ Historial de compras
- ✅ Dashboard de vendedor
- ✅ Calificar vendedores
- ✅ Reportar contenido inapropiado

### Admin
- ✅ Dashboard de moderación
- ✅ Revisión de reportes
- ✅ Suspensión de usuarios
- ✅ Gestión de plataforma
- ✅ Analytics y estadísticas

---

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **Next.js** | 16.1.6 | Framework React con SSR |
| **React** | 19.x | Librería UI |
| **TypeScript** | 5.x | Lenguaje tipado |
| **TailwindCSS** | 3.x | Estilos utility-first |
| **Radix UI** | Latest | Componentes accesibles |
| **Lucide React** | Latest | Iconografía |
| **Sonner** | Latest | Notificaciones toast |
| **Motion** | Latest | Animaciones |
| **Next-i18n** | (opcional) | Internacionalización |
| **Jest** | 29.x | Testing unitario |
| **Playwright** | Latest | Testing E2E |

---

## 📦 Instalación y Setup

### Requisitos Previos

- **Node.js** 18.x o superior
- **npm** 9.x o superior
- **Git**
- **Backend corriendo** en `http://localhost:3001/api`

### Pasos de Instalación

**1. Navegar a la carpeta frontend:**
```bash
cd unimarket_front/unimarket
```

**2. Instalar dependencias:**
```bash
npm install

# Si hay problemas con lock:
rm -rf node_modules package-lock.json
npm install
```

**3. Crear archivo `.env.local`:**
```bash
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001/api
EOF
```

**4. Verificar instalación:**
```bash
npm run dev
# Acceder a http://localhost:3000
```

---

## 🔑 Variables de Entorno

Crear archivo `.env.local`:

```env
# ============================================
# API BACKEND
# ============================================
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# En producción:
# NEXT_PUBLIC_API_URL=https://api.unimarket.edu/api

# ============================================
# OPCIONAL: Analytics / Tracking
# ============================================
# NEXT_PUBLIC_GA_ID=UA-XXXXX
# NEXT_PUBLIC_SENTRY_DSN=https://...

# ============================================
# DESARROLLO
# ============================================
NEXT_PUBLIC_ENV=development
```

**Nota:** Las variables con prefijo `NEXT_PUBLIC_` están disponibles en el navegador. Las otras solo existen en el servidor.

---

## 🚀 Ejecutar Localmente

### Modo Desarrollo

```bash
npm run dev

# Salida:
# ▲ Next.js 16.1.6
# - ready started server on 0.0.0.0:3000, url: http://localhost:3000
# ○ Compiling / ...
# ✓ Compiled / in 2s
```

Accede a `http://localhost:3000` en el navegador.

**Hot Reload:** Los cambios se reflejan automáticamente.

### Modo Producción

```bash
# Compilar
npm run build

# Ejecutar
npm run start

# O en un paso:
npm run start:prod
```

### Con Docker

```bash
# Construir imagen
docker build -t unimarket-frontend .

# Ejecutar
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://backend:3001/api \
  unimarket-frontend

# O desde docker-compose:
cd ../..
docker-compose up unimarket_front
```

---

## 📜 Scripts Disponibles

| Script | Propósito |
|--------|-----------|
| `npm run dev` | Desarrollo con hot-reload |
| `npm run build` | Compilar para producción |
| `npm run start` | Ejecutar producción |
| `npm run test` | Ejecutar tests unitarios |
| `npm run test:watch` | Tests en modo watch |
| `npm run test:e2e` | Tests E2E con Playwright |
| `npm run test:e2e:ui` | Tests E2E con UI |
| `npm run test:e2e:report` | Ver reporte de E2E |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint + auto-fix |
| `npm run format` | Prettier format |
| `npm run type-check` | TypeScript check |

---

## 📁 Estructura del Proyecto

```
src/
│
├── 📄 APP (Rutas y Layouts - App Router de Next.js)
│   ├── layout.tsx            # Layout raíz (Meta, estilos)
│   ├── page.tsx              # Home page
│   ├── globals.css           # Estilos globales
│   │
│   ├── 🔐 login/
│   │   ├── page.tsx          # Página de login/registro
│   │   └── layout.tsx        # Layout de login
│   │
│   ├── 🏬 marketplace/
│   │   ├── page.tsx          # Listado de productos
│   │   └── layout.tsx
│   │
│   ├── 📦 product/
│   │   ├── [id]/
│   │   │   ├── page.tsx      # Detalles del producto
│   │   │   └── layout.tsx
│   │   └── create/
│   │       └── page.tsx      # Crear nuevo anuncio
│   │
│   ├── 👤 profile/
│   │   ├── page.tsx          # Mi perfil
│   │   ├── [userId]/page.tsx # Perfil de otro usuario
│   │   └── settings/page.tsx # Configuración
│   │
│   ├── 💬 chat/
│   │   ├── page.tsx          # Lista de chats
│   │   └── [chatId]/page.tsx # Chat individual
│   │
│   ├── 📊 dashboard/
│   │   ├── seller/page.tsx   # Dashboard vendedor
│   │   └── admin/page.tsx    # Panel admin
│   │
│   └── 🚨 admin/
│       ├── page.tsx          # Admin home
│       ├── reports/page.tsx  # Gestión de reportes
│       └── users/page.tsx    # Gestión de usuarios
│
├── 🎨 COMPONENTS (Componentes Reutilizables)
│   ├── marketplace/
│   │   ├── ProductCard.tsx           # Card de producto
│   │   ├── ProductGrid.tsx           # Grid de productos
│   │   ├── ProductFilters.tsx        # Filtros
│   │   └── SearchBar.tsx             # Barra de búsqueda
│   │
│   ├── product/
│   │   ├── ProductDetail.tsx         # Detalles completos
│   │   ├── ProductImages.tsx         # Galería de imágenes
│   │   ├── ProductRatings.tsx        # Calificaciones
│   │   └── RelatedProducts.tsx       # Productos relacionados
│   │
│   ├── auth/
│   │   ├── LoginForm.tsx             # Formulario login
│   │   ├── RegisterForm.tsx          # Formulario registro
│   │   └── ProtectedRoute.tsx        # Guard de ruta
│   │
│   ├── chat/
│   │   ├── ChatList.tsx              # Lista de conversaciones
│   │   ├── ChatWindow.tsx            # Ventana de chat
│   │   ├── MessageList.tsx           # Mensajes
│   │   └── MessageInput.tsx          # Input de mensaje
│   │
│   ├── common/
│   │   ├── Header.tsx                # Header/Navbar
│   │   ├── Footer.tsx                # Footer
│   │   ├── LoadingSpinner.tsx        # Spinner de carga
│   │   ├── Modal.tsx                 # Modal genérico
│   │   └── Button.tsx                # Botón estándar
│   │
│   ├── admin/
│   │   ├── ReportsList.tsx           # Listado de reportes
│   │   ├── UserManagement.tsx        # Gestión usuarios
│   │   └── Dashboard.tsx             # Panel admin
│   │
│   └── profile/
│       ├── ProfileCard.tsx           # Card de perfil
│       ├── SellerInfo.tsx            # Info del vendedor
│       └── UserProducts.tsx          # Productos del usuario
│
├── 📚 CONTEXTS (Estado Global)
│   ├── AuthContext.tsx       # Autenticación
│   ├── UserContext.tsx       # Datos del usuario
│   ├── ProductsContext.tsx   # Productos y favoritos
│   ├── ChatContext.tsx       # Chats y mensajes
│   ├── NotificationContext.tsx # Notificaciones
│   └── ThemeContext.tsx      # Tema (light/dark)
│
├── 🪝 HOOKS (React Hooks Personalizados)
│   ├── useAuth.ts            # Hook de autenticación
│   ├── useUser.ts            # Hook de usuario
│   ├── useProducts.ts        # Hook de productos
│   ├── useChat.ts            # Hook de chats
│   ├── useFavorites.ts       # Hook de favoritos
│   ├── useFilters.ts         # Hook de filtros
│   ├── useNotification.ts    # Hook de notificaciones
│   └── useLocalStorage.ts    # Hook localStorage
│
├── 🌐 LIB (Utilidades y Cliente API)
│   ├── api.ts                # Cliente HTTP tipado
│   ├── types.ts              # Tipos globales
│   ├── constants.ts          # Constantes
│   ├── utils.ts              # Funciones utilitarias
│   ├── validation.ts         # Validación de formularios
│   └── helpers.ts            # Funciones helper
│
├── 🌍 I18N (Internacionalización - Opcional)
│   ├── en.json               # Textos en inglés
│   ├── es.json               # Textos en español
│   └── config.ts             # Configuración i18n
│
├── 🧪 __TESTS__ (Tests Unitarios)
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── ...
│
└── 📁 PUBLIC (Assets Estáticos)
    ├── images/
    ├── icons/
    └── fonts/
```

---

## 🛣️ Rutas y Páginas

### Rutas Públicas

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | `page.tsx` | Home/Landing |
| `/login` | `login/page.tsx` | Login y registro |
| `/marketplace` | `marketplace/page.tsx` | Listado de productos |
| `/product/[id]` | `product/[id]/page.tsx` | Detalles del producto |
| `/profile/[userId]` | `profile/[userId]/page.tsx` | Perfil público |

### Rutas Autenticadas (Estudiante)

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/profile` | `profile/page.tsx` | Mi perfil |
| `/profile/settings` | `profile/settings/page.tsx` | Configuración |
| `/product/create` | `product/create/page.tsx` | Crear anuncio |
| `/product/[id]/edit` | `product/[id]/edit/page.tsx` | Editar anuncio |
| `/chat` | `chat/page.tsx` | Mis chats |
| `/chat/[chatId]` | `chat/[chatId]/page.tsx` | Chat individual |
| `/dashboard/seller` | `dashboard/seller/page.tsx` | Dashboard vendedor |

### Rutas Admin

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/admin` | `admin/page.tsx` | Panel principal |
| `/admin/reports` | `admin/reports/page.tsx` | Gestión de reportes |
| `/admin/users` | `admin/users/page.tsx` | Gestión de usuarios |

---

## 🧩 Componentes Principales

### ProductCard
Tarjeta de producto para listar en marketplace.

```tsx
<ProductCard 
  product={product}
  onFavorite={handleFavorite}
  isFavorite={false}
/>
```

**Props:**
- `product: Product` - Datos del producto
- `onFavorite: () => void` - Callback al marcar favorito
- `isFavorite: boolean` - Está en favoritos

### ProductDetail
Panel completo con detalles, imágenes, vendedor y calificaciones.

```tsx
<ProductDetail 
  productId="p123"
  onContactSeller={handleContact}
/>
```

### ChatWindow
Ventana de conversación con mensajes y input.

```tsx
<ChatWindow 
  chatId="c123"
  onSendMessage={handleSend}
/>
```

### ProductFilters
Filtros avanzados para búsqueda.

```tsx
<ProductFilters 
  onFilterChange={handleFilter}
  categories={categories}
/>
```

---

## 🎯 Contexts y Estado Global

### AuthContext
Gestiona autenticación, token y usuario actual.

```tsx
const { user, token, login, logout, isAuthenticated } = useAuth();
```

**Proporciona:**
- `user: User | null` - Usuario autenticado
- `token: string | null` - JWT token
- `isAuthenticated: boolean` - Está autenticado
- `login(credentials)` - Iniciar sesión
- `logout()` - Cerrar sesión
- `register(data)` - Registrarse

### ProductsContext
Estado global de productos, búsqueda y favoritos.

```tsx
const { products, loading, favorites, addFavorite } = useProducts();
```

### ChatContext
Conversaciones y mensajes en tiempo real.

```tsx
const { chats, currentChat, messages, sendMessage } = useChat();
```

### NotificationContext
Sistema de notificaciones toast.

```tsx
const { showNotification } = useNotification();
showNotification('Producto guardado!', 'success');
```

---

## 🪝 Hooks Personalizados

### useAuth
Acceso a autenticación y usuario actual.

```tsx
const { user, login, isAuthenticated } = useAuth();

if (!isAuthenticated) {
  return <Redirect to="/login" />;
}
```

### useProducts
Listado y búsqueda de productos.

```tsx
const { products, searchProducts, loading } = useProducts();

useEffect(() => {
  searchProducts({ category: 'tech', priceMax: 5000000 });
}, []);
```

### useChat
Gestión de chats y mensajes.

```tsx
const { messages, sendMessage, loading } = useChat(chatId);

const handleSend = async (text) => {
  await sendMessage(text);
};
```

### useFavorites
Gestión de productos favoritos.

```tsx
const { favorites, addFavorite, removeFavorite } = useFavorites();

const toggleFavorite = (productId) => {
  if (favorites.includes(productId)) {
    removeFavorite(productId);
  } else {
    addFavorite(productId);
  }
};
```

### useFilters
Filtros de productos.

```tsx
const { filters, setFilter, applyFilters } = useFilters();

const handleCategoryChange = (category) => {
  setFilter('category', category);
};
```

---

## 🌐 Cliente API

**Archivo:** `src/lib/api.ts`

Cliente HTTP tipado para comunicación con backend.

```tsx
import { apiClient } from '@/lib/api';

// Obtener productos
const products = await apiClient.getProducts({ 
  page: 1, 
  limit: 10 
});

// Crear producto
await apiClient.createProduct({
  title: 'Laptop',
  price: 1200000,
  description: '...',
  category: 'tech',
  images: ['url1', 'url2']
});

// Login
const { access_token, user } = await apiClient.login({
  email: 'user@email.com',
  password: 'password'
});
```

**Métodos disponibles:**
- `getProducts(params)` - Listar productos
- `getProduct(id)` - Detalles del producto
- `createProduct(data)` - Crear producto
- `updateProduct(id, data)` - Actualizar
- `deleteProduct(id)` - Eliminar
- `searchProducts(query)` - Buscar
- `login(credentials)` - Login
- `register(data)` - Registro
- `getChats()` - Listar chats
- `sendMessage(chatId, content)` - Enviar mensaje
- `getMessages(chatId)` - Obtener mensajes
- `createRating(data)` - Crear calificación
- `getSellerRatings(sellerId)` - Calificaciones del vendedor

---

## 🧪 Testing

### Tests Unitarios (Jest)

```bash
npm test
npm run test:watch
npm run test:cov
```

**Estructura:**
```
src/__tests__/
├── components/
│   └── ProductCard.test.tsx
├── hooks/
│   └── useAuth.test.ts
└── lib/
    └── api.test.ts
```

**Ejemplo de test:**
```typescript
describe('ProductCard', () => {
  it('debe renderizar título del producto', () => {
    const product = { id: '1', title: 'Laptop', price: 1000 };
    const { getByText } = render(<ProductCard product={product} />);
    
    expect(getByText('Laptop')).toBeInTheDocument();
  });
});
```

### Tests E2E (Playwright)

```bash
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:report
```

**Tests incluyen:**
- `marketplace-favorites.spec.ts` - Guardar/quitar favoritos
- `notifications-chat-link.spec.ts` - Chat desde notificaciones
- `product-report-chat.spec.ts` - Reportar y chatear
- `purchases-resell-rating.spec.ts` - Compra y calificación
- `seller-admin-moderation.spec.ts` - Moderation admin

**Estructura:**
```
e2e/
├── marketplace-favorites.spec.ts
├── notifications-chat-link.spec.ts
└── ...
```

---

## 🚀 Deployment

### Vercel (Recomendado para Next.js)

**1. Conectar repo a Vercel:**
- Ir a [vercel.com](https://vercel.com)
- Click "New Project"
- Importar repositorio

**2. Configurar variables de entorno:**
```
NEXT_PUBLIC_API_URL=https://api-prod.unimarket.edu/api
```

**3. Deploy automático:**
- Cada push a `main` deploya automáticamente

### Azure App Service

**1. Crear Web App:**
```bash
az webapp create --resource-group rg-unimarket \
  --plan unimarket-plan \
  --name unimarket-web \
  --runtime "node|18-lts"
```

**2. Configurar variables:**
```bash
az webapp config appsettings set \
  --resource-group rg-unimarket \
  --name unimarket-web \
  --settings \
    NEXT_PUBLIC_API_URL=https://api.unimarket.edu/api
```

**3. Deployar:**
```bash
# Build
npm run build

# Deploy a Azure
npm run deploy
```

### Docker

```bash
# Construir imagen
docker build -t unimarket-frontend .

# Ejecutar
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.unimarket.edu/api \
  unimarket-frontend
```

---

## 🐛 Troubleshooting

### Problema: Conexión rechazada al backend

**Síntomas:** `Error: Failed to fetch from API`

**Solución:**
```bash
# Verificar que backend está corriendo
curl http://localhost:3001/api

# Verificar .env.local
cat .env.local

# Debería tener:
# NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Problema: Stale lock file

**Síntomas:** `Error: Unable to acquire lock at .next/dev/lock`

**Solución:**
```bash
# Eliminar lock y carpeta .next
rm -rf .next node_modules package-lock.json

# Reinstalar
npm install

# Reiniciar
npm run dev
```

### Problema: Tipos TypeScript faltantes

**Síntomas:** `Cannot find type 'Product'`

**Solución:**
```bash
# Regenerar tipos
npm run type-check

# Verificar src/lib/types.ts exista con tipos
```

### Problema: Imágenes no se cargan

**Síntomas:** Imágenes 404 o placeholder

**Solución:**
1. Verificar URLs en `product.images`
2. Si es una URL relativa, cambiar a URL absoluta
3. Verificar CORS en backend

### Problema: Hot reload no funciona

**Síntomas:** Cambios no se reflejan automáticamente

**Solución:**
```bash
# Detener dev server (Ctrl+C)
# Eliminar .next
rm -rf .next

# Reiniciar
npm run dev
```

### Problema: Componentes Radix UI no se cargan

**Síntomas:** Estilos rotos, componentes sin estilo

**Solución:**
```bash
# Verificar que TailwindCSS está configurado
cat tailwind.config.ts

# Reinstalar dependencias
npm install

# Verificar globals.css tiene:
# @tailwind base;
# @tailwind components;
# @tailwind utilities;
```

---

## 📚 Recursos Adicionales

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TailwindCSS](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Playwright Docs](https://playwright.dev)

---

## 🤝 Contribuir

1. Fork repositorio
2. Crear rama (`git checkout -b feature/MiFeature`)
3. Commit cambios (`git commit -m 'Add MiFeature'`)
4. Push (`git push origin feature/MiFeature`)
5. Pull Request

---

## 📄 Licencia

MIT License
