import type { Category } from "@/data/registry";

export interface ComparisonRow {
  label: string;
  subtrate: string;
  competitor: string;
}

export interface Comparison {
  slug: string;
  competitorName: string;
  competitorUrl: string;
  title: string;
  description: string;
  /** Our tool slugs this comparison covers, for cross-linking. */
  toolSlugs: string[];
  toolCategory: Category;
  h1: string;
  intro: string;
  rows: ComparisonRow[];
  subtrateEdge: string;
  competitorEdge: string;
  faqs: { q: string; a: string }[];
  /** ISO date the competitor facts below were checked against their live site. */
  checkedDate: string;
}

export const COMPARISONS: Comparison[] = [
  {
    slug: "subtrate-vs-tinypng",
    competitorName: "TinyPNG",
    competitorUrl: "https://tinypng.com/",
    title: "Subtrate vs TinyPNG — Which Free Image Compressor to Use?",
    description:
      "Subtrate vs TinyPNG compared: uploads, retention, free-tier limits, and formats for compressing, resizing, and converting images online.",
    toolSlugs: ["compress-image", "resize-image", "convert-image-format"],
    toolCategory: "image",
    h1: "Subtrate vs TinyPNG",
    intro:
      "TinyPNG is one of the most widely used image compressors, and it does a good job — but it works by uploading your file. Subtrate does the same compression, resizing, and format conversion locally in your browser, so the file never leaves your device in the first place.",
    rows: [
      {
        label: "Where images are processed",
        subtrate: "Entirely in your browser",
        competitor: "Uploaded to TinyPNG's servers",
      },
      {
        label: "File retention",
        subtrate: "Never uploaded, nothing to retain",
        competitor: "Kept up to 48 hours before deletion, per their own policy",
      },
      {
        label: "Free tier limits",
        subtrate: "No batch or file-size limit beyond your device's memory",
        competitor: "Up to 20 images per batch, 5 MB per image on the free tier",
      },
      {
        label: "Format conversion",
        subtrate: "JPG, PNG, WEBP (plus HEIC decoding)",
        competitor: "Free tier includes only 3 format conversions total",
      },
      {
        label: "Account required",
        subtrate: "No",
        competitor: "No for basic compression; yes for paid Web Pro/Ultra plans",
      },
    ],
    subtrateEdge:
      "For everyday compressing, resizing, and converting, Subtrate does the same job with no upload step, no 5 MB cap, and no 20-image batch ceiling — useful if you're processing a larger shoot or a personal photo you'd rather not send to a server, even one with a stated 48-hour deletion policy.",
    competitorEdge:
      "TinyPNG supports newer formats like JPEG XL and AVIF that Subtrate doesn't yet, and its server-side pipeline can squeeze slightly smaller files on some images since it isn't limited to what a browser's canvas API can do. If you need those specific formats or are optimizing images at production scale via their API, TinyPNG is the better fit.",
    faqs: [
      {
        q: "Does TinyPNG delete my images?",
        a: "TinyPNG states it retains uploaded images for up to 48 hours before deleting them. Subtrate never uploads the image at all, so there's nothing to retain or delete.",
      },
      {
        q: "Is TinyPNG free?",
        a: "Yes, for basic compression, but the free tier caps files at 5 MB and 20 images per batch, and format conversion is limited to 3 free conversions before a paid plan is required. Subtrate's compressor, resizer, and format converter have no such caps.",
      },
    ],
    checkedDate: "2026-09-21",
  },
  {
    slug: "subtrate-vs-cleanup-pictures",
    competitorName: "Cleanup.pictures",
    competitorUrl: "https://cleanup.pictures/",
    title: "Subtrate vs Cleanup.pictures — Free Watermark & Object Remover Compared",
    description:
      "Subtrate vs Cleanup.pictures compared: resolution limits, pricing, and where your photo is processed when removing a watermark or unwanted object.",
    toolSlugs: ["watermark-remover"],
    toolCategory: "image",
    h1: "Subtrate vs Cleanup.pictures",
    intro:
      "Cleanup.pictures (by Clipdrop/Stability AI) is a well-known AI object and watermark remover with a genuinely free tier. The main differences are resolution, price beyond the free cap, and where the image goes while it's processed.",
    rows: [
      {
        label: "Free resolution",
        subtrate: "Full resolution, no cap",
        competitor: "Capped at 720p on the free tier",
      },
      {
        label: "Beyond the free tier",
        subtrate: "Still free — there is no paid plan",
        competitor: "$3-5/month (Pro) for unlimited resolution",
      },
      {
        label: "Removal method",
        subtrate: "Telea inpainting, runs in a background thread on-device",
        competitor: "AI inpainting model, runs on Clipdrop's servers",
      },
      {
        label: "Account required",
        subtrate: "No",
        competitor: "Not required for the free tier",
      },
    ],
    subtrateEdge:
      "If you need to clean up a photo at its original resolution — not downsampled to 720p — without paying, Subtrate does that for free. Everything happens on-device, so a photo you'd rather not upload (an ID scan, a personal picture) never has to leave your browser.",
    competitorEdge:
      "Cleanup.pictures' AI model generally produces more convincing results on complex textures — busy backgrounds, people, detailed scenes — than inpainting-based removal, because it's been trained specifically for this. For a hard removal job on a full-resolution image where quality matters more than staying under 720p or avoiding a monthly fee, their Pro plan is the stronger tool.",
    faqs: [
      {
        q: "Is Cleanup.pictures free?",
        a: "Yes, with unlimited images at up to 720p resolution. Going beyond 720p requires their Pro plan, starting around $3/month billed annually.",
      },
      {
        q: "Which gives better results on a complex background?",
        a: "Cleanup.pictures' AI model tends to handle busy textures and detailed scenes better, since it's trained for exactly that. Subtrate's inpainting works best on thinner marks over fairly even backgrounds.",
      },
    ],
    checkedDate: "2026-09-21",
  },
  {
    slug: "subtrate-vs-passport-photo-online",
    competitorName: "Passport Photo Online",
    competitorUrl: "https://passport-photo.online/",
    title: "Subtrate vs Passport Photo Online — Free vs Paid Passport Photo Tools",
    description:
      "Subtrate vs Passport Photo Online compared: price, wait time, and privacy for cropping a photo to passport or visa size.",
    toolSlugs: ["passport-photo"],
    toolCategory: "image",
    h1: "Subtrate vs Passport Photo Online",
    intro:
      "Passport Photo Online uses AI to center your face and clean up the background, then sells you the result. Subtrate's Passport Photo Maker does the cropping and sizing for free, instantly, with no background removal — the trade-off for not charging anything or holding your photo for review.",
    rows: [
      {
        label: "Price",
        subtrate: "Free",
        competitor: "$16.95 for a digital photo, $19.95 printed",
      },
      {
        label: "Turnaround",
        subtrate: "Instant, download immediately",
        competitor: "Digital download after ~2-3 business days of manual verification",
      },
      {
        label: "Background handling",
        subtrate: "Manual — shoot against a plain background",
        competitor: "AI background cleanup included",
      },
      {
        label: "Where the photo goes",
        subtrate: "Never leaves your browser",
        competitor: "Uploaded for AI processing and human verification",
      },
      {
        label: "Print sheet",
        subtrate: "Free 4×6 in print sheet included",
        competitor: "Paid print option available",
      },
    ],
    subtrateEdge:
      "If you can take a decent front-facing photo against a plain background, Subtrate gets you a correctly sized passport photo — including the file-size cap many application portals enforce — for free and in seconds, with nothing uploaded or held for review.",
    competitorEdge:
      "If your background isn't clean or you'd rather not reshoot, Passport Photo Online's AI background removal and human verification step catches sizing mistakes before you submit to an embassy or passport office — worth the fee if a rejected application would cost you more in time than $17.",
    faqs: [
      {
        q: "Why does Passport Photo Online take days to deliver?",
        a: "It includes a manual verification step by a human reviewer before the digital photo is released, which is where the 2-3 business day turnaround comes from.",
      },
      {
        q: "Does Subtrate remove the background automatically?",
        a: "No — Subtrate only crops and resizes. Take the photo against a plain, light background for the best result, since automatic background removal isn't included.",
      },
    ],
    checkedDate: "2026-09-21",
  },
  {
    slug: "subtrate-vs-ilovepdf",
    competitorName: "iLovePDF",
    competitorUrl: "https://www.ilovepdf.com/",
    title: "Subtrate vs iLovePDF — Which Free PDF Tool Should You Use?",
    description:
      "Subtrate vs iLovePDF compared: uploads, file-size limits, task limits, price, and privacy. See which free PDF tool fits merging, splitting, and compressing PDFs.",
    toolSlugs: ["merge-pdf", "split-pdf", "compress-pdf"],
    toolCategory: "pdf",
    h1: "Subtrate vs iLovePDF",
    intro:
      'Both let you merge, split, and compress PDFs for free in a browser. The difference is where the file goes while that happens, and what "free" actually includes.',
    rows: [
      {
        label: "Where files are processed",
        subtrate: "Entirely in your browser",
        competitor: "Uploaded to iLovePDF's servers",
      },
      {
        label: "Account required",
        subtrate: "No",
        competitor: "No for basic use, yes for saved history/extras",
      },
      {
        label: "Free tier limits",
        subtrate: "No task limits, no file-size cap beyond your device's memory",
        competitor: "Per-tool file-size caps and limited tasks per hour on the free plan",
      },
      {
        label: "Paid plan",
        subtrate: "None — everything is free",
        competitor:
          "Premium subscription for unlimited tasks, larger files, and an ad-free experience",
      },
      {
        label: "Watermarks",
        subtrate: "Never",
        competitor: "Not applied on standard operations",
      },
    ],
    subtrateEdge:
      "iLovePDF is a capable tool, and its free tier covers most one-off jobs. But every file you process leaves your device and sits on a third-party server while it's converted — fine for a public document, worth a second thought for a contract, ID scan, or medical record. Subtrate runs the same operations locally with no upload step and no per-tool task limit.",
    competitorEdge:
      "iLovePDF supports more PDF operations overall (e-signing, OCR, PDF editing, format conversions beyond images) and offers mobile apps and cloud-storage integrations that a browser-only tool doesn't try to replicate. For merging, splitting, and compressing — the core, everyday PDF tasks — the two produce the same result; the difference is privacy and whether you hit a limit.",
    faqs: [
      {
        q: "Does iLovePDF upload my files to a server?",
        a: "Yes. iLovePDF processes files on its own servers, including regional processing options on its paid plan. Subtrate processes every file locally in your browser — nothing is ever uploaded.",
      },
      {
        q: "Is iLovePDF free?",
        a: "iLovePDF has a free tier, but it caps file size and the number of tasks per tool, and pushes a paid subscription for unlimited use, larger files, and an ad-free experience. Subtrate's tools are free with no task limits, no account, and no paid tier.",
      },
      {
        q: "Which is better for merging or splitting PDFs?",
        a: "For occasional use, both work. If you'd rather not upload a contract, ID, or personal document to a third-party server, or you don't want to hit a free-tier task limit, Subtrate's browser-based merge and split tools do the same job locally with no account and no cap.",
      },
    ],
    checkedDate: "2026-09-21",
  },
  {
    slug: "subtrate-vs-wordcounter",
    competitorName: "WordCounter.net",
    competitorUrl: "https://www.wordcounter.net/",
    title: "Subtrate vs WordCounter.net — Free Word Counter Compared",
    description:
      "Subtrate vs WordCounter.net compared: features, account requirements, and where your draft is stored when counting words and checking readability.",
    toolSlugs: ["word-counter"],
    toolCategory: "text",
    h1: "Subtrate vs WordCounter.net",
    intro:
      "WordCounter.net is a long-running, feature-rich word counter with extras like grammar checking and a thesaurus. Subtrate's Word Counter is narrower by design — word/character counts, readability, reading time, and keyword density — and never needs an account to save your draft.",
    rows: [
      {
        label: "Core counting features",
        subtrate: "Words, characters, readability, reading time, keyword density",
        competitor: "Same, plus grammar/spell check and thesaurus via Grammarly integration",
      },
      {
        label: "Draft autosave",
        subtrate: "Saved to your browser's local storage automatically",
        competitor: "Requires a free account; saved to WordCounter's servers",
      },
      {
        label: "Account required",
        subtrate: "Never",
        competitor: "Only for autosave, writing goals, and premium extras",
      },
      {
        label: "Where your text goes",
        subtrate: "Never leaves your browser",
        competitor: "Sent to their server if you use document upload or account features",
      },
    ],
    subtrateEdge:
      "If you just want live word, character, and readability stats on something you're drafting privately — without creating an account or uploading a document — Subtrate does that and autosaves locally to this browser, not to a server.",
    competitorEdge:
      "WordCounter.net's Grammarly-powered grammar and plagiarism checking, plus a built-in thesaurus, go well beyond counting — genuinely useful if you're polishing something for publication and want more than stats. That depth is the trade-off for creating an account.",
    faqs: [
      {
        q: "Does WordCounter.net save my text automatically?",
        a: "Only if you create a free account — otherwise nothing is saved. Subtrate autosaves your draft to this browser's local storage without any account, though that also means it's not synced across devices.",
      },
      {
        q: "Which has more features?",
        a: "WordCounter.net, if you count grammar checking, a thesaurus, and plagiarism detection. Subtrate stays focused on counting and readability stats with nothing sent to a server.",
      },
    ],
    checkedDate: "2026-09-21",
  },
  {
    slug: "subtrate-vs-diffchecker",
    competitorName: "Diffchecker",
    competitorUrl: "https://www.diffchecker.com/",
    title: "Subtrate vs Diffchecker — Free Text Comparison Tools",
    description:
      "Subtrate vs Diffchecker compared: comparison modes, pricing, and features for spotting what changed between two blocks of text.",
    toolSlugs: ["text-compare"],
    toolCategory: "text",
    h1: "Subtrate vs Diffchecker",
    intro:
      "Diffchecker is a well-established diff tool that, like Subtrate, runs its basic comparison in your browser rather than uploading text to a server. The two are closer on privacy than most comparisons on this site — the real differences are feature depth and what's gated behind a paid plan.",
    rows: [
      {
        label: "Where comparison runs",
        subtrate: "In your browser",
        competitor: "In your browser (per their own stated policy)",
      },
      {
        label: "Comparison modes",
        subtrate: "Word, line, and character",
        competitor: "Side-by-side, plus unified/word/character precision on Pro",
      },
      {
        label: "Account required",
        subtrate: "Never",
        competitor: "No for basic comparing; yes to save, share, or upgrade",
      },
      {
        label: "Similarity score",
        subtrate: "Shown for every comparison",
        competitor: "Not a core feature",
      },
    ],
    subtrateEdge:
      "Diffchecker's free tier is genuinely solid and also client-side — the edge here is narrower than most. Subtrate includes a similarity score by default and needs no account for any of its three comparison modes, where Diffchecker gates unified view and character-level precision behind Pro.",
    competitorEdge:
      "Diffchecker has a much larger surface: file upload and comparison, a desktop app for fully offline use, merge functionality, and syntax-highlighted code diffing. If you're comparing code files or need an offline desktop tool, Diffchecker's ecosystem goes further than a single browser-based text tool.",
    faqs: [
      {
        q: "Is Diffchecker private?",
        a: "Diffchecker states its browser-based comparison runs client-side and isn't published or shared, similar to Subtrate. It also offers a desktop app for fully offline comparison.",
      },
      {
        q: "What's gated behind Diffchecker Pro?",
        a: "Unified view, word/character-level precision, syntax highlighting, real-time editing, and merging changes are free to try but unlimited only on their paid Pro plan. Subtrate's three comparison modes are all free with no cap.",
      },
    ],
    checkedDate: "2026-09-21",
  },
  {
    slug: "subtrate-vs-convertcase",
    competitorName: "ConvertCase.net",
    competitorUrl: "https://convertcase.net/",
    title: "Subtrate vs ConvertCase.net — Free Text Case Converters",
    description:
      "Subtrate vs ConvertCase.net compared: which case conversions each tool offers, and what's needed to use them.",
    toolSlugs: ["case-converter"],
    toolCategory: "text",
    h1: "Subtrate vs ConvertCase.net",
    intro:
      "ConvertCase.net covers a much wider range of text effects than a typical case converter — including novelty formats like upside-down and zalgo text. Subtrate's Case Converter sticks to the cases people actually need for writing and code.",
    rows: [
      {
        label: "Standard cases",
        subtrate: "UPPERCASE, lowercase, Title Case, camelCase, snake_case",
        competitor: "Sentence, lower, UPPER, Capitalized, aLtErNaTiNg, Title Case",
      },
      {
        label: "Novelty effects",
        subtrate: "Not offered",
        competitor: "Strikethrough, upside-down, zalgo, mirror, invisible text, and more",
      },
      {
        label: "Smart Title Case",
        subtrate: 'Keeps small words ("and", "of", "the") lowercase automatically',
        competitor: "Title Case option available",
      },
      {
        label: "Account required",
        subtrate: "Never",
        competitor: "Not required",
      },
    ],
    subtrateEdge:
      "For the cases developers and writers actually reach for — especially camelCase and snake_case for naming variables, which ConvertCase doesn't offer — Subtrate's converter is faster to use with no extra clutter.",
    competitorEdge:
      "ConvertCase.net is the better choice if you specifically want the novelty text effects — zalgo, upside-down, mirrored, wingdings — for social media captions or messages. Subtrate deliberately doesn't cover that territory.",
    faqs: [
      {
        q: "Does ConvertCase.net do camelCase or snake_case?",
        a: "No — its case list focuses on sentence, title, and novelty text effects rather than programming naming conventions. Subtrate includes both camelCase and snake_case specifically for that use case.",
      },
      {
        q: "Which has more text effects overall?",
        a: "ConvertCase.net, by a wide margin — it includes binary, morse code, wingdings, zalgo, and several other novelty conversions Subtrate doesn't attempt.",
      },
    ],
    checkedDate: "2026-09-21",
  },
  {
    slug: "subtrate-vs-codebeautify",
    competitorName: "CodeBeautify",
    competitorUrl: "https://codebeautify.org/",
    title: "Subtrate vs CodeBeautify — JSON, Base64, URL & Hash Tools Compared",
    description:
      "Subtrate vs CodeBeautify compared: JSON formatting, JSON diff, Base64, URL encoding, and hash generation — one focused tool per page vs one crowded multi-tool site.",
    toolSlugs: [
      "json-formatter",
      "json-diff",
      "base64-encode-decode",
      "url-encode-decode",
      "hash-generator",
    ],
    toolCategory: "developer",
    h1: "Subtrate vs CodeBeautify",
    intro:
      "CodeBeautify bundles dozens of developer utilities — including JSON formatting and diffing, Base64 and URL encoding, and hash generation — into one ad-supported site. Subtrate covers the same core tools as separate, focused pages with no ads and no bundled clutter.",
    rows: [
      {
        label: "Tool layout",
        subtrate: "One focused tool per page",
        competitor: "Dozens of tools on one dense, ad-supported site",
      },
      {
        label: "JSON formatter error location",
        subtrate: "Exact line and position on invalid JSON",
        competitor: "Formatting and validation included",
      },
      {
        label: "JSON diff key-order handling",
        subtrate: "Keys sorted first, so reordering isn't flagged as a change",
        competitor: "JSON Diff tool included",
      },
      {
        label: "UTF-8 safe Base64",
        subtrate: "Yes — emoji and accents encode/decode correctly",
        competitor: "Multiple Base64 variants offered (image, JSON, XML, hex)",
      },
      {
        label: "Ads",
        subtrate: "None",
        competitor: "Ad-supported",
      },
    ],
    subtrateEdge:
      "If you want one of these tools without ads, without dozens of unrelated utilities competing for space on the page, and without wondering what happens to the data you paste, Subtrate's single-purpose pages are the more focused option — and everything runs in your browser rather than depending on a server round-trip.",
    competitorEdge:
      "CodeBeautify's breadth is real: if you need an XML formatter, a CSV converter, an HMAC generator, or a dozen other utilities beyond what Subtrate covers, having them all on one site with a consistent interface is genuinely convenient for a developer bouncing between formats.",
    faqs: [
      {
        q: "Does CodeBeautify process data locally or upload it?",
        a: "CodeBeautify doesn't publish clear technical details on this. Subtrate's tools are all built to run entirely in the browser's own JavaScript engine — nothing is transmitted, by design.",
      },
      {
        q: "Which has more tools overall?",
        a: "CodeBeautify, by a large margin — it bundles dozens of format converters and utilities beyond what Subtrate's developer category covers. Subtrate trades that breadth for a focused, ad-free page per tool.",
      },
    ],
    checkedDate: "2026-09-21",
  },
  {
    slug: "subtrate-vs-regex101",
    competitorName: "regex101",
    competitorUrl: "https://regex101.com/",
    title: "Subtrate vs regex101 — Free Regex Testers Compared",
    description:
      "Subtrate vs regex101 compared: regex flavor, explanation panel, saved libraries, and which fits testing a JavaScript regular expression.",
    toolSlugs: ["regex-tester"],
    toolCategory: "developer",
    h1: "Subtrate vs regex101",
    intro:
      "regex101 is the most feature-rich regex tester around, with a live explanation panel and a saved regex library. The one thing to know before using it for JavaScript work: its default flavor is PCRE2 (PHP), not JavaScript — Subtrate tests against the browser's own JavaScript RegExp engine specifically.",
    rows: [
      {
        label: "Default regex flavor",
        subtrate: "JavaScript (ECMAScript) — matches your browser's native RegExp exactly",
        competitor: "PCRE2 (PHP) by default; other flavors selectable",
      },
      {
        label: "Live explanation panel",
        subtrate: "Not included",
        competitor: "Auto-generated as you type",
      },
      {
        label: "Saved regex library",
        subtrate: "Not included",
        competitor: "Available with an account",
      },
      {
        label: "Account required",
        subtrate: "Never",
        competitor: "Not required for basic testing; needed to save/share",
      },
    ],
    subtrateEdge:
      "If you're testing a regex that will actually run in JavaScript — a `new RegExp()` call, a `.match()`, a form validator — Subtrate's tester uses the exact same engine, so what matches here is what matches in your code. Flavors differ enough (lookbehind support, named groups, flag behavior) that a pattern tested against PCRE2 can behave differently once it hits JavaScript.",
    competitorEdge:
      "For learning regex or debugging a complex pattern, regex101's auto-generated explanation panel and saved library are genuinely hard to beat — nothing on Subtrate attempts that. If your target language isn't JavaScript, switching regex101's flavor selector gets you an accurate test for PHP, Python, Java, and others in one place.",
    faqs: [
      {
        q: "What regex flavor does regex101 use by default?",
        a: "PCRE2 (PHP), with other flavors like Python, Java, and JavaScript selectable from a dropdown. Subtrate's tester always uses the browser's native JavaScript RegExp engine, since that's the flavor most web developers actually need to match.",
      },
      {
        q: "Does regex101 explain what a pattern does?",
        a: "Yes — it auto-generates a plain-English explanation of the regex as you type, a feature Subtrate doesn't include.",
      },
    ],
    checkedDate: "2026-09-21",
  },
  {
    slug: "subtrate-vs-jwt-io",
    competitorName: "jwt.io",
    competitorUrl: "https://jwt.io/",
    title: "Subtrate vs jwt.io — Free JWT Decoders Compared",
    description:
      "Subtrate vs jwt.io compared: decoding, signature verification, and what to consider before pasting a real token into either tool.",
    toolSlugs: ["jwt-decoder"],
    toolCategory: "developer",
    h1: "Subtrate vs jwt.io",
    intro:
      "jwt.io, run by Auth0/Okta, is the de facto standard JWT debugger and states its decoding runs client-side. Subtrate's JWT Decoder does the same decode-only job with a narrower feature set and no signature verification.",
    rows: [
      {
        label: "Decoding",
        subtrate: "Header and payload, plus expiry check",
        competitor: "Header, payload, and full debugger view",
      },
      {
        label: "Signature verification",
        subtrate: "Not offered — decode only",
        competitor: "Yes, if you paste in the signing secret or public key",
      },
      {
        label: "Run by",
        subtrate: "Independent tool site",
        competitor: "Auth0/Okta",
      },
      {
        label: "Account required",
        subtrate: "Never",
        competitor: "Not required for the debugger",
      },
    ],
    subtrateEdge:
      "For a quick look at what claims a token carries — without the option to verify a signature at all — Subtrate is a narrower, single-purpose tool. Because it never asks for or accepts a signing secret, there's no version of the workflow where you'd paste a key into it.",
    competitorEdge:
      "jwt.io's signature verification is genuinely useful when you control both the token and the key and want to confirm a JWT is valid, not just readable. Some teams still avoid pasting a real production secret into any third-party site regardless of what it claims about local processing — a reasonable caution either way — but for that specific verification workflow, jwt.io does something Subtrate deliberately doesn't offer.",
    faqs: [
      {
        q: "Does jwt.io verify JWT signatures?",
        a: "Yes, if you provide the secret or public key used to sign the token. Subtrate's decoder only reads the header and payload — it has no signature verification feature at all.",
      },
      {
        q: "Is it safe to paste a real token into either tool?",
        a: "Both claim to decode client-side. For a token whose payload contains sensitive claims, or if you're asked to enter a real signing secret anywhere, it's reasonable to be cautious regardless of what any third-party site states about its processing.",
      },
    ],
    checkedDate: "2026-09-21",
  },
  {
    slug: "subtrate-vs-epochconverter",
    competitorName: "Epoch Converter",
    competitorUrl: "https://www.epochconverter.com/",
    title: "Subtrate vs Epoch Converter — Unix Timestamp Tools Compared",
    description:
      "Subtrate vs Epoch Converter compared: timezone handling, batch conversion, and code snippets for converting Unix timestamps to dates.",
    toolSlugs: ["timestamp-converter"],
    toolCategory: "developer",
    h1: "Subtrate vs Epoch Converter",
    intro:
      "Epoch Converter has been the standard reference for Unix timestamp conversion for years, with deep coverage of edge cases like GPS and NTP time. Subtrate's Timestamp Converter handles the everyday case — seconds/milliseconds, local/UTC/ISO 8601 — in a simpler interface.",
    rows: [
      {
        label: "Core conversion",
        subtrate: "Seconds and milliseconds, local/UTC/ISO 8601",
        competitor: "Seconds, milliseconds, microseconds, and nanoseconds",
      },
      {
        label: "Specialized formats",
        subtrate: "Not covered",
        competitor: "GPS time, NTP time, Excel date formats",
      },
      {
        label: "Code snippets",
        subtrate: "Not included",
        competitor: "Example code across many programming languages",
      },
      {
        label: "Account required",
        subtrate: "Never",
        competitor: "Not required",
      },
    ],
    subtrateEdge:
      "For the everyday task — pasting in a timestamp from a log or API response and getting a readable date, or the reverse — Subtrate's simpler interface gets there in one screen with no unrelated tools competing for attention.",
    competitorEdge:
      "Epoch Converter's depth is real: GPS/NTP time formats, Excel date serial numbers, and ready-made code snippets in dozens of languages go well beyond what a general-purpose converter needs to cover. For an edge case outside plain Unix seconds/milliseconds, it's the more complete reference.",
    faqs: [
      {
        q: "Does Epoch Converter handle milliseconds?",
        a: "Yes — it supports seconds, milliseconds, microseconds, and even nanoseconds. Subtrate's converter covers seconds and milliseconds, the two you'll encounter in almost all everyday API and log timestamps.",
      },
      {
        q: "Which is better for a quick one-off conversion?",
        a: "Both work well for that. Subtrate's single-purpose page has less on screen if you just need one timestamp converted right now.",
      },
    ],
    checkedDate: "2026-09-21",
  },
  {
    slug: "subtrate-vs-uuidgenerator-net",
    competitorName: "UUIDGenerator.net",
    competitorUrl: "https://www.uuidgenerator.net/",
    title: "Subtrate vs UUIDGenerator.net — Free UUID Generators Compared",
    description:
      "Subtrate vs UUIDGenerator.net compared: UUID versions supported, randomness source, and bulk generation.",
    toolSlugs: ["uuid-generator"],
    toolCategory: "generator",
    h1: "Subtrate vs UUIDGenerator.net",
    intro:
      "UUIDGenerator.net supports a wider range of UUID versions than Subtrate's generator, including v1 and the newer time-ordered v7. Subtrate focuses on v4 — the version almost everyone actually needs — generated with the browser's own cryptographic randomness.",
    rows: [
      {
        label: "UUID versions",
        subtrate: "v4 only",
        competitor: "v1, v4, v7, and nil/empty UUIDs",
      },
      {
        label: "Randomness source",
        subtrate: "crypto.randomUUID / crypto.getRandomValues (browser-native)",
        competitor: 'Described as "a secure random number generator"; implementation undisclosed',
      },
      {
        label: "Bulk generation",
        subtrate: "Slider-based, generate many at once, formatted to spec",
        competitor: "Bulk v4 generation with file download",
      },
      {
        label: "Account required",
        subtrate: "Never",
        competitor: "Not required",
      },
    ],
    subtrateEdge:
      "Subtrate names its exact randomness source — the browser's own `crypto.randomUUID` API — so it's verifiable rather than taken on trust, and generation happens in memory on your device with nothing sent anywhere.",
    competitorEdge:
      "If you specifically need a v1 (timestamp+MAC-based) or v7 (time-ordered, increasingly used for database primary keys) UUID, UUIDGenerator.net supports those versions where Subtrate currently only generates v4.",
    faqs: [
      {
        q: "Does Subtrate generate v7 UUIDs?",
        a: "Not currently — only v4, the fully-random version most applications use for IDs and tokens. UUIDGenerator.net also supports v1 and the newer time-ordered v7.",
      },
      {
        q: "Which one is more transparent about randomness?",
        a: "Subtrate specifically uses the browser's `crypto.randomUUID` (or `crypto.getRandomValues` as a fallback) — a documented, auditable standard API. UUIDGenerator.net describes its generator as secure but doesn't specify the exact implementation.",
      },
    ],
    checkedDate: "2026-09-21",
  },
  {
    slug: "subtrate-vs-the-qr-code-generator",
    competitorName: "The QR Code Generator",
    competitorUrl: "https://www.the-qrcode-generator.com/",
    title: "Subtrate vs The QR Code Generator — Static vs Dynamic QR Codes",
    description:
      "Subtrate vs The QR Code Generator compared: static vs trackable dynamic QR codes, free-tier limits, and which to use for printed material.",
    toolSlugs: ["qr-code-generator"],
    toolCategory: "generator",
    h1: "Subtrate vs The QR Code Generator",
    intro:
      "The QR Code Generator's free tier gives unlimited static codes plus two lifetime dynamic (trackable, editable) codes before it pushes a paid plan. Subtrate only makes static codes — the kind that can't break later because a subscription lapsed — and never tracks who scans them.",
    rows: [
      {
        label: "Static codes",
        subtrate: "Unlimited, free, never expire",
        competitor: "Unlimited on the free tier, don't expire",
      },
      {
        label: "Dynamic (editable/trackable) codes",
        subtrate: "Not offered — Subtrate only makes static codes",
        competitor: "2 free for life, more requires a paid plan",
      },
      {
        label: "Scan tracking",
        subtrate: "Never — no server sees a scan",
        competitor: "Available on dynamic codes",
      },
      {
        label: "Account required",
        subtrate: "Never",
        competitor: "Not stated as required for static codes",
      },
    ],
    subtrateEdge:
      "For printed material — a flyer, menu, or business card — a code that can quietly stop working because a subscription lapsed is a real risk. Subtrate's codes encode your data directly with no redirect and no account tied to them, so there's nothing to expire.",
    competitorEdge:
      "If you actually want to edit where a QR code points after printing it, or see how many times it's been scanned, that requires a dynamic code by definition — something only a service with an account and a redirect layer, like The QR Code Generator, can offer. Subtrate doesn't and won't offer this, since it would mean routing scans through a server.",
    faqs: [
      {
        q: "What's the difference between a static and dynamic QR code?",
        a: "A static code encodes your data (a URL, text, Wi-Fi details) directly and can never be changed or tracked. A dynamic code points to a redirect URL the provider controls, so they can change the destination or track scans later — but that also means the code depends on their service staying active.",
      },
      {
        q: "Can Subtrate make trackable QR codes?",
        a: "No, by design — that would require routing every scan through a server. Subtrate only generates static codes.",
      },
    ],
    checkedDate: "2026-09-21",
  },
  {
    slug: "subtrate-vs-bitwarden",
    competitorName: "Bitwarden Password Generator",
    competitorUrl: "https://bitwarden.com/password-generator/",
    title: "Subtrate vs Bitwarden Password Generator — Both Private, What's Different",
    description:
      "Subtrate vs Bitwarden's password generator compared: both run locally and never send your password anywhere — see how the rest of the feature set differs.",
    toolSlugs: ["password-generator"],
    toolCategory: "generator",
    h1: "Subtrate vs Bitwarden Password Generator",
    intro:
      "Bitwarden's generator is one of the few competitors on this list that's also genuinely private — it states passwords are generated locally and never touch Bitwarden's servers, backed by Bitwarden's open-source codebase. The comparison here isn't about privacy; it's about what surrounds the generator.",
    rows: [
      {
        label: "Where passwords are generated",
        subtrate: "Locally, using crypto.getRandomValues",
        competitor: "Locally, per Bitwarden's own stated policy",
      },
      {
        label: "Open source",
        subtrate: "No",
        competitor: "Yes — Bitwarden's full codebase is public",
      },
      {
        label: "Length range",
        subtrate: "Slider-based, common lengths",
        competitor: "5 to 128 characters",
      },
      {
        label: "Passphrase mode",
        subtrate: "Not offered — random character passwords only",
        competitor: "Yes — dictionary-word passphrases with dashes",
      },
      {
        label: "Account required",
        subtrate: "Never",
        competitor: "Not required to generate; needed to save/autofill",
      },
    ],
    subtrateEdge:
      "If you just want a password generated and copied with nothing else attached — no account prompt, no password manager ecosystem to consider — Subtrate is the more standalone tool for a one-off password.",
    competitorEdge:
      "Bitwarden's generator is a genuinely fair, transparent competitor: it's open source, so its randomness and \"never touches our servers\" claim can actually be verified in the code rather than taken on faith. It also offers a passphrase mode, and generating the password inside Bitwarden makes sense if you're already using it to store and autofill passwords.",
    faqs: [
      {
        q: "Is Bitwarden's password generator actually private?",
        a: "By its own claim and because Bitwarden is open source, yes — the generation logic runs client-side and is auditable in their public codebase. That's a stronger transparency claim than most tools on this page can make, Subtrate included, since Subtrate's source isn't published.",
      },
      {
        q: "Why choose Subtrate over Bitwarden's generator?",
        a: "Mainly if you don't want any password-manager context attached to the action — just a password generated and copied, nothing to sign up for or sync.",
      },
    ],
    checkedDate: "2026-09-21",
  },
  {
    slug: "subtrate-vs-content-credentials-verify",
    competitorName: "Content Credentials Verify",
    competitorUrl: "https://verify.contentauthenticity.org/",
    title: "Subtrate vs Content Credentials Verify — Detect & Remove AI Image Metadata",
    description:
      "Subtrate vs Content Credentials Verify compared: which tool actually detects AI-generated images and which can also strip the metadata footprint, not just view it.",
    toolSlugs: ["ai-image-metadata"],
    toolCategory: "ai",
    h1: "Subtrate vs Content Credentials Verify",
    intro:
      "Content Credentials Verify is the official viewer from the Content Authenticity Initiative — the Adobe-led coalition behind the C2PA standard now used by Google, OpenAI, and Microsoft to label AI content. It's the most authoritative name for checking Content Credentials, but it's read-only and only sees one specific signature type. Subtrate's AI Image Metadata Cleaner detects a wider range of AI footprints and can actually remove them.",
    rows: [
      {
        label: "What it does",
        subtrate: "Detects the AI footprint and removes it",
        competitor: "Verifies and displays C2PA Content Credentials only",
      },
      {
        label: "Detects Stable Diffusion / ComfyUI prompts",
        subtrate: "Yes — reads the PNG text chunks those tools write",
        competitor: "No — only reads C2PA Content Credentials, a different signature",
      },
      {
        label: "Removes the metadata",
        subtrate: "Yes — downloads a clean, pixel-identical copy",
        competitor: "No removal feature — verification only",
      },
      {
        label: "Batch processing",
        subtrate: "Any number of files, download individually or as a ZIP",
        competitor: "Designed for one file at a time",
      },
      {
        label: "Run by",
        subtrate: "Independent tool site",
        competitor: "Content Authenticity Initiative (Adobe-led C2PA coalition)",
      },
      {
        label: "Account required",
        subtrate: "Never",
        competitor: "Not required",
      },
    ],
    subtrateEdge:
      "Most AI generators don't use C2PA at all — Stable Diffusion WebUI and ComfyUI write the full prompt and model name directly into PNG text chunks instead, which Content Credentials Verify can't read since that's not the signature it checks for. Subtrate detects both kinds of footprint, and unlike a verifier, it can actually strip what it finds — a step Content Credentials Verify doesn't offer at all.",
    competitorEdge:
      "For an image that does carry genuine C2PA Content Credentials — increasingly common from Adobe Firefly, DALL·E, and Google's models — Content Credentials Verify is the authoritative way to inspect it: it's built and maintained by the same coalition that defined the C2PA standard, and can show the full edit history and cryptographic chain of custody, which Subtrate reads but doesn't cryptographically verify.",
    faqs: [
      {
        q: "Does Content Credentials Verify remove AI metadata from an image?",
        a: "No — it's a read-only verifier. It shows you what Content Credentials are attached to a file if they exist, but there's no option to strip them. Subtrate is built specifically to remove what it detects.",
      },
      {
        q: "Does Content Credentials Verify catch Stable Diffusion or ComfyUI images?",
        a: "Only if the image separately carries C2PA Content Credentials, which those open-source tools don't add by default. Their actual fingerprint — prompt and model name written into PNG text chunks — is a different kind of metadata that a C2PA-only verifier isn't built to read.",
      },
      {
        q: "Which is more trustworthy for verifying Content Credentials specifically?",
        a: "Content Credentials Verify, without question — it's the reference implementation from the coalition (Adobe, Google, Microsoft, OpenAI, and others) that created the C2PA standard. Subtrate reads the same metadata blocks but doesn't perform cryptographic signature verification the way the official verifier does.",
      },
    ],
    checkedDate: "2026-09-21",
  },
];

export function getComparison(slug: string): Comparison | undefined {
  return COMPARISONS.find((c) => c.slug === slug);
}

export function getComparisonsForTool(toolSlug: string): Comparison[] {
  return COMPARISONS.filter((c) => c.toolSlugs.includes(toolSlug));
}

export function getComparisonsForCategory(category: Category): Comparison[] {
  return COMPARISONS.filter((c) => c.toolCategory === category);
}
