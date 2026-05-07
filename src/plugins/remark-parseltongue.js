import { visit } from "unist-util-visit";

/**
 * Converts :parsel[] and :::parsel blocks into styled HTML for Parseltongue text.
 *
 * Supported attributes:
 * - tone: whisper | aggressive | ancient | any sanitized class suffix
 * - translate: yes | true
 * - translation: explicit tooltip text
 */
export default function remarkParsel() {
  return (tree) => {
    visit(tree, ["textDirective", "leafDirective", "containerDirective"], (node, index, parent) => {
      if (node.name !== "parsel") return;
      if (!parent || typeof index !== "number") return;

      const attrs = node.attributes || {};
      const text = extractNodeText(node);

      parent.children[index] = {
        type: "html",
        value:
          node.type === "containerDirective"
            ? buildBlockParsel(node.children ?? [], attrs)
            : buildInlineParsel(text, attrs),
      };
    });
  };
}

function buildInlineParsel(text, attrs) {
  const toneClass = getToneClass(attrs.tone);
  const translationHtml = renderTranslation(attrs, text);
  const safeText = escapeHtml(text);

  return `
    <span class="parsel-inline${toneClass}">
      <span class="parsel-stack">
        <span class="parsel-echo" aria-hidden="true">${safeText}</span>
        <span class="parsel-text">${safeText}</span>
      </span>
      ${translationHtml}
    </span>
  `;
}

function buildBlockParsel(children, attrs) {
  const toneClass = getToneClass(attrs.tone);
  const rawText = extractChildrenText(children).trim();
  const textHtml = splitParagraphs(rawText)
    .map((paragraph) => {
      const safeParagraph = escapeHtml(paragraph);

      return `
        <p class="parsel-paragraph">
          <span class="parsel-stack">
            <span class="parsel-echo" aria-hidden="true">${safeParagraph}</span>
            <span class="parsel-text">${safeParagraph}</span>
          </span>
        </p>
      `;
    })
    .join("");

  return `
    <div class="parsel-block${toneClass}">
      <div class="parsel-body">
        ${textHtml}
      </div>
      ${renderTranslation(attrs, rawText)}
    </div>
  `;
}

function getToneClass(value) {
  const tone = normalizeClassName(value || "");
  return tone ? ` tone-${tone}` : "";
}

function renderTranslation(attrs, fallbackText) {
  const shouldTranslate = normalizeBoolean(attrs.translate);
  const translation = String(attrs.translation || "").trim();

  if (!shouldTranslate && !translation) return "";

  return `<span class="parsel-translation">${escapeHtml(translation || fallbackText)}</span>`;
}

function normalizeBoolean(value) {
  const normalized = String(value).trim().toLowerCase();
  return normalized === "yes" || normalized === "true";
}

function normalizeClassName(value) {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase();
}

function extractNodeText(node) {
  if (!node) return "";
  if (node.type === "text") return node.value;
  if (node.type === "break" || node.type === "softBreak") return "\n";
  if (!Array.isArray(node.children)) return "";

  return node.children.map(extractNodeText).join("");
}

function extractChildrenText(children) {
  return (children || []).map(extractNodeText).join("\n");
}

function splitParagraphs(text) {
  return String(text)
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
