/**
 * MVM FOX — Database Seed Script (v7)
 *
 * Populates the database with realistic demo content for development and review.
 * Hierarchical categories: Electronics → subcategories, Software → subcategories, Catering → subcategories.
 * All seeded images are flagged isPlaceholder=true.
 *
 * Usage:
 *   npx tsx prisma/seed.ts
 *   npx tsx prisma/seed.ts --clear
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ─── Unsplash Source URLs ───
const IMG = {
  // Electronics
  laptop1: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&q=80",
  laptop2: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=80",
  laptop3: "https://images.unsplash.com/photo-1525547719571-a2f4ac2945c2?w=1200&q=80",
  phone1: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1200&q=80",
  phone2: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&q=80",
  phone3: "https://images.unsplash.com/photo-1565849904461-04a58adcb756?w=1200&q=80",
  fridge: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=1200&q=80",
  headphones: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80",
  speaker: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=1200&q=80",

  // Software
  software1: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80",
  software2: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&q=80",
  software3: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80",
  software4: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",

  // Catering (Velvet Fox)
  catering1: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=80",
  catering2: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=1200&q=80",
  catering3: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=80",
  catering4: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=1200&q=80",
  catering5: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=1200&q=80",
  catering6: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=1200&q=80",
  catering7: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80",
  catering8: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1200&q=80",

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

  // Brand
  brandVelvet: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80",
  brandLogo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&q=80",

  // Hero slides
  hero1: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&q=80",
  hero2: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1600&q=80",
  hero3: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600&q=80",
  hero4: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1600&q=80",
} as const;

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

  console.log("🌱 Seeding MVM FOX database (v7)...\n");

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

  // ═══ 3. PRODUCT CATEGORIES (hierarchical) ═══
  console.log("📦 Seeding product categories...");
  const catElectronics = await prisma.productCategory.upsert({ where: { slug: "electronics" }, update: {}, create: { slug: "electronics", name: "Electronics", description: "Laptops, phones, appliances, and more", icon: "monitor", sortOrder: 1 } });
  const catSoftware = await prisma.productCategory.upsert({ where: { slug: "software" }, update: {}, create: { slug: "software", name: "Software", description: "Productivity, creative, and business tools", icon: "code", sortOrder: 2 } });
  const catCatering = await prisma.productCategory.upsert({ where: { slug: "catering-shop" }, update: {}, create: { slug: "catering-shop", name: "Catering", description: "Velvet Fox catering menus and packages", icon: "utensils", sortOrder: 3 } });

  // Subcategories
  const subLaptops = await prisma.productCategory.upsert({ where: { slug: "laptops" }, update: {}, create: { slug: "laptops", name: "Laptops", parentId: catElectronics.id, sortOrder: 1 } });
  const subPhones = await prisma.productCategory.upsert({ where: { slug: "smartphones" }, update: {}, create: { slug: "smartphones", name: "Smartphones", parentId: catElectronics.id, sortOrder: 2 } });
  const subAppliances = await prisma.productCategory.upsert({ where: { slug: "home-appliances" }, update: {}, create: { slug: "home-appliances", name: "Home Appliances", parentId: catElectronics.id, sortOrder: 3 } });
  const subAudio = await prisma.productCategory.upsert({ where: { slug: "audio" }, update: {}, create: { slug: "audio", name: "Audio", parentId: catElectronics.id, sortOrder: 4 } });
  const subProductivity = await prisma.productCategory.upsert({ where: { slug: "productivity-software" }, update: {}, create: { slug: "productivity-software", name: "Productivity", parentId: catSoftware.id, sortOrder: 1 } });
  const subCreative = await prisma.productCategory.upsert({ where: { slug: "creative-software" }, update: {}, create: { slug: "creative-software", name: "Creative & Design", parentId: catSoftware.id, sortOrder: 2 } });
  const subSecurity = await prisma.productCategory.upsert({ where: { slug: "security-software" }, update: {}, create: { slug: "security-software", name: "Security", parentId: catSoftware.id, sortOrder: 3 } });
  const subGourmet = await prisma.productCategory.upsert({ where: { slug: "gourmet-meals" }, update: {}, create: { slug: "gourmet-meals", name: "Gourmet Meals", parentId: catCatering.id, sortOrder: 1 } });
  const subDesserts = await prisma.productCategory.upsert({ where: { slug: "desserts" }, update: {}, create: { slug: "desserts", name: "Desserts", parentId: catCatering.id, sortOrder: 2 } });
  const subPlatters = await prisma.productCategory.upsert({ where: { slug: "platters" }, update: {}, create: { slug: "platters", name: "Platters & Boards", parentId: catCatering.id, sortOrder: 3 } });
  console.log("   ✓ Electronics, Software, Catering + subcategories");

  // ═══ 4. PRODUCTS ═══
  console.log("🛒 Seeding products...");

  const products: Array<{
    slug: string; name: string; shortDescription: string; description: string;
    story: string; specs: Record<string, string> | null;
    price: number; stock: number; categoryId: string; brandId: string | null;
    image: string; imageName: string; sku: string; productType: string;
    images?: string[];
  }> = [
    // ── ELECTRONICS ──
    {
      slug: "mvm-fox-pro-16-laptop", name: "MVM FOX Pro 16\" Laptop",
      shortDescription: "16\" Retina display, M3 Pro chip, 18GB RAM, 512GB SSD — built for creators.",
      description: "The MVM FOX Pro 16-inch is our flagship laptop for creative professionals and power users. Featuring a stunning Liquid Retina XDR display, the M3 Pro chip with 12-core CPU and 18-core GPU, 18GB unified memory, and 512GB SSD. All-day battery life meets pro-level performance. [SEED DATA — Replace before launch]",
      story: "We built the Pro 16 for people who refuse to compromise. Whether you're editing 4K video, running complex datasets, or designing the next great interface — this machine keeps up without breaking a sweat. The display alone will change how you see your work.",
      specs: { Display: '16.2" Liquid Retina XDR', Processor: "Apple M3 Pro 12-core", Memory: "18GB Unified", Storage: "512GB SSD", Battery: "Up to 22 hours", Weight: "2.14 kg" },
      price: 2499.00, stock: 25, categoryId: subLaptops.id, brandId: null,
      image: IMG.laptop1, imageName: "mvm-fox-pro-16.jpg", sku: "MVM-ELP-001", productType: "physical",
      images: [IMG.laptop1, IMG.laptop2, IMG.laptop3],
    },
    {
      slug: "mvm-fox-air-14-laptop", name: "MVM FOX Air 14\" Laptop",
      shortDescription: "Ultra-thin 14\" laptop, M3 chip, 16GB RAM, all-day battery for everyday brilliance.",
      description: "The MVM FOX Air 14-inch redefines portable computing. Just 1.24 kg with a gorgeous 14-inch Liquid Retina display, M3 chip, 16GB unified memory, and up to 18 hours of battery life. Perfect for professionals on the move. [SEED DATA — Replace before launch]",
      story: "Some days you need power without the weight. The Air 14 is for those days — and every day after. Slip it into any bag, open it anywhere, and get lost in a display that makes you forget how thin this machine actually is.",
      specs: { Display: '13.6" Liquid Retina', Processor: "Apple M3 8-core", Memory: "16GB Unified", Storage: "256GB SSD", Battery: "Up to 18 hours", Weight: "1.24 kg" },
      price: 1299.00, stock: 40, categoryId: subLaptops.id, brandId: null,
      image: IMG.laptop2, imageName: "mvm-fox-air-14.jpg", sku: "MVM-ELA-001", productType: "physical",
      images: [IMG.laptop2, IMG.laptop1],
    },
    {
      slug: "mvm-fox-phone-15-pro", name: "MVM FOX Phone 15 Pro",
      shortDescription: "6.7\" OLED display, A17 Pro chip, 48MP camera system, titanium design.",
      description: "The MVM FOX Phone 15 Pro pushes the boundaries of what a smartphone can do. A17 Pro chip delivers console-level gaming. The 48MP main camera with 5x optical zoom captures extraordinary detail. Titanium design is both lightweight and incredibly durable. [SEED DATA — Replace before launch]",
      story: "Every detail of the Phone 15 Pro was obsessively refined. The titanium frame feels incredible in hand. The camera system sees in the dark. And the A17 Pro chip is so fast, it redefines what's possible in your pocket.",
      specs: { Display: '6.7" Super Retina XDR OLED', Processor: "A17 Pro", Camera: "48MP Main + 12MP Ultra Wide + 12MP 5x Telephoto", Storage: "256GB", Battery: "Up to 29 hours video", Material: "Titanium" },
      price: 1199.00, stock: 50, categoryId: subPhones.id, brandId: null,
      image: IMG.phone1, imageName: "mvm-fox-phone-15-pro.jpg", sku: "MVM-ELP-002", productType: "physical",
      images: [IMG.phone1, IMG.phone2, IMG.phone3],
    },
    {
      slug: "mvm-fox-phone-se", name: "MVM FOX Phone SE",
      shortDescription: "4.7\" Retina display, A15 chip, 12MP camera — flagship power, compact form.",
      description: "The MVM FOX Phone SE packs flagship performance into a compact, affordable design. Powered by the A15 Bionic chip with a 12MP camera system, Touch ID, and 5G connectivity. [SEED DATA — Replace before launch]",
      story: "Not everyone wants a giant phone. The Phone SE proves that small can be mighty — same chip that powers our flagship, in a form factor that disappears into your pocket.",
      specs: { Display: '4.7" Retina HD', Processor: "A15 Bionic", Camera: "12MP Wide", Storage: "128GB", Battery: "Up to 15 hours video", Connectivity: "5G" },
      price: 429.00, stock: 60, categoryId: subPhones.id, brandId: null,
      image: IMG.phone2, imageName: "mvm-fox-phone-se.jpg", sku: "MVM-ELS-001", productType: "physical",
      images: [IMG.phone2, IMG.phone1],
    },
    {
      slug: "mvm-fox-smart-fridge", name: "MVM FOX Smart Fridge 4-Door",
      shortDescription: "26 cu. ft. French door fridge with touchscreen, Wi-Fi, and AI inventory tracking.",
      description: "The MVM FOX Smart Fridge combines premium design with intelligent features. A 21.5\" touchscreen display, internal cameras with AI-powered food recognition, Wi-Fi connectivity, and a sleek stainless steel finish. [SEED DATA — Replace before launch]",
      story: "We reimagined what a fridge should be. The built-in touchscreen keeps your family organized. Internal cameras let you check what's inside from the grocery store. And the AI learns your habits to suggest recipes and reduce waste.",
      specs: { Capacity: "26 cu. ft.", Display: '21.5" Touchscreen', Finish: "Fingerprint-resistant stainless steel", Features: "AI inventory, internal cameras, Wi-Fi", Energy: "ENERGY STAR® certified", Doors: "4-door French door" },
      price: 3299.00, stock: 8, categoryId: subAppliances.id, brandId: null,
      image: IMG.fridge, imageName: "mvm-fox-smart-fridge.jpg", sku: "MVM-ELA-002", productType: "physical",
      images: [IMG.fridge],
    },
    {
      slug: "mvm-fox-pro-headphones", name: "MVM FOX Pro Headphones",
      shortDescription: "Active noise cancellation, 40-hour battery, Hi-Res Audio certified.",
      description: "Immerse yourself in sound with the MVM FOX Pro Headphones. Industry-leading active noise cancellation, 40-hour battery life, Hi-Res Audio support, and a premium comfort-fit design for all-day listening. [SEED DATA — Replace before launch]",
      story: "Great audio should disappear — you should just hear the music, not the headphones. Our Pro headphones were tuned by Grammy-winning engineers to deliver sound so natural, you'll discover details in songs you've heard a thousand times.",
      specs: { Driver: "40mm custom", ANC: "Adaptive noise cancellation", Battery: "40 hours (ANC on)", Audio: "Hi-Res Audio certified", Connectivity: "Bluetooth 5.3, 3.5mm", Weight: "250g" },
      price: 349.00, stock: 35, categoryId: subAudio.id, brandId: null,
      image: IMG.headphones, imageName: "mvm-fox-pro-headphones.jpg", sku: "MVM-ELH-001", productType: "physical",
      images: [IMG.headphones, IMG.speaker],
    },
    {
      slug: "mvm-fox-home-speaker", name: "MVM FOX Home Speaker",
      shortDescription: "360° room-filling sound, voice assistant, multi-room audio support.",
      description: "The MVM FOX Home Speaker delivers rich, 360-degree sound that fills any room. Built-in voice assistant, seamless multi-room audio, and a beautifully minimal design that blends into any space. [SEED DATA — Replace before launch]",
      story: "We wanted a speaker that sounds incredible from every angle — not just the sweet spot. The Home Speaker uses custom-designed drivers arranged in a 360° array, so every seat in the room is the best seat.",
      specs: { Drivers: "360° array with 3 custom drivers", Bass: "Dedicated woofer", Voice: "Built-in assistant", "Multi-room": "Up to 8 speakers", Connectivity: "Wi-Fi 6, Bluetooth 5.3, AirPlay 2", Power: "AC powered" },
      price: 249.00, stock: 30, categoryId: subAudio.id, brandId: null,
      image: IMG.speaker, imageName: "mvm-fox-home-speaker.jpg", sku: "MVM-ELS-002", productType: "physical",
      images: [IMG.speaker, IMG.headphones],
    },

    // ── SOFTWARE ──
    {
      slug: "mvm-fox-flow-suite", name: "MVM FOX Flow Suite",
      shortDescription: "All-in-one productivity platform — tasks, docs, calendar, and AI assistant.",
      description: "MVM FOX Flow Suite brings your entire workflow into one beautifully designed platform. Real-time document collaboration, intelligent task management, calendar integration, and an AI assistant that learns your patterns. [SEED DATA — Replace before launch]",
      story: "We were tired of switching between ten apps to get one thing done. Flow Suite was born from the belief that productivity tools should feel like one continuous thought, not a scattered collection of tabs.",
      specs: { Platform: "Web, macOS, Windows, iOS, Android", Storage: "100GB cloud included", Collaboration: "Real-time multi-user", AI: "Built-in writing & planning assistant", Integrations: "Slack, GitHub, Google, Outlook", License: "Annual subscription" },
      price: 12.99, stock: 9999, categoryId: subProductivity.id, brandId: null,
      image: IMG.software1, imageName: "mvm-fox-flow-suite.jpg", sku: "MVM-SWP-001", productType: "subscription",
      images: [IMG.software1, IMG.software4],
    },
    {
      slug: "mvm-fox-design-studio", name: "MVM FOX Design Studio",
      shortDescription: "Professional design tool — vector, raster, motion, and prototyping in one app.",
      description: "MVM FOX Design Studio is a professional-grade design platform for UI/UX, branding, illustration, and motion graphics. Industry-standard tools with AI-powered features that accelerate your creative workflow. [SEED DATA — Replace before launch]",
      story: "Design tools have gotten complicated. We built Design Studio to be powerful without being intimidating — every feature is exactly where you'd expect it, and the AI features feel like having a skilled assistant looking over your shoulder.",
      specs: { Platform: "macOS, Windows, iPad", Formats: "Vector, raster, motion, prototype", AI: "Generative fill, auto-layout, style transfer", Export: "SVG, PNG, PDF, Lottie, MP4", Collaboration: "Real-time co-editing", License: "Per-seat subscription" },
      price: 19.99, stock: 9999, categoryId: subCreative.id, brandId: null,
      image: IMG.software2, imageName: "mvm-fox-design-studio.jpg", sku: "MVM-SWC-001", productType: "subscription",
      images: [IMG.software2, IMG.software4],
    },
    {
      slug: "mvm-fox-shield-pro", name: "MVM FOX Shield Pro",
      shortDescription: "Enterprise-grade security suite — antivirus, VPN, password manager, dark web monitoring.",
      description: "MVM FOX Shield Pro protects your devices and data with a comprehensive security suite. Real-time threat protection, secure VPN, encrypted password manager, and dark web monitoring — all in one lightweight agent. [SEED DATA — Replace before launch]",
      story: "Security shouldn't slow you down. Shield Pro runs silently in the background, protecting you without the pop-ups, slowdowns, or complexity that make people turn off their antivirus. We think the best security is the kind you never notice.",
      specs: { Protection: "Real-time antivirus & ransomware", VPN: "Unlimited, 50+ countries", Passwords: "Encrypted vault, auto-fill", Monitoring: "Dark web & identity alerts", Devices: "Up to 10 per license", Platform: "macOS, Windows, iOS, Android" },
      price: 9.99, stock: 9999, categoryId: subSecurity.id, brandId: null,
      image: IMG.software3, imageName: "mvm-fox-shield-pro.jpg", sku: "MVM-SWS-001", productType: "subscription",
      images: [IMG.software3],
    },
    {
      slug: "mvm-fox-data-pilot", name: "MVM FOX Data Pilot",
      shortDescription: "Business analytics platform — dashboards, reports, and AI-driven insights.",
      description: "MVM FOX Data Pilot transforms raw data into actionable insights. Drag-and-drop dashboard builder, automated reporting, and AI-powered anomaly detection help you make smarter decisions faster. [SEED DATA — Replace before launch]",
      story: "Every business has data. Few have clarity. Data Pilot bridges that gap — not by adding complexity, but by asking the right questions and surfacing the answers you didn't know to look for.",
      specs: { Connectors: "SQL, CSV, API, Google Sheets, Salesforce", Dashboards: "Unlimited, drag-and-drop builder", Reports: "Scheduled PDF/email delivery", AI: "Anomaly detection, trend forecasting", Users: "Up to 25 per plan", License: "Annual subscription" },
      price: 29.99, stock: 9999, categoryId: subProductivity.id, brandId: null,
      image: IMG.software4, imageName: "mvm-fox-data-pilot.jpg", sku: "MVM-SWP-002", productType: "subscription",
      images: [IMG.software4, IMG.software1],
    },

    // ── CATERING (Velvet Fox) ──
    {
      slug: "artisan-margherita-pizza", name: "Artisan Margherita Pizza",
      shortDescription: "Hand-stretched dough, San Marzano tomatoes, fresh mozzarella, and basil.",
      description: "Our signature Margherita is made with imported San Marzano tomatoes, creamy fior di latte mozzarella, and fresh basil on a 48-hour cold-fermented sourdough crust. Serves 2-3. [SEED DATA — Replace before launch]",
      story: "Some recipes don't need reinventing — they need respect. Our Margherita honors the Neapolitan tradition with the best ingredients we can source, prepared by hand every time.",
      specs: null, price: 24.99, stock: 50, categoryId: subGourmet.id, brandId: velvetBrand.id,
      image: IMG.catering1, imageName: "artisan-margherita.jpg", sku: "VFT-GM-001", productType: "physical",
    },
    {
      slug: "classic-smash-burger", name: "Classic Smash Burger",
      shortDescription: "Double-smashed wagyu patties, aged cheddar, house sauce, brioche bun.",
      description: "Two thin-smashed wagyu beef patties, aged cheddar, pickles, shredded lettuce, tomato, and our secret house sauce on a toasted brioche bun. [SEED DATA — Replace before launch]",
      story: "The smash burger isn't complicated — but doing it right is an art. We smash thin, flip fast, and build with intention. Every layer matters.",
      specs: null, price: 16.99, stock: 60, categoryId: subGourmet.id, brandId: velvetBrand.id,
      image: IMG.catering4, imageName: "classic-smash-burger.jpg", sku: "VFT-GM-002", productType: "physical",
    },
    {
      slug: "signature-chocolate-cake", name: "Signature Chocolate Ganache Cake",
      shortDescription: "Rich Belgian chocolate layers with silky ganache and gold leaf.",
      description: "Three layers of moist Belgian chocolate cake filled with dark chocolate ganache, finished with a mirror glaze and edible gold leaf. Serves 8-10. [SEED DATA — Replace before launch]",
      story: "This cake is our most requested item for a reason. It's the kind of dessert that makes people close their eyes on the first bite.",
      specs: null, price: 65.00, stock: 15, categoryId: subDesserts.id, brandId: velvetBrand.id,
      image: IMG.catering6, imageName: "chocolate-ganache-cake.jpg", sku: "VFT-DS-001", productType: "physical",
    },
    {
      slug: "french-pastry-box", name: "French Pastry Selection Box",
      shortDescription: "Six handcrafted pastries: croissants, éclairs, macarons, and more.",
      description: "A curated box of six French pastries including butter croissants, chocolate éclairs, raspberry macarons, pain au chocolat, lemon tarts, and opera cake. [SEED DATA — Replace before launch]",
      story: "Our pastry chef trained in Paris for a decade. This box is a love letter to everything she learned there — technique, restraint, and the understanding that butter makes everything better.",
      specs: null, price: 38.00, stock: 25, categoryId: subDesserts.id, brandId: velvetBrand.id,
      image: IMG.catering2, imageName: "french-pastry-box.jpg", sku: "VFT-DS-002", productType: "physical",
    },
    {
      slug: "charcuterie-board", name: "Artisan Charcuterie Board",
      shortDescription: "Curated selection of cured meats, cheeses, fruits, and accompaniments.",
      description: "A beautifully arranged board featuring prosciutto di Parma, sopressata, aged Manchego, triple-cream brie, seasonal fruits, honeycomb, cornichons, and artisan crackers. Serves 6-8. [SEED DATA — Replace before launch]",
      story: "A great charcuterie board is a conversation starter. We source from small-batch producers who share our obsession with quality, and arrange everything to look as good as it tastes.",
      specs: null, price: 85.00, stock: 20, categoryId: subPlatters.id, brandId: velvetBrand.id,
      image: IMG.catering8, imageName: "charcuterie-board.jpg", sku: "VFT-PL-001", productType: "physical",
    },
    {
      slug: "grilled-steak-platter", name: "Grilled Steak Platter for Two",
      shortDescription: "Dry-aged ribeye, truffle fries, grilled asparagus, chimichurri.",
      description: "Two 12oz dry-aged ribeye steaks, grilled to your preference and served with truffle-parmesan fries, charred asparagus, and house chimichurri. [SEED DATA — Replace before launch]",
      story: "We dry-age our steaks for 28 days in a climate-controlled room. The result is a depth of flavor that you simply can't rush — and a texture that melts before you finish chewing.",
      specs: null, price: 120.00, stock: 10, categoryId: subGourmet.id, brandId: velvetBrand.id,
      image: IMG.catering7, imageName: "grilled-steak-platter.jpg", sku: "VFT-GM-003", productType: "physical",
    },
  ];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug, name: p.name, shortDescription: p.shortDescription,
        description: p.description, story: p.story || null, specs: p.specs || undefined,
        price: p.price, sku: p.sku, stock: p.stock, status: "PUBLISHED",
        isActive: true, sortOrder: i + 1, productType: p.productType,
        categoryId: p.categoryId, brandId: p.brandId,
      },
    });

    const existingImage = await prisma.productImage.findFirst({ where: { productId: product.id } });
    if (!existingImage) {
      const images = p.images || [p.image];
      for (let j = 0; j < images.length; j++) {
        await createProductImage(product.id, images[j], `${p.name} — view ${j + 1}`, j === 0, j);
      }
      await createMedia(p.image, p.imageName, `${p.name} — stock photo`, "products");
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
    { slug: "wedding-catering", title: "Wedding Catering", shortDescription: "Bespoke wedding menus crafted to match your vision.", description: "Your wedding day deserves a culinary experience as extraordinary as your love story. Velvet Fox designs bespoke menus tailored to your theme, dietary needs, and guest count. [SEED DATA]", categoryId: svcCatCatering.id, image: IMG.service1, benefits: ["Custom menu design", "Dietary accommodation", "Professional service staff", "Tasting included"], process: ["Initial consultation", "Menu tasting", "Final menu design", "Day-of execution"] },
    { slug: "corporate-event-catering", title: "Corporate Event Catering", shortDescription: "Impress clients and teams with polished, professional catering.", description: "From board lunches to product launches and annual galas, we deliver catering that reflects your brand's standards. [SEED DATA]", categoryId: svcCatEvents.id, image: IMG.service2, benefits: ["Flexible packages", "On-site coordinator", "Last-minute bookings"], process: ["Event brief", "Proposal", "Logistics planning", "Day-of delivery"] },
    { slug: "private-chef-experience", title: "Private Chef Experience", shortDescription: "A personal chef comes to your home for an intimate dinner.", description: "Bring the restaurant to you. Our private chef service transforms your kitchen into a fine-dining destination. [SEED DATA]", categoryId: svcCatPrivate.id, image: IMG.service6, benefits: ["Custom multi-course menu", "Chef and server included", "All equipment provided"], process: ["Menu consultation", "Ingredient sourcing", "Chef arrival", "Multi-course service"] },
    { slug: "farm-to-table-dining", title: "Farm-to-Table Dining", shortDescription: "Seasonal menus sourced directly from local farms.", description: "Experience the purest flavors nature offers. Our farm-to-table program partners with local farms and artisan producers. [SEED DATA]", categoryId: svcCatCatering.id, image: IMG.service5, benefits: ["Locally sourced", "Seasonal menus", "Sustainable"], process: ["Seasonal menu release", "Booking", "Sourcing", "Farm-fresh delivery"] },
    { slug: "event-design-styling", title: "Event Design & Styling", shortDescription: "Complete event aesthetics — tablescapes, floral, lighting.", description: "The perfect event is more than great food — it's an atmosphere. Our design team handles everything from tablescapes to lighting. [SEED DATA]", categoryId: svcCatEvents.id, image: IMG.service3, benefits: ["Full concept design", "Floral coordination", "Lighting planning"], process: ["Concept presentation", "Design refinement", "Sourcing & setup", "Day-of styling"] },
    { slug: "menu-consultation", title: "Menu Consultation & Development", shortDescription: "Work with our culinary team to design menus for your venue.", description: "Whether you're launching a restaurant or refreshing a menu, our culinary consultants bring decades of experience. [SEED DATA]", categoryId: svcCatPrivate.id, image: IMG.service4, benefits: ["Market-analyzed design", "Cost optimization", "Kitchen workflow review"], process: ["Concept analysis", "Menu draft", "Kitchen testing", "Final delivery"] },
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

  const pkgs = [
    { slug: "executive-lunch", menuId: menuCorp.id, name: "Executive Lunch Package", description: "Premium working lunch for up to 30 guests.", pricePerGuest: 35.00, minimumGuests: 10, image: IMG.menu1, includes: ["Sandwich platter", "Seasonal salads", "Desserts", "Coffee & tea"] },
    { slug: "gala-dinner", menuId: menuCorp.id, name: "Gala Dinner Package", description: "Full-service plated or buffet dinner.", pricePerGuest: 95.00, minimumGuests: 50, image: IMG.menu4, includes: ["3-course dinner", "Welcome cocktails", "Wine pairing", "Service team"] },
    { slug: "classic-wedding-pkg", menuId: menuWed.id, name: "Classic Wedding Package", description: "Plated dinner with cocktail hour and dessert bar.", pricePerGuest: 120.00, minimumGuests: 50, image: IMG.menu2, includes: ["Cocktail hour", "3-course dinner", "Dessert bar", "Champagne toast", "Tasting for 4"] },
    { slug: "intimate-gathering", menuId: menuPriv.id, name: "Intimate Gathering Package", description: "Dinner parties and small celebrations, up to 20 guests.", pricePerGuest: 75.00, minimumGuests: 8, image: IMG.menu3, includes: ["4-course tasting menu", "Welcome drinks", "Table styling", "Leftover packaging"] },
  ];
  for (const pkg of pkgs) {
    const existing = await prisma.cateringPackage.findUnique({ where: { slug: pkg.slug } });
    if (!existing) {
      await prisma.cateringPackage.create({ data: { slug: pkg.slug, menuId: pkg.menuId, name: pkg.name, description: pkg.description, pricePerGuest: pkg.pricePerGuest, minimumGuests: pkg.minimumGuests, imageUrl: pkg.image, includes: pkg.includes, isActive: true, sortOrder: 1 } });
      await createMedia(pkg.image, `${pkg.slug}.jpg`, `${pkg.name} — stock photo`, "catering");
    }
    console.log(`   ✓ ${pkg.name}`);
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
    { title: "Unforgettable Events.\nPerfectly Crafted.", subtitle: "Velvet Fox Catering", content: { description: "From intimate gatherings to grand celebrations, Velvet Fox delivers exceptional culinary experiences tailored to your vision." }, ctaText: "View Catering", ctaLink: "/shop/catering", imageUrl: IMG.hero4, sortOrder: 3 },
    { title: "Multi-Service\nBusiness Platform.", subtitle: "MVM FOX", content: { description: "Premium catering, curated products, and professional services — all under one roof." }, ctaText: "Explore MVM FOX", ctaLink: "/services", imageUrl: IMG.hero1, sortOrder: 4 },
  ];

  for (const s of heroSlides) {
    const existing = await prisma.homepageSection.findFirst({ where: { type: `hero_slide_${s.sortOrder}` } });
    if (!existing) {
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
    { key: "contact_email", value: "info@mvmfox.com", group: "contact" },
  ]) {
    await prisma.siteSetting.upsert({ where: { key: s.key }, update: {}, create: s });
  }

  console.log("\n═══════════════════════════════════════════════════════");
  console.log("🎉 MVM FOX database seeded successfully (v7)!");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`   Admin: admin@mvmfox.com / admin123`);
  console.log(`   Products: ${await prisma.product.count()}`);
  console.log(`   Categories: ${await prisma.productCategory.count()}`);
  console.log(`   Services: ${await prisma.service.count()}`);
  console.log(`   Media (placeholder): ${await prisma.media.count()}`);
  console.log("");
}

main().catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); }).finally(() => prisma.$disconnect());
