import { useState, useMemo, useId, useRef } from 'react';
import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import {
  IconAlertCircle,
  IconArchive,
  IconArchiveOff,
  IconInbox,
  IconMail,
  IconMailCheck,
  IconMailOpened,
  IconRefresh,
  IconSearch,
  IconTrash,
  IconX
} from '@tabler/icons-react';
import { db } from '../../../services/firebase';
import { useConfirm } from '../../../context/ConfirmContext';
import {
  MESSAGE_STATUSES,
  getTopicLabel,
  buildSafeReplyMailto
} from '../../../services/contactMessages';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Skeleton } from '../../../components/ui/skeleton';
import { AdminPageHeader } from '../components/AdminPageHeader';

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
  { value: 'archived', label: 'Archived' }
];

const VALID_STATUS_SET = new Set(MESSAGE_STATUSES);

function normalizeStatus(rawStatus) {
  return VALID_STATUS_SET.has(rawStatus) ? rawStatus : 'unread';
}

function formatMessageTimestamp(raw) {
  if (!raw) return 'Just now';
  let date = null;
  if (raw instanceof Date) {
    date = raw;
  } else if (typeof raw?.toDate === 'function') {
    date = raw.toDate();
  } else if (typeof raw?.seconds === 'number') {
    date = new Date(raw.seconds * 1000);
  } else if (typeof raw?._seconds === 'number') {
    date = new Date(raw._seconds * 1000);
  } else if (typeof raw === 'string' || typeof raw === 'number') {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) date = parsed;
  }

  if (!date || Number.isNaN(date.getTime())) return 'Just now';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function AdminMessagesTab({
  messages = [],
  setMessages,
  reloadMessages,
  showToast,
  loading = false,
  error = ''
}) {
  const confirm = useConfirm();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [busyIds, setBusyIds] = useState(() => new Set());
  const busyIdsRef = useRef(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const tabId = useId();
  const tabRefs = useRef([]);
  const panelId = `${tabId}-panel`;

  const setCardBusy = (id, busy) => {
    if (busy) {
      busyIdsRef.current.add(id);
    } else {
      busyIdsRef.current.delete(id);
    }
    setBusyIds(new Set(busyIdsRef.current));
  };

  const counts = useMemo(() => {
    const base = { all: messages.length, unread: 0, read: 0, archived: 0 };
    messages.forEach((msg) => {
      const st = normalizeStatus(msg?.status);
      if (st === 'unread') base.unread += 1;
      else if (st === 'read') base.read += 1;
      else if (st === 'archived') base.archived += 1;
    });
    return base;
  }, [messages]);

  const filteredMessages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return messages.filter((msg) => {
      if (!msg || typeof msg !== 'object') return false;
      const st = normalizeStatus(msg.status);
      if (statusFilter !== 'all' && st !== statusFilter) return false;
      if (!q) return true;
      const hay = [
        typeof msg.name === 'string' ? msg.name : '',
        typeof msg.email === 'string' ? msg.email : '',
        getTopicLabel(msg.topic),
        typeof msg.topic === 'string' ? msg.topic : '',
        typeof msg.message === 'string' ? msg.message : ''
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [messages, statusFilter, searchQuery]);

  const handleTabKeyDown = (e, currentIndex) => {
    let nextIndex = null;
    if (e.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % STATUS_TABS.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + STATUS_TABS.length) % STATUS_TABS.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = STATUS_TABS.length - 1;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      setStatusFilter(STATUS_TABS[nextIndex].value);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  const handleRefresh = async () => {
    if (!reloadMessages || refreshing) return;
    setRefreshing(true);
    try {
      await reloadMessages();
    } finally {
      setRefreshing(false);
    }
  };

  const handleStatusChange = async (msg, nextStatus) => {
    if (!db || !msg?.id || busyIdsRef.current.has(msg.id)) return;
    const prevStatus = msg.status;
    setCardBusy(msg.id, true);
    setMessages?.((prev) =>
      prev.map((item) => (item.id === msg.id ? { ...item, status: nextStatus } : item))
    );

    try {
      await updateDoc(doc(db, 'messages', msg.id), {
        status: nextStatus,
        updatedAt: serverTimestamp()
      });
      const labelMap = {
        read: 'Marked message as read.',
        unread: 'Marked message as unread.',
        archived: 'Message archived.'
      };
      showToast?.(labelMap[nextStatus] || 'Message updated.', 'success');
    } catch (err) {
      console.error('Error updating message status:', err);
      setMessages?.((prev) =>
        prev.map((item) => (item.id === msg.id ? { ...item, status: prevStatus } : item))
      );
      showToast?.('Failed to update message: ' + (err?.message || 'Unexpected error'), 'error');
    } finally {
      setCardBusy(msg.id, false);
    }
  };

  const handleDelete = async (msg) => {
    if (!db || !msg?.id || busyIdsRef.current.has(msg.id)) return;
    setCardBusy(msg.id, true);

    try {
      const safeSender =
        (typeof msg.name === 'string' && msg.name.trim()) ||
        (typeof msg.email === 'string' && msg.email.trim()) ||
        'this sender';

      const ok = await confirm({
        title: 'Delete Message?',
        message: `Are you sure you want to permanently delete the inquiry from "${safeSender}"? This cannot be undone.`,
        confirmText: 'Delete Message',
        cancelText: 'Cancel',
        variant: 'danger'
      });
      if (!ok) return;

      setMessages?.((prev) => prev.filter((item) => item.id !== msg.id));

      try {
        await deleteDoc(doc(db, 'messages', msg.id));
        showToast?.('Message deleted.', 'info');
      } catch (err) {
        console.error('Error deleting message:', err);
        setMessages?.((prev) =>
          prev.some((item) => item.id === msg.id) ? prev : [msg, ...prev]
        );
        showToast?.('Failed to delete message: ' + (err?.message || 'Unexpected error'), 'error');
      }
    } finally {
      setCardBusy(msg.id, false);
    }
  };

  return (
    <section id="tab-messages" className="flex flex-col gap-6">
      <AdminPageHeader
        title="Messages Inbox"
        badge={`${counts.unread} unread`}
        description="Review direct portfolio inquiries, reply via email, mark read status, or archive resolved threads."
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-11 sm:min-h-9"
            disabled={refreshing}
            onClick={handleRefresh}
          >
            <IconRefresh
              className={`size-4 ${refreshing ? 'animate-spin' : ''}`}
              stroke={1.75}
              data-icon="inline-start"
              aria-hidden="true"
            />
            Refresh
          </Button>
        }
      />

      {/* FILTER BAR */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="tablist"
          aria-label="Filter messages by status"
          className="flex flex-wrap items-center gap-1.5"
        >
          {STATUS_TABS.map((tab, idx) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                ref={(el) => {
                  tabRefs.current[idx] = el;
                }}
                id={`${tabId}-tab-${tab.value}`}
                type="button"
                role="tab"
                tabIndex={isActive ? 0 : -1}
                aria-selected={isActive}
                aria-controls={panelId}
                onClick={() => setStatusFilter(tab.value)}
                onKeyDown={(e) => handleTabKeyDown(e, idx)}
                className={`inline-flex min-h-11 sm:min-h-9 items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isActive
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`font-mono text-[11px] tabular-nums ${
                    isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  }`}
                >
                  {counts[tab.value]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:max-w-xs">
          <IconSearch
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="text"
            aria-label="Search messages"
            placeholder="Search sender, email, or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 sm:h-9 pl-9 pr-11 sm:pr-9"
          />
          {searchQuery ? (
            <button
              type="button"
              aria-label="Clear message search"
              onClick={() => setSearchQuery('')}
              className="absolute top-1/2 right-0 flex size-11 sm:size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
            >
              <IconX className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      {/* MESSAGES PANEL */}
      <div
        id={panelId}
        role="tabpanel"
        tabIndex={0}
        aria-labelledby={`${tabId}-tab-${statusFilter}`}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
      >
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((n) => (
              <Card key={n} className="py-5">
                <CardContent className="flex flex-col gap-3 px-5">
                  <div className="flex items-center justify-between gap-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card role="alert" className="border-destructive/40 bg-destructive/5 py-8">
            <CardContent className="flex flex-col items-center gap-3 text-center">
              <div className="flex size-11 items-center justify-center rounded-xl border border-destructive/30 bg-destructive/10 text-destructive-text">
                <IconAlertCircle className="size-5" stroke={1.75} aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-foreground">
                  Could not load inbox messages
                </p>
                <p className="max-w-md text-xs text-muted-foreground">{error}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-11 sm:min-h-9"
                disabled={refreshing}
                onClick={handleRefresh}
              >
                <IconRefresh
                  className={`size-4 ${refreshing ? 'animate-spin' : ''}`}
                  stroke={1.75}
                  data-icon="inline-start"
                  aria-hidden="true"
                />
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : filteredMessages.length === 0 ? (
          <Card className="border-dashed py-12">
            <CardContent className="flex flex-col items-center gap-3 text-center">
              <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <IconInbox className="size-6" stroke={1.75} aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-foreground">
                  {messages.length === 0
                    ? 'No inquiries received yet'
                    : 'No messages match this filter'}
                </p>
                <p className="max-w-md text-xs text-muted-foreground">
                  {messages.length === 0
                    ? 'Submissions from your public portfolio contact form will appear here.'
                    : 'Try switching status tabs or clearing your search query.'}
                </p>
              </div>
              {messages.length > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-11 sm:min-h-9"
                  onClick={() => {
                    setStatusFilter('all');
                    setSearchQuery('');
                  }}
                >
                  Reset Filters
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredMessages.map((msg) => {
              const status = normalizeStatus(msg.status);
              const isUnread = status === 'unread';
              const isArchived = status === 'archived';
              const topicLabel = getTopicLabel(msg.topic);
              const isBusy = busyIds.has(msg.id);
              const safeName =
                typeof msg.name === 'string' && msg.name.trim()
                  ? msg.name.trim()
                  : 'Anonymous Visitor';
              const safeEmail = typeof msg.email === 'string' ? msg.email.trim() : '';
              const safeMessage =
                typeof msg.message === 'string' && msg.message.trim()
                  ? msg.message
                  : '(No message content)';
              const replyHref = buildSafeReplyMailto(safeEmail, msg.topic);

              return (
                <Card
                  key={msg.id}
                  className={`py-0 gap-0 overflow-hidden transition-colors ${
                    isUnread ? 'border-foreground/30' : 'border-border'
                  }`}
                >
                  <CardContent className="flex flex-col gap-3.5 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex min-w-0 flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {isUnread ? (
                            <span
                              aria-hidden="true"
                              className="size-2 shrink-0 rounded-full bg-foreground"
                            />
                          ) : null}
                          <h3 className="font-display text-base font-semibold tracking-tight text-foreground">
                            {safeName}
                          </h3>
                          <Badge variant="secondary" className="text-[11px] font-medium">
                            {topicLabel}
                          </Badge>
                          {isUnread ? (
                            <Badge
                              variant="outline"
                              className="border-status-warn-border bg-status-warn-bg text-status-warn-fg text-[11px]"
                            >
                              Unread
                            </Badge>
                          ) : isArchived ? (
                            <Badge variant="outline" className="text-[11px] text-muted-foreground">
                              Archived
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-status-success-border bg-status-success-bg text-status-success-fg text-[11px]"
                            >
                              Read
                            </Badge>
                          )}
                        </div>
                        {safeEmail ? (
                          <span className="truncate font-mono text-xs text-muted-foreground">
                            {safeEmail}
                          </span>
                        ) : null}
                      </div>

                      <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                        {formatMessageTimestamp(msg.createdAt)}
                      </span>
                    </div>

                    <p className="whitespace-pre-wrap break-words rounded-lg border border-border bg-muted/30 p-3.5 text-sm leading-relaxed text-foreground">
                      {safeMessage}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {replyHref ? (
                          <Button asChild size="sm" className="min-h-11 sm:min-h-8">
                            <a href={replyHref}>
                              <IconMail
                                className="size-3.5"
                                stroke={1.75}
                                data-icon="inline-start"
                                aria-hidden="true"
                              />
                              Reply via Email
                            </a>
                          </Button>
                        ) : null}

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="min-h-11 sm:min-h-8"
                          disabled={isBusy}
                          onClick={() => handleStatusChange(msg, isUnread ? 'read' : 'unread')}
                        >
                          {isUnread ? (
                            <>
                              <IconMailOpened
                                className="size-3.5"
                                stroke={1.75}
                                data-icon="inline-start"
                                aria-hidden="true"
                              />
                              Mark as Read
                            </>
                          ) : (
                            <>
                              <IconMailCheck
                                className="size-3.5"
                                stroke={1.75}
                                data-icon="inline-start"
                                aria-hidden="true"
                              />
                              Mark as Unread
                            </>
                          )}
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="min-h-11 sm:min-h-8"
                          disabled={isBusy}
                          onClick={() =>
                            handleStatusChange(msg, isArchived ? 'read' : 'archived')
                          }
                        >
                          {isArchived ? (
                            <>
                              <IconArchiveOff
                                className="size-3.5"
                                stroke={1.75}
                                data-icon="inline-start"
                                aria-hidden="true"
                              />
                              Unarchive
                            </>
                          ) : (
                            <>
                              <IconArchive
                                className="size-3.5"
                                stroke={1.75}
                                data-icon="inline-start"
                                aria-hidden="true"
                              />
                              Archive
                            </>
                          )}
                        </Button>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={isBusy}
                        className="size-11 text-muted-foreground hover:bg-destructive/10 hover:text-destructive-text sm:size-8"
                        aria-label={`Delete message from ${safeName}`}
                        onClick={() => handleDelete(msg)}
                      >
                        <IconTrash className="size-4" stroke={1.75} aria-hidden="true" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
