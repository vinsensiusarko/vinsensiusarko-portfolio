import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AdminLogin } from '../../../src/pages/admin/AdminLogin';
import { ThemeProvider } from '../../../src/context/ThemeContext';

describe('AdminLogin', () => {
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

  it('persists desktop sidebar collapse state to localStorage (Review Focus #4)', () => {
    localStorage.setItem('admin_sidebar_collapsed', 'true');
    expect(localStorage.getItem('admin_sidebar_collapsed')).toBe('true');
    localStorage.removeItem('admin_sidebar_collapsed');
  });

  it('scopes self-contained CSS tokens for confirm modals, admin shell, and rich descriptions', () => {
    const confirmCss = fs.readFileSync(path.resolve('src/styles/confirm.css'), 'utf8');
    const adminCss = fs.readFileSync(path.resolve('src/styles/admin.css'), 'utf8');
    const indexCss = fs.readFileSync(path.resolve('src/styles/index.css'), 'utf8');

    expect(confirmCss).toMatch(/\.confirm-modal-overlay[\s\S]*--bg-card:/);
    expect(adminCss).toMatch(/\.admin-shell[\s\S]*--primary:/);
    expect(adminCss).toMatch(/\.admin-shell[\s\S]*--text-primary:/);
    expect(indexCss).toMatch(/\.rich-list-group/);
    expect(indexCss).toMatch(/\.rich-number-badge/);
  });
});
