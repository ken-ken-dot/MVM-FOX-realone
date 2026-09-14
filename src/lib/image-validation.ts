/**
 * MVM FOX — Image URL Validation Utility
 *
 * Validates that image URLs are resolvable via HTTP HEAD requests.
 * Used by the product API routes and seed script to prevent
 * broken image references from being persisted.
 */

import https from "https";
import http from "http";

/**
 * Check if a URL returns a successful HTTP status (2xx or 3xx).
 * Returns { ok, status, reason }.
 */
export function checkImageUrl(
  url: string,
  timeoutMs = 10000,
): Promise<{ ok: boolean; status: number; reason: string }> {
  return new Promise((resolve) => {
    if (!url || !url.startsWith("http")) {
      resolve({
        ok: false,
        status: 0,
        reason: url ? "Not an HTTP(S) URL" : "URL is empty or null",
      });
      return;
    }
    const lib = url.startsWith("https") ? https : http;
    const req = lib.request(
      url,
      { method: "HEAD", timeout: timeoutMs },
      (res) => {
        resolve({
          ok: res.statusCode !== undefined && res.statusCode >= 200 && res.statusCode < 400,
          status: res.statusCode ?? 0,
          reason: "",
        });
      },
    );
    req.on("timeout", () => {
      req.destroy();
      resolve({ ok: false, status: 0, reason: "Request timed out" });
    });
    req.on("error", (e) => {
      resolve({ ok: false, status: 0, reason: e.message });
    });
    req.end();
  });
}

/**
 * Validate an array of image URLs and return the broken ones.
 * Used by the seed script to validate all IMG constants before persisting.
 */
export async function validateImageUrls(
  urls: string[],
): Promise<{ total: number; broken: number; failures: { url: string; status: number; reason: string }[] }> {
  const results = await Promise.all(
    urls.map(async (url) => {
      const check = await checkImageUrl(url);
      return { url, ...check };
    }),
  );
  const failures = results.filter((r) => !r.ok);
  return { total: results.length, broken: failures.length, failures };
}
