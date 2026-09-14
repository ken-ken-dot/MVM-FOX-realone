"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar, Plus, Save, Loader2 } from "lucide-react";
import { Card, EmptyState, Button, Input, Textarea, Modal } from "@/components/ui";

interface CateringEvent {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  _count: { requests: number };
}

export default function AdminCateringEventsPage() {
  const [events, setEvents] = useState<CateringEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CateringEvent | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "",
    sortOrder: "0",
  });

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/catering-events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const openCreateModal = () => {
    setEditingEvent(null);
    setForm({ name: "", slug: "", description: "", icon: "", sortOrder: "0" });
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (event: CateringEvent) => {
    setEditingEvent(event);
    setForm({
      name: event.name,
      slug: event.slug,
      description: event.description || "",
      icon: event.icon || "",
      sortOrder: String(event.sortOrder),
    });
    setError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.slug) {
      setError("Name and slug are required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        ...form,
        sortOrder: parseInt(form.sortOrder, 10) || 0,
      };

      const url = editingEvent
        ? `/api/admin/catering-events/${editingEvent.id}`
        : "/api/admin/catering-events";
      const method = editingEvent ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save.");
        setSaving(false);
        return;
      }

      setModalOpen(false);
      fetchEvents();
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("Delete this event type? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/admin/catering-events/${eventId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchEvents();
      }
    } catch {
      // ignore
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-h1 font-bold tracking-tight">Catering Events</h1>
          <p className="text-body text-text-secondary mt-1">
            Manage event types for catering
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus size={16} />
          Add Event Type
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-text-tertiary" />
        </div>
      ) : events.length === 0 ? (
        <Card>
          <EmptyState
            title="No event types yet"
            description="Create your first event type to get started."
            action={
              <Button onClick={openCreateModal} size="sm">
                <Plus size={14} />
                Add Event Type
              </Button>
            }
          />
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Event Type
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Description
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Requests
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Sort
                  </th>
                  <th className="px-6 py-3 text-body-sm font-semibold text-text-secondary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr
                    key={event.id}
                    className="border-b border-border-subtle last:border-0 hover:bg-surface-neutral/30"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                          <Calendar size={16} className="text-accent" />
                        </div>
                        <div>
                          <p className="text-body-sm font-medium">{event.name}</p>
                          <p className="text-caption text-text-tertiary">/{event.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-body-sm text-text-secondary max-w-xs truncate">
                      {event.description || "—"}
                    </td>
                    <td className="px-6 py-4 text-body-sm">
                      {event._count.requests}
                    </td>
                    <td className="px-6 py-4 text-body-sm text-text-tertiary">
                      {event.sortOrder}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(event)}
                          className="text-body-sm text-accent hover:text-accent-hover transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="text-body-sm text-text-tertiary hover:text-error transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingEvent ? "Edit Event Type" : "Create Event Type"}
      >
        <div className="space-y-4">
          {error && (
            <div className="rounded-lg bg-error/10 p-3 text-body-sm text-error">{error}</div>
          )}
          <Input
            label="Name *"
            value={form.name}
            onChange={(e) => {
              setForm((f) => ({
                ...f,
                name: e.target.value,
                slug: f.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
              }));
            }}
            required
          />
          <Input
            label="Slug *"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            required
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
          />
          <Input
            label="Icon"
            value={form.icon}
            onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
            placeholder="e.g. heart, building, cake, flame"
          />
          <Input
            label="Sort Order"
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              <Save size={16} />
              {editingEvent ? "Save Changes" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
