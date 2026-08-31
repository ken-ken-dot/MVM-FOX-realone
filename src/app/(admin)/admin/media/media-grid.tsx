"use client";

import { useState } from "react";
import Image from "next/image";
import { Image as ImageIcon, Tag } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { Card, EmptyState, Badge } from "@/components/ui";

interface MediaFile {
  id: string;
  url: string;
  fileName: string;
  mimeType: string | null;
  alt: string | null;
  isPlaceholder: boolean;
  createdAt: Date;
}

interface MediaGridProps {
  initialMedia: MediaFile[];
}

export function MediaGrid({ initialMedia }: MediaGridProps) {
  const [filter, setFilter] = useState<"all" | "placeholders">("all");

  const filteredMedia =
    filter === "placeholders"
      ? initialMedia.filter((f) => f.isPlaceholder)
      : initialMedia;

  const placeholderCount = initialMedia.filter((f) => f.isPlaceholder).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-h1 font-bold tracking-tight">Media Library</h1>
          <p className="text-body text-text-secondary mt-1">
            Manage uploaded media files
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`h-9 px-4 rounded-full text-body-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-accent text-text-on-accent"
                : "border border-border-default text-text-secondary hover:bg-surface-neutral"
            }`}
          >
            All ({initialMedia.length})
          </button>
          <button
            onClick={() => setFilter("placeholders")}
            className={`h-9 px-4 rounded-full text-body-sm font-medium transition-colors ${
              filter === "placeholders"
                ? "bg-warning text-white"
                : "border border-border-default text-text-secondary hover:bg-surface-neutral"
            }`}
          >
            <Tag size={14} className="inline mr-1" />
            Stock/Placeholder ({placeholderCount})
          </button>
        </div>
      </div>

      {filteredMedia.length === 0 ? (
        <Card>
          <EmptyState
            title={filter === "placeholders" ? "No placeholder images" : "No media files yet"}
            description={
              filter === "placeholders"
                ? "All images have been replaced with real assets."
                : "Media files will appear here when uploaded."
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredMedia.map((file) => (
            <div
              key={file.id}
              className="rounded-lg border border-border-subtle bg-white overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-square bg-surface-neutral">
                {file.mimeType?.startsWith("image/") ? (
                  <Image
                    src={file.url}
                    alt={file.alt || file.fileName}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon size={24} className="text-text-tertiary" />
                  </div>
                )}
                {file.isPlaceholder && (
                  <div className="absolute top-1 right-1">
                    <Badge variant="warning" size="sm">
                      Stock
                    </Badge>
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="text-caption text-text-secondary truncate">
                  {file.fileName}
                </p>
                <p className="text-caption text-text-tertiary">
                  {formatDateTime(file.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
