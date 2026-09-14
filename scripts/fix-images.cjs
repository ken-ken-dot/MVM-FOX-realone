/**
 * MVM FOX — Fix Broken Image References (v19)
 *
 * Replaces all broken Unsplash URLs in ProductImage and Media tables
 * with working alternatives from the existing seed constants.
 */

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Map of broken Unsplash URLs → working replacements
// Each replacement is a working Unsplash photo from the same category
const URL_MAP = {
  // Broken laptop photo → working laptop photo (laptop2)
  "https://images.unsplash.com/photo-1525547719571-a2f4ac2945c2?w=1920&q=85":
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1920&q=85",

  // Broken phone photo → working phone photo (phone1)
  "https://images.unsplash.com/photo-1565849904461-04a58adcb756?w=1920&q=85":
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1920&q=85",

  // Broken misc photo → working monitor photo (monitor1)
  "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&q=85":
    "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1920&q=85",

  // Broken earbuds photo → working headphones photo (headphones)
  "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=1920&q=85":
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1920&q=85",

  // Broken misc photo (q=80) → working tablet photo (tablet2)
  "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&q=80":
    "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=1200&q=80",
};

async function main() {
  console.log("🔧 MVM FOX — Fixing Broken Image References\n");

  let totalFixed = 0;

  // Fix ProductImage records
  console.log("📋 Fixing ProductImage records...");
  for (const [brokenUrl, fixedUrl] of Object.entries(URL_MAP)) {
    const result = await prisma.productImage.updateMany({
      where: { url: brokenUrl },
      data: { url: fixedUrl },
    });
    if (result.count > 0) {
      console.log(`   ✓ Fixed ${result.count} ProductImage(s): ${brokenUrl.split("/").pop()} → ${fixedUrl.split("/").pop()}`);
      totalFixed += result.count;
    }
  }

  // Fix Media records
  console.log("\n📋 Fixing Media records...");
  for (const [brokenUrl, fixedUrl] of Object.entries(URL_MAP)) {
    const result = await prisma.media.updateMany({
      where: { url: brokenUrl },
      data: { url: fixedUrl },
    });
    if (result.count > 0) {
      console.log(`   ✓ Fixed ${result.count} Media record(s): ${brokenUrl.split("/").pop()} → ${fixedUrl.split("/").pop()}`);
      totalFixed += result.count;
    }
  }

  console.log(`\n✅ Total records fixed: ${totalFixed}`);
  await prisma.$disconnect();
}

main().catch(e => {
  console.error("Fix failed:", e);
  process.exit(1);
});
