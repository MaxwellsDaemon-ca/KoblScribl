import { visit } from "unist-util-visit";

console.log("LOADING REMARK PARSEL PLUGIN FROM:", import.meta.url);

export default function remarkParsel() {
  return (tree) => {
    console.log("remarkParsel transformer ran");

    visit(
      tree,
      ["textDirective", "leafDirective", "containerDirective"],
      (node, index, parent) => {
        console.log("DIRECTIVE NODE FOUND:", {
          type: node.type,
          name: node.name,
          attributes: node.attributes,
          index,
        });

        if (node.name !== "parsel") {
          return;
        }

        const text = extractNodeText(node);
        const attrs = node.attributes || {};

        console.log("PARSEL NODE TEXT:", text);
        console.log("PARSEL NODE ATTRS:", attrs);

        if (!parent || typeof index !== "number") {
          console.log("SKIPPING PARSEL NODE: missing parent or index");
          return;
        }

        if (node.type === "textDirective" || node.type === "leafDirective") {
          const html = buildInlineParsel(text, attrs);
          console.log("INLINE PARSEL HTML:", html);

          parent.children[index] = {
            type: "html",
            value: html,
          };

          return;
        }

        if (node.type === "containerDirective") {
          const html = buildBlockParsel(node.children ?? [], attrs);
          console.log("BLOCK PARSEL HTML:", html);

          parent.children[index] = {
            type: "html",
            value: html,
          };
        }
      }
    );
  };
}

function buildInlineParsel(text, attrs) {
  const tone = normalizeClassName(attrs.tone || "");
  const translate = normalizeBoolean(attrs.translate);
  const translation = String(attrs.translation || "").trim();

  const toneClass = tone ? ` tone-${tone}` : "";
  const translationHtml = renderTranslation(translate, translation, text);

  return `
    <span class="parsel-inline${toneClass}">
      <span class="parsel-stack">
        <span class="parsel-echo" aria-hidden="true">${escapeHtml(text)}</span>
        <span class="parsel-text">${escapeHtml(text)}</span>
      </span>
      ${translationHtml}
    </span>
  `;
}

function buildBlockParsel(children, attrs) {
  const tone = normalizeClassName(attrs.tone || "");
  const translate = normalizeBoolean(attrs.translate);
  const translation = String(attrs.translation || "").trim();

  const toneClass = tone ? ` tone-${tone}` : "";
  const rawText = extractChildrenText(children).trim();
  const paragraphs = splitParagraphs(rawText);

  const textHtml = paragraphs
    .map(
      (paragraph) => `
        <p class="parsel-paragraph">
          <span class="parsel-stack">
            <span class="parsel-echo" aria-hidden="true">${escapeHtml(paragraph)}</span>
            <span class="parsel-text">${escapeHtml(paragraph)}</span>
          </span>
        </p>
      `
    )
    .join("");

  const translationHtml = renderTranslation(translate, translation, rawText);

  return `
    <div class="parsel-block${toneClass}">
      <div class="parsel-body">
        ${textHtml}
      </div>
      ${translationHtml}
    </div>
  `;
}

function renderTranslation(translate, translation, fallbackText) {
  if (!translate && !translation) {
    return "";
  }

  const text = translation || fallbackText;

  return `
    <span class="parsel-translation">${escapeHtml(text)}</span>
  `;
}

function normalizeBoolean(value) {
  return String(value).trim().toLowerCase() === "yes" ||
    String(value).trim().toLowerCase() === "true";
}

function normalizeClassName(value) {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase();
}

function extractNodeText(node) {
  if (!node) {
    return "";
  }

  if (node.type === "text") {
    return node.value;
  }

  if (node.type === "break" || node.type === "softBreak") {
    return "\n";
  }

  if (!node.children || !Array.isArray(node.children)) {
    return "";
  }

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