import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export const MESSAGE_TOPICS = [
  { value: 'freelance', label: 'Freelance Project' },
  { value: 'hiring', label: 'Job Opportunity' },
  { value: 'collaboration', label: 'Collaboration' },
  { value: 'general', label: 'General Inquiry' }
];

export const MESSAGE_STATUSES = ['unread', 'read', 'archived'];

export const COOLDOWN_MS = 60_000;
const COOLDOWN_STORAGE_KEY = 'portfolio_contact_last_sent_at';
const EMAIL_PATTERN = /^[^\s@?,;&#<>"'\\]+@[^\s@?,;&#<>"'\\]+\.[^\s@?,;&#<>"'\\]+$/;
const VALID_TOPIC_VALUES = new Set(MESSAGE_TOPICS.map((t) => t.value));
const MAX_MAILTO_LENGTH = 1800;

export function getTopicLabel(topicValue) {
  const found = MESSAGE_TOPICS.find((t) => t.value === topicValue);
  return found ? found.label : 'General Inquiry';
}

export function isSafeEmailAddress(email) {
  const trimmed = String(email ?? '').trim();
  return trimmed.length >= 5 && trimmed.length <= 160 && EMAIL_PATTERN.test(trimmed);
}

function encodeMailtoAddress(email) {
  return encodeURIComponent(String(email ?? '').trim()).replace(/%40/g, '@');
}

export function buildSafeReplyMailto(email, topicValue) {
  if (!isSafeEmailAddress(email)) return '';
  const topicLabel = getTopicLabel(topicValue);
  const subject = encodeURIComponent(`Re: ${topicLabel} Inquiry`);
  return `mailto:${encodeMailtoAddress(email)}?subject=${subject}`;
}

export function validateContactForm({ name = '', email = '', topic = 'freelance', message = '' } = {}) {
  const errors = {};
  const trimmedName = String(name ?? '').trim();
  const trimmedEmail = String(email ?? '').trim();
  const trimmedMessage = String(message ?? '').trim();
  const nameLen = [...trimmedName].length;
  const messageLen = [...trimmedMessage].length;

  if (nameLen < 2) {
    errors.name = 'Please enter your name (at least 2 characters).';
  } else if (nameLen > 100) {
    errors.name = 'Name must be 100 characters or fewer.';
  }

  if (!isSafeEmailAddress(trimmedEmail)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!VALID_TOPIC_VALUES.has(topic)) {
    errors.topic = 'Please select an inquiry topic.';
  }

  if (messageLen < 10) {
    errors.message = 'Please write at least 10 characters so I have enough context.';
  } else if (messageLen > 2000) {
    errors.message = 'Message must be 2,000 characters or fewer.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      name: trimmedName,
      email: trimmedEmail,
      topic: VALID_TOPIC_VALUES.has(topic) ? topic : 'general',
      message: trimmedMessage
    }
  };
}

export function getCooldownRemainingMs(now = Date.now()) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return 0;
    const raw = window.localStorage.getItem(COOLDOWN_STORAGE_KEY);
    if (!raw) return 0;
    const lastSent = Number(raw);
    if (!Number.isFinite(lastSent) || lastSent <= 0) return 0;
    const elapsed = now - lastSent;
    if (elapsed < 0 || elapsed >= COOLDOWN_MS) return 0;
    return COOLDOWN_MS - elapsed;
  } catch {
    return 0;
  }
}

export function recordSubmissionTimestamp(now = Date.now()) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(COOLDOWN_STORAGE_KEY, String(now));
    }
  } catch {
    // ignore storage quota/privacy mode failures
  }
}

export function buildMailtoFallbackUrl({
  toEmail,
  name = '',
  email = '',
  topic = 'general',
  message = ''
} = {}) {
  const recipient = isSafeEmailAddress(toEmail) ? String(toEmail).trim() : 'me@vinsensiusarka.id';
  const topicLabel = getTopicLabel(topic);
  const subject = `[Portfolio] ${topicLabel} from ${String(name ?? '').trim() || 'Visitor'}`;
  const prefix = `mailto:${encodeMailtoAddress(recipient)}?subject=${encodeURIComponent(subject)}&body=`;
  const bodyLines = [
    `Name: ${String(name ?? '').trim() || '-'}`,
    `Email: ${String(email ?? '').trim() || '-'}`,
    `Topic: ${topicLabel}`,
    '',
    String(message ?? '').trim()
  ];
  const fullBody = bodyLines.join('\n');
  const encodedBody = encodeURIComponent(fullBody);

  if (prefix.length + encodedBody.length <= MAX_MAILTO_LENGTH) {
    return `${prefix}${encodedBody}`;
  }

  const suffix = '\n... [truncated]';
  const encodedSuffix = encodeURIComponent(suffix);
  const available = Math.max(0, MAX_MAILTO_LENGTH - prefix.length - encodedSuffix.length);

  let truncated = '';
  let encodedLen = 0;
  for (const ch of fullBody) {
    const chEncodedLen = encodeURIComponent(ch).length;
    if (encodedLen + chEncodedLen > available) break;
    truncated += ch;
    encodedLen += chEncodedLen;
  }

  return `${prefix}${encodeURIComponent(truncated)}${encodedSuffix}`;
}

export async function submitContactMessage({
  name = '',
  email = '',
  topic = 'freelance',
  message = '',
  website = ''
} = {}) {
  // Silent honeypot bypass for automated bots
  if (String(website ?? '').trim().length > 0) {
    return { ok: true, honeypot: true };
  }

  const remainingMs = getCooldownRemainingMs();
  if (remainingMs > 0) {
    const seconds = Math.ceil(remainingMs / 1000);
    return {
      ok: false,
      code: 'cooldown',
      message: `Please wait ${seconds}s before sending another message.`
    };
  }

  const validation = validateContactForm({ name, email, topic, message });
  if (!validation.valid) {
    return {
      ok: false,
      code: 'validation',
      errors: validation.errors,
      message: 'Please review the highlighted fields and try again.'
    };
  }

  if (!db) {
    return {
      ok: false,
      code: 'unavailable',
      message: 'Message service is temporarily unavailable. You can email me directly below.'
    };
  }

  try {
    const docRef = await addDoc(collection(db, 'messages'), {
      name: validation.sanitized.name,
      email: validation.sanitized.email,
      topic: validation.sanitized.topic,
      message: validation.sanitized.message,
      status: 'unread',
      source: 'portfolio_contact_form',
      createdAt: serverTimestamp()
    });
    recordSubmissionTimestamp();
    return { ok: true, id: docRef?.id || null };
  } catch (err) {
    const isPermissionError =
      err?.code === 'permission-denied' ||
      String(err?.message || '').toLowerCase().includes('permission');
    return {
      ok: false,
      code: isPermissionError ? 'permission-denied' : 'network',
      message: isPermissionError
        ? 'Direct form submissions are currently unavailable. Use the email button below so your message is not lost.'
        : 'Could not send your message right now. Check your connection or send via email below.'
    };
  }
}
