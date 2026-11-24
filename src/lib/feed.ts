import { XMLParser } from "fast-xml-parser";
import type { FeedSource } from "@/data/sources";
import type { TechItem } from "@/types/intelligence";
import { extractTopics, normalizeId, rankItem } from "@/lib/intelligence";

function asArray<T>(value: T | T[] | undefined): T[] {
  return value ? (Array.isArray(value) ? value : [value]) : [];
}

function text(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "#text" in value) return String((value as { "#text": unknown })["#text"] ?? "");
  return "";
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

export async function fetchFeed(source: FeedSource) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6500);
  try {
    const response = await fetch(source.url, {
      headers: { "User-Agent": "Signal-Tech-Intelligence/1.0" },
      signal: controller.signal,
      next: { revalidate: 900 },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const xml = await response.text();
    const parsed = new XMLParser({ ignoreAttributes: false }).parse(xml);
    const entries = asArray(parsed.rss?.channel?.item ?? parsed.feed?.entry) as Record<string, unknown>[];

    const items: TechItem[] = entries.slice(0, 8).map((entry) => {
      const rawLink = entry.link;
      const firstLink = Array.isArray(rawLink)
        ? rawLink.find((link) => typeof link === "object" && link !== null && ((link as Record<string, unknown>)["@_href"] || (link as Record<string, unknown>).href)) ?? rawLink[0]
        : rawLink;
      const linkObject = firstLink && typeof firstLink === "object" ? firstLink as Record<string, unknown> : null;
      const url = typeof rawLink === "string" ? rawLink : String(linkObject?.["@_href"] ?? linkObject?.href ?? text(firstLink) ?? "");
      const title = stripHtml(text(entry.title));
      const summary = stripHtml(text(entry.description ?? entry.summary ?? entry["content:encoded"] ?? "")).slice(0, 220);
      const dateValue = entry.pubDate ?? entry.published ?? entry.updated ?? entry["dc:date"];
      const parsedDate = dateValue ? new Date(text(dateValue)) : new Date();
      const publishedAt = Number.isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString();
      const topics = extractTopics(title, summary);
      const mergedTopics = topics.length ? topics : source.topics;

      return rankItem({
        id: normalizeId(url, title),
        title,
        url,
        source: source.name,
        publishedAt,
        summary,
        topics: mergedTopics.slice(0, 3),
      });
    }).filter((item) => item.title && item.url);

    return items;
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}
