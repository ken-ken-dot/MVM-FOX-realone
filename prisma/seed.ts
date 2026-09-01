/**
 * MVM FOX — Database Seed Script
 *
 * Populates the database with realistic demo content for development and review.
 * Every seeded image is flagged isPlaceholder=true so the Media Library's
 * placeholder filter shows exactly which assets need replacing before launch.
 *
 * Usage:
 *   npx tsx prisma/seed.ts
 *
 * To clear all seed data:
 *   npx tsx prisma/seed.ts --clear
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

// ─── Unsplash Source URLs (free, reliable, high-quality) ───
// Using specific photo IDs for consistency across runs.
const IMG = {
  // Products — Gourmet / Food
  product1: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80", // Artisan pizza
  product2: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80", // Pastry/dessert
  product3: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80", // Fresh salad bowl
  product4: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=800&q=80", // Gourmet burger
  product5: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&q=80", // Eggs Benedict brunch
  product6: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&q=80", // Chocolate cake
  product7: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80", // Grilled steak platter
  product8: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80", // charcuterie board

  // Services
  service1: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80", // Wedding venue
  service2: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80", // Corporate event
  service3: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80", // Fine dining
  service4: "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80", // Menu planning
  service5: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&q=80", // Farm-to-table
  service6: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80", // Private chef

  // Catering
  catering1: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80", // Corporate catering spread
  catering2: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80", // Wedding reception
  catering3: "https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?w=800&q=80", // Private event dinner
  catering4: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80", // Celebration party

  // Brand
  brandVelvet: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80",
  brandLogo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&q=80",

  // Homepage hero
  heroBg: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&q=80",
  cateringHero: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80",
} as const;

// ─── Helper: create a media record ───
async function createMedia(url: string, fileName: string, alt: string, folder: string) {
  return prisma.media.create({
    data: {
      url,
      fileName,
      mimeType: "image/jpeg",
      alt,
      folder,
      isPlaceholder: true,
    },
  });
}

// ─── Helper: seeded product image ───
async function createProductImage(productId: string, url: string, alt: string, isPrimary: boolean, sortOrder: number) {
  return prisma.productImage.create({
    data: { productId, url, alt, isPrimary, sortOrder },
  });
}

async function main() {
  const clearMode = process.argv.includes("--clear");

  if (clearMode) {
    console.log("🧹 Clearing all seed data...");
    // Delete in dependency order
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

  console.log("🌱 Seeding MVM FOX database...\n");

  // ═══════════════════════════════════════════════════════════
  // 1. ADMIN USER
  // ═══════════════════════════════════════════════════════════
  console.log("👤 Seeding admin user...");
  const adminPasswordHash = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@mvmfox.com" },
    update: {},
    create: {
      email: "admin@mvmfox.com",
      name: "MVM FOX Admin",
      passwordHash: adminPasswordHash,
      role: "SUPER_ADMIN",
    },
  });
  console.log(`   ✓ Admin: admin@mvmfox.com / admin123 (${admin.id})`);

  // ═══════════════════════════════════════════════════════════
  // 2. BRAND
  // ═══════════════════════════════════════════════════════════
  console.log("🏷️  Seeding brands...");
  const velvetBrand = await prisma.brand.upsert({
    where: { slug: "velvet-catering" },
    update: {},
    create: {
      slug: "velvet-catering",
      name: "Velvet Catering",
      tagline: "Elevating every occasion",
      description:
        "Velvet Catering is the premium catering arm of MVM FOX, specializing in bespoke culinary experiences for weddings, corporate events, and private celebrations. Our chefs combine innovative techniques with the finest seasonal ingredients to create unforgettable dining moments.",
      logoUrl: IMG.brandLogo,
      coverImageUrl: IMG.brandVelvet,
      isActive: true,
      sortOrder: 1,
    },
  });
  await createMedia(IMG.brandVelvet, "velvet-brand-cover.jpg", "Velvet Catering brand cover image", "brands");
  await createMedia(IMG.brandLogo, "velvet-brand-logo.jpg", "Velvet Catering logo", "brands");
  console.log(`   ✓ Velvet Catering brand`);

  // ═══════════════════════════════════════════════════════════
  // 3. PRODUCT CATEGORIES
  // ═══════════════════════════════════════════════════════════
  console.log("📦 Seeding product categories...");
  const catGourmet = await prisma.productCategory.upsert({
    where: { slug: "gourmet-meals" },
    update: {},
    create: { slug: "gourmet-meals", name: "Gourmet Meals", description: "Chef-crafted ready-to-enjoy meals", sortOrder: 1 },
  });
  const catDesserts = await prisma.productCategory.upsert({
    where: { slug: "desserts" },
    update: {},
    create: { slug: "desserts", name: "Desserts", description: "Sweet endings for every occasion", sortOrder: 2 },
  });
  const catPlatters = await prisma.productCategory.upsert({
    where: { slug: "platters" },
    update: {},
    create: { slug: "platters", name: "Platters & Boards", description: "Artisan platters for gatherings", sortOrder: 3 },
  });
  console.log("   ✓ Gourmet Meals, Desserts, Platters & Boards");

  // ═══════════════════════════════════════════════════════════
  // 4. PRODUCTS (8 across 3 categories)
  // ═══════════════════════════════════════════════════════════
  console.log("🛒 Seeding products...");

  const products = [
    {
      slug: "artisan-margherita-pizza",
      name: "Artisan Margherita Pizza",
      shortDescription: "Hand-stretched dough, San Marzano tomatoes, fresh mozzarella, and basil.",
      description: "Our signature Margherita is made with imported San Marzano tomatoes, creamy fior di latte mozzarella, and fresh basil on a 48-hour cold-fermented sourdough crust. Baked at high heat for a perfectly charred, airy base. Serves 2-3. [SEED DATA — Replace before launch]",
      price: 24.99,
      stock: 50,
      categoryId: catGourmet.id,
      brandId: velvetBrand.id,
      image: IMG.product1,
      imageName: "artisan-margherita-pizza.jpg",
      sku: "VFT-GM-001",
    },
    {
      slug: "signature-chocolate-ganache-cake",
      name: "Signature Chocolate Ganache Cake",
      shortDescription: "Rich Belgian chocolate layers with silky ganache and gold leaf.",
      description: "Three layers of moist Belgian chocolate cake filled with dark chocolate ganache, finished with a mirror glaze and edible gold leaf. A showstopper for any celebration. Serves 8-10. [SEED DATA — Replace before launch]",
      price: 65.00,
      stock: 15,
      categoryId: catDesserts.id,
      brandId: velvetBrand.id,
      image: IMG.product6,
      imageName: "chocolate-ganache-cake.jpg",
      sku: "VFT-DS-001",
    },
    {
      slug: "farm-fresh-salad-bowl",
      name: "Farm Fresh Harvest Bowl",
      shortDescription: "Seasonal greens, roasted vegetables, grains, and house vinaigrette.",
      description: "A vibrant bowl of mixed baby greens, roasted seasonal vegetables, ancient grains, toasted seeds, and our signature citrus-herb vinaigrette. Nutritious, colorful, and deeply satisfying. [SEED DATA — Replace before launch]",
      price: 18.50,
      stock: 40,
      categoryId: catGourmet.id,
      brandId: velvetBrand.id,
      image: IMG.product3,
      imageName: "farm-fresh-salad-bowl.jpg",
      sku: "VFT-GM-002",
    },
    {
      slug: "smash-burger-classic",
      name: "Classic Smash Burger",
      shortDescription: "Double-smashed wagyu patties, aged cheddar, house sauce, brioche bun.",
      description: "Two thin-smashed wagyu beef patties, aged cheddar, pickles, shredded lettuce, tomato, and our secret house sauce on a toasted brioche bun. The burger that started it all. [SEED DATA — Replace before launch]",
      price: 16.99,
      stock: 60,
      categoryId: catGourmet.id,
      brandId: velvetBrand.id,
      image: IMG.product4,
      imageName: "classic-smash-burger.jpg",
      sku: "VFT-GM-003",
    },
    {
      slug: "brunch-eggs-benedict",
      name: "Eggs Benedict Royale",
      shortDescription: "Poached eggs, smoked salmon, hollandaise on toasted English muffin.",
      description: "Perfectly poached eggs over Scottish smoked salmon on a toasted English muffin, draped in our silky house-made hollandaise. A brunch classic elevated. [SEED DATA — Replace before launch]",
      price: 22.00,
      stock: 35,
      categoryId: catGourmet.id,
      brandId: velvetBrand.id,
      image: IMG.product5,
      imageName: "eggs-benedict-royale.jpg",
      sku: "VFT-GM-004",
    },
    {
      slug: "gourmet-charcuterie-board",
      name: "Artisan Charcuterie Board",
      shortDescription: "Curated selection of cured meats, cheeses, fruits, and accompaniments.",
      description: "A beautifully arranged board featuring prosciutto di Parma, sopressata, aged Manchego, triple-cream brie, seasonal fruits, honeycomb, cornichons, and artisan crackers. Serves 6-8. [SEED DATA — Replace before launch]",
      price: 85.00,
      stock: 20,
      categoryId: catPlatters.id,
      brandId: velvetBrand.id,
      image: IMG.product8,
      imageName: "artisan-charcuterie-board.jpg",
      sku: "VFT-PL-001",
    },
    {
      slug: "grilled-steak-platter",
      name: "Grilled Steak Platter for Two",
      shortDescription: "Dry-aged ribeye, truffle fries, grilled asparagus, chimichurri.",
      description: "Two 12oz dry-aged ribeye steaks, grilled to your preference and served with truffle-parmesan fries, charred asparagus, and house chimichurri. A luxurious dinner for two. [SEED DATA — Replace before launch]",
      price: 120.00,
      stock: 10,
      categoryId: catGourmet.id,
      brandId: velvetBrand.id,
      image: IMG.product7,
      imageName: "grilled-steak-platter.jpg",
      sku: "VFT-GM-005",
    },
    {
      slug: "pastry-selection-box",
      name: "French Pastry Selection Box",
      shortDescription: "Six handcrafted pastries: croissants, éclairs, macarons, and more.",
      description: "A curated box of six French pastries including butter croissants, chocolate éclairs, raspberry macarons, pain au chocolat, lemon tarts, and opera cake. Baked fresh daily. [SEED DATA — Replace before launch]",
      price: 38.00,
      stock: 25,
      categoryId: catDesserts.id,
      brandId: velvetBrand.id,
      image: IMG.product2,
      imageName: "french-pastry-selection.jpg",
      sku: "VFT-DS-002",
    },
  ];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        name: p.name,
        shortDescription: p.shortDescription,
        description: p.description,
        price: p.price,
        sku: p.sku,
        stock: p.stock,
        status: "PUBLISHED",
        isActive: true,
        sortOrder: i + 1,
        categoryId: p.categoryId,
        brandId: p.brandId,
      },
    });

    // Create product image (only if not already exists)
    const existingImage = await prisma.productImage.findFirst({ where: { productId: product.id } });
    if (!existingImage) {
      await createProductImage(product.id, p.image, p.name, true, 1);
      await createMedia(p.image, p.imageName, `${p.name} — stock photo`, "products");
    }
    console.log(`   ✓ ${p.name} (${p.sku})`);
  }

  // ═══════════════════════════════════════════════════════════
  // 5. SERVICE CATEGORIES
  // ═══════════════════════════════════════════════════════════
  console.log("🔧 Seeding service categories...");
  const svcCatEvents = await prisma.serviceCategory.upsert({
    where: { slug: "event-planning" },
    update: {},
    create: { slug: "event-planning", name: "Event Planning", description: "Full-service event coordination", sortOrder: 1 },
  });
  const svcCatCatering = await prisma.serviceCategory.upsert({
    where: { slug: "catering-services" },
    update: {},
    create: { slug: "catering-services", name: "Catering Services", description: "Professional culinary experiences", sortOrder: 2 },
  });
  const svcCatPrivate = await prisma.serviceCategory.upsert({
    where: { slug: "private-dining" },
    update: {},
    create: { slug: "private-dining", name: "Private Dining", description: "Exclusive in-home and venue dining", sortOrder: 3 },
  });
  console.log("   ✓ Event Planning, Catering Services, Private Dining");

  // ═══════════════════════════════════════════════════════════
  // 6. SERVICES (6 across 3 categories)
  // ═══════════════════════════════════════════════════════════
  console.log("💼 Seeding services...");

  const services = [
    {
      slug: "wedding-catering",
      title: "Wedding Catering",
      shortDescription: "Bespoke wedding menus crafted to match your vision, from plated dinners to grazing stations.",
      description: "Your wedding day deserves a culinary experience as extraordinary as your love story. Velvet Catering designs bespoke menus tailored to your theme, dietary needs, and guest count. From elegant plated dinners to interactive food stations and late-night snack bars, our team handles every detail so you can focus on celebrating. [SEED DATA — Replace before launch]",
      categoryId: svcCatCatering.id,
      brandId: velvetBrand.id,
      image: IMG.service1,
      benefits: ["Custom menu design", "Dietary accommodation", "Professional service staff", "Tasting session included"],
      process: ["Initial consultation", "Menu tasting", "Final menu design", "Day-of execution"],
    },
    {
      slug: "corporate-event-catering",
      title: "Corporate Event Catering",
      shortDescription: "Impress clients and teams with polished, professional catering for meetings, launches, and galas.",
      description: "From board lunches to product launches and annual galas, we deliver catering that reflects your brand's standards. Our corporate packages include menu consultation, on-site coordination, and flexible service styles — whether you need a quick working lunch or a full-scale event. [SEED DATA — Replace before launch]",
      categoryId: svcCatEvents.id,
      brandId: velvetBrand.id,
      image: IMG.service2,
      benefits: ["Flexible package options", "On-site event coordinator", "Branded table settings available", "Last-minute bookings accepted"],
      process: ["Event brief", "Proposal & menu selection", "Logistics planning", "Day-of delivery"],
    },
    {
      slug: "private-chef-experience",
      title: "Private Chef Experience",
      shortDescription: "A personal chef comes to your home or venue for an intimate, restaurant-quality dinner.",
      description: "Bring the restaurant to you. Our private chef service transforms your kitchen into a fine-dining destination. Choose from curated tasting menus or work with our chef to design a completely custom multi-course dinner. Perfect for anniversaries, dinner parties, and special celebrations. [SEED DATA — Replace before launch]",
      categoryId: svcCatPrivate.id,
      brandId: velvetBrand.id,
      image: IMG.service6,
      benefits: ["Fully customized multi-course menu", "Chef and server included", "All equipment provided", "Leftover packaging included"],
      process: ["Menu consultation", "Ingredient sourcing", "Chef arrival & prep", "Multi-course service"],
    },
    {
      slug: "farm-to-table-dining",
      title: "Farm-to-Table Dining",
      shortDescription: "Seasonal menus sourced directly from local farms and artisan producers.",
      description: "Experience the purest flavors nature offers. Our farm-to-table program partners with local farms, ranches, and artisan producers to create seasonal menus that are as sustainable as they are delicious. Each dish tells the story of its origin — from soil to plate. [SEED DATA — Replace before launch]",
      categoryId: svcCatCatering.id,
      brandId: velvetBrand.id,
      image: IMG.service5,
      benefits: ["Locally sourced ingredients", "Seasonal rotating menus", "Sustainable practices", "Farm visit opportunities"],
      process: ["Seasonal menu release", "Booking & customization", "Sourcing & preparation", "Farm-fresh delivery"],
    },
    {
      slug: "event-design-styling",
      title: "Event Design & Styling",
      shortDescription: "Complete event aesthetics — from tablescapes to floral design and lighting.",
      description: "The perfect event is more than great food — it's an atmosphere. Our design team handles everything from tablescapes and floral arrangements to lighting design and spatial planning. We create cohesive visual experiences that complement our culinary offerings and leave lasting impressions. [SEED DATA — Replace before launch]",
      categoryId: svcCatEvents.id,
      brandId: velvetBrand.id,
      image: IMG.service3,
      benefits: ["Full visual concept design", "Floral & décor coordination", "Lighting & ambiance planning", "Day-of styling team"],
      process: ["Concept presentation", "Design refinement", "Sourcing & setup", "Day-of styling"],
    },
    {
      slug: "menu-consultation",
      title: "Menu Consultation & Development",
      shortDescription: "Work with our culinary team to design menus for your restaurant, hotel, or venue.",
      description: "Whether you're launching a new restaurant or refreshing an existing menu, our culinary consultants bring decades of experience to the table. We analyze your concept, audience, and market position to develop menus that are profitable, executable, and delicious. [SEED DATA — Replace before launch]",
      categoryId: svcCatPrivate.id,
      brandId: velvetBrand.id,
      image: IMG.service4,
      benefits: ["Market-analyzed menu design", "Cost-per-plate optimization", "Kitchen workflow review", "Seasonal rotation planning"],
      process: ["Concept analysis", "Menu draft development", "Kitchen testing", "Final menu delivery"],
    },
  ];

  for (let i = 0; i < services.length; i++) {
    const s = services[i];
    const service = await prisma.service.upsert({
      where: { slug: s.slug },
      update: {},
      create: {
        slug: s.slug,
        title: s.title,
        shortDescription: s.shortDescription,
        description: s.description,
        categoryId: s.categoryId,
        brandId: s.brandId,
        imageUrl: s.image,
        benefits: s.benefits,
        process: s.process,
        isActive: true,
        sortOrder: i + 1,
      },
    });

    // Create media record
    const existingMedia = await prisma.media.findFirst({ where: { url: s.image } });
    if (!existingMedia) {
      await createMedia(s.image, `${s.slug}.jpg`, `${s.title} — stock photo`, "services");
    }

    // Create FAQ for each service
    const existingFaq = await prisma.fAQ.findFirst({ where: { serviceId: service.id } });
    if (!existingFaq) {
      await prisma.fAQ.create({
        data: {
          question: `What's included in ${s.title}?`,
          answer: `Our ${s.title} includes a full consultation, custom design/plan, professional execution, and post-event follow-up. Contact us for a detailed breakdown. [SEED DATA]`,
          category: "General",
          sortOrder: 1,
          serviceId: service.id,
        },
      });
    }

    console.log(`   ✓ ${s.title}`);
  }

  // ═══════════════════════════════════════════════════════════
  // 7. CATERING MENUS & PACKAGES (4 menus, each with 1-2 packages)
  // ═══════════════════════════════════════════════════════════
  console.log("🍽️  Seeding catering menus & packages...");

  const menuCorporate = await prisma.cateringMenu.upsert({
    where: { slug: "corporate-events" },
    update: {},
    create: {
      slug: "corporate-events",
      name: "Corporate Events",
      description: "Professional catering solutions for meetings, conferences, launches, and corporate celebrations.",
      imageUrl: IMG.catering1,
      isActive: true,
      sortOrder: 1,
    },
  });

  const menuWedding = await prisma.cateringMenu.upsert({
    where: { slug: "weddings-celebrations" },
    update: {},
    create: {
      slug: "weddings-celebrations",
      name: "Weddings & Celebrations",
      description: "Bespoke catering for the most important day of your life. From intimate gatherings to grand receptions.",
      imageUrl: IMG.catering2,
      isActive: true,
      sortOrder: 2,
    },
  });

  const menuPrivate = await prisma.cateringMenu.upsert({
    where: { slug: "private-dining" },
    update: {},
    create: {
      slug: "private-dining",
      name: "Private Dining",
      description: "Exclusive in-home and venue dining experiences for smaller, more intimate occasions.",
      imageUrl: IMG.catering3,
      isActive: true,
      sortOrder: 3,
    },
  });

  // Packages
  const packages = [
    {
      slug: "executive-lunch",
      menuId: menuCorporate.id,
      name: "Executive Lunch Package",
      description: "Premium working lunch for up to 30 guests. Includes sandwich platters, salads, desserts, and beverages.",
      pricePerGuest: 35.00,
      minimumGuests: 10,
      image: IMG.catering1,
      includes: ["Artisan sandwich platter", "Seasonal salad selection", "Mini dessert assortment", "Coffee & tea service", "Tableware & setup"],
    },
    {
      slug: "gala-dinner",
      menuId: menuCorporate.id,
      name: "Gala Dinner Package",
      description: "Full-service plated or buffet dinner for corporate galas and milestone celebrations.",
      pricePerGuest: 95.00,
      minimumGuests: 50,
      image: IMG.catering4,
      includes: ["3-course plated dinner or premium buffet", "Welcome cocktails", "Bread service", "Wine pairing option", "Dedicated service team"],
    },
    {
      slug: "classic-wedding",
      menuId: menuWedding.id,
      name: "Classic Wedding Package",
      description: "Timeless elegance for your special day. Plated dinner with cocktail hour and dessert bar.",
      pricePerGuest: 120.00,
      minimumGuests: 50,
      image: IMG.catering2,
      includes: ["Cocktail hour with canapés", "3-course plated dinner", "Dessert bar", "Champagne toast", "Cake cutting service", "Tasting for 4 guests"],
    },
    {
      slug: "intimate-gathering",
      menuId: menuPrivate.id,
      name: "Intimate Gathering Package",
      description: "Perfect for dinner parties, anniversaries, and small celebrations of up to 20 guests.",
      pricePerGuest: 75.00,
      minimumGuests: 8,
      image: IMG.catering3,
      includes: ["4-course tasting menu", "Welcome drinks", "Table styling", "Chef's table option", "Leftover packaging"],
    },
  ];

  for (const pkg of packages) {
    const existing = await prisma.cateringPackage.findUnique({ where: { slug: pkg.slug } });
    if (!existing) {
      await prisma.cateringPackage.create({
        data: {
          slug: pkg.slug,
          menuId: pkg.menuId,
          name: pkg.name,
          description: pkg.description,
          pricePerGuest: pkg.pricePerGuest,
          minimumGuests: pkg.minimumGuests,
          imageUrl: pkg.image,
          includes: pkg.includes,
          isActive: true,
          sortOrder: 1,
        },
      });
      const existingMedia = await prisma.media.findFirst({ where: { url: pkg.image } });
      if (!existingMedia) {
        await createMedia(pkg.image, `${pkg.slug}.jpg`, `${pkg.name} — stock photo`, "catering");
      }
    }
    console.log(`   ✓ ${pkg.name}`);
  }

  // ═══════════════════════════════════════════════════════════
  // 8. CATERING EVENTS
  // ═══════════════════════════════════════════════════════════
  console.log("🎉 Seeding catering event types...");
  const eventTypes = [
    { slug: "wedding", name: "Wedding", icon: "💒", description: "Your perfect day, perfectly catered", sortOrder: 1 },
    { slug: "corporate", name: "Corporate", icon: "🏢", description: "Professional events that impress", sortOrder: 2 },
    { slug: "birthday", name: "Birthday", icon: "🎂", description: "Celebrate in style", sortOrder: 3 },
    { slug: "private-dinner", name: "Private Dinner", icon: "🕯️", description: "Intimate gatherings, exceptional food", sortOrder: 4 },
  ];

  for (const evt of eventTypes) {
    await prisma.cateringEvent.upsert({
      where: { slug: evt.slug },
      update: {},
      create: evt,
    });
    console.log(`   ✓ ${evt.name}`);
  }

  // ═══════════════════════════════════════════════════════════
  // 9. TESTIMONIALS
  // ═══════════════════════════════════════════════════════════
  console.log("⭐ Seeding testimonials...");
  const testimonials = [
    { quote: "Velvet Catering made our wedding absolutely magical. Every dish was a conversation piece, and our guests are still talking about the tasting menu months later.", authorName: "Sarah & James Mitchell", authorTitle: "Wedding, June 2025", sortOrder: 1 },
    { quote: "We've used MVM FOX for three corporate events now. The consistency, presentation, and professionalism are unmatched. They just get it.", authorName: "David Chen", authorTitle: "VP Operations, TechStart Inc.", sortOrder: 2 },
    { quote: "The private chef experience was extraordinary. It felt like having a Michelin-starred restaurant in our own home. Truly unforgettable.", authorName: "Maria Rodriguez", authorTitle: "Private Dining Client", sortOrder: 3 },
  ];

  for (const t of testimonials) {
    const existing = await prisma.testimonial.findFirst({ where: { authorName: t.authorName } });
    if (!existing) {
      await prisma.testimonial.create({ data: { ...t, isPublished: true } });
    }
    console.log(`   ✓ ${t.authorName}`);
  }

  // ═══════════════════════════════════════════════════════════
  // 10. HOMEPAGE SECTIONS
  // ═══════════════════════════════════════════════════════════
  console.log("🏠 Seeding homepage sections...");
  const sections = [
    {
      type: "hero",
      title: "Premium Services.\nExceptional Quality.",
      subtitle: "Multi-Service Business Platform",
      content: { description: "From world-class catering to curated products and professional services — MVM FOX delivers excellence across every touchpoint." },
      ctaText: "Explore Services",
      ctaLink: "/services",
      imageUrl: IMG.heroBg,
      isVisible: true,
      sortOrder: 1,
    },
    {
      type: "catering_cta",
      title: "Unforgettable Events,\nPerfectly Crafted",
      subtitle: "Velvet Catering",
      content: { description: "From intimate gatherings to grand celebrations, our catering team delivers exceptional culinary experiences tailored to your vision." },
      ctaText: "View Catering",
      ctaLink: "/catering",
      imageUrl: IMG.cateringHero,
      isVisible: true,
      sortOrder: 2,
    },
    {
      type: "final_cta",
      title: "Ready to Get Started?",
      content: { description: "Whether you need catering for a special event, want to shop our products, or are looking for professional services — we're here to help." },
      ctaText: "Get a Quote",
      ctaLink: "/request-quote",
      isVisible: true,
      sortOrder: 3,
    },
  ];

  for (const section of sections) {
    const existing = await prisma.homepageSection.findFirst({ where: { type: section.type } });
    if (!existing) {
      await prisma.homepageSection.create({ data: section });
    }
    console.log(`   ✓ ${section.type}`);
  }

  // ═══════════════════════════════════════════════════════════
  // 11. SITE SETTINGS
  // ═══════════════════════════════════════════════════════════
  console.log("⚙️  Seeding site settings...");
  const settings = [
    { key: "site_name", value: "MVM FOX", group: "general" },
    { key: "site_tagline", value: "Multi-Service Business Platform", group: "general" },
    { key: "contact_email", value: "info@mvmfox.com", group: "contact" },
    { key: "contact_phone", value: "(123) 456-7890", group: "contact" },
  ];

  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log("   ✓ Site settings");

  console.log("\n═══════════════════════════════════════════════════════");
  console.log("🎉 MVM FOX database seeded successfully!");
  console.log("═══════════════════════════════════════════════════════");
  console.log("\n📋 Summary:");
  console.log(`   Admin: admin@mvmfox.com / admin123`);
  console.log(`   Products: ${await prisma.product.count()}`);
  console.log(`   Services: ${await prisma.service.count()}`);
  console.log(`   Catering Menus: ${await prisma.cateringMenu.count()}`);
  console.log(`   Catering Packages: ${await prisma.cateringPackage.count()}`);
  console.log(`   Brands: ${await prisma.brand.count()}`);
  console.log(`   Testimonials: ${await prisma.testimonial.count()}`);
  console.log(`   Media (all placeholder): ${await prisma.media.count()}`);
  console.log(`   Homepage Sections: ${await prisma.homepageSection.count()}`);
  console.log("");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
