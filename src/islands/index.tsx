import { lazy, Suspense, type ComponentType } from "react";
import { ClientOnly } from "@tanstack/react-router";

const MAP: Record<string, () => Promise<{ default: ComponentType }>> = {
  "case-converter": () => import("@/islands/CaseConverter"),
  "text-compare": () => import("@/islands/TextCompare"),
  "word-counter": () => import("@/islands/WordCounter"),
  "base64-encode-decode": () => import("@/islands/Base64Tool"),
  "json-formatter": () => import("@/islands/JsonFormatter"),
  "json-diff": () => import("@/islands/JsonDiff"),
  "regex-tester": () => import("@/islands/RegexTester"),
  "password-generator": () => import("@/islands/PasswordGenerator"),
  "qr-code-generator": () => import("@/islands/QrCodeGenerator"),
  "compress-image": () => import("@/islands/ImageCompressor"),
  "resize-image": () => import("@/islands/ImageResizer"),
  "convert-image-format": () => import("@/islands/ImageConverter"),
  "merge-pdf": () => import("@/islands/MergePdf"),
  "split-pdf": () => import("@/islands/SplitPdf"),
  "compress-pdf": () => import("@/islands/CompressPdf"),
  "url-encode-decode": () => import("@/islands/UrlEncoderTool"),
  "jwt-decoder": () => import("@/islands/JwtDecoderTool"),
  "uuid-generator": () => import("@/islands/UuidGeneratorTool"),
  "hash-generator": () => import("@/islands/HashGeneratorTool"),
  "timestamp-converter": () => import("@/islands/TimestampConverterTool"),
  "passport-photo": () => import("@/islands/PassportPhotoTool"),
};

const cache = new Map<string, ComponentType>();

function getComponent(slug: string): ComponentType | null {
  if (!MAP[slug]) return null;
  if (!cache.has(slug)) cache.set(slug, lazy(MAP[slug]));
  return cache.get(slug)!;
}

function Fallback() {
  return (
    <div
      className="card"
      style={{
        minHeight: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--muted)",
      }}
    >
      Loading tool…
    </div>
  );
}

export function ToolIsland({ slug }: { slug: string }) {
  const Comp = getComponent(slug);
  if (!Comp) return null;
  return (
    <ClientOnly fallback={<Fallback />}>
      <Suspense fallback={<Fallback />}>
        <Comp />
      </Suspense>
    </ClientOnly>
  );
}
