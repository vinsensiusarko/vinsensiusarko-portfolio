import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminDatabaseTab } from '../../../src/pages/admin/tabs/AdminDatabaseTab';
import { ConfirmProvider } from '../../../src/context/ConfirmContext';

vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getDocs: vi.fn(() =>
      Promise.resolve({
        size: 9,
        docs: [
          { id: 'p1', data: () => ({ title: 'Project 1', order: 1 }) },
          { id: 'p2', data: () => ({ title: 'Project 2', order: 2 }) }
        ]
      })
    ),
    getDoc: vi.fn(() =>
      Promise.resolve({
        exists: () => true,
        data: () => ({ name: 'Vinsensius Arka' })
      })
    ),
    setDoc: vi.fn().mockResolvedValue(),
    addDoc: vi.fn().mockResolvedValue({ id: 'new-id' })
  };
});

describe('AdminDatabaseTab Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders database health cards, export backup button, and restore controls', async () => {
    render(
      <ConfirmProvider>
        <AdminDatabaseTab reloadAll={vi.fn()} showToast={vi.fn()} />
      </ConfirmProvider>
    );

    expect(screen.getByRole('heading', { name: /Database & Backup Center/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText(/Documents/i).length).toBeGreaterThan(0);
    });

    expect(screen.getByRole('button', { name: /Download Full Backup/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Preview Backup Data/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Restore from JSON/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Run Initial Seeder/i })).toBeInTheDocument();
  });

  it('opens preview modal when Preview Backup Data is clicked', async () => {
    const showToastMock = vi.fn();
    render(
      <ConfirmProvider>
        <AdminDatabaseTab reloadAll={vi.fn()} showToast={showToastMock} />
      </ConfirmProvider>
    );

    const previewBtn = screen.getByRole('button', { name: /Preview Backup Data/i });
    fireEvent.click(previewBtn);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Raw JSON Backup Preview/i })).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Copy JSON/i })).toBeInTheDocument();
  });

  it('triggers backup export and downloads JSON file', async () => {
    const showToastMock = vi.fn();
    render(
      <ConfirmProvider>
        <AdminDatabaseTab reloadAll={vi.fn()} showToast={showToastMock} />
      </ConfirmProvider>
    );

    // Mock createObjectURL, revokeObjectURL, and a.click to avoid jsdom navigation warning
    const createObjectUrlMock = vi.fn(() => 'blob:mock-url');
    const revokeObjectUrlMock = vi.fn();
    window.URL.createObjectURL = createObjectUrlMock;
    window.URL.revokeObjectURL = revokeObjectUrlMock;
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    const exportBtn = screen.getByRole('button', { name: /Download Full Backup/i });
    fireEvent.click(exportBtn);

    await waitFor(() => {
      expect(showToastMock).toHaveBeenCalledWith(
        expect.stringMatching(/Backup downloaded successfully/i),
        'success'
      );
    });

    expect(createObjectUrlMock).toHaveBeenCalled();
    expect(revokeObjectUrlMock).toHaveBeenCalledWith('blob:mock-url');
    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });
});
