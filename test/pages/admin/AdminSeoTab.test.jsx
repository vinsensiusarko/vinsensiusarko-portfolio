import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminSeoTab } from '../../../src/pages/admin/tabs/AdminSeoTab';

vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getDoc: vi.fn(() =>
      Promise.resolve({
        exists: () => true,
        data: () => ({
          name: 'Vinsensius Arka',
          ogTitle: 'Vinsensius Arka — Custom OG',
          ogRole: 'Mobile & Web Specialist',
          ogDescription: 'Custom social preview description',
          heroImage: '/assets/images/arko-pic.jpg'
        })
      })
    ),
    setDoc: vi.fn().mockResolvedValue()
  };
});

describe('AdminSeoTab Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,mock_canvas_data_url');
  });

  it('renders SEO & OpenGraph generator with canvas, controls, and theme selectors', async () => {
    render(<AdminSeoTab showToast={vi.fn()} />);

    expect(
      screen.getByRole('heading', { name: /SEO & OpenGraph Image Generator/i })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByLabelText(/Headline \/ Author Name/i)).toHaveValue(
        'Vinsensius Arka — Custom OG'
      );
    });

    expect(screen.getByRole('button', { name: /Cyber Indigo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Midnight Navy/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sunset Plum/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download 1200×630 PNG/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save as Website SEO/i })).toBeInTheDocument();
  });

  it('switches social preview platform frames (Twitter, WhatsApp, LinkedIn)', async () => {
    render(<AdminSeoTab showToast={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByTitle(/Preview as Twitter \/ X/i)).toBeInTheDocument();
    });

    const waBtn = screen.getByTitle(/Preview as WhatsApp/i);
    fireEvent.click(waBtn);
    expect(waBtn).toHaveClass('active');

    const liBtn = screen.getByTitle(/Preview as LinkedIn/i);
    fireEvent.click(liBtn);
    expect(liBtn).toHaveClass('active');
  });

  it('updates form inputs when user modifies headline or tagline', async () => {
    render(<AdminSeoTab showToast={vi.fn()} />);

    const titleInput = await screen.findByLabelText(/Headline \/ Author Name/i);
    fireEvent.change(titleInput, { target: { value: 'New Brand Title' } });
    expect(titleInput.value).toBe('New Brand Title');

    const roleInput = screen.getByLabelText(/Professional Role \/ Subtitle/i);
    fireEvent.change(roleInput, { target: { value: 'Senior Flutter Engineer' } });
    expect(roleInput.value).toBe('Senior Flutter Engineer');
  });

  it('triggers save to Firestore when Save as Website SEO is clicked', async () => {
    const showToastMock = vi.fn();
    render(<AdminSeoTab showToast={showToastMock} />);

    await screen.findByLabelText(/Headline \/ Author Name/i);

    const saveBtn = screen.getByRole('button', { name: /Save as Website SEO/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(showToastMock).toHaveBeenCalledWith(
        expect.stringMatching(/OpenGraph image & SEO settings saved/i),
        'success'
      );
    });
  });
});
