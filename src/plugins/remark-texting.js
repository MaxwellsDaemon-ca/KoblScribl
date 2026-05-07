import { emojify } from "node-emoji";
import { visit } from "unist-util-visit";

/**
 * Converts :::texting directive blocks into phone-style message transcripts.
 *
 * Example header inside a block:
 *   @alexei[time="2:11 AM", color="purple"]
 *
 * Supported directive attributes:
 * - sender/me: speaker name aligned to the right
 * - title: optional transcript title
 * - colors: comma-separated speaker:color map
 */
export default function remarkTexting() {
  return (tree) => {
    visit(tree, (node, index, parent) => {
      if (node.type !== "containerDirective" || node.name !== "texting") return;
      if (!parent || typeof index !== "number") return;

      const sender = normalizeSpeaker(node.attributes?.sender || node.attributes?.me || "");
      const title = String(node.attributes?.title || "").trim();
      const colorMap = parseColorMap(node.attributes?.colors || "");
      const messages = parseDirectiveChildren(node.children ?? [], sender, colorMap);

      parent.children[index] = {
        type: "html",
        value: buildTextingHtml(messages, title),
      };
    });
  };
}

function parseDirectiveChildren(children, sender, colorMap) {
  const messages = [];
  let currentMessage = null;

  for (const child of children) {
    if (child.type !== "paragraph") continue;

    const paragraphText = extractNodeText(child).trim();
    if (!paragraphText) continue;

    const headerMatch = paragraphText.match(/^@([a-zA-Z0-9_-]+)(?:\[(.*?)\])?$/);

    if (headerMatch) {
      if (currentMessage) {
        finalizeMessage(currentMessage, sender);
        messages.push(currentMessage);
      }

      const speaker = normalizeSpeaker(headerMatch[1]);
      const attrs = parseInlineAttributes(headerMatch[2] || "");
      const isSystem = speaker === "system";

      currentMessage = {
        speaker,
        color: normalizeColor(attrs.color || colorMap[speaker] || ""),
        time: normalizeTime(attrs.time || ""),
        paragraphs: [],
        isSender: false,
        showName: true,
        isSystem,
      };

      continue;
    }

    if (!currentMessage) {
      messages.push(createFallbackMessage(paragraphText));
      continue;
    }

    currentMessage.paragraphs.push(paragraphText);
  }

  if (currentMessage) {
    finalizeMessage(currentMessage, sender);
    messages.push(currentMessage);
  }

  return applyNameGrouping(messages);
}

function createFallbackMessage(paragraphText) {
  return {
    speaker: "unknown",
    color: "",
    time: "",
    paragraphs: [paragraphText],
    isSender: false,
    showName: true,
    isSystem: false,
  };
}

function finalizeMessage(message, sender) {
  message.isSender = !message.isSystem && sender !== "" && message.speaker === sender;
}

function applyNameGrouping(messages) {
  for (let index = 0; index < messages.length; index++) {
    const previous = messages[index - 1];
    const message = messages[index];

    if (message.isSystem) {
      message.showName = false;
      continue;
    }

    message.showName = !previous || previous.speaker !== message.speaker || previous.isSystem;
  }

  return messages;
}

function parseColorMap(colorString) {
  const map = {};
  const parts = String(colorString)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  for (const part of parts) {
    const [speaker, color] = part.split(":").map((item) => item?.trim());
    if (!speaker || !color) continue;

    map[normalizeSpeaker(speaker)] = normalizeColor(color);
  }

  return map;
}

function normalizeTime(value) {
  const trimmed = stripQuotes(String(value).trim());
  return trimmed.replace(/^(\d{1,2})[-._](\d{2})(\s*[AaPp][Mm])$/, "$1:$2$3");
}

function parseInlineAttributes(attrString) {
  const attrs = {};
  const regex = /(\w+)=(".*?"|'.*?'|[^,\]]+)/g;
  let match;

  while ((match = regex.exec(attrString)) !== null) {
    attrs[match[1].toLowerCase()] = stripQuotes(match[2].trim());
  }

  return attrs;
}

function stripQuotes(value) {
  return String(value).replace(/^["'“”‘’]|["'“”‘’]$/g, "");
}

function extractNodeText(node) {
  if (!node) return "";
  if (node.type === "text") return node.value;
  if (node.type === "break" || node.type === "softBreak") return "\n";
  if (!Array.isArray(node.children)) return "";

  return node.children.map(extractNodeText).join("");
}

function buildTextingHtml(messages, title) {
  const titleHtml = title ? `<div class="texting-title">${escapeHtml(title)}</div>` : "";
  const inner = messages.map(renderMessage).join("");

  return `
    <div class="texting-block">
      ${titleHtml}
      ${inner}
    </div>
  `;
}

function renderMessage(message) {
  if (message.isSystem) return renderSystemMessage(message);

  const sideClass = message.isSender ? "is-sender" : "is-recipient";
  const colorClass = message.color ? ` color-${escapeClassName(message.color)}` : "";
  const nameHtml = message.showName ? `<div class="texting-name">${escapeHtml(message.speaker)}</div>` : "";
  const timeHtml = message.time ? `<div class="texting-time">${escapeHtml(message.time)}</div>` : "";
  const paragraphsHtml = message.paragraphs
    .map((paragraph) => `<p class="texting-paragraph">${emojify(escapeHtml(paragraph))}</p>`)
    .join("");

  return `
    <div class="texting-message ${sideClass}${colorClass} from-${escapeClassName(message.speaker)}">
      <div class="texting-bubble-wrapper">
        <div class="texting-meta">
          ${nameHtml}
          ${timeHtml}
        </div>
        <div class="texting-bubble">
          ${paragraphsHtml}
        </div>
      </div>
    </div>
  `;
}

function renderSystemMessage(message) {
  const timeHtml = message.time ? `<span class="texting-system-time">${escapeHtml(message.time)}</span>` : "";
  const contentHtml = message.paragraphs
    .map((paragraph) => `<div class="texting-system-line">${escapeHtml(paragraph)}</div>`)
    .join("");

  return `
    <div class="texting-system-message color-${escapeClassName(message.color || "slate")}">
      ${contentHtml}
      ${timeHtml}
    </div>
  `;
}

function normalizeSpeaker(value) {
  return String(value).trim().toLowerCase();
}

function normalizeColor(value) {
  return String(value).trim().toLowerCase();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeClassName(value) {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase();
}
