import { Star } from "lucide-react";
import { prisma, safeQuery } from "@/lib/prisma";
import { Badge, Card, EmptyState } from "@/components/ui";

export default async function AdminTestimonialsPage() {
  const testimonials = await safeQuery(
    () => prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } }),
    [],
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-h1 font-bold tracking-tight">Testimonials</h1>
        <p className="text-body text-text-secondary mt-1">
          Manage customer testimonials
        </p>
      </div>

      {testimonials.length === 0 ? (
        <Card>
          <EmptyState
            title="No testimonials yet"
            description="Testimonials will appear here when added through the CMS."
          />
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Quote
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Author
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Published
                  </th>
                </tr>
              </thead>
              <tbody>
                {testimonials.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-border-subtle last:border-0"
                  >
                    <td className="px-6 py-4">
                      <p className="text-body-sm text-text-secondary italic line-clamp-2">
                        &ldquo;{t.quote}&rdquo;
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-body-sm font-medium">
                        {t.authorName}
                      </p>
                      {t.authorTitle && (
                        <p className="text-caption text-text-tertiary">
                          {t.authorTitle}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={t.isPublished ? "success" : "default"}>
                        {t.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
