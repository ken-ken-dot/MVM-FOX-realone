import { z } from "zod";

// ─── Quote Request ───
export const quoteRequestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  serviceId: z.string().min(1, "Please select a service"),
  location: z.string().optional(),
  description: z.string().min(10, "Please describe what you need (at least 10 characters)"),
  eventDate: z.string().optional(),
  guestCount: z.string().optional(),
  notes: z.string().max(500, "Notes must be 500 characters or fewer").optional(),
});

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;

// ─── Catering Request ───
export const cateringRequestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  companyName: z.string().optional(),
  packageName: z.string().optional(),
  eventTypeId: z.string().min(1, "Please select an event type"),
  guestCount: z.number().min(10, "Minimum 10 guests").max(10000, "Maximum 10,000 guests"),
  eventDate: z.string().min(1, "Please select a date"),
  location: z.string().min(1, "Please enter a location"),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type CateringRequestInput = z.infer<typeof cateringRequestSchema>;

// ─── Contact Form ───
export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  subject: z.string().min(3, "Please enter a subject"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactInput = z.infer<typeof contactSchema>;

// ─── Checkout ───
export const checkoutSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "ZIP code is required"),
  country: z.string().optional().default("US"),
  notes: z.string().max(500, "Notes must be 500 characters or fewer").optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

// ─── Product (Admin) ───
// A product cannot be published without at least one image.
// The imageCount field is injected by the admin form before validation.
export const productSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required"),
    shortDescription: z.string().min(1, "Short description is required"),
    description: z.string().min(1, "Description is required"),
    price: z.number().min(0.01, "Price must be positive"),
    compareAtPrice: z.number().optional(),
    sku: z.string().optional(),
    stock: z.number().min(0).default(0),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
    brandId: z.string().optional(),
    categoryId: z.string().optional(),
    isActive: z.boolean().default(true),
    imageCount: z.number().optional(),
  })
  .refine(
    (data) => {
      // If status is PUBLISHED, require at least one image
      if (data.status === "PUBLISHED" && (!data.imageCount || data.imageCount === 0)) {
        return false;
      }
      return true;
    },
    {
      message: "A product must have at least one image before it can be published. Upload an image or set status to Draft.",
      path: ["status"],
    }
  );

export type ProductInput = z.infer<typeof productSchema>;

// ─── Service (Admin) ───
export const serviceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  shortDescription: z.string().min(1, "Short description is required"),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().optional(),
  brandId: z.string().optional(),
  categoryId: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

// ─── Brand (Admin) ───
export const brandSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  tagline: z.string().optional(),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  coverImageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type BrandInput = z.infer<typeof brandSchema>;

// ─── User Login ───
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
