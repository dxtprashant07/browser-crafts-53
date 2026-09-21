export type Category = "image" | "pdf" | "text" | "developer" | "generator" | "ai";

export interface Tool {
  slug: string;
  name: string;
  category: Category;
  shortDesc: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  updatedAt: string; // ISO date, last content review
  howTo: [string, string, string];
  faqs: { q: string; a: string }[];
  related: string[];
  popular?: boolean;
}

export interface CategoryMeta {
  id: Category;
  name: string;
  icon: string;
  description: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "image",
    name: "Image",
    icon: "🖼️",
    description: "Compress, resize, and convert images without ever uploading them.",
  },
  {
    id: "pdf",
    name: "PDF",
    icon: "📄",
    description: "Merge, split, and shrink PDF files entirely inside your browser.",
  },
  {
    id: "text",
    name: "Text",
    icon: "✍️",
    description: "Count, clean, and reshape text with fast, private tools.",
  },
  {
    id: "developer",
    name: "Developer",
    icon: "⚙️",
    description: "Format, validate, and encode data — no data ever leaves your device.",
  },
  {
    id: "generator",
    name: "Generator",
    icon: "✨",
    description: "Generate QR codes and strong passwords on the spot.",
  },
  {
    id: "ai",
    name: "AI",
    icon: "🤖",
    description: "Inspect AI-generated images and strip their hidden metadata — never uploaded.",
  },
];

export const TOOLS: Tool[] = [
  {
    slug: "compress-image",
    name: "Image Compressor",
    category: "image",
    shortDesc: "Shrink JPG, PNG & WEBP with a quality slider — right in your browser.",
    metaTitle: "Image Compressor — Reduce JPG, PNG & WEBP Size",
    metaDescription:
      "Compress images online for free. Adjust quality, see before/after sizes and percent saved, then download. Runs 100% in your browser — no uploads.",
    h1: "Image Compressor",
    intro:
      "The Image Compressor shrinks JPG, PNG, and WEBP files by re-encoding them at a lower quality using your browser's canvas API — the same kind of lossy compression a desktop editor uses, without installing anything. Drag the quality slider and watch the before/after size and percent saved update live, so you can find the smallest file that still looks clean. It's built for the everyday problem of a photo too large to email, attach to a form, or upload to a website with a strict size limit. Because nothing is uploaded to a server, it also works for compressing images you'd rather not send anywhere — screenshots with sensitive text, ID photos, or personal pictures. There's no account, no daily limit, and no watermark added to the result. Compress one image or run the tool repeatedly for a batch, entirely on your own device.",
    updatedAt: "2026-09-21",
    howTo: [
      "Drop or select a JPG, PNG, or WEBP image.",
      "Drag the quality slider until the size and preview look right.",
      "Download the compressed image — check the percent saved.",
    ],
    faqs: [
      {
        q: "Does compressing reduce image quality?",
        a: "Lossy formats like JPG and WEBP trade a little detail for much smaller files. The default 72% keeps images looking clean; lower it for smaller files.",
      },
      {
        q: "Are my images uploaded to a server?",
        a: "No. Compression happens entirely in your browser using the canvas API. Your file never leaves this device.",
      },
      {
        q: "Which formats can I compress?",
        a: "JPG, PNG, and WEBP are supported. PNG re-encodes to WEBP-style compression for the best savings.",
      },
    ],
    related: ["resize-image", "convert-image-format", "compress-pdf", "qr-code-generator"],
    popular: true,
  },
  {
    slug: "resize-image",
    name: "Image Resizer",
    category: "image",
    shortDesc: "Resize images to exact pixel dimensions with optional aspect-ratio lock.",
    metaTitle: "Image Resizer — Change Image Dimensions Online",
    metaDescription:
      "Resize JPG, PNG, and WEBP images to exact width and height with an aspect-ratio lock. Free, private, and fully browser-based — no uploads required.",
    h1: "Image Resizer",
    intro:
      "The Image Resizer changes an image's pixel width and height to an exact size you set, with an optional aspect-ratio lock so proportions don't distort. It's the tool for fitting a photo to a specific requirement — a website's banner dimensions, a form's upload size, a social media profile picture, or a print size in pixels — rather than just shrinking file size. Enter a target width or height, keep the lock on to scale proportionally, or turn it off for an exact custom size. Downscaling stays sharp; enlarging past the original resolution can look soft, since no new detail is invented. Because resizing runs in the browser's canvas, there's no upload step and no practical file-size limit beyond your device's own memory. Use it on its own or pair it with the Image Compressor afterward to also shrink the file size once the dimensions are right.",
    updatedAt: "2026-09-21",
    howTo: [
      "Drop or select an image to resize.",
      "Enter a target width or height — lock the ratio to keep proportions.",
      "Download your resized image instantly.",
    ],
    faqs: [
      {
        q: "Will resizing distort my image?",
        a: "Only if you turn off the aspect-ratio lock and use mismatched dimensions. Keep the lock on to preserve proportions.",
      },
      {
        q: "Can I upscale a small image?",
        a: "Yes, but enlarging beyond the original resolution can look soft. Resizing down always stays crisp.",
      },
      {
        q: "Is there a file size limit?",
        a: "No hard limit — because everything runs locally, only your device's memory matters.",
      },
    ],
    related: ["compress-image", "convert-image-format", "qr-code-generator", "merge-pdf"],
  },
  {
    slug: "convert-image-format",
    name: "Image Format Converter",
    category: "image",
    shortDesc: "Convert between JPG, PNG, and WEBP — including HEIC photos from iPhone.",
    metaTitle: "Image Converter — JPG, PNG, WEBP & HEIC",
    metaDescription:
      "Convert images between JPG, PNG, and WEBP, including iPhone HEIC photos. Free, instant, and fully in-browser — your files never leave your device.",
    h1: "Image Format Converter",
    intro:
      "The Image Format Converter switches an image between JPG, PNG, and WEBP, and also decodes iPhone HEIC photos that most non-Apple apps and older Windows software can't open directly. Drop a file, pick the output format, and download the converted copy — useful for turning an iPhone photo library into JPGs before uploading elsewhere, adding transparency by converting to PNG, or switching to WEBP for the smallest file size at similar quality. Converting to PNG is lossless; JPG and WEBP re-encode at a high default quality, so a single conversion loses little. All of the decoding and re-encoding, including the HEIC step, happens locally using the browser's canvas and a WebAssembly HEIC decoder — the photo is never sent anywhere, which matters for images you'd rather not upload to a third-party converter site. No account, no batch limit beyond your device's memory.",
    updatedAt: "2026-09-21",
    howTo: [
      "Drop or select an image (HEIC supported).",
      "Choose the output format: JPG, PNG, or WEBP.",
      "Convert and download the new file.",
    ],
    faqs: [
      {
        q: "Can I convert iPhone HEIC photos?",
        a: "Yes. HEIC files are decoded in your browser and can be converted to JPG, PNG, or WEBP.",
      },
      {
        q: "Which format should I choose?",
        a: "Use JPG for photos, PNG when you need transparency, and WEBP for the smallest size with good quality.",
      },
      {
        q: "Does converting lose quality?",
        a: "Converting to PNG is lossless. JPG and WEBP are lossy but re-encoded at high quality by default.",
      },
    ],
    related: ["compress-image", "resize-image", "merge-pdf", "qr-code-generator"],
  },
  {
    slug: "merge-pdf",
    name: "PDF Merge",
    category: "pdf",
    shortDesc: "Combine multiple PDFs into one — drag to reorder before merging.",
    metaTitle: "Merge PDF — Combine PDF Files Online Free",
    metaDescription:
      "Merge multiple PDF files into a single document. Drag to reorder pages, then download. 100% browser-based and private — your files are never uploaded.",
    h1: "PDF Merge",
    intro:
      "PDF Merge combines two or more PDF files into a single document, with drag-and-drop reordering so you control the exact page order before merging — no separate reordering step needed. It's the everyday fix for stitching together scanned pages, combining a cover letter with a resume, or assembling multiple reports into one PDF to send or print. Pages are copied exactly as they are using the pdf-lib library, so text, images, fonts, and layout are preserved rather than flattened into images. There's no limit on how many files you can merge beyond what your device can handle in memory, since merging runs entirely client-side — nothing is uploaded to a server, which matters for contracts, IDs, or anything else you'd rather not send through a third-party site. Add your files, drag them into order, click merge, and download the combined PDF immediately.",
    updatedAt: "2026-09-21",
    howTo: [
      "Add two or more PDF files.",
      "Drag the files to set the merge order.",
      "Click Merge and download the combined PDF.",
    ],
    faqs: [
      {
        q: "How many PDFs can I merge?",
        a: "As many as your device can handle — there's no server limit because merging happens locally.",
      },
      {
        q: "Will the original formatting be kept?",
        a: "Yes. Pages are copied exactly as they are, preserving text, images, and layout.",
      },
      {
        q: "Are my PDFs uploaded?",
        a: "Never. The merge runs entirely in your browser with pdf-lib. Your files stay on your device.",
      },
    ],
    related: ["split-pdf", "compress-pdf", "compress-image", "qr-code-generator"],
    popular: true,
  },
  {
    slug: "split-pdf",
    name: "PDF Split",
    category: "pdf",
    shortDesc: "Extract page ranges, split every page, or separate odd and even pages.",
    metaTitle: "Split PDF — Extract Pages from a PDF Online",
    metaDescription:
      "Split a PDF by page range, into single pages, or by odd/even pages. Free, fast, and fully in-browser — no uploads and no watermarks.",
    h1: "PDF Split",
    intro:
      "PDF Split pulls pages out of a PDF three ways: extract a specific page range (like \"1-8, 14\"), split every page into its own file, or separate odd and even pages — useful for pulling a chapter out of a longer document, breaking a scanned book into individual pages, or separating a double-sided scan's front and back sides. Splitting into individual pages downloads a ZIP containing one single-page PDF per page; a range extraction downloads just those pages as one file. The split runs entirely in your browser using pdf-lib, so there's no upload, no watermark added to the result, and no page-count limit beyond your device's memory. This makes it a private alternative for splitting sensitive documents — contracts, ID scans, medical records — that you wouldn't want passing through a third-party server. Pick a mode, preview the page count, and download instantly.",
    updatedAt: "2026-09-21",
    howTo: [
      "Drop or select the PDF you want to split.",
      "Pick a mode: page range, every page, or odd/even.",
      "Download the extracted pages.",
    ],
    faqs: [
      {
        q: "How do I enter a page range?",
        a: 'Use commas and dashes, like "1-8, 14". The tool extracts exactly those pages in order.',
      },
      {
        q: "What does 'every page' produce?",
        a: "A ZIP file containing each page as its own single-page PDF.",
      },
      {
        q: "Is my PDF safe?",
        a: "Yes. Splitting happens locally in your browser; the file is never uploaded anywhere.",
      },
    ],
    related: ["merge-pdf", "compress-pdf", "convert-image-format", "compress-image"],
  },
  {
    slug: "compress-pdf",
    name: "PDF Compress",
    category: "pdf",
    shortDesc: "Shrink PDF file size by recompressing embedded images.",
    metaTitle: "Compress PDF — Reduce PDF File Size Online",
    metaDescription:
      "Compress PDF files by recompressing embedded images at Light, Balanced, or Strong levels. See before/after sizes. Private and fully browser-based.",
    h1: "PDF Compress",
    intro:
      "PDF Compress shrinks a PDF's file size by recompressing the images embedded inside it, at a Light, Balanced, or Strong level, and shows the exact before/after size and percent saved. This targets the most common reason a PDF is large — high-resolution scanned pages or embedded photos — rather than the text itself, so a text-only PDF may shrink very little since text is already compact. Balanced suits most everyday files like scanned forms or reports; Strong gives the smallest size when visual quality matters less, such as an internal draft. It's built for the common problem of a PDF too large to email or upload to a portal with a strict size cap. Compression happens entirely in the browser, so the document — which might contain financial details, contracts, or personal information — is never uploaded to a server. Pick a level, and download the smaller file immediately.",
    updatedAt: "2026-09-21",
    howTo: [
      "Drop or select a PDF file.",
      "Choose a level: Light, Balanced, or Strong.",
      "Download the compressed PDF and compare sizes.",
    ],
    faqs: [
      {
        q: "How does PDF compression work here?",
        a: "Embedded raster images are re-encoded at a lower quality. Text-only PDFs may see little change since text is already compact.",
      },
      {
        q: "Which level should I use?",
        a: "Balanced suits most files. Use Strong for the smallest size when quality is less critical.",
      },
      {
        q: "Are my PDFs uploaded?",
        a: "No. Everything runs in your browser — your document never leaves this device.",
      },
    ],
    related: ["merge-pdf", "split-pdf", "compress-image", "resize-image"],
  },
  {
    slug: "qr-code-generator",
    name: "QR Code Generator",
    category: "generator",
    shortDesc: "Create QR codes for links, text, or Wi-Fi — download PNG and SVG.",
    metaTitle: "QR Code Generator — Free PNG & SVG QR Codes",
    metaDescription:
      "Generate QR codes for links, plain text, or Wi-Fi networks. Live preview, download as high-res PNG or scalable SVG. Free and fully browser-based.",
    h1: "QR Code Generator",
    intro:
      "The QR Code Generator creates a scannable QR code from a link, plain text, or Wi-Fi network details, with a live preview as you type and a download as a high-resolution PNG or a scalable SVG. Unlike QR code services that route the code through a shortened redirect link they can track or later disable, this tool encodes your data directly into the code itself, so it works permanently with no tracking and no expiry. That makes it suitable for printed material — menus, flyers, business cards, event signage — where a broken redirect months later would be a real problem. The Wi-Fi option builds a code that lets guests join a network by scanning, without typing the password. Choose PNG for quick sharing at a fixed size or SVG when the code needs to scale to a poster or print at any size without losing sharpness. Nothing is sent to a server; generation happens locally.",
    updatedAt: "2026-09-21",
    howTo: [
      "Choose a type: Link, Text, or Wi-Fi.",
      "Fill in the details and watch the live preview.",
      "Download the QR code as a PNG or SVG.",
    ],
    faqs: [
      {
        q: "Do these QR codes expire?",
        a: "No. The code encodes your data directly, so it works forever with no tracking or redirects.",
      },
      {
        q: "What's the difference between PNG and SVG?",
        a: "PNG is a 1024px image great for sharing; SVG is scalable and perfect for print at any size.",
      },
      {
        q: "Can I make a Wi-Fi QR code?",
        a: "Yes. Enter your network name, password, and security type, and guests can connect by scanning.",
      },
    ],
    related: ["password-generator", "compress-image", "base64-encode-decode", "json-formatter"],
    popular: true,
  },
  {
    slug: "json-formatter",
    name: "JSON Formatter / Validator",
    category: "developer",
    shortDesc: "Format, minify, and validate JSON with precise error locations.",
    metaTitle: "JSON Formatter & Validator — Beautify JSON Online",
    metaDescription:
      "Format, minify, and validate JSON instantly. Get exact line and position on errors, copy results, and see a Valid JSON badge. Private and in-browser.",
    h1: "JSON Formatter / Validator",
    intro:
      "The JSON Formatter and Validator pretty-prints, minifies, and validates JSON, and on invalid input points to the exact line and character position of the problem instead of a generic parse error. Paste JSON to reformat it with readable indentation for reviewing an API response or config file, or minify it to strip whitespace before embedding it somewhere space matters. A visible \"Valid JSON\" badge confirms well-formed input at a glance. Because the exact error location is shown, tracking down a missing comma or unclosed bracket in a large payload takes seconds instead of scanning by eye. Parsing and formatting run entirely in the browser's JavaScript engine, so API keys, tokens, or other sensitive fields inside the JSON are never transmitted anywhere — a meaningful difference from formatter sites that process input on their own servers. Works on large files within your browser's memory, with one-click copy of the result.",
    updatedAt: "2026-09-21",
    howTo: [
      "Paste or type your JSON into the input.",
      "Click Format to beautify, or Minify to compact it.",
      "Copy the output — invalid JSON shows the exact error location.",
    ],
    faqs: [
      {
        q: "What happens if my JSON is invalid?",
        a: "You'll see a clear message with the exact line and position of the problem, so you can fix it fast.",
      },
      {
        q: "Is my data sent anywhere?",
        a: "No. Parsing and formatting run entirely in your browser — nothing is transmitted.",
      },
      {
        q: "Can it handle large JSON files?",
        a: "Yes, within your browser's memory. Very large files may take a moment to render.",
      },
    ],
    related: ["json-diff", "text-compare", "base64-encode-decode", "regex-tester"],
    popular: true,
  },
  {
    slug: "json-diff",
    name: "JSON Diff",
    category: "developer",
    shortDesc: "Compare two JSON documents and see exactly what changed — keys, values, structure.",
    metaTitle: "JSON Diff — Compare Two JSON Files Online",
    metaDescription:
      "Compare two JSON documents side by side and highlight added, removed, and changed values. Keys are sorted so reordering isn't flagged. Free and fully in-browser.",
    h1: "JSON Diff",
    intro:
      "JSON Diff compares two JSON documents side by side and highlights exactly what was added, removed, or changed between them, with a similarity score summarizing how close the two are. Both sides are normalized with keys sorted before comparing, so reordering the same keys in an object isn't flagged as a difference — only real structural or value changes are, which avoids noisy false positives from formatting differences alone. This is useful for comparing an API response before and after a change, reviewing a config file diff, or checking whether two versions of a data export actually differ in substance. If either side fails to parse, the tool reports which one and why, so you can fix it before comparing. The entire comparison runs in the browser — nothing is uploaded — and the result can be copied as a unified diff or the two sides swapped for a reverse comparison.",
    updatedAt: "2026-09-21",
    howTo: [
      "Paste the original JSON on the left and the changed JSON on the right.",
      "Click Compare to see a side-by-side diff with a similarity score.",
      "Copy the unified diff, or swap the two sides.",
    ],
    faqs: [
      {
        q: "Does key order matter?",
        a: "No. Both documents are normalized with keys sorted, so reordering the same keys is not reported as a difference — only real structural or value changes are.",
      },
      {
        q: "What if my JSON is invalid?",
        a: "You'll get a clear message telling you which side failed to parse, so you can fix it before comparing.",
      },
      {
        q: "Is my data uploaded?",
        a: "No. Parsing and diffing run entirely in your browser — nothing leaves your device.",
      },
    ],
    related: ["json-formatter", "text-compare", "regex-tester", "base64-encode-decode"],
  },
  {
    slug: "regex-tester",
    name: "Regex Tester",
    category: "developer",
    shortDesc: "Test regular expressions live with match highlighting, flags, and capture groups.",
    metaTitle: "Regex Tester — Test Regular Expressions Online",
    metaDescription:
      "Test JavaScript regular expressions live: highlight matches in your text, toggle flags, and inspect capture groups. Instant, private, and fully in-browser.",
    h1: "Regex Tester",
    intro:
      "The Regex Tester runs a JavaScript regular expression against text you provide and highlights every match live as you type, with a table showing each capture group and its position in the string. Toggle the standard flags — g (global), i (ignore case), m (multiline), s (dotall), u (unicode), y (sticky) — and see how each one changes the match set immediately, which makes it faster to debug a pattern than guessing and re-running code. This is the JavaScript (ECMAScript) regex flavor specifically, using the browser's built-in RegExp engine, so behavior matches exactly what a `new RegExp()` call in a Node.js or browser script would produce — useful for validating a pattern before pasting it into actual code. Because matching runs locally, it's also a safe way to test a regex against real but sensitive sample data — log lines, emails, IDs — without sending that text to a server.",
    updatedAt: "2026-09-21",
    howTo: [
      "Type a regular expression and toggle the flags you need (g, i, m, s, u, y).",
      "Paste text into the test string box.",
      "See matches highlighted live, with a table of capture groups and positions.",
    ],
    faqs: [
      {
        q: "Which regex flavor is this?",
        a: "JavaScript (ECMAScript) regular expressions, using your browser's built-in RegExp engine.",
      },
      {
        q: "What do the flags mean?",
        a: "g = global (all matches), i = ignore case, m = multiline, s = dotall (dot matches newlines), u = unicode, y = sticky.",
      },
      {
        q: "Is my text sent anywhere?",
        a: "No. The pattern runs against your text entirely in the browser — nothing is uploaded.",
      },
    ],
    related: ["json-formatter", "json-diff", "text-compare", "base64-encode-decode"],
  },
  {
    slug: "word-counter",
    name: "Word Counter",
    category: "text",
    shortDesc: "Live word, character & readability stats with keyword density and goals.",
    metaTitle: "Word Counter — Words, Characters & Readability",
    metaDescription:
      "Count words and characters live, with keyword density, reading level, reading time, and writing goals. Autosaves your draft locally. Free and private.",
    h1: "Word Counter",
    intro:
      "The Word Counter tracks words, characters, sentences, and paragraphs live as you type or paste text, alongside a readability score, estimated reading and speaking time, and keyword density showing which words appear most often relative to the total. It's built for writers checking an article against a target length, students hitting an assignment's word count, or anyone editing copy where keyword density matters for SEO. Reading time is estimated at roughly 200 words per minute and speaking time at roughly 130 words per minute, standard benchmarks for adult reading and presenting pace. Set a word-count goal and the tool tracks progress toward it as you write. Your draft autosaves to the browser's local storage so it survives a refresh or an accidental tab close, but it's stored only on this device and never uploaded — useful for drafting something private before it's ready to share.",
    updatedAt: "2026-09-21",
    howTo: [
      "Type or paste your text into the editor.",
      "Watch the live stats: words, characters, readability, and more.",
      "Set a word goal and track progress as you write.",
    ],
    faqs: [
      {
        q: "Is my writing saved?",
        a: "Your draft autosaves to this browser's local storage so it's there when you return. It never leaves your device.",
      },
      {
        q: "How is reading time calculated?",
        a: "Reading time assumes about 200 words per minute; speaking time assumes about 130 words per minute.",
      },
      {
        q: "What is keyword density?",
        a: "It's how often your most-used words appear relative to the total, useful for SEO and editing.",
      },
    ],
    related: ["text-compare", "case-converter", "json-formatter", "base64-encode-decode"],
    popular: true,
  },
  {
    slug: "password-generator",
    name: "Password Generator",
    category: "generator",
    shortDesc: "Generate strong, random passwords with a live strength meter.",
    metaTitle: "Password Generator — Strong Random Passwords",
    metaDescription:
      "Generate secure random passwords with adjustable length and character sets. Includes a strength meter and one-click copy. Uses crypto-grade randomness.",
    h1: "Password Generator",
    intro:
      "The Password Generator creates a strong, random password using the browser's `crypto.getRandomValues` API — the same cryptographically secure randomness used for actual security-sensitive code, not a weaker `Math.random()` fallback some generator tools use. Set the length with a slider and toggle uppercase, lowercase, numbers, and symbols independently, and a live strength meter reflects the current settings. Sixteen characters mixing all four character types is a reasonable strong default for most accounts; longer is better where a site allows it, since length matters more than complexity once a minimum bar is met. Because the password is generated in memory on your device and never transmitted or logged anywhere, it's safe to use for the account you're most protective of, unlike a password suggested by a server-side tool that could theoretically log it. Copy it with one click and regenerate as many times as needed.",
    updatedAt: "2026-09-21",
    howTo: [
      "Set the password length with the slider.",
      "Toggle uppercase, lowercase, numbers, and symbols.",
      "Copy your password — regenerate anytime.",
    ],
    faqs: [
      {
        q: "Are these passwords truly random?",
        a: "Yes. They use the browser's crypto.getRandomValues, the same secure randomness used for cryptography.",
      },
      {
        q: "Is the password stored anywhere?",
        a: "No. It's generated in memory on your device and never saved or transmitted.",
      },
      {
        q: "How long should my password be?",
        a: "16 characters is a strong default. Longer passwords with mixed characters are harder to crack.",
      },
    ],
    related: ["qr-code-generator", "base64-encode-decode", "json-formatter", "word-counter"],
    popular: true,
  },
  {
    slug: "base64-encode-decode",
    name: "Base64 Encode / Decode",
    category: "developer",
    shortDesc: "Encode and decode Base64 with correct UTF-8 handling.",
    metaTitle: "Base64 Encode & Decode — UTF-8 Safe Online",
    metaDescription:
      "Encode text to Base64 or decode it back, with proper UTF-8 handling for emoji and accents. Live conversion and one-click copy. Runs fully in-browser.",
    h1: "Base64 Encode / Decode",
    intro:
      "This tool encodes text to Base64 or decodes Base64 back to readable text, with correct UTF-8 handling via `TextEncoder`/`TextDecoder` so emoji, accented characters, and non-Latin scripts convert without corruption — a common failure point in simpler Base64 tools that only handle plain ASCII. Base64 turns arbitrary binary or text data into a safe ASCII string, which is why it shows up constantly in data URLs for embedding small images in CSS or HTML, email attachment encoding, Basic Auth headers, and API payloads that need to carry binary data as text. Paste input, pick Encode or Decode, and the result updates live with a one-click copy button. Because conversion happens entirely in the browser's JavaScript engine, it's a fast way to decode a Base64 string — including one containing an API key or token — without pasting it into a third-party server first.",
    updatedAt: "2026-09-21",
    howTo: [
      "Choose Encode or Decode.",
      "Type or paste your input.",
      "Copy the converted result instantly.",
    ],
    faqs: [
      {
        q: "Does it handle emoji and accents?",
        a: "Yes. It uses TextEncoder/TextDecoder for correct UTF-8, so multi-byte characters convert safely.",
      },
      {
        q: "What is Base64 used for?",
        a: "Encoding binary or text data into ASCII, often for data URLs, email attachments, and APIs.",
      },
      {
        q: "Is my input private?",
        a: "Completely. Conversion happens in your browser; nothing is uploaded.",
      },
    ],
    related: ["json-formatter", "word-counter", "case-converter", "password-generator"],
  },
  {
    slug: "text-compare",
    name: "Text Compare",
    category: "text",
    shortDesc: "Compare two texts and see exactly what changed — by word, line, or character.",
    metaTitle: "Text Compare — Diff Two Texts Online",
    metaDescription:
      "Compare two blocks of text and highlight additions and deletions by word, line, or character. See a similarity score and copy the diff. Free and fully in-browser.",
    h1: "Text Compare",
    intro:
      "Text Compare highlights exactly what changed between two blocks of text — an original and an edited version — by word, line, or character, plus a similarity score showing what share of the content stayed the same. Word and character mode suit prose, catching small edits like a changed sentence or fixed typo; line mode compares whole lines at a time, which fits code, config files, or any line-structured document better since it won't fragment a single changed line into confusing partial highlights. This is useful for reviewing a contract redline, checking what an editor changed in an article draft, or comparing two versions of a config file without a full diff tool. Paste the original on the left and the revision on the right, pick a comparison mode, and the tool marks additions and removals directly. Comparison runs locally in the browser, so the text never leaves your device.",
    updatedAt: "2026-09-21",
    howTo: [
      "Paste the original text on the left and the changed text on the right.",
      "Choose to compare by words, lines, or characters.",
      "Click Compare to see additions, removals, and a similarity score.",
    ],
    faqs: [
      {
        q: "What's the difference between word, line, and character mode?",
        a: "Word and character mode highlight fine-grained changes within a paragraph. Line mode compares whole lines at a time, which suits code or line-by-line documents.",
      },
      {
        q: "How is the similarity score calculated?",
        a: "It's the share of words (or lines/characters, depending on mode) that are identical between the two texts, out of everything compared.",
      },
      {
        q: "Is my text uploaded anywhere?",
        a: "No. The comparison runs entirely in your browser using a diff algorithm — nothing is sent to a server.",
      },
    ],
    related: ["word-counter", "case-converter", "json-formatter", "base64-encode-decode"],
  },
  {
    slug: "case-converter",
    name: "Case Converter",
    category: "text",
    shortDesc: "Convert text to UPPERCASE, lowercase, Title Case, camelCase & more.",
    metaTitle: "Case Converter — Change Text Case Online",
    metaDescription:
      "Convert text to UPPERCASE, lowercase, Title Case, camelCase, or snake_case with one click. Smart title casing and copy button. Free and fully in-browser.",
    h1: "Case Converter",
    intro:
      'The Case Converter switches text between UPPERCASE, lowercase, Title Case, camelCase, snake_case, and other common cases with one click, using a smart Title Case that keeps small words like "and," "of," and "the" lowercase unless they start the phrase — matching standard style-guide title casing instead of naively capitalizing every word. It\'s a quick fix for reformatting a heading pulled from mismatched sources, converting a phrase into a variable name (camelCase or snake_case) for code, or cleaning up text typed with caps lock stuck on. camelCase joins words with capital letters and no spaces (`myVariable`), while snake_case joins them with underscores (`my_variable`) — the two most common naming conventions in programming, both generated instantly from the same input. Paste or type text, click the case you want, and copy the result. All conversion runs locally in the browser; nothing is uploaded.',
    updatedAt: "2026-09-21",
    howTo: [
      "Type or paste your text.",
      "Click the case you want to apply.",
      "Copy the converted text.",
    ],
    faqs: [
      {
        q: "What is smart Title Case?",
        a: 'It capitalizes major words but keeps small words like "and", "of", and "the" lowercase unless they start the phrase.',
      },
      {
        q: "What's the difference between camelCase and snake_case?",
        a: "camelCase joins words with capitals (myVariable); snake_case joins them with underscores (my_variable).",
      },
      {
        q: "Is my text uploaded?",
        a: "No. All conversion runs locally in your browser.",
      },
    ],
    related: ["text-compare", "word-counter", "json-formatter", "base64-encode-decode"],
  },
  {
    slug: "url-encode-decode",
    name: "URL Encoder / Decoder",
    category: "developer",
    shortDesc: "Encode and decode URLs and query strings with percent-encoding.",
    metaTitle: "URL Encoder & Decoder — Percent-Encode Online",
    metaDescription:
      "Encode or decode URLs and query string components with percent-encoding. Switch between component and full-URI encoding. Free and fully in-browser.",
    h1: "URL Encoder / Decoder",
    intro:
      "This tool encodes or decodes a URL, query string, or path segment using percent-encoding, with a toggle between Component and Full URI modes because the two serve different purposes. Component encoding (`encodeURIComponent`) escapes every reserved character and is the right choice for a single query parameter value or path segment that might contain spaces, symbols, or another URL. Full URI encoding (`encodeURI`) leaves URL-structure characters like `:`, `/`, `?`, and `&` untouched, which is correct when encoding a complete URL rather than one piece of it — using Component encoding on a full URL by mistake breaks it by escaping its own structure. Paste text and the result updates live; decoding a malformed input (a stray `%` not followed by a valid two-digit hex code) shows a clear error instead of a silent failure. Encoding and decoding use the browser's native URI functions, so nothing is sent to a server.",
    updatedAt: "2026-09-21",
    howTo: [
      "Choose Encode or Decode.",
      "Pick Component for query/path parts, or Full URI for whole URLs.",
      "Paste your text — the result updates live.",
    ],
    faqs: [
      {
        q: "What's the difference between Component and Full URI?",
        a: "Component encoding (encodeURIComponent) escapes every reserved character, ideal for a single query parameter or path segment. Full URI encoding (encodeURI) leaves URL structure characters like : / ? & untouched, for encoding a complete URL.",
      },
      {
        q: "Why does decoding sometimes fail?",
        a: "Decoding throws an error if the input contains a stray % not followed by a valid two-digit hex code. Check the input was copied in full.",
      },
      {
        q: "Is my data uploaded?",
        a: "No. Encoding and decoding run entirely in your browser using the native URI functions — nothing is sent anywhere.",
      },
    ],
    related: ["base64-encode-decode", "json-formatter", "jwt-decoder", "hash-generator"],
  },
  {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    category: "developer",
    shortDesc: "Decode a JSON Web Token's header and payload and check its expiry.",
    metaTitle: "JWT Decoder — Decode JSON Web Tokens Online",
    metaDescription:
      "Paste a JWT to decode its header and payload as readable JSON, and see whether it's expired. Free, private, and fully in-browser — no signature verification.",
    h1: "JWT Decoder",
    intro:
      "The JWT Decoder pastes apart a JSON Web Token into its decoded header and payload, shown as readable formatted JSON, and flags whether the token's `exp` claim means it's expired. A JWT's header and payload are base64url-encoded but not encrypted, so decoding them doesn't require a secret — that's the point of this tool, and also the reason a JWT should never contain sensitive data assumed to be hidden, since anyone holding the token can read it the same way. This tool does not verify the token's signature; that check requires the issuing server's secret or public key, which by design never leaves that server, so a decoded-and-valid-looking token here isn't proof it's genuine. It's built for debugging — checking what claims an auth token actually carries, or confirming why a session expired — without pasting a live token into an unfamiliar third-party site. Decoding runs entirely in the browser; the token is never transmitted.",
    updatedAt: "2026-09-21",
    howTo: [
      "Paste a JWT (three dot-separated parts).",
      "View the decoded header and payload as formatted JSON.",
      "Check the expiry banner to see if the token is still valid.",
    ],
    faqs: [
      {
        q: "Does this verify the signature?",
        a: "No. This tool only decodes the header and payload, which are base64url-encoded but not encrypted. Verifying the signature would require the secret or public key, which never leaves your server.",
      },
      {
        q: "Is my token uploaded anywhere?",
        a: "No. Decoding happens entirely in your browser — the token is never transmitted.",
      },
      {
        q: "Why did decoding fail?",
        a: "A JWT must have exactly three dot-separated, base64url-encoded parts. Make sure you copied the full token.",
      },
    ],
    related: ["base64-encode-decode", "json-formatter", "url-encode-decode", "hash-generator"],
  },
  {
    slug: "uuid-generator",
    name: "UUID Generator",
    category: "generator",
    shortDesc: "Generate random v4 UUIDs in bulk, with optional formatting.",
    metaTitle: "UUID Generator — Free Random UUID v4 Generator",
    metaDescription:
      "Generate one or many random version 4 UUIDs using cryptographically secure randomness. Toggle hyphens and case, copy individually or all at once.",
    h1: "UUID Generator",
    intro:
      "The UUID Generator produces one or many random version 4 UUIDs at once, using `crypto.randomUUID` (with a `crypto.getRandomValues`-based fallback for older browsers) — the same cryptographically secure randomness source used for security-sensitive code, not a weak pseudo-random generator. A v4 UUID is a 128-bit identifier where every bit except a handful of fixed version and variant markers is random, making an accidental collision between two generated UUIDs astronomically unlikely even across billions of values, which is why it's the standard choice for database primary keys, distributed system IDs, and session tokens. Set how many you need with a slider — useful for seeding test data or generating a batch of IDs at once — and toggle hyphens and uppercase to match whatever format your target system expects. Copy a single UUID or all of them together. Generation happens in memory in the browser; nothing is sent to a server or logged.",
    updatedAt: "2026-09-21",
    howTo: [
      "Set how many UUIDs you want with the slider.",
      "Toggle hyphens and uppercase to match your format.",
      "Copy a single UUID or all of them at once.",
    ],
    faqs: [
      {
        q: "Are these truly random?",
        a: "Yes. UUIDs are generated with crypto.randomUUID (or crypto.getRandomValues as a fallback), the same secure randomness used for cryptography.",
      },
      {
        q: "What is a v4 UUID?",
        a: "A 128-bit identifier where all bits except a few fixed version/variant bits are random, making collisions astronomically unlikely.",
      },
      {
        q: "Are the UUIDs stored anywhere?",
        a: "No. They're generated in memory in your browser and never sent to a server.",
      },
    ],
    related: ["password-generator", "hash-generator", "json-formatter", "qr-code-generator"],
  },
  {
    slug: "hash-generator",
    name: "Hash Generator",
    category: "developer",
    shortDesc: "Compute SHA-1, SHA-256, SHA-384 & SHA-512 hashes of any text.",
    metaTitle: "Hash Generator — SHA-1, SHA-256, SHA-384, SHA-512 Online",
    metaDescription:
      "Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes of any text instantly using the browser's SubtleCrypto API. Free, private, and fully in-browser.",
    h1: "Hash Generator",
    intro:
      "The Hash Generator computes SHA-1, SHA-256, SHA-384, and SHA-512 digests of any text you type, all four updating live, using the browser's native `SubtleCrypto` API rather than a JavaScript reimplementation. SHA-256 is the general-purpose standard today for checksums, data integrity checks, and password-adjacent hashing schemes; SHA-1 is still seen in legacy checksums but is considered cryptographically weak and shouldn't be relied on for anything security-sensitive. MD5 isn't offered here — browsers' `SubtleCrypto` doesn't implement it, and it's been cryptographically broken for years, so SHA-1 or better is the safer floor even for non-security checksum use. This is useful for verifying a downloaded file's integrity against a published hash, generating a checksum for a document, or understanding how a given hash function behaves on sample input. All computation happens locally via the browser's built-in crypto engine — the text is never uploaded.",
    updatedAt: "2026-09-21",
    howTo: [
      "Type or paste the text you want to hash.",
      "All four hash digests update live below.",
      "Copy any hash with one click.",
    ],
    faqs: [
      {
        q: "Which algorithm should I use?",
        a: "SHA-256 is the most common general-purpose choice today. SHA-1 is considered weak for security purposes but still used for checksums.",
      },
      {
        q: "Why isn't MD5 included?",
        a: "Browsers' built-in SubtleCrypto API doesn't implement MD5, and it's cryptographically broken — SHA-1 or better is recommended even for non-security checksums.",
      },
      {
        q: "Is my text uploaded?",
        a: "No. Hashes are computed locally using the browser's SubtleCrypto API — nothing is sent to a server.",
      },
    ],
    related: ["uuid-generator", "base64-encode-decode", "password-generator", "json-formatter"],
  },
  {
    slug: "timestamp-converter",
    name: "Timestamp Converter",
    category: "developer",
    shortDesc: "Convert Unix timestamps to dates and back, in seconds or milliseconds.",
    metaTitle: "Unix Timestamp Converter — Epoch to Date Online",
    metaDescription:
      "Convert a Unix timestamp to a readable local, UTC, and ISO 8601 date, or convert a date back to seconds and milliseconds since the epoch. Free and in-browser.",
    h1: "Timestamp Converter",
    intro:
      "The Timestamp Converter turns a Unix timestamp into a readable date — shown in your local timezone, in UTC, and as an ISO 8601 string — or goes the other direction, converting a picked date into its epoch timestamp in both seconds and milliseconds. The seconds-vs-milliseconds distinction trips people up constantly: Unix timestamps in seconds are 10 digits today (like `1735000000`), while JavaScript's `Date.now()` and many web APIs use milliseconds, which show up as 13-digit numbers — this tool handles both and lets you switch which one you're working with. It's built for debugging a timestamp found in a log file, an API response, or a database row without doing the arithmetic by hand or firing up a script. Click Now to grab the current time in every format at once. All conversion uses the browser's built-in Date object, so nothing is sent anywhere.",
    updatedAt: "2026-09-21",
    howTo: [
      "Enter a Unix timestamp, or click Now to use the current time.",
      "Switch between seconds and milliseconds to match your source.",
      "Or enter a date below to get its timestamp instead.",
    ],
    faqs: [
      {
        q: "Seconds or milliseconds — which do I have?",
        a: "Unix timestamps in seconds are 10 digits today (e.g. 1735000000); JavaScript's Date.now() and many APIs use milliseconds, which are 13 digits.",
      },
      {
        q: "What timezone is shown?",
        a: "The Local row uses your browser's timezone; the UTC and ISO 8601 rows are timezone-independent.",
      },
      {
        q: "Is my input sent anywhere?",
        a: "No. Conversion uses the browser's built-in Date object — nothing leaves your device.",
      },
    ],
    related: ["json-formatter", "uuid-generator", "hash-generator", "word-counter"],
  },
  {
    slug: "passport-photo",
    name: "Passport Photo Maker",
    category: "image",
    shortDesc: "Crop any photo to the exact passport/visa size for your country and print a sheet.",
    metaTitle: "Passport Photo Maker — Correct Size for Any Country",
    metaDescription:
      "Crop a photo to the exact passport or visa photo size — US/India 2x2in, UK/EU 35x45mm, Canada, China, or a custom size. Download a single photo or a 4x6 print sheet. Free and fully in-browser.",
    h1: "Passport Photo Maker",
    intro:
      "The Passport Photo Maker crops any photo to the exact dimensions a passport or visa application requires — 2×2 in for the US and India, 35×45 mm for the UK, Ireland, the Schengen area, and Australia, plus Canada, China, and a fully custom size in millimeters for anywhere else. Upload a front-facing photo, drag and zoom to frame the face within the guide, and download either a single photo or a 4×6 in print sheet that tiles several copies onto one standard print size for a photo lab or home printer. A separate control handles the other common rejection reason: many application portals cap the upload at a file size in kilobytes — 20 KB or 50 KB is typical — completely apart from the pixel dimensions being correct, and the tool lowers JPEG quality just enough to hit that target without changing the size. It doesn't remove the background automatically, so shoot against a plain, light background for the best result. Cropping and compression happen entirely on-device.",
    updatedAt: "2026-09-21",
    howTo: [
      "Upload a clear, front-facing photo.",
      "Pick your country's size (or enter a custom size in mm) and drag/zoom to frame your face.",
      "If your form caps the upload size (e.g. 20 KB, 50 KB), pick a max size — the tool compresses to fit — then download the single photo or a 4×6 in print sheet.",
    ],
    faqs: [
      {
        q: "Which size should I pick?",
        a: "Most passport photos are either 2×2 in (US, India) or 35×45 mm (UK, Ireland, Schengen/EU, Australia). Check your country's passport office if you're unsure — you can also enter any exact size with Custom.",
      },
      {
        q: "Why does my form reject the photo for being too big or too small?",
        a: "Many online forms (passport, visa, exam applications) cap the upload at a specific file size in KB, separate from the pixel dimensions. Pick a max size like 20 KB or 50 KB below the download button, and the tool lowers JPEG quality just enough to fit — the pixel dimensions stay correct.",
      },
      {
        q: "Does this remove the background?",
        a: "No. This tool only crops and resizes — take the photo against a plain, light background for the best result, since background removal isn't done automatically.",
      },
      {
        q: "What is the 4×6 in print sheet?",
        a: "It tiles multiple copies of your cropped photo onto one standard 4×6 in photo print, sized so a photo lab or home printer can print it at actual size and you cut out each copy.",
      },
      {
        q: "Is my photo uploaded anywhere?",
        a: "No. Cropping and the print sheet are generated entirely on your device using canvas — your photo is never sent to a server.",
      },
    ],
    related: ["resize-image", "compress-image", "convert-image-format", "qr-code-generator"],
    popular: true,
  },
  {
    slug: "watermark-remover",
    name: "Watermark Remover",
    category: "image",
    shortDesc: "Paint over a watermark or unwanted object and rebuild what was behind it.",
    metaTitle: "Watermark Remover — Erase Watermarks & Objects Online",
    metaDescription:
      "Brush over a watermark, logo, date stamp, or unwanted object and the tool repaints the area from the pixels around it. No sign-up, no upload, no watermark of its own.",
    h1: "Watermark Remover",
    intro:
      "The Watermark Remover erases a logo, date stamp, caption, or small unwanted object from a photo by painting over it and reconstructing the area underneath using Telea inpainting — the same fast-marching algorithm behind OpenCV's inpainting function — rather than simply blurring or smearing the covered region. Set a brush size, paint over the mark plus a pixel or two of its edge, and the tool works inward from the edge of the stroke, following the direction of the surrounding lines and colors so edges continue naturally into the gap. It handles thin marks over fairly even backgrounds well — text watermarks, timestamps, small objects on sky, skin, or plain walls — but reconstructs structure rather than fine texture, so a large brush over busy detail like foliage or a crowd comes back visibly smoother than the original; several small passes beat one big one. Removing your own watermark or a client's is ordinary editing; removing someone else's to reuse their work is a different, legal question you'll need to make the call on. All processing runs on-device in a background thread — nothing is uploaded.",
    updatedAt: "2026-09-21",
    howTo: [
      "Drop or select the image you want to clean.",
      "Set a brush size and paint over the watermark — cover it fully, plus a pixel or two of its edge.",
      "Click Remove painted area, then download — or paint over any leftovers and run it again.",
    ],
    faqs: [
      {
        q: "How does the removal actually work?",
        a: "It runs Telea inpainting — the same fast-marching algorithm OpenCV uses. The painted area is erased, then refilled pixel by pixel, working inward from the edge of your brush stroke and following the direction of the surrounding lines and colours so edges continue into the gap instead of blurring across it.",
      },
      {
        q: "What kind of watermarks does it handle well?",
        a: "Thin marks over reasonably even backgrounds — logo text, captions, date stamps, small objects on sky, skin, walls, or water. It reconstructs structure, not texture, so a large brush over busy detail such as foliage or a crowd comes back noticeably smooth. Painting in several small passes beats one big one.",
      },
      {
        q: "Is it legal to remove a watermark?",
        a: "On your own images, or ones you have the rights to edit, yes — removing your own logo, a client's stamp, or a stray object is ordinary editing. Removing another party's watermark to reuse their work is copyright infringement in most countries, and in the US also risks a claim under the DMCA's copyright-management-information rules. That call is yours to make.",
      },
      {
        q: "Can it remove invisible AI watermarks like SynthID?",
        a: "No. Those are encoded across the whole image rather than in one spot, and only the vendor's detector can read them. This tool works on marks you can see and paint over. For the metadata a generator writes into the file, use the AI Image Metadata Cleaner.",
      },
      {
        q: "Is my image uploaded anywhere?",
        a: "No. The image is decoded, repainted, and re-encoded inside your browser — the work runs in a background thread on your own device, and the file never leaves it.",
      },
    ],
    related: ["ai-image-metadata", "compress-image", "resize-image", "convert-image-format"],
    popular: true,
  },
  {
    slug: "ai-image-metadata",
    name: "AI Image Metadata Cleaner",
    category: "ai",
    shortDesc:
      "Detect which AI made an image and strip its footprint — batch, lossless, never uploaded.",
    metaTitle: "Delete AI Footprints — Image Metadata Remover & Model Detector",
    metaDescription:
      "Find out which AI generated an image — Midjourney, DALL·E, Stable Diffusion, ComfyUI, Firefly, Gemini — then delete the prompt, EXIF, XMP, IPTC, and C2PA footprints without re-encoding. Batch, unlimited size, and never uploaded to any server.",
    h1: "AI Image Metadata Cleaner",
    intro:
      "The AI Image Metadata Cleaner reads the hidden metadata that image generators write into a file — Stable Diffusion WebUI and ComfyUI store the full text prompt and model name directly in PNG text chunks, NovelAI and InvokeAI tag themselves by name, and Firefly, DALL·E, and Google's models attach C2PA Content Credentials — identifies which generator produced the image, and then strips that footprint without touching a single pixel. Because the file is rebuilt by copying the original image data byte-for-byte and dropping only the metadata blocks, there's no re-encoding step, so the result is bit-identical to the source image rather than a lossy resave. Drop any number of PNG, JPG, or WebP files with no size cap, review what each one reveals — prompt, model, timestamps — then download individually or as a ZIP. A clean result means no known signature remains, not necessarily that an image wasn't AI-made, since invisible pixel watermarks like SynthID need the vendor's own detector to read. Nothing is ever uploaded — the entire scan-and-clean process runs in your browser.",
    updatedAt: "2026-09-21",
    howTo: [
      "Drop or select any number of PNG, JPG, or WebP images — there is no file-size cap.",
      "Read the detected generator per file and expand each metadata block to see exactly what it stores.",
      "Download a clean copy, or all of them as a ZIP — the pixels are untouched, only the footprint is gone.",
    ],
    faqs: [
      {
        q: "How does it know which AI generated the image?",
        a: "Generators write their fingerprint into the file: Stable Diffusion WebUI and ComfyUI store the full prompt and model name in PNG text chunks, NovelAI and InvokeAI tag themselves by name, and Firefly, DALL·E, and Google's models attach C2PA Content Credentials. The tool reads those blocks and matches them against known signatures.",
      },
      {
        q: "If nothing is detected, does that mean it isn't AI?",
        a: "No. Metadata is trivially removed, and screenshots, re-saves, and most social platforms strip it automatically. A clean result means there is no signature left in the file — not that the image is real. Invisible pixel watermarks like Google's SynthID cannot be read without the vendor's detector.",
      },
      {
        q: "Does removing metadata hurt image quality?",
        a: "Not at all. The file is rebuilt by copying the original image data byte for byte and dropping only the metadata blocks — there is no re-encoding, so the pixels are bit-identical to the original.",
      },
      {
        q: "What exactly gets removed?",
        a: "PNG text chunks (tEXt, zTXt, iTXt), EXIF, XMP, IPTC, timestamps, and C2PA Content Credentials. Colour-critical data — ICC profiles, the Adobe colour-transform marker, palettes, and animation frames — is deliberately kept so the image still displays correctly.",
      },
      {
        q: "Is my image uploaded anywhere?",
        a: "No — and that's the point. Other footprint removers upload your file to a server and promise to delete it later, usually within some number of minutes. This tool parses and rebuilds the file inside your browser, so there is no upload, no queue, no retention window, and no file-size cap. Your prompt never reaches anyone.",
      },
      {
        q: "Can I clean several images at once?",
        a: "Yes. Drop as many PNG, JPG, and WebP files as you like — each one is scanned separately, and you can download them individually or all at once as a ZIP.",
      },
    ],
    related: ["watermark-remover", "compress-image", "convert-image-format", "resize-image"],
    popular: true,
  },
];

export function getTool(slug: string): Tool | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: Category): Tool[] {
  return TOOLS.filter((t) => t.category === category);
}

export function getCategory(id: string): CategoryMeta | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function getPopularTools(): Tool[] {
  return TOOLS.filter((t) => t.popular);
}

export function categoryCount(id: Category): number {
  return getToolsByCategory(id).length;
}
