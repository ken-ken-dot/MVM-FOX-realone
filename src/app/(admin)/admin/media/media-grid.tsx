"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Image as ImageIcon, Tag, Search, Trash2, RefreshCw, X, ExternalLink, AlertTriangle } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { Card, EmptyState, Badge, Button, Input, Modal } from "@/components/ui";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [replaceUrl, setReplaceUrl] = useState("");
  const [replacing, setReplacing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const placeholderCount = initialMedia.filter((f) => f.isPlaceholder).length;

  const filteredMedia = initialMedia.filter((file) => {
    // Filter by type
    if (filter === "placeholders" && !file.isPlaceholder) return false;

    // Filter by search query (filename or alt text)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesName = file.fileName.toLowerCase().includes(q);
      const matchesAlt = file.alt?.toLowerCase().includes(q) ?? false;
      const matchesPlaceholder = file.isPlaceholder && "placeholder".includes(q);
      if (!matchesName && !matchesAlt && !matchesPlaceholder) return false;
    }

    return true;
  });

  const handleReplace = useCallback(async () => {
    if (!selectedFile || !replaceUrl) return;
    setReplacing(true);
    try {
      // Update the media record's URL
      const res = await fetch(`/api/admin/media/${selectedFile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: replaceUrl, isPlaceholder: false }),
      });

      if (res.ok) {
        // Refresh the page to show updated data
        window.location.reload();
      }
    } catch {
      // ignore
    } finally {
      setReplacing(false);
    }
  }, [selectedFile, replaceUrl]);

  const handleDelete = useCallback(async () => {
    if (!selectedFile) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/media/${selectedFile.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        window.location.reload();
      }
    } catch {
      // ignore
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [selectedFile]);

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

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search by filename, alt text, or 'placeholder'..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-border-default bg-white text-body-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
            >
              <X size={14} />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-caption text-text-tertiary mt-2">
            {filteredMedia.length} result{filteredMedia.length !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;
          </p>
        )}
      </div>

      {filteredMedia.length === 0 ? (
        <Card>
          <EmptyState
            title={filter === "placeholders" ? "No placeholder images" : "No media files found"}
            description={
              searchQuery
                ? `No images match "${searchQuery}". Try a different search.`
                : filter === "placeholders"
                  ? "All images have been replaced with real assets."
                  : "Media files will appear here when uploaded."
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {filteredMedia.map((file) => (
            <button
              key={file.id}
              onClick={() => setSelectedFile(file)}
              className="rounded-lg border border-border-subtle bg-white overflow-hidden hover:shadow-md transition-shadow text-left cursor-pointer"
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
              <div className="p-3">
                <p className="text-caption text-text-secondary truncate">
                  {file.fileName}
                </p>
                <p className="text-caption text-text-tertiary">
                  {formatDateTime(file.createdAt)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Detail / Replace Modal */}
      <Modal
        open={!!selectedFile}
        onClose={() => { setSelectedFile(null); setReplaceUrl(""); }}
        title="Image Details"
      >
        {selectedFile && (
          <div className="space-y-4">
            {/* Preview */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-surface-neutral">
              {selectedFile.mimeType?.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedFile.url}
                  alt={selectedFile.alt || selectedFile.fileName}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon size={48} className="text-text-tertiary" />
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-3 text-body-sm">
              <div>
                <p className="text-caption text-text-tertiary">Filename</p>
                <p className="font-medium truncate">{selectedFile.fileName}</p>
              </div>
              <div>
                <p className="text-caption text-text-tertiary">Type</p>
                <p className="font-medium">{selectedFile.mimeType || "Unknown"}</p>
              </div>
              <div>
                <p className="text-caption text-text-tertiary">Alt Text</p>
                <p className="font-medium">{selectedFile.alt || "—"}</p>
              </div>
              <div>
                <p className="text-caption text-text-tertiary">Status</p>
                {selectedFile.isPlaceholder ? (
                  <Badge variant="warning">Stock/Placeholder</Badge>
                ) : (
                  <Badge variant="success">Real Image</Badge>
                )}
              </div>
              <div className="col-span-2">
                <p className="text-caption text-text-tertiary">URL</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-xs truncate flex-1 font-mono">{selectedFile.url}</p>
                  <a href={selectedFile.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-hover shrink-0">
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>

            {/* Replace section */}
            <div className="border-t border-border-subtle pt-4">
              <p className="text-body-sm font-semibold mb-2">Replace Image</p>
              <p className="text-caption text-text-tertiary mb-3">
                Upload a new image to replace this one. All references will be updated.
              </p>
              <Input
                label="New Image URL"
                value={replaceUrl}
                onChange={(e) => setReplaceUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
              {replaceUrl && (
                <div className="mt-2 w-32 h-32 rounded-lg border border-border-subtle overflow-hidden bg-surface-neutral">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={replaceUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex justify-end mt-3">
                <Button
                  onClick={handleReplace}
                  loading={replacing}
                  disabled={!replaceUrl}
                  size="sm"
                >
                  <RefreshCw size={14} />
                  Replace
                </Button>
              </div>
            </div>

            {/* Delete section */}
            <div className="border-t border-border-subtle pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body-sm font-semibold text-error">Delete Image</p>
                  <p className="text-caption text-text-tertiary">
                    This action cannot be undone.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="border-error/30 text-error hover:bg-error/5"
                >
                  <Trash2 size={14} />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-error shrink-0 mt-0.5" />
            <div>
              <p className="text-body-sm font-medium">Are you sure you want to delete this image?</p>
              <p className="text-caption text-text-secondary mt-1">
                This will permanently remove <strong>{selectedFile?.fileName}</strong>. If this image is
                used anywhere on the site, those references will break.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              loading={deleting}
              className="border-error/30 text-error hover:bg-error/5"
            >
              <Trash2 size={14} />
              Delete Permanently
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
