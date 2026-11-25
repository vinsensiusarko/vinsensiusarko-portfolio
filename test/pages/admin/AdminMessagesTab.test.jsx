import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { updateDoc, deleteDoc } from 'firebase/firestore';
import { ConfirmProvider } from '../../../src/context/ConfirmContext';
import { AdminMessagesTab } from '../../../src/pages/admin/tabs/AdminMessagesTab';

vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    updateDoc: vi.fn().mockResolvedValue(),
    deleteDoc: vi.fn().mockResolvedValue(),
    serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP')
  };
});

const SAMPLE_MESSAGES = [
  {
    id: 'm1',
    name: 'Alex Rivera',
    email: 'alex@studio.dev',
    topic: 'freelance',
    message: 'Need a Flutter POS mobile app built for Q3.',
    status: 'unread',
    createdAt: '2026-11-25T10:00:00Z'
  },
  {
    id: 'm2',
    name: 'Sam Lee',
    email: 'sam@company.io',
    topic: 'hiring',
    message: 'Interested in interviewing you for a full-stack role.',
    status: 'read',
    createdAt: '2026-11-24T09:00:00Z'
  },
  {
    id: 'm3',
    name: 'Jordan Kim',
    email: 'jordan@archive.org',
    topic: 'general',
    message: 'Old completed inquiry thread.',
    status: 'archived',
    createdAt: '2026-11-20T08:00:00Z'
  }
];

function renderInbox(props = {}) {
  return render(
    <ConfirmProvider>
      <AdminMessagesTab
        messages={SAMPLE_MESSAGES}
        setMessages={vi.fn()}
        reloadMessages={vi.fn()}
        showToast={vi.fn()}
        {...props}
      />
    </ConfirmProvider>
  );
}

describe('AdminMessagesTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders messages, filters by status tabs with keyboard navigation, and filters by search', () => {
    renderInbox();

    expect(screen.getByRole('heading', { name: /Messages Inbox/i })).toBeInTheDocument();
    expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
    expect(screen.getByText('Sam Lee')).toBeInTheDocument();
    expect(screen.getByText('Jordan Kim')).toBeInTheDocument();

    const allTab = screen.getByRole('tab', { name: /^All/i });
    allTab.focus();
    fireEvent.keyDown(allTab, { key: 'ArrowRight' });

    expect(screen.getByRole('tab', { name: /^Unread/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
    expect(screen.queryByText('Sam Lee')).not.toBeInTheDocument();

    fireEvent.click(allTab);
    fireEvent.change(screen.getByLabelText(/Search messages/i), { target: { value: 'full-stack' } });
    expect(screen.getByText('Sam Lee')).toBeInTheDocument();
    expect(screen.queryByText('Alex Rivera')).not.toBeInTheDocument();
  });

  it('provides prefilled Reply via Email link and supports Mark as Read, Archive, and confirmed Delete', async () => {
    const showToastMock = vi.fn();
    const setMessagesMock = vi.fn();
    renderInbox({ showToast: showToastMock, setMessages: setMessagesMock });

    const replyLinks = screen.getAllByRole('link', { name: /Reply via Email/i });
    expect(replyLinks[0]).toHaveAttribute(
      'href',
      expect.stringContaining('mailto:alex@studio.dev?subject=')
    );

    fireEvent.click(screen.getByRole('button', { name: /Mark as Read/i }));
    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ status: 'read' })
      );
    });

    fireEvent.click(screen.getAllByRole('button', { name: /^Archive$/i })[0]);
    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ status: 'archived' })
      );
    });

    fireEvent.click(screen.getByRole('button', { name: /Delete message from Alex Rivera/i }));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^Delete Message$/i }));

    await waitFor(() => {
      expect(deleteDoc).toHaveBeenCalled();
      expect(showToastMock).toHaveBeenCalledWith('Message deleted.', 'info');
    });
  });
});
