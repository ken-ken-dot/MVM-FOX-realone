import { HelpCircle } from "lucide-react";
import { prisma, safeQuery } from "@/lib/prisma";
import { Card, EmptyState } from "@/components/ui";

export default async function AdminFAQsPage() {
  const faqs = await safeQuery(
    () => prisma.fAQ.findMany({
      orderBy: { sortOrder: "asc" },
      include: { service: { select: { title: true } } },
    }),
    [],
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-h1 font-bold tracking-tight">FAQs</h1>
        <p className="text-body text-text-secondary mt-1">
          Manage frequently asked questions
        </p>
      </div>

      {faqs.length === 0 ? (
        <Card>
          <EmptyState
            title="No FAQs yet"
            description="FAQs will appear here when added."
          />
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Question
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Service
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Category
                  </th>
                </tr>
              </thead>
              <tbody>
                {faqs.map((faq) => (
                  <tr
                    key={faq.id}
                    className="border-b border-border-subtle last:border-0"
                  >
                    <td className="px-6 py-4">
                      <p className="text-body-sm font-medium">
                        {faq.question}
                      </p>
                      <p className="text-caption text-text-tertiary line-clamp-1">
                        {faq.answer}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-body-sm text-text-secondary">
                      {faq.service?.title || "—"}
                    </td>
                    <td className="px-6 py-4 text-body-sm text-text-secondary">
                      {faq.category || "—"}
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
