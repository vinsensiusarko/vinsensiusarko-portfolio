import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContactSection } from '../../../src/components/sections/ContactSection';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('../../../src/services/contactMessages', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    submitContactMessage: vi.fn()
  };
});

import { toast } from 'sonner';
import { submitContactMessage } from '../../../src/services/contactMessages';

describe('ContactSection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    });
  });

  it('renders full email address and social channel links', () => {
    render(
      <ContactSection
        contactSettings={{
          email: 'me@vinsensiusarka.id',
          linkedin: 'https://www.linkedin.com/in/vinsensiusarka/',
          github: 'https://github.com/vinsensiusarko'
        }}
      />
    );

    expect(screen.getByRole('heading', { name: /Contact Me/i })).toBeInTheDocument();
    expect(screen.getByText('me@vinsensiusarka.id')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /LinkedIn profile/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /GitHub profile/i })).toBeInTheDocument();
  });

  it('copies email to clipboard and fires Sonner success toast', async () => {
    render(<ContactSection contactSettings={{ email: 'me@vinsensiusarka.id' }} />);

    const copyBtn = screen.getByRole('button', { name: /Copy email address/i });
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('me@vinsensiusarka.id');
      expect(toast.success).toHaveBeenCalledWith('Copied me@vinsensiusarka.id to clipboard');
    });
  });

  it('keeps AvailabilityBadge hidden by default and displays it when enabled via siteSettings', () => {
    const { rerender } = render(
      <ContactSection
        contactSettings={{ email: 'me@vinsensiusarka.id' }}
        siteSettings={{ availabilityStatus: 'hidden' }}
      />
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    rerender(
      <ContactSection
        contactSettings={{ email: 'me@vinsensiusarka.id' }}
        siteSettings={{ availabilityStatus: 'available', availabilityText: 'Open for freelance builds' }}
      />
    );
    expect(screen.getByRole('status', { name: 'Open for freelance builds' })).toBeInTheDocument();
  });

  it('validates direct contact form fields and submits a valid inquiry cleanly', async () => {
    submitContactMessage.mockResolvedValueOnce({ ok: true, id: 'msg-1' });
    render(<ContactSection contactSettings={{ email: 'me@vinsensiusarka.id' }} />);

    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));
    expect(screen.getByText(/Please enter your name/i)).toBeInTheDocument();
    expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
    expect(screen.getByText(/Please write at least 10 characters/i)).toBeInTheDocument();
    expect(submitContactMessage).not.toHaveBeenCalled();

    const freelanceRadio = screen.getByRole('radio', { name: /Freelance Project/i });
    freelanceRadio.focus();
    fireEvent.keyDown(freelanceRadio, { key: 'ArrowRight' });
    expect(screen.getByRole('radio', { name: /Job Opportunity/i })).toHaveAttribute(
      'aria-checked',
      'true'
    );

    fireEvent.change(screen.getByLabelText(/Your Name/i), { target: { value: 'Alex Rivera' } });
    fireEvent.change(screen.getByLabelText(/^Email Address$/i), {
      target: { value: 'alex@studio.dev' }
    });
    fireEvent.change(screen.getByLabelText(/^Message$/i), {
      target: { value: 'We would love to discuss a Flutter mobile engineering role.' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));

    await waitFor(() => {
      expect(submitContactMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Alex Rivera',
          email: 'alex@studio.dev',
          topic: 'hiring'
        })
      );
      expect(screen.getByRole('heading', { name: /Message Received/i })).toBeInTheDocument();
    });
  });

  it('displays error alert with prefilled mailto fallback when submission fails', async () => {
    submitContactMessage.mockResolvedValueOnce({
      ok: false,
      code: 'permission-denied',
      message: 'Direct form submissions are currently unavailable.'
    });

    render(<ContactSection contactSettings={{ email: 'me@vinsensiusarka.id' }} />);

    fireEvent.change(screen.getByLabelText(/Your Name/i), { target: { value: 'Jordan' } });
    fireEvent.change(screen.getByLabelText(/^Email Address$/i), {
      target: { value: 'jordan@acme.io' }
    });
    fireEvent.change(screen.getByLabelText(/^Message$/i), {
      target: { value: 'Interested in hiring you for a React dashboard build.' }
    });
    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/currently unavailable/i);
    const mailtoLink = screen.getByRole('link', { name: /Open in Email Client/i });
    expect(mailtoLink).toHaveAttribute('href', expect.stringContaining('mailto:me@vinsensiusarka.id'));
    expect(mailtoLink).toHaveAttribute('href', expect.stringContaining(encodeURIComponent('React dashboard')));
  });
});
