import { visit } from "unist-util-visit";

console.log("LOADING REMARK TEXTING PLUGIN FROM:", import.meta.url);

export default function remarkTexting() {
  return (tree) => {
    visit(tree, (node, index, parent) => {
      if (node.type !== "containerDirective" || node.name !== "texting") {
        return;
      }

      const sender = normalizeSpeaker(
        node.attributes?.sender || node.attributes?.me || ""
      );

      const title = String(node.attributes?.title || "").trim();
      const colorMap = parseColorMap(node.attributes?.colors || "");

      const messages = parseDirectiveChildren(
        node.children ?? [],
        sender,
        colorMap
      );

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
    if (child.type !== "paragraph") {
      continue;
    }

    const paragraphText = extractNodeText(child).trim();

    if (!paragraphText) {
      continue;
    }

    const headerMatch = paragraphText.match(/^@([a-zA-Z0-9_-]+)(?:\[(.*?)\])?$/);

if (headerMatch) {
  console.log("HEADER PARAGRAPH:", paragraphText);
  console.log("HEADER MATCH speaker:", headerMatch[1]);
  console.log("HEADER MATCH attrs:", headerMatch[2]);

  if (currentMessage) {
    finalizeMessage(currentMessage, sender);
    messages.push(currentMessage);
  }

  const speaker = normalizeSpeaker(headerMatch[1]);
  const attrs = parseInlineAttributes(headerMatch[2] || "");

  console.log("PARSED ATTRS:", attrs);

  const isSystem = speaker === "system";

  currentMessage = {
    speaker,
    color: normalizeColor(attrs.color || colorMap[speaker] || ""),
    time: normalizeTime(attrs.time || "").trim(),
    paragraphs: [],
    isSender: false,
    showName: true,
    isSystem,
  };

  console.log("FINAL TIME VALUE:", currentMessage.time);

  continue;
}

    if (!currentMessage) {
      messages.push({
        speaker: "unknown",
        color: "",
        time: "",
        paragraphs: [paragraphText],
        isSender: false,
        showName: true,
        isSystem: false,
      });
      continue;
    }

    currentMessage.paragraphs.push(paragraphText);
  }

  if (currentMessage) {
    finalizeMessage(currentMessage, sender);
    messages.push(currentMessage);
  }

  for (let i = 0; i < messages.length; i++) {
    const previous = messages[i - 1];

    if (messages[i].isSystem) {
      messages[i].showName = false;
      continue;
    }

    messages[i].showName =
      !previous ||
      previous.speaker !== messages[i].speaker ||
      previous.isSystem;
  }

  return messages;
}

function finalizeMessage(message, sender) {
  message.isSender = !message.isSystem && sender !== "" && message.speaker === sender;
}

function parseColorMap(colorString) {
  const map = {};

  const parts = String(colorString)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  for (const part of parts) {
    const [speaker, color] = part.split(":").map((item) => item?.trim());

    if (!speaker || !color) {
      continue;
    }

    map[normalizeSpeaker(speaker)] = normalizeColor(color);
  }

  return map;
}

function normalizeTime(value) {
  const trimmed = stripQuotes(String(value).trim());

  return trimmed.replace(
    /^(\d{1,2})[-._](\d{2})(\s*[AaPp][Mm])$/,
    "$1:$2$3"
  );
}

function parseInlineAttributes(attrString) {
  const attrs = {};
  const regex = /(\w+)=(".*?"|'.*?'|[^,\]]+)/g;

  let match;

  while ((match = regex.exec(attrString)) !== null) {
    const key = match[1].toLowerCase();
    const rawValue = match[2].trim();

    attrs[key] = stripQuotes(rawValue);
  }

  return attrs;
}

function stripQuotes(value) {
  return String(value).replace(/^["'“”‘’]|["'“”‘’]$/g, "");
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

function buildTextingHtml(messages, title) {
  const titleHtml = title
    ? `<div class="texting-title">${escapeHtml(title)}</div>`
    : "";

  const inner = messages
    .map((message) => {
      if (message.isSystem) {
        const timeHtml = message.time
          ? `<span class="texting-system-time">${escapeHtml(message.time)}</span>`
          : "";

        const contentHtml = message.paragraphs
          .map(
            (paragraph) =>
              `<div class="texting-system-line">${escapeHtml(paragraph)}</div>`
          )
          .join("");

        return `
          <div class="texting-system-message color-${escapeClassName(message.color || "slate")}">
            ${contentHtml}
            ${timeHtml}
          </div>
        `;
      }

      const sideClass = message.isSender ? "is-sender" : "is-recipient";
      const colorClass = message.color
        ? ` color-${escapeClassName(message.color)}`
        : "";
      const nameHtml = message.showName
        ? `<div class="texting-name">${escapeHtml(message.speaker)}</div>`
        : "";
      const timeHtml = message.time
        ? `<div class="texting-time">${escapeHtml(message.time)}</div>`
        : "";

      const paragraphsHtml = message.paragraphs
        .map(
          (paragraph) =>
            `<p class="texting-paragraph">${escapeHtml(paragraph)}</p>`
        )
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
    })
    .join("");

  return `
    <div class="texting-block">
      ${titleHtml}
      ${inner}
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