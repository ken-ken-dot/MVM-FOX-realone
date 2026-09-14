/**
 * MVM FOX — Database Seed Script (v13)
 *
 * Populates the database with realistic demo content for development and review.
 * Hierarchical categories: Electronics → subcategories, Software → subcategories, Catering → subcategories.
 * All seeded images are flagged isPlaceholder=true.
 *
 * v13 additions:
 * - Expanded product catalog (25+ Electronics, 15+ Software, tiered Catering)
 * - Faceted browsing fields: tags, platform, licenseType, tier, eventTypeId
 *
 * Usage:
 *   npx tsx prisma/seed.ts
 *   npx tsx prisma/seed.ts --clear
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import https from "https";
import http from "http";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ─── Unsplash Source URLs ───
const IMG = {
  // Electronics — Laptops
  laptop1: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1920&q=85",
  laptop2: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1920&q=85",
  laptop3: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=1920&q=85",
  laptop4: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=1920&q=85",
  laptop5: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=1920&q=85",
  // Electronics — Phones
  phone1: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1920&q=85",
  phone2: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1920&q=85",
  phone3: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1920&q=85",
  // Electronics — Tablets
  tablet1: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=1920&q=85",
  tablet2: "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=1920&q=85",
  // Electronics — Desktops
  desktop1: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=1920&q=85",
  desktop2: "https://images.unsplash.com/photo-1593642634443-44adaa06623a?w=1920&q=85",
  // Electronics — Monitors/TVs
  monitor1: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1920&q=85",
  monitor2: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1920&q=85",
  // Electronics — Audio
  headphones: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1920&q=85",
  speaker: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=1920&q=85",
  earbuds: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1920&q=85",
  // Electronics — Smart Home
  smarthome1: "https://images.unsplash.com/photo-1558002038-1055907df827?w=1920&q=85",
  smarthome2: "https://images.unsplash.com/photo-1558002038-1055907df827?w=1920&q=85",
  // Electronics — Appliances
  fridge: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=1920&q=85",
  washer: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=1920&q=85",
  // Electronics — Accessories
  charger: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=1920&q=85",
  keyboard: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1920&q=85",

  // Software
  software1: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80",
  software2: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80",
  software3: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80",
  software4: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",
  software5: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80",
  software6: "https://images.unsplash.com/photo-1537498425277-c283d32ef9db?w=1200&q=80",
  software7: "https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=1200&q=80",
  software8: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80",

  // Catering (Velvet Fox)
  catering1: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=80",
  catering2: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=1200&q=80",
  catering3: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=80",
  catering4: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=1200&q=80",
  catering5: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=1200&q=80",
  catering6: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=1200&q=80",
  catering7: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80",
  catering8: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1200&q=80",
  catering9: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80",
  catering10: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80",
  catering11: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1200&q=80",
  catering12: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80",
  catering13: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&q=80",
  catering14: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1200&q=80",
  catering15: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=1200&q=80",
  catering16: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=1200&q=80",

  // Services
  service1: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80",
  service2: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
  service3: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80",
  service4: "https://images.unsplash.com/photo-1555244162-803834f70033?w=1200&q=80",
  service5: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=1200&q=80",
  service6: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",

  // Catering menus
  menu1: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=80",
  menu2: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&q=80",
  menu3: "https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?w=1200&q=80",
  menu4: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&q=80",

  // Brand — Velvet Fox
  brandVelvet: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80",
  brandLogo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&q=80",

  // Brand — MVM Electronics
  brandElectronics: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1600&q=80",
  brandElectronicsCover: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&q=80",

  // Brand — MVM Software
  brandSoftware: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1600&q=80",
  brandSoftwareCover: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600&q=80",

  // Hero slides
  hero1: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&q=80",
  hero2: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1600&q=80",
  hero3: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600&q=80",
  hero4: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1600&q=80",

  // Brands page hero slides
  brandsHeroSoftware: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1920&q=80",
  brandsHeroElectronics: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1920&q=80",
  brandsHeroCatering: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=1920&q=80",

  // About page video poster
  aboutVideoPoster: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1920&q=80",
} as const;

function checkUrl(url: string, timeoutMs = 10000): Promise<{ ok: boolean; status: number; reason: string }> {
  return new Promise((resolve) => {
    if (!url || !url.startsWith("http")) {
      resolve({ ok: false, status: 0, reason: url ? "not an HTTP URL" : "null/empty" });
      return;
    }
    const lib = url.startsWith("https") ? https : http;
    const req = lib.request(url, { method: "HEAD", timeout: timeoutMs }, (res) => {
      resolve({ ok: res.statusCode !== undefined && res.statusCode >= 200 && res.statusCode < 400, status: res.statusCode ?? 0, reason: "" });
    });
    req.on("timeout", () => { req.destroy(); resolve({ ok: false, status: 0, reason: "timeout" }); });
    req.on("error", (e) => { resolve({ ok: false, status: 0, reason: e.message }); });
    req.end();
  });
}

async function createMedia(url: string, fileName: string, alt: string, folder: string) {
  const existing = await prisma.media.findFirst({ where: { url } });
  if (!existing) {
    await prisma.media.create({ data: { url, fileName, mimeType: "image/jpeg", alt, folder, isPlaceholder: true } });
  }
}

async function createProductImage(productId: string, url: string, alt: string, isPrimary: boolean, sortOrder: number) {
  return prisma.productImage.create({ data: { productId, url, alt, isPrimary, sortOrder } });
}

async function main() {
  const clearMode = process.argv.includes("--clear");
  if (clearMode) {
    console.log("🧹 Clearing all data...");
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.cateringRequest.deleteMany();
    await prisma.serviceRequest.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.formDraft.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.product.deleteMany();
    await prisma.productCategory.deleteMany();
    await prisma.service.deleteMany();
    await prisma.serviceCategory.deleteMany();
    await prisma.cateringPackage.deleteMany();
    await prisma.cateringMenu.deleteMany();
    await prisma.cateringEvent.deleteMany();
    await prisma.brand.deleteMany();
    await prisma.fAQ.deleteMany();
    await prisma.testimonial.deleteMany();
    await prisma.page.deleteMany();
    await prisma.homepageSection.deleteMany();
    await prisma.siteSetting.deleteMany();
    await prisma.media.deleteMany();
    await prisma.user.deleteMany();
    await prisma.customer.deleteMany();
    console.log("✅ All data cleared.\n");
  }

  // ═══ 0. VALIDATE ALL IMAGE URLS ═══
  console.log("🔍 Validating all image URLs before seeding...");
  const allUrls = Object.values(IMG);
  const uniqueUrls = [...new Set(allUrls)];
  const brokenUrls: { url: string; status: number; reason: string }[] = [];
  for (const url of uniqueUrls) {
    const check = await checkUrl(url);
    if (!check.ok) brokenUrls.push({ url, ...check });
  }
  if (brokenUrls.length > 0) {
    console.warn(`\n⚠️  WARNING: ${brokenUrls.length} image URL(s) returned errors and will be SKIPPED:`);
    for (const b of brokenUrls) {
      console.warn(`   ✗ ${b.url} — status ${b.status}, reason: ${b.reason}`);
    }
    console.warn("\n   These URLs may have been removed from Unsplash. Replace them with working alternatives.\n");
  } else {
    console.log(`   ✓ All ${uniqueUrls.length} unique image URLs validated successfully.\n`);
  }

  // ═══ 1. ADMIN USER ═══
  console.log("👤 Seeding admin user...");
  const adminPasswordHash = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@mvmfox.com" },
    update: {},
    create: { email: "admin@mvmfox.com", name: "MVM FOX Admin", passwordHash: adminPasswordHash, role: "SUPER_ADMIN" },
  });
  console.log("   ✓ admin@mvmfox.com / admin123");

  // ═══ 2. BRAND ═══
  console.log("🏷️  Seeding brands...");
  const velvetBrand = await prisma.brand.upsert({
    where: { slug: "velvet-fox" },
    update: {},
    create: {
      slug: "velvet-fox", name: "Velvet Fox", tagline: "Elevating every occasion",
      description: "Velvet Fox is the premium catering brand of MVM FOX, specializing in bespoke culinary experiences for weddings, corporate events, and private celebrations.",
      logoUrl: IMG.brandLogo, coverImageUrl: IMG.brandVelvet, isActive: true, sortOrder: 1,
    },
  });
  await createMedia(IMG.brandVelvet, "velvet-fox-cover.jpg", "Velvet Fox brand cover", "brands");
  console.log("   ✓ Velvet Fox brand");

  const electronicsBrand = await prisma.brand.upsert({
    where: { slug: "mvm-electronics" },
    update: {},
    create: {
      slug: "mvm-electronics", name: "MVM Electronics", tagline: "Engineered for performance",
      description: "MVM FOX's first-party electronics line — premium laptops, phones, smart home devices, and audio products built with obsessive attention to detail and crafted for everyday life.",
      logoUrl: IMG.brandElectronics, coverImageUrl: IMG.brandElectronicsCover, isActive: true, sortOrder: 2,
    },
  });
  await createMedia(IMG.brandElectronicsCover, "mvm-electronics-cover.jpg", "MVM Electronics brand cover", "brands");
  console.log("   ✓ MVM Electronics brand");

  const softwareBrand = await prisma.brand.upsert({
    where: { slug: "mvm-software" },
    update: {},
    create: {
      slug: "mvm-software", name: "MVM Software", tagline: "Built to empower",
      description: "MVM FOX's software division — productivity tools, creative suites, and security solutions designed to help individuals and teams do their best work.",
      logoUrl: IMG.brandSoftware, coverImageUrl: IMG.brandSoftwareCover, isActive: true, sortOrder: 3,
    },
  });
  await createMedia(IMG.brandSoftwareCover, "mvm-software-cover.jpg", "MVM Software brand cover", "brands");
  console.log("   ✓ MVM Software brand");

  // ═══ 3. PRODUCT CATEGORIES (hierarchical) ═══
  console.log("📦 Seeding product categories...");
  const catElectronics = await prisma.productCategory.upsert({ where: { slug: "electronics" }, update: {}, create: { slug: "electronics", name: "Electronics", description: "Laptops, phones, appliances, and more", icon: "monitor", imageUrl: IMG.hero2, sortOrder: 1 } });
  const catSoftware = await prisma.productCategory.upsert({ where: { slug: "software" }, update: {}, create: { slug: "software", name: "Software", description: "Productivity, creative, and business tools", icon: "code", imageUrl: IMG.hero3, sortOrder: 2 } });
  const catCatering = await prisma.productCategory.upsert({ where: { slug: "catering-shop" }, update: {}, create: { slug: "catering-shop", name: "Catering", description: "Velvet Fox catering menus and packages", icon: "utensils", imageUrl: IMG.hero4, sortOrder: 3 } });

  // Electronics Subcategories
  const subLaptops = await prisma.productCategory.upsert({ where: { slug: "laptops" }, update: {}, create: { slug: "laptops", name: "Laptops", parentId: catElectronics.id, sortOrder: 1 } });
  const subDesktops = await prisma.productCategory.upsert({ where: { slug: "desktops" }, update: {}, create: { slug: "desktops", name: "Desktops", parentId: catElectronics.id, sortOrder: 2 } });
  const subPhones = await prisma.productCategory.upsert({ where: { slug: "smartphones" }, update: {}, create: { slug: "smartphones", name: "Smartphones", parentId: catElectronics.id, sortOrder: 3 } });
  const subTablets = await prisma.productCategory.upsert({ where: { slug: "tablets" }, update: {}, create: { slug: "tablets", name: "Tablets", parentId: catElectronics.id, sortOrder: 4 } });
  const subMonitors = await prisma.productCategory.upsert({ where: { slug: "monitors-tvs" }, update: {}, create: { slug: "monitors-tvs", name: "Monitors & TVs", parentId: catElectronics.id, sortOrder: 5 } });
  const subAudio = await prisma.productCategory.upsert({ where: { slug: "audio" }, update: {}, create: { slug: "audio", name: "Audio", parentId: catElectronics.id, sortOrder: 6 } });
  const subSmartHome = await prisma.productCategory.upsert({ where: { slug: "smart-home" }, update: {}, create: { slug: "smart-home", name: "Smart Home", parentId: catElectronics.id, sortOrder: 7 } });
  const subAppliances = await prisma.productCategory.upsert({ where: { slug: "home-appliances" }, update: {}, create: { slug: "home-appliances", name: "Home Appliances", parentId: catElectronics.id, sortOrder: 8 } });
  const subAccessories = await prisma.productCategory.upsert({ where: { slug: "accessories" }, update: {}, create: { slug: "accessories", name: "Accessories", parentId: catElectronics.id, sortOrder: 9 } });

  // Software Subcategories
  const subProductivity = await prisma.productCategory.upsert({ where: { slug: "productivity-software" }, update: {}, create: { slug: "productivity-software", name: "Productivity", parentId: catSoftware.id, sortOrder: 1 } });
  const subCreative = await prisma.productCategory.upsert({ where: { slug: "creative-software" }, update: {}, create: { slug: "creative-software", name: "Creative & Design", parentId: catSoftware.id, sortOrder: 2 } });
  const subSecurity = await prisma.productCategory.upsert({ where: { slug: "security-software" }, update: {}, create: { slug: "security-software", name: "Security", parentId: catSoftware.id, sortOrder: 3 } });
  const subBusiness = await prisma.productCategory.upsert({ where: { slug: "business-software" }, update: {}, create: { slug: "business-software", name: "Business & Enterprise", parentId: catSoftware.id, sortOrder: 4 } });
  const subDeveloper = await prisma.productCategory.upsert({ where: { slug: "developer-tools" }, update: {}, create: { slug: "developer-tools", name: "Developer Tools", parentId: catSoftware.id, sortOrder: 5 } });

  // Catering Subcategories
  const subGourmet = await prisma.productCategory.upsert({ where: { slug: "gourmet-meals" }, update: {}, create: { slug: "gourmet-meals", name: "Gourmet Meals", parentId: catCatering.id, sortOrder: 1 } });
  const subDesserts = await prisma.productCategory.upsert({ where: { slug: "desserts" }, update: {}, create: { slug: "desserts", name: "Desserts", parentId: catCatering.id, sortOrder: 2 } });
  const subPlatters = await prisma.productCategory.upsert({ where: { slug: "platters" }, update: {}, create: { slug: "platters", name: "Platters & Boards", parentId: catCatering.id, sortOrder: 3 } });

  console.log("   ✓ Electronics (9 subcats), Software (5 subcats), Catering (3 subcats)");

  // ═══ 4. PRODUCTS ═══
  console.log("🛒 Seeding products...");

  type ProductSeed = {
    slug: string; name: string; shortDescription: string; description: string;
    story: string; specs: Record<string, string> | null;
    price: number; stock: number; categoryId: string; brandId: string | null;
    image: string; imageName: string; sku: string; productType: string;
    tags?: string[]; platform?: string; licenseType?: string;
    images?: string[];
  };

  const products: ProductSeed[] = [
    // ══════════════════════════════════════════
    // ELECTRONICS — Laptops (5)
    // ══════════════════════════════════════════
    {
      slug: "mvm-fox-pro-16-laptop", name: "MVM FOX Pro 16\" Laptop",
      shortDescription: "16\" Retina display, M3 Pro chip, 18GB RAM, 512GB SSD — built for creators.",
      description: "The MVM FOX Pro 16-inch is our flagship laptop for creative professionals and power users. Featuring a stunning Liquid Retina XDR display, the M3 Pro chip with 12-core CPU and 18-core GPU, 18GB unified memory, and 512GB SSD. All-day battery life meets pro-level performance. [SEED DATA — Replace before launch]",
      story: "We built the Pro 16 for people who refuse to compromise. Whether you're editing 4K video, running complex datasets, or designing the next great interface — this machine keeps up without breaking a sweat.",
      specs: { Display: '16.2" Liquid Retina XDR', Processor: "Apple M3 Pro 12-core", Memory: "18GB Unified", Storage: "512GB SSD", Battery: "Up to 22 hours", Weight: "2.14 kg" },
      price: 2499.00, stock: 25, categoryId: subLaptops.id, brandId: null,
      image: IMG.laptop1, imageName: "mvm-fox-pro-16.jpg", sku: "MVM-ELP-001", productType: "physical",
      tags: ["Work", "Office", "Creative"],
      images: [IMG.laptop1, IMG.laptop2, IMG.laptop3],
    },
    {
      slug: "mvm-fox-air-14-laptop", name: "MVM FOX Air 14\" Laptop",
      shortDescription: "Ultra-thin 14\" laptop, M3 chip, 16GB RAM, all-day battery for everyday brilliance.",
      description: "The MVM FOX Air 14-inch redefines portable computing. Just 1.24 kg with a gorgeous 14-inch Liquid Retina display, M3 chip, 16GB unified memory, and up to 18 hours of battery life. Perfect for professionals on the move. [SEED DATA — Replace before launch]",
      story: "Some days you need power without the weight. The Air 14 is for those days — and every day after.",
      specs: { Display: '13.6" Liquid Retina', Processor: "Apple M3 8-core", Memory: "16GB Unified", Storage: "256GB SSD", Battery: "Up to 18 hours", Weight: "1.24 kg" },
      price: 1299.00, stock: 40, categoryId: subLaptops.id, brandId: null,
      image: IMG.laptop2, imageName: "mvm-fox-air-14.jpg", sku: "MVM-ELA-001", productType: "physical",
      tags: ["Work", "Travel", "Office"],
      images: [IMG.laptop2, IMG.laptop1],
    },
    {
      slug: "mvm-fox-pro-max-16-laptop", name: "MVM FOX Pro Max 16\" Laptop",
      shortDescription: "16\" Liquid Retina XDR, M3 Max chip, 36GB RAM, 1TB SSD — the ultimate workstation.",
      description: "For those who demand the absolute best. The Pro Max packs the M3 Max chip, 36GB unified memory, and a 1TB SSD into a stunning 16-inch form factor. [SEED DATA — Replace before launch]",
      story: "When we set out to build the most powerful laptop we could, we didn't ask 'what if?' — we asked 'why not?' The Pro Max is our answer.",
      specs: { Display: '16.2" Liquid Retina XDR', Processor: "Apple M3 Max 14-core", Memory: "36GB Unified", Storage: "1TB SSD", Battery: "Up to 22 hours", Weight: "2.14 kg" },
      price: 3499.00, stock: 15, categoryId: subLaptops.id, brandId: null,
      image: IMG.laptop3, imageName: "mvm-fox-pro-max.jpg", sku: "MVM-ELP-002", productType: "physical",
      tags: ["Work", "Creative", "Office"],
      images: [IMG.laptop3, IMG.laptop1],
    },
    {
      slug: "mvm-fox-student-14-laptop", name: "MVM FOX Student 14\" Laptop",
      shortDescription: "Affordable 14\" laptop, 8GB RAM, 256GB SSD — perfect for students.",
      description: "Everything a student needs without the premium price tag. Solid performance, all-day battery, and a durable design built to survive a backpack. [SEED DATA — Replace before launch]",
      story: "Education shouldn't come with a premium tax. We built the Student 14 to prove that great computing can be accessible.",
      specs: { Display: '14" Full HD IPS', Processor: "Intel Core i5-13th Gen", Memory: "8GB DDR5", Storage: "256GB SSD", Battery: "Up to 12 hours", Weight: "1.45 kg" },
      price: 599.00, stock: 60, categoryId: subLaptops.id, brandId: null,
      image: IMG.laptop4, imageName: "mvm-fox-student.jpg", sku: "MVM-ELS-001", productType: "physical",
      tags: ["Home", "Office", "Travel"],
      images: [IMG.laptop4, IMG.laptop5],
    },
    {
      slug: "mvm-fox-gaming-17-laptop", name: "MVM FOX Gaming 17\" Laptop",
      shortDescription: "17\" 165Hz display, RTX 4070, 32GB RAM — built for serious gamers.",
      description: "The MVM FOX Gaming 17 delivers desktop-class gaming in a portable form. High refresh rate display, RTX graphics, and advanced cooling. [SEED DATA — Replace before launch]",
      story: "We didn't just make a laptop that can game — we made a gaming laptop that's actually pleasant to use every day.",
      specs: { Display: '17.3" QHD 165Hz', Processor: "Intel Core i9-14th Gen", GPU: "NVIDIA RTX 4070", Memory: "32GB DDR5", Storage: "1TB NVMe SSD", Battery: "Up to 8 hours" },
      price: 1899.00, stock: 20, categoryId: subLaptops.id, brandId: null,
      image: IMG.laptop5, imageName: "mvm-fox-gaming.jpg", sku: "MVM-ELG-001", productType: "physical",
      tags: ["Gaming", "Home", "Work"],
      images: [IMG.laptop5, IMG.laptop3],
    },

    // ══════════════════════════════════════════
    // ELECTRONICS — Desktops (3)
    // ══════════════════════════════════════════
    {
      slug: "mvm-fox-studio-desktop", name: "MVM FOX Studio Desktop",
      shortDescription: "Compact desktop, M3 chip, 16GB RAM, perfect for creative workflows.",
      description: "The Studio Desktop packs incredible performance into an impossibly small form factor. [SEED DATA — Replace before launch]",
      story: "We believe the best desktop is one you forget is there — until you need its power.",
      specs: { Processor: "Apple M3 8-core", Memory: "16GB Unified", Storage: "512GB SSD", Ports: "Thunderbolt 4 x2, USB-C, HDMI", Dimensions: "12.7 × 12.7 cm" },
      price: 1299.00, stock: 30, categoryId: subDesktops.id, brandId: null,
      image: IMG.desktop1, imageName: "mvm-fox-studio-desktop.jpg", sku: "MVM-ELD-001", productType: "physical",
      tags: ["Office", "Creative", "Home"],
      images: [IMG.desktop1, IMG.desktop2],
    },
    {
      slug: "mvm-fox-workstation-desktop", name: "MVM FOX Workstation Pro",
      shortDescription: "Tower workstation, M3 Max, 64GB RAM — for demanding professional workloads.",
      description: "When your work demands every ounce of computing power, the Workstation Pro delivers. [SEED DATA — Replace before launch]",
      story: "Built for the professionals who push machines to their limits — and need them to push back.",
      specs: { Processor: "Apple M3 Max 14-core", Memory: "64GB Unified", Storage: "2TB SSD", GPU: "30-core GPU", Ports: "Thunderbolt 4 x6, HDMI, USB-A x4" },
      price: 4999.00, stock: 10, categoryId: subDesktops.id, brandId: null,
      image: IMG.desktop2, imageName: "mvm-fox-workstation.jpg", sku: "MVM-ELD-002", productType: "physical",
      tags: ["Office", "Creative", "Work"],
      images: [IMG.desktop2, IMG.desktop1],
    },
    {
      slug: "mvm-fox-mini-pc", name: "MVM FOX Mini PC",
      shortDescription: "Ultra-compact mini PC, Intel i7, 16GB RAM — space-saving powerhouse.",
      description: "The Mini PC proves that big performance doesn't need a big box. [SEED DATA — Replace before launch]",
      story: "Sometimes the best things come in small packages — and this one fits behind your monitor.",
      specs: { Processor: "Intel Core i7-14th Gen", Memory: "16GB DDR5", Storage: "512GB SSD", Dimensions: "11.5 × 11.5 × 3.5 cm", Ports: "USB-C x2, USB-A x3, HDMI, Ethernet" },
      price: 799.00, stock: 25, categoryId: subDesktops.id, brandId: null,
      image: IMG.desktop1, imageName: "mvm-fox-mini-pc.jpg", sku: "MVM-ELD-003", productType: "physical",
      tags: ["Office", "Home", "Work"],
      images: [IMG.desktop1],
    },

    // ══════════════════════════════════════════
    // ELECTRONICS — Smartphones (3)
    // ══════════════════════════════════════════
    {
      slug: "mvm-fox-phone-15-pro", name: "MVM FOX Phone 15 Pro",
      shortDescription: "6.7\" OLED display, A17 Pro chip, 48MP camera system, titanium design.",
      description: "The MVM FOX Phone 15 Pro pushes the boundaries of what a smartphone can do. [SEED DATA — Replace before launch]",
      story: "Every detail of the Phone 15 Pro was obsessively refined. The titanium frame feels incredible in hand.",
      specs: { Display: '6.7" Super Retina XDR OLED', Processor: "A17 Pro", Camera: "48MP Main + 12MP Ultra Wide + 12MP 5x Telephoto", Storage: "256GB", Battery: "Up to 29 hours video", Material: "Titanium" },
      price: 1199.00, stock: 50, categoryId: subPhones.id, brandId: null,
      image: IMG.phone1, imageName: "mvm-fox-phone-15-pro.jpg", sku: "MVM-ELP-003", productType: "physical",
      tags: ["Home", "Work", "Travel"],
      images: [IMG.phone1, IMG.phone2, IMG.phone3],
    },
    {
      slug: "mvm-fox-phone-se", name: "MVM FOX Phone SE",
      shortDescription: "4.7\" Retina display, A15 chip, 12MP camera — flagship power, compact form.",
      description: "The MVM FOX Phone SE packs flagship performance into a compact, affordable design. [SEED DATA — Replace before launch]",
      story: "Not everyone wants a giant phone. The Phone SE proves that small can be mighty.",
      specs: { Display: '4.7" Retina HD', Processor: "A15 Bionic", Camera: "12MP Wide", Storage: "128GB", Battery: "Up to 15 hours video", Connectivity: "5G" },
      price: 429.00, stock: 60, categoryId: subPhones.id, brandId: null,
      image: IMG.phone2, imageName: "mvm-fox-phone-se.jpg", sku: "MVM-ELS-002", productType: "physical",
      tags: ["Home", "Travel", "Office"],
      images: [IMG.phone2, IMG.phone1],
    },
    {
      slug: "mvm-fox-phone-ultra", name: "MVM FOX Phone Ultra",
      shortDescription: "6.9\" AMOLED, A17 Pro Max, 200MP camera, S Pen support — the flagship.",
      description: "The Phone Ultra is our most ambitious smartphone ever. A massive display, class-leading camera, and S Pen creativity. [SEED DATA — Replace before launch]",
      story: "We built the Ultra for people who want everything — and we delivered.",
      specs: { Display: '6.9" Dynamic AMOLED 2X', Processor: "A17 Pro Max", Camera: "200MP Main + 50MP Ultra Wide + 12MP 10x Telephoto", Storage: "512GB", Battery: "Up to 33 hours video", Extras: "S Pen included" },
      price: 1399.00, stock: 35, categoryId: subPhones.id, brandId: null,
      image: IMG.phone3, imageName: "mvm-fox-phone-ultra.jpg", sku: "MVM-ELP-004", productType: "physical",
      tags: ["Work", "Creative", "Home"],
      images: [IMG.phone3, IMG.phone1],
    },

    // ══════════════════════════════════════════
    // ELECTRONICS — Tablets (2)
    // ══════════════════════════════════════════
    {
      slug: "mvm-fox-tab-pro-12", name: "MVM FOX Tab Pro 12.9\"",
      shortDescription: "12.9\" Liquid Retina XDR, M3 chip, Apple Pencil support — your canvas.",
      description: "The Tab Pro transforms from tablet to workstation with a keyboard cover and Pencil support. [SEED DATA — Replace before launch]",
      story: "We wanted a tablet that doesn't compromise — one that's equally at home sketching on a couch or presenting in a boardroom.",
      specs: { Display: '12.9" Liquid Retina XDR', Processor: "Apple M3", Memory: "8GB Unified", Storage: "256GB", Camera: "12MP Wide + 10MP Ultra Wide", Extras: "Apple Pencil Pro support" },
      price: 1099.00, stock: 30, categoryId: subTablets.id, brandId: null,
      image: IMG.tablet1, imageName: "mvm-fox-tab-pro.jpg", sku: "MVM-ELT-001", productType: "physical",
      tags: ["Creative", "Work", "Travel"],
      images: [IMG.tablet1, IMG.tablet2],
    },
    {
      slug: "mvm-fox-tab-air", name: "MVM FOX Tab Air 10.9\"",
      shortDescription: "10.9\" Liquid Retina, A15 chip, all-day battery —轻薄娱乐利器.",
      description: "Light, powerful, and beautiful — the Tab Air is perfect for entertainment and light productivity. [SEED DATA — Replace before launch]",
      story: "The Tab Air is the tablet you'll actually carry everywhere. It's that light.",
      specs: { Display: '10.9" Liquid Retina', Processor: "A15 Bionic", Memory: "4GB", Storage: "128GB", Camera: "12MP Wide", Battery: "Up to 10 hours" },
      price: 449.00, stock: 45, categoryId: subTablets.id, brandId: null,
      image: IMG.tablet2, imageName: "mvm-fox-tab-air.jpg", sku: "MVM-ELT-002", productType: "physical",
      tags: ["Home", "Travel", "Gaming"],
      images: [IMG.tablet2, IMG.tablet1],
    },

    // ══════════════════════════════════════════
    // ELECTRONICS — Monitors & TVs (2)
    // ══════════════════════════════════════════
    {
      slug: "mvm-fox-ultramonitor-32", name: "MVM FOX UltraMonitor 32\"",
      shortDescription: "32\" 4K IPS display, 100% sRGB, USB-C hub — the perfect desk companion.",
      description: "A monitor that does it all — stunning 4K resolution, built-in USB-C hub, and factory-calibrated color accuracy. [SEED DATA — Replace before launch]",
      story: "We spent two years tuning this panel because we believe your eyes deserve better than 'good enough.'",
      specs: { Resolution: "3840 × 2160 (4K UHD)", Panel: "IPS, 60Hz", Color: "100% sRGB, 98% DCI-P3", Ports: "USB-C 90W, HDMI 2.1 x2, DisplayPort 1.4", Stand: "Height, tilt, swivel, pivot" },
      price: 799.00, stock: 20, categoryId: subMonitors.id, brandId: null,
      image: IMG.monitor1, imageName: "mvm-fox-ultramonitor.jpg", sku: "MVM-ELM-001", productType: "physical",
      tags: ["Office", "Creative", "Home"],
      images: [IMG.monitor1, IMG.monitor2],
    },
    {
      slug: "mvm-fox-smart-tv-65", name: "MVM FOX Smart TV 65\"",
      shortDescription: "65\" QLED 4K, 120Hz, Dolby Atmos — cinema at home.",
      description: "Bring the theater home with our 65-inch QLED Smart TV featuring stunning picture quality and immersive sound. [SEED DATA — Replace before launch]",
      story: "Movie night will never be the same. This TV makes everything look like a director's cut.",
      specs: { Resolution: "3840 × 2160 (4K UHD)", Panel: "QLED, 120Hz", HDR: "HDR10+, Dolby Vision", Audio: "Dolby Atmos 40W", Smart: "MVM FOX OS, AirPlay, Chromecast" },
      price: 1299.00, stock: 15, categoryId: subMonitors.id, brandId: null,
      image: IMG.monitor2, imageName: "mvm-fox-smart-tv.jpg", sku: "MVM-ELM-002", productType: "physical",
      tags: ["Home", "Gaming"],
      images: [IMG.monitor2, IMG.monitor1],
    },

    // ══════════════════════════════════════════
    // ELECTRONICS — Audio (3)
    // ══════════════════════════════════════════
    {
      slug: "mvm-fox-pro-headphones", name: "MVM FOX Pro Headphones",
      shortDescription: "Active noise cancellation, 40-hour battery, Hi-Res Audio certified.",
      description: "Immerse yourself in sound with the MVM FOX Pro Headphones. Industry-leading ANC and premium comfort. [SEED DATA — Replace before launch]",
      story: "Great audio should disappear — you should just hear the music, not the headphones.",
      specs: { Driver: "40mm custom", ANC: "Adaptive noise cancellation", Battery: "40 hours (ANC on)", Audio: "Hi-Res Audio certified", Connectivity: "Bluetooth 5.3, 3.5mm", Weight: "250g" },
      price: 349.00, stock: 35, categoryId: subAudio.id, brandId: null,
      image: IMG.headphones, imageName: "mvm-fox-pro-headphones.jpg", sku: "MVM-ELH-001", productType: "physical",
      tags: ["Travel", "Work", "Home"],
      images: [IMG.headphones, IMG.speaker],
    },
    {
      slug: "mvm-fox-home-speaker", name: "MVM FOX Home Speaker",
      shortDescription: "360° room-filling sound, voice assistant, multi-room audio support.",
      description: "The MVM FOX Home Speaker delivers rich, 360-degree sound that fills any room. [SEED DATA — Replace before launch]",
      story: "We wanted a speaker that sounds incredible from every angle.",
      specs: { Drivers: "360° array with 3 custom drivers", Bass: "Dedicated woofer", Voice: "Built-in assistant", "Multi-room": "Up to 8 speakers", Connectivity: "Wi-Fi 6, Bluetooth 5.3, AirPlay 2" },
      price: 249.00, stock: 30, categoryId: subAudio.id, brandId: null,
      image: IMG.speaker, imageName: "mvm-fox-home-speaker.jpg", sku: "MVM-ELS-003", productType: "physical",
      tags: ["Home", "Office"],
      images: [IMG.speaker, IMG.headphones],
    },
    {
      slug: "mvm-fox-pro-earbuds", name: "MVM FOX Pro Earbuds",
      shortDescription: "True wireless, ANC, 30-hour total battery, IPX5 water resistant.",
      description: "Premium true wireless earbuds with adaptive ANC and a comfortable, secure fit. [SEED DATA — Replace before launch]",
      story: "We obsessed over the fit because the best earbuds are the ones you forget you're wearing.",
      specs: { Driver: "11mm custom", ANC: "Adaptive transparency mode", Battery: "8h buds + 22h case", Connectivity: "Bluetooth 5.3, Multipoint", "Water Resistance": "IPX5", Weight: "5.2g per bud" },
      price: 199.00, stock: 50, categoryId: subAudio.id, brandId: null,
      image: IMG.earbuds, imageName: "mvm-fox-pro-earbuds.jpg", sku: "MVM-ELE-001", productType: "physical",
      tags: ["Travel", "Work", "Home", "Gaming"],
      images: [IMG.earbuds, IMG.headphones],
    },

    // ══════════════════════════════════════════
    // ELECTRONICS — Smart Home (2)
    // ══════════════════════════════════════════
    {
      slug: "mvm-fox-smart-hub", name: "MVM FOX Smart Hub",
      shortDescription: "Central smart home controller — Zigbee, Z-Wave, Wi-Fi, Thread, Matter.",
      description: "The Smart Hub connects and automates all your smart devices from one beautiful interface. [SEED DATA — Replace before launch]",
      story: "Smart homes shouldn't feel like puzzle pieces. The Hub makes everything work together.",
      specs: { Protocols: "Zigbee, Z-Wave, Wi-Fi 6, Thread, Matter", Display: "7\" touchscreen", Voice: "Built-in assistant", Automation: "Scenes, routines, geofencing", Compatibility: "1000+ devices" },
      price: 299.00, stock: 25, categoryId: subSmartHome.id, brandId: null,
      image: IMG.smarthome1, imageName: "mvm-fox-smart-hub.jpg", sku: "MVM-ESH-001", productType: "physical",
      tags: ["Home"],
      images: [IMG.smarthome1, IMG.smarthome2],
    },
    {
      slug: "mvm-fox-security-camera", name: "MVM FOX Security Camera",
      shortDescription: "2K HDR, night vision, AI person detection, local + cloud storage.",
      description: "Keep your home safe with intelligent motion detection and crystal-clear video. [SEED DATA — Replace before launch]",
      story: "Peace of mind shouldn't require a tech degree. We made security simple.",
      specs: { Resolution: "2K HDR", "Night Vision": "Color night vision 30m", Detection: "AI person/vehicle/animal", Storage: "Local microSD + cloud", Connectivity: "Wi-Fi 6, Ethernet", Weather: "IP66 outdoor rated" },
      price: 149.00, stock: 40, categoryId: subSmartHome.id, brandId: null,
      image: IMG.smarthome2, imageName: "mvm-fox-security-cam.jpg", sku: "MVM-ESH-002", productType: "physical",
      tags: ["Home"],
      images: [IMG.smarthome2, IMG.smarthome1],
    },

    // ══════════════════════════════════════════
    // ELECTRONICS — Home Appliances (2)
    // ══════════════════════════════════════════
    {
      slug: "mvm-fox-smart-fridge", name: "MVM FOX Smart Fridge 4-Door",
      shortDescription: "26 cu. ft. French door fridge with touchscreen, Wi-Fi, and AI inventory tracking.",
      description: "The MVM FOX Smart Fridge combines premium design with intelligent features. [SEED DATA — Replace before launch]",
      story: "We reimagined what a fridge should be. The built-in touchscreen keeps your family organized.",
      specs: { Capacity: "26 cu. ft.", Display: '21.5" Touchscreen', Finish: "Fingerprint-resistant stainless steel", Features: "AI inventory, internal cameras, Wi-Fi", Energy: "ENERGY STAR® certified" },
      price: 3299.00, stock: 8, categoryId: subAppliances.id, brandId: null,
      image: IMG.fridge, imageName: "mvm-fox-smart-fridge.jpg", sku: "MVM-ELA-003", productType: "physical",
      tags: ["Home"],
      images: [IMG.fridge],
    },
    {
      slug: "mvm-fox-smart-washer", name: "MVM FOX Smart Washer",
      shortDescription: "5.0 cu. ft. front-load washer, Wi-Fi, AI cycle optimization.",
      description: "Smart laundry starts here — AI detects fabric type and adjusts cycles automatically. [SEED DATA — Replace before launch]",
      story: "We think laundry should be the least interesting part of your day. The Smart Washer makes sure it is.",
      specs: { Capacity: "5.0 cu. ft.", Type: "Front-load", Features: "AI cycle, steam clean, Wi-Fi", Energy: "ENERGY STAR® Most Efficient", "Wash Cycles": "12 preset + custom" },
      price: 1199.00, stock: 12, categoryId: subAppliances.id, brandId: null,
      image: IMG.washer, imageName: "mvm-fox-smart-washer.jpg", sku: "MVM-ELA-004", productType: "physical",
      tags: ["Home"],
      images: [IMG.washer],
    },

    // ══════════════════════════════════════════
    // ELECTRONICS — Accessories (2)
    // ══════════════════════════════════════════
    {
      slug: "mvm-fox-mech-keyboard", name: "MVM FOX Mechanical Keyboard",
      shortDescription: "Hot-swappable switches, RGB backlit, Bluetooth + USB-C, aluminum frame.",
      description: "A premium mechanical keyboard that's as beautiful as it is functional. [SEED DATA — Replace before launch]",
      story: "Every keystroke should feel intentional. Our switches are tuned for the perfect balance of speed and satisfaction.",
      specs: { Switches: "Hot-swappable (Cherry MX compatible)", Layout: "75% compact", Connectivity: "Bluetooth 5.1 + USB-C", Backlight: "Per-key RGB", Frame: "CNC aluminum", Battery: "4000mAh" },
      price: 179.00, stock: 45, categoryId: subAccessories.id, brandId: null,
      image: IMG.keyboard, imageName: "mvm-fox-keyboard.jpg", sku: "MVM-EAK-001", productType: "physical",
      tags: ["Office", "Gaming", "Home"],
      images: [IMG.keyboard],
    },
    {
      slug: "mvm-fox-65w-charger", name: "MVM FOX 65W GaN Charger",
      shortDescription: "65W USB-C GaN charger, 3 ports, foldable prongs — charges everything.",
      description: "One tiny charger that powers your laptop, phone, and tablet simultaneously. [SEED DATA — Replace before launch]",
      story: "We asked: why carry three chargers when one can do the job? GaN technology made it possible.",
      specs: { Output: "65W total (45W + 10W + 10W)", Ports: "USB-C x2, USB-A x1", Technology: "GaN III", Weight: "135g", Prongs: "Foldable US/EU/UK" },
      price: 59.00, stock: 100, categoryId: subAccessories.id, brandId: null,
      image: IMG.charger, imageName: "mvm-fox-charger.jpg", sku: "MVM-EAC-001", productType: "physical",
      tags: ["Travel", "Home", "Office"],
      images: [IMG.charger],
    },

    // ══════════════════════════════════════════
    // SOFTWARE — Productivity (3)
    // ══════════════════════════════════════════
    {
      slug: "mvm-fox-flow-suite", name: "MVM FOX Flow Suite",
      shortDescription: "All-in-one productivity platform — tasks, docs, calendar, and AI assistant.",
      description: "MVM FOX Flow Suite brings your entire workflow into one beautifully designed platform. [SEED DATA — Replace before launch]",
      story: "We were tired of switching between ten apps to get one thing done.",
      specs: { Platform: "Web, macOS, Windows, iOS, Android", Storage: "100GB cloud included", Collaboration: "Real-time multi-user", AI: "Built-in writing & planning assistant", License: "Annual subscription" },
      price: 12.99, stock: 9999, categoryId: subProductivity.id, brandId: null,
      image: IMG.software1, imageName: "mvm-fox-flow-suite.jpg", sku: "MVM-SWP-001", productType: "subscription",
      platform: "Cross-platform", licenseType: "Subscription",
      images: [IMG.software1, IMG.software4],
    },
    {
      slug: "mvm-fox-data-pilot", name: "MVM FOX Data Pilot",
      shortDescription: "Business analytics platform — dashboards, reports, and AI-driven insights.",
      description: "MVM FOX Data Pilot transforms raw data into actionable insights. [SEED DATA — Replace before launch]",
      story: "Every business has data. Few have clarity. Data Pilot bridges that gap.",
      specs: { Connectors: "SQL, CSV, API, Google Sheets, Salesforce", Dashboards: "Unlimited, drag-and-drop builder", Reports: "Scheduled PDF/email delivery", AI: "Anomaly detection, trend forecasting", License: "Annual subscription" },
      price: 29.99, stock: 9999, categoryId: subProductivity.id, brandId: null,
      image: IMG.software4, imageName: "mvm-fox-data-pilot.jpg", sku: "MVM-SWP-002", productType: "subscription",
      platform: "Web", licenseType: "Subscription",
      images: [IMG.software4, IMG.software1],
    },
    {
      slug: "mvm-fox-doc-sync", name: "MVM FOX DocSync",
      shortDescription: "Real-time document collaboration with version history and offline mode.",
      description: "DocSync makes document collaboration effortless with real-time editing, conflict resolution, and a beautiful interface. [SEED DATA — Replace before launch]",
      story: "We believe documents should be alive — always in sync, always accessible, never lost.",
      specs: { Platform: "Web, macOS, Windows, iOS, Android", Features: "Real-time co-editing, version history, offline mode", Formats: "DOCX, PDF, MD, RTF", Storage: "50GB included", License: "Per-seat annual" },
      price: 8.99, stock: 9999, categoryId: subProductivity.id, brandId: null,
      image: IMG.software5, imageName: "mvm-fox-docsync.jpg", sku: "MVM-SWP-003", productType: "subscription",
      platform: "Cross-platform", licenseType: "Subscription",
      images: [IMG.software5, IMG.software1],
    },

    // ══════════════════════════════════════════
    // SOFTWARE — Creative & Design (3)
    // ══════════════════════════════════════════
    {
      slug: "mvm-fox-design-studio", name: "MVM FOX Design Studio",
      shortDescription: "Professional design tool — vector, raster, motion, and prototyping in one app.",
      description: "MVM FOX Design Studio is a professional-grade design platform for UI/UX, branding, illustration, and motion graphics. [SEED DATA — Replace before launch]",
      story: "Design tools have gotten complicated. We built Design Studio to be powerful without being intimidating.",
      specs: { Platform: "macOS, Windows, iPad", Formats: "Vector, raster, motion, prototype", AI: "Generative fill, auto-layout, style transfer", Export: "SVG, PNG, PDF, Lottie, MP4", License: "Per-seat subscription" },
      price: 19.99, stock: 9999, categoryId: subCreative.id, brandId: null,
      image: IMG.software2, imageName: "mvm-fox-design-studio.jpg", sku: "MVM-SWC-001", productType: "subscription",
      platform: "macOS/Windows", licenseType: "Subscription",
      images: [IMG.software2, IMG.software4],
    },
    {
      slug: "mvm-fox-photo-lab", name: "MVM FOX Photo Lab",
      shortDescription: "AI-powered photo editor — RAW processing, batch editing, presets, cloud sync.",
      description: "Photo Lab combines professional-grade RAW processing with AI-powered tools that speed up your editing workflow. [SEED DATA — Replace before launch]",
      story: "We wanted an editor that gets out of your way and lets you focus on the image.",
      specs: { Platform: "macOS, Windows", Formats: "RAW, JPEG, PNG, TIFF, HEIF", AI: "Auto-enhance, sky replacement, subject selection", Presets: "100+ built-in, custom import", License: "One-time purchase" },
      price: 149.00, stock: 9999, categoryId: subCreative.id, brandId: null,
      image: IMG.software6, imageName: "mvm-fox-photo-lab.jpg", sku: "MVM-SWC-002", productType: "physical",
      platform: "macOS/Windows", licenseType: "One-time",
      images: [IMG.software6, IMG.software2],
    },
    {
      slug: "mvm-fox-video-cut", name: "MVM FOX Video Cut",
      shortDescription: "Professional video editor — 4K editing, motion graphics, color grading.",
      description: "Video Cut brings Hollywood-grade editing tools to your desktop with an intuitive interface. [SEED DATA — Replace before launch]",
      story: "Great stories deserve great tools. Video Cut makes professional editing accessible.",
      specs: { Platform: "macOS, Windows", Resolution: "Up to 8K", Features: "Multi-track timeline, color grading, motion graphics", Export: "MP4, MOV, ProRes, H.265", License: "Per-seat subscription" },
      price: 24.99, stock: 9999, categoryId: subCreative.id, brandId: null,
      image: IMG.software7, imageName: "mvm-fox-video-cut.jpg", sku: "MVM-SWC-003", productType: "subscription",
      platform: "macOS/Windows", licenseType: "Subscription",
      images: [IMG.software7, IMG.software2],
    },

    // ══════════════════════════════════════════
    // SOFTWARE — Security (3)
    // ══════════════════════════════════════════
    {
      slug: "mvm-fox-shield-pro", name: "MVM FOX Shield Pro",
      shortDescription: "Enterprise-grade security suite — antivirus, VPN, password manager, dark web monitoring.",
      description: "MVM FOX Shield Pro protects your devices and data with a comprehensive security suite. [SEED DATA — Replace before launch]",
      story: "Security shouldn't slow you down. Shield Pro runs silently in the background.",
      specs: { Protection: "Real-time antivirus & ransomware", VPN: "Unlimited, 50+ countries", Passwords: "Encrypted vault, auto-fill", Monitoring: "Dark web & identity alerts", Devices: "Up to 10 per license" },
      price: 9.99, stock: 9999, categoryId: subSecurity.id, brandId: null,
      image: IMG.software3, imageName: "mvm-fox-shield-pro.jpg", sku: "MVM-SWS-001", productType: "subscription",
      platform: "Cross-platform", licenseType: "Subscription",
      images: [IMG.software3],
    },
    {
      slug: "mvm-fox-vault", name: "MVM FOX Vault",
      shortDescription: "Zero-knowledge password manager — biometric unlock, breach alerts, secure sharing.",
      description: "Vault is a zero-knowledge password manager that keeps your credentials safe without slowing you down. [SEED DATA — Replace before launch]",
      story: "We built Vault because we believe your passwords should be the hardest thing to crack, not the easiest thing to forget.",
      specs: { Security: "Zero-knowledge AES-256 encryption", Features: "Biometric unlock, breach monitoring, secure sharing", Platforms: "Browser extensions, iOS, Android, macOS, Windows", Storage: "Unlimited passwords, 1GB secure files", License: "Annual subscription" },
      price: 3.99, stock: 9999, categoryId: subSecurity.id, brandId: null,
      image: IMG.software3, imageName: "mvm-fox-vault.jpg", sku: "MVM-SWS-002", productType: "subscription",
      platform: "Cross-platform", licenseType: "Subscription",
      images: [IMG.software3],
    },
    {
      slug: "mvm-fox-firewall-enterprise", name: "MVM FOX Firewall Enterprise",
      shortDescription: "Network security for businesses — threat detection, traffic analysis, zero-trust.",
      description: "Enterprise-grade network protection with real-time threat intelligence and zero-trust architecture. [SEED DATA — Replace before launch]",
      story: "Your network is your business. We make sure it stays that way.",
      specs: { Protection: "IDS/IPS, DPI, zero-trust", Deployment: "Cloud, on-prem, hybrid", Features: "Real-time threat dashboard, automated response", Compliance: "SOC 2, HIPAA, GDPR ready", License: "Per-device annual" },
      price: 19.99, stock: 9999, categoryId: subSecurity.id, brandId: null,
      image: IMG.software8, imageName: "mvm-fox-firewall.jpg", sku: "MVM-SWS-003", productType: "subscription",
      platform: "Cross-platform", licenseType: "Subscription",
      images: [IMG.software8],
    },

    // ══════════════════════════════════════════
    // SOFTWARE — Business & Enterprise (3)
    // ══════════════════════════════════════════
    {
      slug: "mvm-fox-crm", name: "MVM FOX CRM",
      shortDescription: "Customer relationship management — pipelines, automation, analytics, AI insights.",
      description: "A CRM that actually helps you close deals, not just track them. [SEED DATA — Replace before launch]",
      story: "We built a CRM that salespeople actually want to use. Revolutionary concept.",
      specs: { Features: "Pipeline management, email tracking, AI scoring", Automation: "Workflow builder, auto-follow-up", Analytics: "Revenue forecasting, team performance", Integrations: "Gmail, Outlook, Slack, Zapier", License: "Per-seat monthly" },
      price: 39.99, stock: 9999, categoryId: subBusiness.id, brandId: null,
      image: IMG.software4, imageName: "mvm-fox-crm.jpg", sku: "MVM-SWB-001", productType: "subscription",
      platform: "Web", licenseType: "Subscription",
      images: [IMG.software4],
    },
    {
      slug: "mvm-fox-erp-lite", name: "MVM FOX ERP Lite",
      shortDescription: "Lightweight ERP for SMBs — inventory, invoicing, accounting, reporting.",
      description: "Everything your small business needs to manage operations without the enterprise complexity. [SEED DATA — Replace before launch]",
      story: "ERP doesn't have to mean 'expensive, rigid, painful.' ERP Lite proves otherwise.",
      specs: { Modules: "Inventory, invoicing, accounting, reporting", Users: "Up to 25", Integrations: "Stripe, PayPal, bank feeds", Reports: "P&L, balance sheet, tax summaries", License: "Monthly subscription" },
      price: 49.99, stock: 9999, categoryId: subBusiness.id, brandId: null,
      image: IMG.software1, imageName: "mvm-fox-erp-lite.jpg", sku: "MVM-SWB-002", productType: "subscription",
      platform: "Web", licenseType: "Subscription",
      images: [IMG.software1],
    },
    {
      slug: "mvm-fox-meeting-pro", name: "MVM FOX Meeting Pro",
      shortDescription: "Video conferencing — HD calls, recording, AI transcription, virtual backgrounds.",
      description: "Crystal-clear video calls with AI-powered transcription and meeting summaries. [SEED DATA — Replace before launch]",
      story: "Meetings are where decisions happen. Meeting Pro makes sure none of them get lost.",
      specs: { Video: "Up to 4K, 100 participants", AI: "Real-time transcription, meeting summaries", Features: "Recording, virtual backgrounds, breakout rooms", Integrations: "Google Calendar, Outlook, Slack", License: "Per-seat monthly" },
      price: 14.99, stock: 9999, categoryId: subBusiness.id, brandId: null,
      image: IMG.software5, imageName: "mvm-fox-meeting-pro.jpg", sku: "MVM-SWB-003", productType: "subscription",
      platform: "Cross-platform", licenseType: "Subscription",
      images: [IMG.software5],
    },

    // ══════════════════════════════════════════
    // SOFTWARE — Developer Tools (3)
    // ══════════════════════════════════════════
    {
      slug: "mvm-fox-code-editor", name: "MVM FOX Code Editor",
      shortDescription: "Modern code editor — AI completions, multi-language, Git integration, extensions.",
      description: "A blazing-fast code editor with built-in AI assistance and deep Git integration. [SEED DATA — Replace before launch]",
      story: "We wanted an editor that thinks like a developer — fast, flexible, and never in the way.",
      specs: { Languages: "50+ with syntax highlighting", AI: "Code completion, refactoring, documentation", Extensions: "5000+ marketplace", Git: "Built-in merge, conflict resolution, branch visualizer", License: "Free core, Pro subscription" },
      price: 0, stock: 9999, categoryId: subDeveloper.id, brandId: null,
      image: IMG.software5, imageName: "mvm-fox-code-editor.jpg", sku: "MVM-SWD-001", productType: "physical",
      platform: "Cross-platform", licenseType: "One-time",
      images: [IMG.software5],
    },
    {
      slug: "mvm-fox-deploy", name: "MVM FOX Deploy",
      shortDescription: "Cloud deployment platform — CI/CD, containers, serverless, monitoring.",
      description: "Deploy and scale your applications with zero-config CI/CD and built-in monitoring. [SEED DATA — Replace before launch]",
      story: "Deploying code shouldn't require a DevOps degree. MVM FOX Deploy makes it push-button simple.",
      specs: { Features: "CI/CD pipelines, container orchestration, serverless", Runtime: "Node.js, Python, Go, Rust, Java", Monitoring: "Logs, metrics, alerts, APM", Scaling: "Auto-scale, edge functions", License: "Usage-based" },
      price: 19.99, stock: 9999, categoryId: subDeveloper.id, brandId: null,
      image: IMG.software8, imageName: "mvm-fox-deploy.jpg", sku: "MVM-SWD-002", productType: "subscription",
      platform: "Web", licenseType: "Subscription",
      images: [IMG.software8],
    },
    {
      slug: "mvm-fox-api-studio", name: "MVM FOX API Studio",
      shortDescription: "API development toolkit — design, test, document, mock — all in one.",
      description: "The complete API development toolkit that replaces five different tools. [SEED DATA — Replace before launch]",
      story: "API development was fragmented. We unified it.",
      specs: { Features: "API design (OpenAPI), testing, documentation, mocking", Protocols: "REST, GraphQL, gRPC, WebSocket", Collaboration: "Team workspaces, version control", Integrations: "Postman import, Swagger export", License: "Per-seat annual" },
      price: 29.00, stock: 9999, categoryId: subDeveloper.id, brandId: null,
      image: IMG.software6, imageName: "mvm-fox-api-studio.jpg", sku: "MVM-SWD-003", productType: "subscription",
      platform: "Cross-platform", licenseType: "Subscription",
      images: [IMG.software6],
    },

    // ══════════════════════════════════════════
    // CATERING — Velvet Fox (expanded with tiers)
    // ══════════════════════════════════════════
    // Corporate
    {
      slug: "corporate-classic-lunch", name: "Corporate Classic Lunch",
      shortDescription: "Sandwich platter, seasonal salads, dessert, coffee & tea — the reliable crowd-pleaser.",
      description: "Our most popular corporate package. A well-curated working lunch that satisfies any palate. [SEED DATA — Replace before launch]",
      story: "The corporate lunch isn't glamorous — but it can be exceptional. We prove that every day.",
      specs: null, price: 28.00, stock: 50, categoryId: subGourmet.id, brandId: velvetBrand.id,
      image: IMG.catering1, imageName: "corporate-classic.jpg", sku: "VFT-CC-001", productType: "physical",
      tags: ["Corporate"],
    },
    {
      slug: "corporate-premium-lunch", name: "Corporate Premium Lunch",
      shortDescription: "Artisan wraps, gourmet salads, charcuterie, pastries, premium beverages.",
      description: "Elevate your working lunch with premium ingredients and elegant presentation. [SEED DATA — Replace before launch]",
      story: "When the standard lunch won't cut it, the Premium Lunch says 'we care about the details.'",
      specs: null, price: 45.00, stock: 40, categoryId: subGourmet.id, brandId: velvetBrand.id,
      image: IMG.catering9, imageName: "corporate-premium.jpg", sku: "VFT-CP-001", productType: "physical",
      tags: ["Corporate"],
    },
    {
      slug: "corporate-signature-gala", name: "Corporate Signature Gala",
      shortDescription: "Full-service plated dinner, welcome cocktails, wine pairing, dedicated service team.",
      description: "A black-tie-worthy dinner experience for your most important corporate events. [SEED DATA — Replace before launch]",
      story: "The Gala package is for events that need to make a lasting impression — and we deliver every time.",
      specs: null, price: 95.00, stock: 20, categoryId: subGourmet.id, brandId: velvetBrand.id,
      image: IMG.catering7, imageName: "corporate-gala.jpg", sku: "VFT-CS-001", productType: "physical",
      tags: ["Corporate"],
    },

    // Wedding
    {
      slug: "wedding-classic-package", name: "Wedding Classic Package",
      shortDescription: "Plated dinner with cocktail hour and dessert bar — timeless elegance.",
      description: "Everything you need for a beautiful wedding reception, crafted with care. [SEED DATA — Replace before launch]",
      story: "We've catered hundreds of weddings. The Classic Package distills everything we've learned into one perfect experience.",
      specs: null, price: 120.00, stock: 15, categoryId: subGourmet.id, brandId: velvetBrand.id,
      image: IMG.catering2, imageName: "wedding-classic.jpg", sku: "VFT-WC-001", productType: "physical",
      tags: ["Wedding"],
    },
    {
      slug: "wedding-premium-package", name: "Wedding Premium Package",
      shortDescription: "Multi-course tasting menu, live stations, champagne toast, premium bar.",
      description: "An elevated wedding experience with live cooking stations and a curated bar menu. [SEED DATA — Replace before launch]",
      story: "The Premium Package is for couples who want their wedding to be the event everyone talks about for years.",
      specs: null, price: 175.00, stock: 10, categoryId: subGourmet.id, brandId: velvetBrand.id,
      image: IMG.catering5, imageName: "wedding-premium.jpg", sku: "VFT-WP-001", productType: "physical",
      tags: ["Wedding"],
    },
    {
      slug: "wedding-signature-luxe", name: "Wedding Signature Luxe",
      shortDescription: "Bespoke 7-course menu, sommelier-selected wines, midnight dessert station.",
      description: "The ultimate wedding dining experience — a completely custom 7-course journey. [SEED DATA — Replace before launch]",
      story: "The Luxe package has no template — every detail is designed from scratch with you.",
      specs: null, price: 250.00, stock: 5, categoryId: subGourmet.id, brandId: velvetBrand.id,
      image: IMG.catering9, imageName: "wedding-luxe.jpg", sku: "VFT-WS-001", productType: "physical",
      tags: ["Wedding"],
    },

    // Private Events
    {
      slug: "private-classic-dinner", name: "Private Classic Dinner",
      shortDescription: "4-course tasting menu for up to 20 guests — intimate and elegant.",
      description: "A curated 4-course dinner experience perfect for private celebrations. [SEED DATA — Replace before launch]",
      story: "Some of our best work happens at intimate dinners — where every course tells a story.",
      specs: null, price: 75.00, stock: 20, categoryId: subGourmet.id, brandId: velvetBrand.id,
      image: IMG.catering3, imageName: "private-classic.jpg", sku: "VFT-PC-001", productType: "physical",
      tags: ["Private Event"],
    },
    {
      slug: "private-premium-dinner", name: "Private Premium Dinner",
      shortDescription: "6-course chef's table experience, wine pairing, dedicated staff.",
      description: "An exclusive chef's table experience in the comfort of your own space. [SEED DATA — Replace before launch]",
      story: "The chef's table experience brings the restaurant to you — with all the drama and none of the crowds.",
      specs: null, price: 125.00, stock: 12, categoryId: subGourmet.id, brandId: velvetBrand.id,
      image: IMG.catering10, imageName: "private-premium.jpg", sku: "VFT-PP-001", productType: "physical",
      tags: ["Private Event"],
    },
    {
      slug: "private-signature-omakase", name: "Private Signature Omakase",
      shortDescription: "10-course omakase experience — chef's choice, seasonal ingredients, sake pairing.",
      description: "Trust our chef to take you on a 10-course journey through the finest seasonal ingredients. [SEED DATA — Replace before launch]",
      story: "Omakase means 'I'll leave it up to you.' It's the highest compliment a diner can give a chef.",
      specs: null, price: 200.00, stock: 5, categoryId: subGourmet.id, brandId: velvetBrand.id,
      image: IMG.catering11, imageName: "private-omakase.jpg", sku: "VFT-PS-001", productType: "physical",
      tags: ["Private Event"],
    },

    // Conference
    {
      slug: "conference-classic-breaks", name: "Conference Classic Breaks",
      shortDescription: "Morning & afternoon tea breaks with pastries, fruit, and beverages.",
      description: "Keep your attendees energized with perfectly timed refreshment breaks. [SEED DATA — Replace before launch]",
      story: "A great conference runs on great coffee and better pastries.",
      specs: null, price: 18.00, stock: 50, categoryId: subPlatters.id, brandId: velvetBrand.id,
      image: IMG.catering12, imageName: "conference-classic.jpg", sku: "VFT-CCB-001", productType: "physical",
      tags: ["Conference"],
    },
    {
      slug: "conference-premium-breaks", name: "Conference Premium Breaks",
      shortDescription: "Gourmet bites, specialty coffee, cold-pressed juices, artisan snacks.",
      description: "Elevated break service with specialty coffee and gourmet snacks. [SEED DATA — Replace before launch]",
      story: "The difference between a good conference and a great one is in the breaks.",
      specs: null, price: 32.00, stock: 35, categoryId: subPlatters.id, brandId: velvetBrand.id,
      image: IMG.catering13, imageName: "conference-premium.jpg", sku: "VFT-CPB-001", productType: "physical",
      tags: ["Conference"],
    },
    {
      slug: "conference-signature-lunch", name: "Conference Signature Lunch",
      shortDescription: "Buffet lunch with live stations, international cuisine, dessert bar.",
      description: "A conference lunch that's actually worth leaving your seat for. [SEED DATA — Replace before launch]",
      story: "We've turned the conference lunch from a obligation into a highlight.",
      specs: null, price: 55.00, stock: 25, categoryId: subGourmet.id, brandId: velvetBrand.id,
      image: IMG.catering14, imageName: "conference-signature.jpg", sku: "VFT-CSL-001", productType: "physical",
      tags: ["Conference"],
    },

    // Party
    {
      slug: "party-classic-buffet", name: "Party Classic Buffet",
      shortDescription: "Crowd-pleasing buffet — sliders, wings, salads, desserts for up to 50 guests.",
      description: "The perfect party spread that everyone will enjoy. [SEED DATA — Replace before launch]",
      story: "A great party starts with great food. Our Classic Buffet is a guaranteed hit.",
      specs: null, price: 35.00, stock: 30, categoryId: subPlatters.id, brandId: velvetBrand.id,
      image: IMG.catering4, imageName: "party-classic.jpg", sku: "VFT-PAC-001", productType: "physical",
      tags: ["Party"],
    },
    {
      slug: "party-premium-grill", name: "Party Premium Grill",
      shortDescription: "Live BBQ station — wagyu burgers, ribs, grilled seafood, craft sides.",
      description: "A live grilling station that brings the theater of open-flame cooking to your party. [SEED DATA — Replace before launch]",
      story: "Nothing brings a party together like the smell of a live grill.",
      specs: null, price: 65.00, stock: 20, categoryId: subGourmet.id, brandId: velvetBrand.id,
      image: IMG.catering15, imageName: "party-premium-grill.jpg", sku: "VFT-PPG-001", productType: "physical",
      tags: ["Party"],
    },
    {
      slug: "party-signature-dj-dining", name: "Party Signature DJ & Dining",
      shortDescription: "Full catering + curated playlist + cocktail bar — the complete party package.",
      description: "Food, drinks, and vibes — all handled. Just show up and celebrate. [SEED DATA — Replace before launch]",
      story: "The best parties are the ones where the host gets to actually enjoy them.",
      specs: null, price: 95.00, stock: 10, categoryId: subGourmet.id, brandId: velvetBrand.id,
      image: IMG.catering16, imageName: "party-signature.jpg", sku: "VFT-PSD-001", productType: "physical",
      tags: ["Party"],
    },

    // Standalone catering items
    {
      slug: "artisan-margherita-pizza", name: "Artisan Margherita Pizza",
      shortDescription: "Hand-stretched dough, San Marzano tomatoes, fresh mozzarella, and basil.",
      description: "Our signature Margherita is made with imported San Marzano tomatoes. [SEED DATA — Replace before launch]",
      story: "Some recipes don't need reinventing — they need respect.",
      specs: null, price: 24.99, stock: 50, categoryId: subGourmet.id, brandId: velvetBrand.id,
      image: IMG.catering1, imageName: "artisan-margherita.jpg", sku: "VFT-GM-001", productType: "physical",
    },
    {
      slug: "classic-smash-burger", name: "Classic Smash Burger",
      shortDescription: "Double-smashed wagyu patties, aged cheddar, house sauce, brioche bun.",
      description: "Two thin-smashed wagyu beef patties on a toasted brioche bun. [SEED DATA — Replace before launch]",
      story: "The smash burger isn't complicated — but doing it right is an art.",
      specs: null, price: 16.99, stock: 60, categoryId: subGourmet.id, brandId: velvetBrand.id,
      image: IMG.catering4, imageName: "classic-smash-burger.jpg", sku: "VFT-GM-002", productType: "physical",
    },
    {
      slug: "signature-chocolate-cake", name: "Signature Chocolate Ganache Cake",
      shortDescription: "Rich Belgian chocolate layers with silky ganache and gold leaf.",
      description: "Three layers of moist Belgian chocolate cake with dark chocolate ganache. [SEED DATA — Replace before launch]",
      story: "This cake is our most requested item for a reason.",
      specs: null, price: 65.00, stock: 15, categoryId: subDesserts.id, brandId: velvetBrand.id,
      image: IMG.catering6, imageName: "chocolate-ganache-cake.jpg", sku: "VFT-DS-001", productType: "physical",
    },
    {
      slug: "french-pastry-box", name: "French Pastry Selection Box",
      shortDescription: "Six handcrafted pastries: croissants, éclairs, macarons, and more.",
      description: "A curated box of six French pastries. [SEED DATA — Replace before launch]",
      story: "Our pastry chef trained in Paris for a decade. This box is a love letter.",
      specs: null, price: 38.00, stock: 25, categoryId: subDesserts.id, brandId: velvetBrand.id,
      image: IMG.catering2, imageName: "french-pastry-box.jpg", sku: "VFT-DS-002", productType: "physical",
    },
    {
      slug: "charcuterie-board", name: "Artisan Charcuterie Board",
      shortDescription: "Curated selection of cured meats, cheeses, fruits, and accompaniments.",
      description: "A beautifully arranged board featuring prosciutto, sopressata, aged Manchego, and more. [SEED DATA — Replace before launch]",
      story: "A great charcuterie board is a conversation starter.",
      specs: null, price: 85.00, stock: 20, categoryId: subPlatters.id, brandId: velvetBrand.id,
      image: IMG.catering8, imageName: "charcuterie-board.jpg", sku: "VFT-PL-001", productType: "physical",
    },
    {
      slug: "grilled-steak-platter", name: "Grilled Steak Platter for Two",
      shortDescription: "Dry-aged ribeye, truffle fries, grilled asparagus, chimichurri.",
      description: "Two 12oz dry-aged ribeye steaks with premium sides. [SEED DATA — Replace before launch]",
      story: "We dry-age our steaks for 28 days. The result is a depth of flavor you can't rush.",
      specs: null, price: 120.00, stock: 10, categoryId: subGourmet.id, brandId: velvetBrand.id,
      image: IMG.catering7, imageName: "grilled-steak-platter.jpg", sku: "VFT-GM-003", productType: "physical",
    },
  ];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        tags: p.tags || [],
        platform: p.platform || null,
        licenseType: p.licenseType || null,
      },
      create: {
        slug: p.slug, name: p.name, shortDescription: p.shortDescription,
        description: p.description, story: p.story || null, specs: p.specs || undefined,
        price: p.price, sku: p.sku, stock: p.stock, status: "PUBLISHED",
        isActive: true, sortOrder: i + 1, productType: p.productType,
        tags: p.tags || [], platform: p.platform || null, licenseType: p.licenseType || null,
        categoryId: p.categoryId, brandId: p.brandId,
      },
    });

    const existingImage = await prisma.productImage.findFirst({ where: { productId: product.id } });
    if (!existingImage) {
      // Filter out any broken URLs before creating image records
      const images = (p.images || [p.image]).filter((url) => {
        const isBroken = brokenUrls.find((b) => b.url === url);
        if (isBroken) {
          console.warn(`   ⚠ Skipping broken image for ${p.name}: ${url}`);
          return false;
        }
        return true;
      });
      for (let j = 0; j < images.length; j++) {
        await createProductImage(product.id, images[j], `${p.name} — view ${j + 1}`, j === 0, j);
      }
      if (images.length > 0) {
        await createMedia(images[0], p.imageName, `${p.name} — stock photo`, "products");
      }
    }
    console.log(`   ✓ ${p.name} (${p.sku})`);
  }

  // ═══ 5. SERVICE CATEGORIES ═══
  console.log("🔧 Seeding service categories...");
  const svcCatEvents = await prisma.serviceCategory.upsert({ where: { slug: "event-planning" }, update: {}, create: { slug: "event-planning", name: "Event Planning", description: "Full-service event coordination", sortOrder: 1 } });
  const svcCatCatering = await prisma.serviceCategory.upsert({ where: { slug: "catering-services" }, update: {}, create: { slug: "catering-services", name: "Catering Services", description: "Professional culinary experiences", sortOrder: 2 } });
  const svcCatPrivate = await prisma.serviceCategory.upsert({ where: { slug: "private-dining" }, update: {}, create: { slug: "private-dining", name: "Private Dining", description: "Exclusive in-home and venue dining", sortOrder: 3 } });

  // ═══ 6. SERVICES ═══
  console.log("💼 Seeding services...");
  const services = [
    { slug: "wedding-catering", title: "Wedding Catering", shortDescription: "Bespoke wedding menus crafted to match your vision.", description: "Your wedding day deserves a culinary experience as extraordinary as your love story. [SEED DATA]", categoryId: svcCatCatering.id, image: IMG.service1, benefits: ["Custom menu design", "Dietary accommodation", "Professional service staff", "Tasting included"], process: ["Initial consultation", "Menu tasting", "Final menu design", "Day-of execution"] },
    { slug: "corporate-event-catering", title: "Corporate Event Catering", shortDescription: "Impress clients and teams with polished, professional catering.", description: "From board lunches to product launches and annual galas. [SEED DATA]", categoryId: svcCatEvents.id, image: IMG.service2, benefits: ["Flexible packages", "On-site coordinator", "Last-minute bookings"], process: ["Event brief", "Proposal", "Logistics planning", "Day-of delivery"] },
    { slug: "private-chef-experience", title: "Private Chef Experience", shortDescription: "A personal chef comes to your home for an intimate dinner.", description: "Bring the restaurant to you. [SEED DATA]", categoryId: svcCatPrivate.id, image: IMG.service6, benefits: ["Custom multi-course menu", "Chef and server included", "All equipment provided"], process: ["Menu consultation", "Ingredient sourcing", "Chef arrival", "Multi-course service"] },
    { slug: "farm-to-table-dining", title: "Farm-to-Table Dining", shortDescription: "Seasonal menus sourced directly from local farms.", description: "Experience the purest flavors nature offers. [SEED DATA]", categoryId: svcCatCatering.id, image: IMG.service5, benefits: ["Locally sourced", "Seasonal menus", "Sustainable"], process: ["Seasonal menu release", "Booking", "Sourcing", "Farm-fresh delivery"] },
    { slug: "event-design-styling", title: "Event Design & Styling", shortDescription: "Complete event aesthetics — tablescapes, floral, lighting.", description: "The perfect event is more than great food. [SEED DATA]", categoryId: svcCatEvents.id, image: IMG.service3, benefits: ["Full concept design", "Floral coordination", "Lighting planning"], process: ["Concept presentation", "Design refinement", "Sourcing & setup", "Day-of styling"] },
    { slug: "menu-consultation", title: "Menu Consultation & Development", shortDescription: "Work with our culinary team to design menus for your venue.", description: "Whether you're launching a restaurant or refreshing a menu. [SEED DATA]", categoryId: svcCatPrivate.id, image: IMG.service4, benefits: ["Market-analyzed design", "Cost optimization", "Kitchen workflow review"], process: ["Concept analysis", "Menu draft", "Kitchen testing", "Final delivery"] },
  ];

  for (let i = 0; i < services.length; i++) {
    const s = services[i];
    const service = await prisma.service.upsert({
      where: { slug: s.slug }, update: {},
      create: { slug: s.slug, title: s.title, shortDescription: s.shortDescription, description: s.description, categoryId: s.categoryId, imageUrl: s.image, benefits: s.benefits, process: s.process, isActive: true, sortOrder: i + 1 },
    });
    await createMedia(s.image, `${s.slug}.jpg`, `${s.title} — stock photo`, "services");
    const existingFaq = await prisma.fAQ.findFirst({ where: { serviceId: service.id } });
    if (!existingFaq) {
      await prisma.fAQ.create({ data: { question: `What's included in ${s.title}?`, answer: `Our ${s.title} includes a full consultation, custom plan, professional execution, and follow-up. [SEED DATA]`, category: "General", sortOrder: 1, serviceId: service.id } });
    }
    console.log(`   ✓ ${s.title}`);
  }

  // ═══ 7. CATERING MENUS & PACKAGES ═══
  console.log("🍽️  Seeding catering menus...");
  const menuCorp = await prisma.cateringMenu.upsert({ where: { slug: "corporate-events" }, update: {}, create: { slug: "corporate-events", name: "Corporate Events", description: "Professional catering for meetings, conferences, and galas.", imageUrl: IMG.menu1, isActive: true, sortOrder: 1 } });
  const menuWed = await prisma.cateringMenu.upsert({ where: { slug: "weddings-celebrations" }, update: {}, create: { slug: "weddings-celebrations", name: "Weddings & Celebrations", description: "Bespoke catering for the most important day of your life.", imageUrl: IMG.menu2, isActive: true, sortOrder: 2 } });
  const menuPriv = await prisma.cateringMenu.upsert({ where: { slug: "private-dining-menu" }, update: {}, create: { slug: "private-dining-menu", name: "Private Dining", description: "Exclusive in-home dining experiences.", imageUrl: IMG.menu3, isActive: true, sortOrder: 3 } });

  // Look up event types
  const evtCorporate = await prisma.cateringEvent.findUnique({ where: { slug: "corporate" } });
  const evtWedding = await prisma.cateringEvent.findUnique({ where: { slug: "wedding" } });
  const evtPrivate = await prisma.cateringEvent.findUnique({ where: { slug: "private-dinner" } });

  const pkgs = [
    { slug: "executive-lunch", menuId: menuCorp.id, name: "Executive Lunch Package", description: "Premium working lunch for up to 30 guests.", pricePerGuest: 35.00, minimumGuests: 10, image: IMG.menu1, includes: ["Sandwich platter", "Seasonal salads", "Desserts", "Coffee & tea"], tier: "Classic", eventTypeId: evtCorporate?.id },
    { slug: "gala-dinner", menuId: menuCorp.id, name: "Gala Dinner Package", description: "Full-service plated or buffet dinner.", pricePerGuest: 95.00, minimumGuests: 50, image: IMG.menu4, includes: ["3-course dinner", "Welcome cocktails", "Wine pairing", "Service team"], tier: "Signature", eventTypeId: evtCorporate?.id },
    { slug: "conference-all-day", menuId: menuCorp.id, name: "Conference All-Day Package", description: "Full-day catering with breaks, lunch, and afternoon refreshments.", pricePerGuest: 65.00, minimumGuests: 20, image: IMG.menu1, includes: ["Morning break", "Lunch buffet", "Afternoon break", "Beverage station"], tier: "Premium", eventTypeId: evtCorporate?.id },
    { slug: "classic-wedding-pkg", menuId: menuWed.id, name: "Classic Wedding Package", description: "Plated dinner with cocktail hour and dessert bar.", pricePerGuest: 120.00, minimumGuests: 50, image: IMG.menu2, includes: ["Cocktail hour", "3-course dinner", "Dessert bar", "Champagne toast", "Tasting for 4"], tier: "Classic", eventTypeId: evtWedding?.id },
    { slug: "premium-wedding-pkg", menuId: menuWed.id, name: "Premium Wedding Package", description: "Multi-course tasting menu with live stations and premium bar.", pricePerGuest: 175.00, minimumGuests: 50, image: IMG.menu2, includes: ["Cocktail hour", "5-course tasting", "Live stations", "Premium bar", "Tasting for 6"], tier: "Premium", eventTypeId: evtWedding?.id },
    { slug: "signature-wedding-pkg", menuId: menuWed.id, name: "Signature Wedding Package", description: "Bespoke 7-course menu with sommelier and midnight station.", pricePerGuest: 250.00, minimumGuests: 30, image: IMG.menu2, includes: ["Welcome cocktails", "7-course tasting", "Sommelier service", "Midnight dessert station", "Tasting for 8"], tier: "Signature", eventTypeId: evtWedding?.id },
    { slug: "intimate-gathering", menuId: menuPriv.id, name: "Intimate Gathering Package", description: "Dinner parties and small celebrations, up to 20 guests.", pricePerGuest: 75.00, minimumGuests: 8, image: IMG.menu3, includes: ["4-course tasting menu", "Welcome drinks", "Table styling", "Leftover packaging"], tier: "Classic", eventTypeId: evtPrivate?.id },
    { slug: "premium-private-dining", menuId: menuPriv.id, name: "Premium Private Dining", description: "Chef's table experience with wine pairing, up to 16 guests.", pricePerGuest: 125.00, minimumGuests: 6, image: IMG.menu3, includes: ["6-course chef's table", "Wine pairing", "Dedicated server", "Custom menu"], tier: "Premium", eventTypeId: evtPrivate?.id },
    { slug: "signature-omakase", menuId: menuPriv.id, name: "Signature Omakase Experience", description: "10-course omakase with sake pairing, exclusive to your group.", pricePerGuest: 200.00, minimumGuests: 4, image: IMG.menu3, includes: ["10-course omakase", "Sake pairing", "Chef interaction", "Personalized menu"], tier: "Signature", eventTypeId: evtPrivate?.id },
  ];
  for (const pkg of pkgs) {
    const existing = await prisma.cateringPackage.findUnique({ where: { slug: pkg.slug } });
    if (!existing) {
      await prisma.cateringPackage.create({ data: { slug: pkg.slug, menuId: pkg.menuId, name: pkg.name, description: pkg.description, pricePerGuest: pkg.pricePerGuest, minimumGuests: pkg.minimumGuests, imageUrl: pkg.image, includes: pkg.includes, tier: pkg.tier, eventTypeId: pkg.eventTypeId, isActive: true, sortOrder: 1 } });
      await createMedia(pkg.image, `${pkg.slug}.jpg`, `${pkg.name} — stock photo`, "catering");
    }
    console.log(`   ✓ ${pkg.name} (${pkg.tier})`);
  }

  // ═══ 8. CATERING EVENTS ═══
  console.log("🎉 Seeding event types...");
  for (const evt of [
    { slug: "wedding", name: "Wedding", icon: "heart", description: "Your perfect day, perfectly catered", sortOrder: 1 },
    { slug: "corporate", name: "Corporate", icon: "building", description: "Professional events that impress", sortOrder: 2 },
    { slug: "birthday", name: "Birthday", icon: "cake", description: "Celebrate in style", sortOrder: 3 },
    { slug: "private-dinner", name: "Private Dinner", icon: "flame", description: "Intimate gatherings, exceptional food", sortOrder: 4 },
  ]) {
    await prisma.cateringEvent.upsert({ where: { slug: evt.slug }, update: {}, create: evt });
    console.log(`   ✓ ${evt.name}`);
  }

  // ═══ 9. HOMEPAGE SECTIONS ═══
  console.log("🏠 Seeding homepage sections...");
  const heroSlides = [
    { title: "Premium Electronics.\nExceptional Quality.", subtitle: "MVM FOX Electronics", content: { description: "Discover our curated selection of laptops, phones, and smart home devices — engineered for performance, designed for everyday life." }, ctaText: "Shop Electronics", ctaLink: "/shop/electronics", imageUrl: IMG.hero2, sortOrder: 1 },
    { title: "Software That\nWorks For You.", subtitle: "MVM FOX Software", content: { description: "Productivity tools, creative suites, and security solutions — built to help you do your best work." }, ctaText: "Explore Software", ctaLink: "/shop/software", imageUrl: IMG.hero3, sortOrder: 2 },
    { title: "Unforgettable Events.\nPerfectly Crafted.", subtitle: "Velvet Fox Catering", content: { description: "From intimate gatherings to grand celebrations, Velvet Fox delivers exceptional culinary experiences tailored to your vision." }, ctaText: "View Catering", ctaLink: "/shop/catering-shop", imageUrl: IMG.hero4, sortOrder: 3 },
    { title: "Multi-Service\nBusiness Platform.", subtitle: "MVM FOX", content: { description: "Premium catering, curated products, and professional services — all under one roof." }, ctaText: "Explore MVM FOX", ctaLink: "/services", imageUrl: IMG.hero1, sortOrder: 4 },
  ];

  for (const s of heroSlides) {
    const existing = await prisma.homepageSection.findFirst({ where: { type: `hero_slide_${s.sortOrder}` } });
    if (existing) {
      await prisma.homepageSection.update({ where: { id: existing.id }, data: { ctaLink: s.ctaLink } });
    } else {
      await prisma.homepageSection.create({ data: { type: `hero_slide_${s.sortOrder}`, ...s, isVisible: true } });
    }
  }
  // Legacy hero + final CTA
  const existingHero = await prisma.homepageSection.findFirst({ where: { type: "hero" } });
  if (existingHero) await prisma.homepageSection.delete({ where: { id: existingHero.id } });
  const existingCta = await prisma.homepageSection.findFirst({ where: { type: "final_cta" } });
  if (!existingCta) {
    await prisma.homepageSection.create({ data: { type: "final_cta", title: "Ready to Get Started?", content: { description: "Whether you need catering, want to shop our products, or are looking for professional services — we're here to help." }, ctaText: "Get a Quote", ctaLink: "/request-quote", isVisible: true, sortOrder: 10 } });
  }
  console.log("   ✓ Hero slides + CTA sections");

  // ═══ 10. SITE SETTINGS ═══
  console.log("⚙️  Seeding settings...");
  for (const s of [
    { key: "site_name", value: "MVM FOX", group: "general" },
    { key: "site_tagline", value: "Multi-Service Business Platform", group: "general" },
    { key: "site_description", value: "Premium catering, curated electronics, and professional services — all under one roof.", group: "seo" },
    { key: "contact_email", value: "info@mvmfox.com", group: "contact" },
    { key: "contact_phone", value: "+1 (555) 123-4567", group: "contact" },
    { key: "contact_address", value: "123 Business Ave, Suite 100, New York, NY 10001", group: "contact" },
    { key: "social_twitter", value: "https://twitter.com/mvmfox", group: "social" },
    { key: "social_linkedin", value: "https://linkedin.com/company/mvmfox", group: "social" },
    { key: "social_instagram", value: "https://instagram.com/mvmfox", group: "social" },
    { key: "notif_new_orders", value: "true", group: "notifications" },
    { key: "notif_new_catering", value: "true", group: "notifications" },
    { key: "notif_low_stock", value: "true", group: "notifications" },
    { key: "notif_new_service_requests", value: "true", group: "notifications" },
  ]) {
    await prisma.siteSetting.upsert({ where: { key: s.key }, update: {}, create: s });
  }

  console.log("\n═══════════════════════════════════════════════════════");
  console.log("🎉 MVM FOX database seeded successfully (v13)!");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`   Admin: admin@mvmfox.com / admin123`);
  console.log(`   Products: ${await prisma.product.count()}`);
  console.log(`   Categories: ${await prisma.productCategory.count()}`);
  console.log(`   Services: ${await prisma.service.count()}`);
  console.log(`   Media (placeholder): ${await prisma.media.count()}`);
  console.log("");
}

main().catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); }).finally(() => prisma.$disconnect());
