# MVM FOX — Launch-Day Runbook

## 1. Running Locally from a Clean Clone

```bash
# 1. Clone the repository
git clone <repo-url> && cd mvm-fox

# 2. Install dependencies
npm install

# 3. Set up environment variables (see §2 below)
cp .env.example .env   # then edit with real values

# 4. Start PostgreSQL (or use an external host)
#    Ensure the DATABASE_URL points to a running Postgres instance

# 5. Run database migrations
npx prisma migrate deploy

# 6. Seed the database with demo content (admin user, products, services, catering, brands)
npm run db:seed

# 7. Start the dev server
npm run dev

# 8. Open http://localhost:3000 (public site)
#    Open http://localhost:3000/admin/login (admin panel)
```

## 2. Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (e.g. `postgresql://user:pass@host:5432/mvmfox`) |
| `NEXTAUTH_SECRET` | Yes | Random string for NextAuth session signing. Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes | Base URL for NextAuth callbacks (e.g. `http://localhost:3000` or `https://mvmfox.com`) |
| `NEXT_PUBLIC_SITE_URL` | No | Public site URL used in metadata/sitemap. Defaults to `https://mvmfox.com` |

## 3. First Hour as an Admin Walkthrough

### Step 1: Log In
- Navigate to **/admin/login**
- Email: `admin@mvmfox.com` / Password: `admin123`
- You'll land on the **Dashboard** with stats cards and recent activity

### Seed Data (pre-loaded)
The seed script populates the database with demo content for review:
- **8 products** across 3 categories (Gourmet Meals, Desserts, Platters) — all Published with images
- **6 services** across 3 categories (Event Planning, Catering, Private Dining) — all Active with images
- **3 catering menus** with 4 packages (Corporate, Wedding, Private Dining)
- **1 brand** (Velvet Fox) with cover image
- **3 testimonials**, **3 homepage sections**, **4 catering event types**
- **20 media records** — all flagged `isPlaceholder=true`
- **1 admin user**: `admin@mvmfox.com` / `admin123` (SUPER_ADMIN)

All seed data uses Unsplash stock photos tagged as placeholder. Use the Media Library's **Stock/Placeholder** filter to see exactly which images need replacing before launch.

To re-seed from scratch: `npm run db:seed:clear`

### Step 2: Add Your First Product
1. Go to **Products** in the sidebar
2. Click **Add Product**
3. Fill in: Name, slug, short description, full description, price, stock
4. Upload at least one image (required to publish)
5. Set status to **Published**
6. The product now appears on **/shop**

### Step 3: Check for New Orders/Requests
- **Orders** — customer purchases (cart → checkout flow)
- **Catering > Requests** — catering inquiry forms
- **Services > Service Requests** — quote request forms
- New items trigger **notifications** (bell icon in header, polls every 30s)

### Step 4: Swap a Placeholder Image
1. Go to **Media Library** in the sidebar
2. Click the **Stock/Placeholder** filter to see flagged images
3. Upload your real image, then update the relevant content entity to use the new URL

### Step 5: Add Content
- **Content > Homepage** — hero, catering CTA, final CTA sections
- **Content > Testimonials** — customer quotes
- **Content > FAQs** — frequently asked questions
- **Brands** — brand portfolio entries

## 4. Known Limitations

These are honest, named limitations — not a "nothing is broken" list:

1. **No online payment processing** — Checkout is manual. Orders are created with `PENDING` payment status. No Stripe/PayPal integration exists yet.

2. **No image upload to cloud storage** — The Media Library shows uploaded files but there is no S3/Cloudinary upload pipeline. Images must be added via URLs pointing to external hosting (Unsplash, Pexels, etc. are configured in `next.config.ts`).

3. **Contact form is a log-only stub** — `/api/contact` logs to console. No email is sent. A real email provider (Resend, SendGrid, etc.) needs integration.

4. **No admin product/service edit/create forms** — The "Add Product" and "Add Service" links exist in the sidebar and list views, but the corresponding form pages (`/admin/products/new`, `/admin/services/new`, etc.) have not been built. Admin CRUD is limited to read-only list views.

5. **Role-based access control is cookie-presence only** — The middleware checks for a session token but does not decode the JWT to enforce role restrictions server-side. Role checks happen at the page level via `requireRole()` but the middleware itself does not differentiate between SUPER_ADMIN, ADMIN, CONTENT_MANAGER, and ORDER_MANAGER.

6. **No server-side role enforcement on API routes** — Admin API routes (`/api/admin/*`) are protected by the middleware token check, but individual API handlers do not verify the user's role before performing mutations.

7. **Category filters on public pages are static** — The shop and services pages render category pills but they don't filter client-side. They are visual placeholders until JavaScript interactivity is added.

8. **Order detail pages not built** — The orders list links to `/admin/orders/[id]` but no detail page exists.

9. **Product/service edit pages not built** — List views link to edit pages that don't exist yet.

10. **No email notifications** — In-app notifications work, but no email is sent to admins or customers for status changes.

11. **Cart is session-based, not user-based** — Cart is tied to a browser cookie, not an authenticated user. Logging in does not merge carts.

12. **Audit log requires admin users to exist** — The audit system logs mutations but only if a valid `userId` is present. Until users are created via the admin panel, audit entries cannot be written.
