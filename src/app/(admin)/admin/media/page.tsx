import { prisma, safeQuery } from "@/lib/prisma";
import { MediaGrid } from "./media-grid";

export default async function AdminMediaPage() {
  const media = await safeQuery(
    () =>
      prisma.media.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          url: true,
          fileName: true,
          mimeType: true,
          alt: true,
          isPlaceholder: true,
          createdAt: true,
        },
      }),
    [],
  );

  return <MediaGrid initialMedia={media} />;
}
