# xCardGen Frontend

The **xCardGen Frontend** is a cutting-edge web application built to provide a seamless event management and design experience. It leverages the power of **Next.js 16** and **React 19** to deliver server-side rendered performance with rich client-side interactivity.

## 🚀 Technology Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: TypeScript 5.7
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/) (built on Radix Primitives)
- **State Management**:
  - **Global**: [Zustand](https://github.com/pmndrs/zustand) (Auth, Workspace State)
  - **Server State**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Graphics Engine**: [Konva.js](https://konvajs.org/) & `react-konva` for the Card Editor
- **Forms**: React Hook Form + Zod Validation
- **Icons**: Lucide React

## 📂 Project Structure

```
frontend/
├── app/
│   ├── (auth)/             # Authentication routes (Login, Register - Unprotected)
│   ├── (root)/             # Marketing / Landing pages
│   ├── dashboard/          # Protected Application Area (Workspace, Events, Builder)
│   ├── x/                  # Public Event Pages (Dynamic Routes)
│   ├── api/                # Next.js API Routes (Proxy/Edge functions)
│   ├── globals.css         # Global styles & Tailwind directives
│   └── layout.tsx          # Root layout (Providers, Font loading)
├── components/
│   ├── ui/                 # Reusable atomic components (Button, Input, Dialog)
│   ├── dashboard/          # Dashboard-specific blocks (Sidebar, Header)
│   ├── editor/             # The Canvas Editor components (Layers, Toolbar)
│   └── public/             # Components for public event pages
├── lib/
│   ├── api/                # Axios instances & API service layers
│   └── utils.ts            # CN helper and common utilities
├── stores/                 # Zustand state stores
└── types/                  # Frontend-specific type definitions
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js v20.x
- Backend API running locally or remotely

### 1. Clone & Install

```bash
git clone <repo-url>
cd frontend
npm install
```

### 2. Environment Configuration

Create a `.env.local` file to define environment-specific variables.

```ini
NEXT_PUBLIC_BACKEND_URL="http://localhost:3001"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### 3. Run Development Server

```bash
npm run dev
```

Access the app at `http://localhost:3000`.

## 🧩 Key Features & Modules

### 🎨 The Template Editor (`/dashboard/templates/[id]/editor`)

The heart of xCardGen.

- **Konva Canvas**: We use an HTML5 Canvas abstraction to allow users to drag-and-drop elements.
- **Layers System**: Supports Text, Images, Shapes, and QR Codes.
- **Dynamic Data Binding**: Elements can be bound to attendee data (e.g., `{name}`, `{email}`).
- **Responsive**: The editor UI adapts to screen size, but the canvas maintains fixed export dimensions.

### 🛡️ Authentication & Security

- **Session Handling**: On load, `AuthInitializer` checks the backend for a valid HTTP-only cookie.
- **Route Protection**: Middleware and `AuthGuard` components prevent unauthorized access to `/dashboard`.
- **Workspace Context**: The `WorkspaceStore` ensures all API requests are scoped to the currently active workspace.

### 📊 Public Event Pages (`/x/[slug]`)

- **Rendering**: Uses Incremental Static Regeneration (ISR) or Server-Side Rendering (SSR) for SEO and performance.
- **Registration Form**: Dynamic forms generated based on event requirements.
- **Real-time Feedback**: Instant generation of preview cards upon submission using the backend engine.

## 🎨 Theming & Customization

We use **Tailwind CSS v4** with CSS variables for theming.

- **Dark Mode**: Native support via `next-themes`.
- **Customization**: Modify `app/globals.css` to change the primary brand colors (`--primary`, `--secondary`).

## 🚢 Deployment

### Vercel (Recommended)

1.  Connect your GitHub repository.
2.  Add Environment Variables in Vercel Dashboard.
3.  Deploy. Next.js creates optimized Edge/Serverless functions automatically.

### Docker / Self-Hosted

```bash
# Build standalone output
npm run build

# Start server
node .next/standalone/server.js
```

_Note: Ensure `output: 'standalone'` is set in `next.config.mjs`._

## 🧪 Linting & Quality

```bash
npm run lint
```

## 📄 License

Proprietary software. All rights reserved.
