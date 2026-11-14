export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function formatRichDescription(text) {
  if (!text) return '';

  const lines = String(text).split(/\r?\n/);
  let html = '';
  let inListGroup = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      if (inListGroup) {
        html += '</div>';
        inListGroup = false;
      }
      continue;
    }

    const olMatch = line.match(/^(\d+)[.)]\s+(.*)/);
    const ulMatch = line.match(/^[-*•]\s+(.*)/);

    if (olMatch) {
      if (!inListGroup) {
        html += '<div class="rich-list-group">';
        inListGroup = true;
      }
      html += `<div class="rich-list-item rich-numbered-item"><span class="rich-number-badge">${olMatch[1]}</span><span class="rich-item-text">${escapeHtml(olMatch[2])}</span></div>`;
    } else if (ulMatch) {
      if (!inListGroup) {
        html += '<div class="rich-list-group">';
        inListGroup = true;
      }
      html += `<div class="rich-list-item rich-bullet-item"><span class="rich-check-badge"><i class="fa-solid fa-circle-check"></i></span><span class="rich-item-text">${escapeHtml(ulMatch[1])}</span></div>`;
    } else {
      if (inListGroup) {
        html += '</div>';
        inListGroup = false;
      }
      html += `<p class="rich-desc-p">${escapeHtml(line)}</p>`;
    }
  }

  if (inListGroup) {
    html += '</div>';
  }

  return html;
}
