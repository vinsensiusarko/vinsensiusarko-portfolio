import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { setDoc } from 'firebase/firestore';
import { ConfirmProvider } from '../../../src/context/ConfirmContext';
import { AdminProfileTab } from '../../../src/pages/admin/tabs/AdminProfileTab';
import { AdminContactTab } from '../../../src/pages/admin/tabs/AdminContactTab';
import { AdminPrivacyTab } from '../../../src/pages/admin/tabs/AdminPrivacyTab';

vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getDoc: vi.fn(() => Promise.resolve({ exists: () => false, data: () => ({}) })),
    setDoc: vi.fn().mockResolvedValue()
  };
});

describe('Admin Settings Tabs (Profile, Contact, Privacy)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders AdminProfileTab with identity fields, photo dropzones, and CV controls', async () => {
    render(<AdminProfileTab showToast={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Full Display Name/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/Hero Greeting/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/About Me Biography Paragraph/i)).toBeInTheDocument();
    expect(screen.getByText(/Click or Drop Hero Photo Here/i)).toBeInTheDocument();
    expect(screen.getByText(/Click or Drop About Photo Here/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/CV File Path or Google Drive Link/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Profile & Bio Changes/i })).toBeInTheDocument();
  });

  it('supports Availability Status controls and Timeline add, reorder, delete, and save in AdminProfileTab', async () => {
    const showToastMock = vi.fn();
    render(<AdminProfileTab showToast={showToastMock} />);

    const customStatusInput = await screen.findByLabelText(/Custom Status Label/i);
    fireEvent.change(customStatusInput, { target: { value: 'Open for Flutter builds' } });

    // Starts with 2 fallback timeline entries
    expect(screen.getAllByLabelText(/Role \/ Degree Title/i)).toHaveLength(2);

    // Add a 3rd entry
    fireEvent.click(screen.getByRole('button', { name: /Add Entry/i }));
    const titleInputsAfterAdd = screen.getAllByLabelText(/Role \/ Degree Title/i);
    expect(titleInputsAfterAdd).toHaveLength(3);
    fireEvent.change(titleInputsAfterAdd[2], { target: { value: 'Software Engineer Intern' } });

    // Reorder entry 3 up to position 2
    fireEvent.click(screen.getByRole('button', { name: /Move timeline entry 3 up/i }));
    expect(screen.getAllByLabelText(/Role \/ Degree Title/i)[1]).toHaveValue(
      'Software Engineer Intern'
    );

    // Delete the last entry (index 3)
    fireEvent.click(screen.getByRole('button', { name: /Delete timeline entry 3/i }));
    expect(screen.getAllByLabelText(/Role \/ Degree Title/i)).toHaveLength(2);

    // Save form and verify setDoc receives availability & timeline payload
    fireEvent.submit(customStatusInput.closest('form'));
    await waitFor(() => {
      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          availabilityStatus: 'hidden',
          availabilityText: 'Open for Flutter builds',
          timeline: expect.arrayContaining([
            expect.objectContaining({ title: 'Software Engineer Intern' })
          ])
        }),
        { merge: true }
      );
    });
  });

  it('renders AdminContactTab channels and saves updates', async () => {
    const showToastMock = vi.fn();
    render(<AdminContactTab showToast={showToastMock} />);

    const emailInput = await screen.findByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'hello@vinsensiusarka.id' } });
    expect(emailInput.value).toBe('hello@vinsensiusarka.id');

    const form = emailInput.closest('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(showToastMock).toHaveBeenCalledWith(
        expect.stringMatching(/Contact & Social links updated/i),
        'success'
      );
    });
  });

  it('renders AdminPrivacyTab with Preview link, Today button, and Reset Defaults confirmation', async () => {
    const showToastMock = vi.fn();
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <AdminPrivacyTab showToast={showToastMock} />
        </ConfirmProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Page Title/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: /Preview Page/i })).toHaveAttribute(
      'href',
      '/privacy-policy'
    );

    fireEvent.click(screen.getByRole('button', { name: /Today/i }));
    expect(showToastMock).toHaveBeenCalledWith(expect.stringMatching(/Date set to/i), 'info');

    fireEvent.click(screen.getByRole('button', { name: /Reset Defaults/i }));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText(/Reset Template Privacy Policy\?/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Batal/i }));
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
  });
});
