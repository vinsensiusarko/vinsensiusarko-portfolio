import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AdminLogin } from '../../../src/pages/admin/AdminLogin';
import { AdminPage } from '../../../src/pages/admin/AdminPage';
import { ThemeProvider } from '../../../src/context/ThemeContext';

vi.mock('firebase/auth', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    onAuthStateChanged: vi.fn((_auth, callback) => {
      callback({ email: 'admin@vinsensiusarka.id' });
      return vi.fn();
    }),
    signOut: vi.fn().mockResolvedValue()
  };
});

vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getDocs: vi.fn(() => Promise.resolve({ size: 0, docs: [] })),
    getDoc: vi.fn(() => Promise.resolve({ exists: () => false, data: () => ({}) }))
  };
});

describe('AdminLogin & AdminPage Shell', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders login form with email, password inputs and back link', () => {
    const showToastMock = vi.fn();
    render(
      <MemoryRouter>
        <AdminLogin showToast={showToastMock} />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Admin Portal/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to Public Portfolio/i })).toHaveAttribute('href', '/');
  });

  it('updates input fields on user change', () => {
    const showToastMock = vi.fn();
    render(
      <MemoryRouter>
        <AdminLogin showToast={showToastMock} />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Email Address/i);
    const passInput = screen.getByLabelText(/Password/i);

    fireEvent.change(emailInput, { target: { value: 'test@admin.com' } });
    fireEvent.change(passInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@admin.com');
    expect(passInput.value).toBe('password123');
  });

  it('renders grouped sidebar shell without global stats-grid banner and persists sidebar state', async () => {
    const { container } = render(
      <MemoryRouter>
        <ThemeProvider>
          <AdminPage />
        </ThemeProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    expect(screen.getByText('Insights')).toBeInTheDocument();
    expect(screen.getByText('Site Settings')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
    expect(screen.getByText('admin@vinsensiusarka.id')).toBeInTheDocument();
    expect(container.querySelector('.stats-grid')).not.toBeInTheDocument();

    const collapseBtn = screen.getByRole('button', { name: /Toggle Collapse Sidebar/i });
    fireEvent.click(collapseBtn);
    expect(localStorage.getItem('admin_sidebar_collapsed')).toBe('true');

    const contactTabBtn = screen.getByRole('button', { name: /Contact & Socials/i });
    fireEvent.click(contactTabBtn);
    expect(localStorage.getItem('admin_active_tab')).toBe('contact');
    expect(screen.getByRole('heading', { name: /Contact & Social Channels/i })).toBeInTheDocument();
    await screen.findByLabelText(/Email Address/i);
  });

  it('retires legacy CSS files and keeps rich description utilities in index.css', () => {
    const styleFiles = fs.readdirSync(path.resolve('src/styles'));
    expect(styleFiles).toEqual(['index.css']);

    const indexCss = fs.readFileSync(path.resolve('src/styles/index.css'), 'utf8');
    expect(indexCss).toMatch(/\.rich-list-group/);
    expect(indexCss).toMatch(/\.rich-number-badge/);
  });
});
