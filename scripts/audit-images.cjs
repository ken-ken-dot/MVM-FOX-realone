/**
 * MVM FOX — Automated Image Audit Script (v19)
 *
 * Connects to the PostgreSQL database and validates every image reference
 * across all models: ProductImage, ProductCategory, Brand, Service,
 * CateringMenu, CateringPackage, HomepageSection, Media, Testimonial.
 *
 * For each URL, performs an HTTP HEAD to verify it resolves (2xx status).
 * Outputs a full broken-image report.
 */

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const https = require("https");
const http = require("http");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function checkUrl(url, timeoutMs = 10000) {
  return new Promise((resolve) => {
    if (!url || !url.startsWith("http")) {
      resolve({ ok: false, status: 0, reason: url ? "not an HTTP URL" : "null/empty" });
      return;
    }
    const lib = url.startsWith("https") ? https : http;
    const req = lib.request(url, { method: "HEAD", timeout: timeoutMs }, (res) => {
      resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, status: res.statusCode, reason: "" });
    });
    req.on("timeout", () => {
      req.destroy();
      resolve({ ok: false, status: 0, reason: "timeout" });
    });
    req.on("error", (e) => {
      resolve({ ok: false, status: 0, reason: e.message });
    });
    req.end();
  });
}

async function main() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  MVM FOX — Automated Image Audit (v19)");
  console.log("═══════════════════════════════════════════════════════════\n");

  const results = [];
  let totalChecked = 0;
  let totalBroken = 0;

  // 1. ProductImage records
  console.log("📋 Scanning ProductImage records...");
  const productImages = await prisma.productImage.findMany({
    include: { product: { select: { slug: true, name: true, status: true } } },
  });
  console.log(`   Found ${productImages.length} ProductImage records`);

  for (const img of productImages) {
    const check = await checkUrl(img.url);
    totalChecked++;
    const record = {
      model: "ProductImage",
      id: img.id,
      url: img.url,
      alt: img.alt,
      slug: img.product?.slug || "unknown",
      productName: img.product?.name || "unknown",
      productStatus: img.product?.status || "unknown",
      isPrimary: img.isPrimary,
      sortOrder: img.sortOrder,
      ok: check.ok,
      status: check.status,
      reason: check.reason,
    };
    if (!check.ok) totalBroken++;
    results.push(record);
  }

  // 2. ProductCategory imageUrl
  console.log("📋 Scanning ProductCategory images...");
  const categories = await prisma.productCategory.findMany({ select: { id: true, slug: true, name: true, imageUrl: true } });
  console.log(`   Found ${categories.length} categories`);
  for (const cat of categories) {
    if (!cat.imageUrl) continue;
    const check = await checkUrl(cat.imageUrl);
    totalChecked++;
    const record = {
      model: "ProductCategory",
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      url: cat.imageUrl,
      ok: check.ok,
      status: check.status,
      reason: check.reason,
    };
    if (!check.ok) totalBroken++;
    results.push(record);
  }

  // 3. Brand images
  console.log("📋 Scanning Brand images...");
  const brands = await prisma.brand.findMany({ select: { id: true, slug: true, name: true, logoUrl: true, coverImageUrl: true } });
  console.log(`   Found ${brands.length} brands`);
  for (const b of brands) {
    for (const field of ["logoUrl", "coverImageUrl"]) {
      const url = b[field];
      if (!url) continue;
      const check = await checkUrl(url);
      totalChecked++;
      const record = {
        model: "Brand",
        id: b.id,
        slug: b.slug,
        name: b.name,
        field,
        url,
        ok: check.ok,
        status: check.status,
        reason: check.reason,
      };
      if (!check.ok) totalBroken++;
      results.push(record);
    }
  }

  // 4. Service images
  console.log("📋 Scanning Service images...");
  const services = await prisma.service.findMany({ select: { id: true, slug: true, title: true, imageUrl: true } });
  console.log(`   Found ${services.length} services`);
  for (const s of services) {
    if (!s.imageUrl) continue;
    const check = await checkUrl(s.imageUrl);
    totalChecked++;
    const record = {
      model: "Service",
      id: s.id,
      slug: s.slug,
      name: s.title,
      url: s.imageUrl,
      ok: check.ok,
      status: check.status,
      reason: check.reason,
    };
    if (!check.ok) totalBroken++;
    results.push(record);
  }

  // 5. CateringMenu images
  console.log("📋 Scanning CateringMenu images...");
  const menus = await prisma.cateringMenu.findMany({ select: { id: true, slug: true, name: true, imageUrl: true } });
  console.log(`   Found ${menus.length} catering menus`);
  for (const m of menus) {
    if (!m.imageUrl) continue;
    const check = await checkUrl(m.imageUrl);
    totalChecked++;
    const record = {
      model: "CateringMenu",
      id: m.id,
      slug: m.slug,
      name: m.name,
      url: m.imageUrl,
      ok: check.ok,
      status: check.status,
      reason: check.reason,
    };
    if (!check.ok) totalBroken++;
    results.push(record);
  }

  // 6. CateringPackage images
  console.log("📋 Scanning CateringPackage images...");
  const packages = await prisma.cateringPackage.findMany({ select: { id: true, slug: true, name: true, imageUrl: true } });
  console.log(`   Found ${packages.length} catering packages`);
  for (const p of packages) {
    if (!p.imageUrl) continue;
    const check = await checkUrl(p.imageUrl);
    totalChecked++;
    const record = {
      model: "CateringPackage",
      id: p.id,
      slug: p.slug,
      name: p.name,
      url: p.imageUrl,
      ok: check.ok,
      status: check.status,
      reason: check.reason,
    };
    if (!check.ok) totalBroken++;
    results.push(record);
  }

  // 7. HomepageSection images
  console.log("📋 Scanning HomepageSection images...");
  const sections = await prisma.homepageSection.findMany({ select: { id: true, type: true, title: true, imageUrl: true } });
  console.log(`   Found ${sections.length} homepage sections`);
  for (const s of sections) {
    if (!s.imageUrl) continue;
    const check = await checkUrl(s.imageUrl);
    totalChecked++;
    const record = {
      model: "HomepageSection",
      id: s.id,
      name: s.title || s.type,
      url: s.imageUrl,
      ok: check.ok,
      status: check.status,
      reason: check.reason,
    };
    if (!check.ok) totalBroken++;
    results.push(record);
  }

  // 8. Media records
  console.log("📋 Scanning Media records...");
  const media = await prisma.media.findMany({ select: { id: true, url: true, fileName: true, alt: true, folder: true } });
  console.log(`   Found ${media.length} media records`);
  for (const m of media) {
    if (!m.url) continue;
    const check = await checkUrl(m.url);
    totalChecked++;
    const record = {
      model: "Media",
      id: m.id,
      name: m.fileName,
      alt: m.alt,
      folder: m.folder,
      url: m.url,
      ok: check.ok,
      status: check.status,
      reason: check.reason,
    };
    if (!check.ok) totalBroken++;
    results.push(record);
  }

  // 9. Testimonial avatars
  console.log("📋 Scanning Testimonial avatars...");
  const testimonials = await prisma.testimonial.findMany({ select: { id: true, authorName: true, authorAvatar: true } });
  console.log(`   Found ${testimonials.length} testimonials`);
  for (const t of testimonials) {
    if (!t.authorAvatar) continue;
    const check = await checkUrl(t.authorAvatar);
    totalChecked++;
    const record = {
      model: "Testimonial",
      id: t.id,
      name: t.authorName,
      url: t.authorAvatar,
      ok: check.ok,
      status: check.status,
      reason: check.reason,
    };
    if (!check.ok) totalBroken++;
    results.push(record);
  }

  // 10. User avatars
  console.log("📋 Scanning User avatars...");
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, avatarUrl: true } });
  console.log(`   Found ${users.length} users`);
  for (const u of users) {
    if (!u.avatarUrl) continue;
    const check = await checkUrl(u.avatarUrl);
    totalChecked++;
    const record = {
      model: "User",
      id: u.id,
      name: u.name || u.email,
      url: u.avatarUrl,
      ok: check.ok,
      status: check.status,
      reason: check.reason,
    };
    if (!check.ok) totalBroken++;
    results.push(record);
  }

  // ═══ REPORT ═══
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("  AUDIT REPORT");
  console.log("═══════════════════════════════════════════════════════════\n");
  console.log(`Total image references checked: ${totalChecked}`);
  console.log(`Total broken references found:  ${totalBroken}`);
  console.log(`Total OK:                        ${totalChecked - totalBroken}\n`);

  if (totalBroken === 0) {
    console.log("✅ ALL IMAGE REFERENCES ARE VALID — no broken images found.\n");
  } else {
    console.log("❌ BROKEN IMAGE REFERENCES:\n");
    console.log("─".repeat(120));
    const broken = results.filter(r => !r.ok);
    for (const r of broken) {
      console.log(`  Model:      ${r.model}`);
      console.log(`  Product:    ${r.productName || r.name || r.slug || "N/A"}${r.productStatus ? ` (${r.productStatus})` : ""}`);
      if (r.field) console.log(`  Field:      ${r.field}`);
      if (r.alt !== undefined) console.log(`  Alt text:   ${r.alt}`);
      if (r.isPrimary !== undefined) console.log(`  Is primary: ${r.isPrimary}`);
      if (r.sortOrder !== undefined) console.log(`  Sort order: ${r.sortOrder}`);
      console.log(`  URL:        ${r.url}`);
      console.log(`  Status:     ${r.status || "N/A"}`);
      console.log(`  Reason:     ${r.reason}`);
      console.log("─".repeat(120));
    }
  }

  // Summary by model
  console.log("\n📊 Summary by model:");
  const models = {};
  for (const r of results) {
    if (!models[r.model]) models[r.model] = { total: 0, broken: 0 };
    models[r.model].total++;
    if (!r.ok) models[r.model].broken++;
  }
  for (const [model, counts] of Object.entries(models)) {
    console.log(`  ${model}: ${counts.total} total, ${counts.broken} broken`);
  }

  // Check for "view N" pattern specifically
  console.log("\n🔍 Checking for 'view N' naming pattern in ProductImage alt text:");
  const viewPattern = productImages.filter(img => img.alt && /— view \d+/.test(img.alt));
  console.log(`   Found ${viewPattern.length} ProductImage records with "— view N" alt text`);
  const viewBroken = viewPattern.filter(img => !results.find(r => r.id === img.id && r.ok));
  console.log(`   Of those, ${viewBroken.length} have broken URLs`);
  if (viewBroken.length > 0) {
    console.log("\n   Broken 'view N' images:");
    for (const img of viewBroken) {
      console.log(`     - Product: ${img.product?.name}, Alt: ${img.alt}, URL: ${img.url}`);
    }
  }

  // Write results to JSON for later use
  const fs = require("fs");
  fs.writeFileSync("scripts/audit-results.json", JSON.stringify({ totalChecked, totalBroken, results }, null, 2));
  console.log("\n📄 Full results written to scripts/audit-results.json");

  await prisma.$disconnect();
}

main().catch(e => {
  console.error("Audit failed:", e);
  process.exit(1);
});
