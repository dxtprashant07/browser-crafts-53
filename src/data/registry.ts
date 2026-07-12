export type Category = "image" | "pdf" | "text" | "developer" | "generator";

export interface Tool {
  slug: string;
  name: string;
  category: Category;
  shortDesc: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
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
      "Drop an image, pick a quality level, and download a smaller file — nothing is ever uploaded.",
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
      "Set a width and height, keep the aspect ratio if you like, and download the resized image.",
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
      "Drop an image — even an iPhone HEIC — pick a target format, and download the converted file.",
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
    intro: "Add several PDFs, drag them into the order you want, and download one combined file.",
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
    intro: "Choose how to split — a range, every page, or odd/even — and download the result.",
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
    intro: "Pick a compression level and download a smaller PDF — see exactly how much you saved.",
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
    intro: "Enter a link, text, or Wi-Fi details and download a crisp QR code as PNG or SVG.",
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
      "Paste JSON to pretty-print, minify, or validate it — errors show the exact line and position.",
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
      "Paste two JSON documents to see a structural, side-by-side diff — reordered keys are ignored.",
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
      "Write a regular expression and see every match highlighted in your test text, with capture groups.",
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
    intro: "Write or paste text and watch words, readability, and keyword stats update instantly.",
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
      "Pick a length and character mix, then copy a strong password generated with secure randomness.",
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
    intro: "Convert text to and from Base64 with full UTF-8 support — safe for emoji and accents.",
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
      "Paste an original and a changed version of text to see exactly what was added or removed.",
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
      "Paste text and switch it to any case — with smart title casing that ignores small words.",
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
