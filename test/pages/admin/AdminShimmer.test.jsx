import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  AdminStatsShimmer,
  AdminProjectsShimmer,
  AdminSkillsShimmer,
  AdminFormShimmer,
  AdminDashboardSkeleton
} from '../../../src/pages/admin/AdminShimmer';

describe('AdminShimmer Components', () => {
  it('renders AdminStatsShimmer with 3 stat shimmer boxes', () => {
    const { container } = render(<AdminStatsShimmer />);
    expect(screen.getByTestId('admin-stats-shimmer')).toBeInTheDocument();
    expect(container.querySelectorAll('.shimmer-stat-box')).toHaveLength(3);
    expect(container.querySelectorAll('.admin-shimmer')).toHaveLength(9);
  });

  it('renders AdminProjectsShimmer with default and custom count', () => {
    const { container: cDefault } = render(<AdminProjectsShimmer />);
    expect(screen.getByTestId('admin-projects-shimmer')).toBeInTheDocument();
    expect(cDefault.querySelectorAll('.shimmer-project-card')).toHaveLength(6);

    const { container: cCustom } = render(<AdminProjectsShimmer count={3} />);
    expect(cCustom.querySelectorAll('.shimmer-project-card')).toHaveLength(3);
  });

  it('renders AdminSkillsShimmer with two columns and item rows', () => {
    const { container } = render(<AdminSkillsShimmer />);
    expect(screen.getByTestId('admin-skills-shimmer')).toBeInTheDocument();
    expect(container.querySelectorAll('.skill-item-row')).toHaveLength(8);
  });

  it('renders AdminFormShimmer with configurable fields', () => {
    const { container: c4 } = render(<AdminFormShimmer fields={4} />);
    expect(screen.getByTestId('admin-form-shimmer')).toBeInTheDocument();
    expect(c4.querySelectorAll('.form-group')).toHaveLength(5); // 2 + 1 + 2

    const { container: c2 } = render(<AdminFormShimmer fields={2} />);
    expect(c2.querySelectorAll('.form-group')).toHaveLength(3); // 2 + 1
  });

  it('renders AdminDashboardSkeleton with sidebar and pulse dot banner', () => {
    render(<AdminDashboardSkeleton />);
    expect(screen.getByTestId('admin-dashboard-skeleton')).toBeInTheDocument();
    expect(screen.getByText(/Verifying Admin Session/i)).toBeInTheDocument();
    expect(screen.getByTestId('admin-stats-shimmer')).toBeInTheDocument();
  });
});
