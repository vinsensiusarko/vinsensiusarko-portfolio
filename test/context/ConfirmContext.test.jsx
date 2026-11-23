import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConfirmProvider, useConfirm } from '../../src/context/ConfirmContext';

function TestConsumer() {
  const confirm = useConfirm();
  return (
    <button
      onClick={async () => {
        const ok = await confirm({
          title: 'Hapus Item?',
          message: 'Item ini akan dihapus permanen.',
          confirmText: 'Ya, Hapus',
          variant: 'danger'
        });
        document.getElementById('result').textContent = ok ? 'CONFIRMED' : 'CANCELLED';
      }}
    >
      Open Dialog
    </button>
  );
}

describe('ConfirmContext & useConfirm', () => {
  it('opens dialog with title and message, resolves true on confirm and false on cancel', async () => {
    render(
      <ConfirmProvider>
        <TestConsumer />
        <div id="result">NONE</div>
      </ConfirmProvider>
    );

    // Open
    fireEvent.click(screen.getByText('Open Dialog'));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('Hapus Item?')).toBeInTheDocument();
    expect(screen.getByText('Item ini akan dihapus permanen.')).toBeInTheDocument();

    // Cancel
    fireEvent.click(screen.getByRole('button', { name: /Batal/i }));
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      expect(screen.getByText('CANCELLED')).toBeInTheDocument();
    });

    // Open and Confirm
    fireEvent.click(screen.getByText('Open Dialog'));
    fireEvent.click(screen.getByRole('button', { name: /Ya, Hapus/i }));
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      expect(screen.getByText('CONFIRMED')).toBeInTheDocument();
    });
  });

  it('dismisses dialog and resolves false when Escape key is pressed (Review Focus #1)', async () => {
    render(
      <ConfirmProvider>
        <TestConsumer />
        <div id="result">NONE</div>
      </ConfirmProvider>
    );

    fireEvent.click(screen.getByText('Open Dialog'));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      expect(screen.getByText('CANCELLED')).toBeInTheDocument();
    });
  });
});
