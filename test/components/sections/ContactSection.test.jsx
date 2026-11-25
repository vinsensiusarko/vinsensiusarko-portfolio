import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContactSection } from '../../../src/components/sections/ContactSection';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

import { toast } from 'sonner';

describe('ContactSection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
