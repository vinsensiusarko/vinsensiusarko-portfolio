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
});
