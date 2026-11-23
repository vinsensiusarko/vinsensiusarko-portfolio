import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminAnalyticsTab } from '../../../src/pages/admin/tabs/AdminAnalyticsTab';
import { ConfirmProvider } from '../../../src/context/ConfirmContext';

describe('AdminAnalyticsTab Component', () => {
  const mockSummary = {
    totalViews: 1250,
    uniqueVisitors: 820,
    cvDownloads: 45,
    devices: { Desktop: 700, Mobile: 480, Tablet: 70 },
    browsers: { Chrome: 800, Safari: 300, Firefox: 100, Edge: 50 },
    os: { Windows: 600, Android: 350, iOS: 200, macOS: 100 }
  };

  const mockDaily = [
    { date: '2026-11-09', views: 120, uniques: 85 },
    { date: '2026-11-10', views: 165, uniques: 110 },
    { date: '2026-11-11', views: 140, uniques: 95 },
    { date: '2026-11-12', views: 190, uniques: 130 },
    { date: '2026-11-13', views: 210, uniques: 145 },
    { date: '2026-11-14', views: 180, uniques: 120 },
    { date: '2026-11-15', views: 245, uniques: 135 }
  ];

  it('renders KPI cards with correct metric values (Review Focus #3)', () => {
    render(
      <ConfirmProvider>
        <AdminAnalyticsTab
          initialSummary={mockSummary}
          initialDaily={mockDaily}
          showToast={vi.fn()}
        />
      </ConfirmProvider>
    );

    expect(screen.getByText('1,250')).toBeInTheDocument(); // Total Views
    expect(screen.getByText('820')).toBeInTheDocument();   // Unique Visitors
    expect(screen.getByText('45')).toBeInTheDocument();    // CV Downloads
    expect(screen.getByText(/Visitor Analytics & Traffic/i)).toBeInTheDocument();
  });

  it('renders 7-day traffic chart and device distribution bars without external chart libraries', () => {
    render(
      <ConfirmProvider>
        <AdminAnalyticsTab
          initialSummary={mockSummary}
          initialDaily={mockDaily}
          showToast={vi.fn()}
        />
      </ConfirmProvider>
    );

    expect(screen.getByText(/7-Day Traffic Trend/i)).toBeInTheDocument();
    expect(screen.getByText(/Device Breakdown/i)).toBeInTheDocument();
    expect(screen.getByText(/Browser Distribution/i)).toBeInTheDocument();
    expect(screen.getByText(/Operating Systems/i)).toBeInTheDocument();
  });

  it('requires confirmation dialog before resetting analytics data (Review Focus #4)', async () => {
    render(
      <ConfirmProvider>
        <AdminAnalyticsTab
          initialSummary={mockSummary}
          initialDaily={mockDaily}
          showToast={vi.fn()}
        />
      </ConfirmProvider>
    );

    const resetBtn = screen.getByRole('button', { name: /Reset Analytics/i });
    fireEvent.click(resetBtn);

    // Confirmation dialog should open
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText(/Reset Analytics Data\?/i)).toBeInTheDocument();

    // Cancel dialog
    const cancelBtn = screen.getByRole('button', { name: /Batal/i });
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
  });
});
