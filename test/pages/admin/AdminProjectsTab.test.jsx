import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminProjectsTab } from '../../../src/pages/admin/tabs/AdminProjectsTab';
import { ConfirmProvider } from '../../../src/context/ConfirmContext';

describe('AdminProjectsTab Gallery & DnD Reordering', () => {
  const mockProjects = [
    {
      id: 'p1',
      title: 'Project One',
      category: 'Web Application',
      order: 1,
      image: '/assets/images/portfolio-1.png',
      gallery: ['/assets/images/portfolio-1.png', '/assets/images/portfolio-2.png']
    },
    {
      id: 'p2',
      title: 'Project Two',
      category: 'Mobile Application',
      order: 2,
      image: '/assets/images/portfolio-3.png'
    }
  ];

  it('renders project list with drag handles and action buttons', () => {
    render(
      <ConfirmProvider>
        <AdminProjectsTab
          projects={mockProjects}
          setProjects={vi.fn()}
          reloadProjects={vi.fn()}
          showToast={vi.fn()}
        />
      </ConfirmProvider>
    );

    expect(screen.getByText('Project One')).toBeInTheDocument();
    expect(screen.getByText('Project Two')).toBeInTheDocument();
    const dragHandles = screen.getAllByTitle(/Drag to reorder/i);
    expect(dragHandles).toHaveLength(2);
  });

  it('opens modal with screenshot gallery management section when editing project with gallery', () => {
    render(
      <ConfirmProvider>
        <AdminProjectsTab
          projects={mockProjects}
          setProjects={vi.fn()}
          reloadProjects={vi.fn()}
          showToast={vi.fn()}
        />
      </ConfirmProvider>
    );

    // Click Edit on Project One
    const editButtons = screen.getAllByRole('button', { name: /Edit/i });
    fireEvent.click(editButtons[0]);

    // Expect modal to be open and show Screenshot Gallery section
    expect(screen.getByText(/Project Screenshot Gallery/i)).toBeInTheDocument();
    expect(screen.getByText(/Multiple screenshots/i)).toBeInTheDocument();

    // Verify 2 screenshots in gallery and delete one
    const deleteGalleryButtons = screen.getAllByTitle(/Remove screenshot/i);
    expect(deleteGalleryButtons).toHaveLength(2);
    fireEvent.click(deleteGalleryButtons[0]);
    expect(screen.getAllByTitle(/Remove screenshot/i)).toHaveLength(1);
  });

  it('triggers drag and drop reordering and updates optimistic project state', async () => {
    const setProjectsMock = vi.fn();
    const showToastMock = vi.fn();

    render(
      <ConfirmProvider>
        <AdminProjectsTab
          projects={mockProjects}
          setProjects={setProjectsMock}
          reloadProjects={vi.fn()}
          showToast={showToastMock}
        />
      </ConfirmProvider>
    );

    const cards = screen.getAllByTitle(/Display Order/i).map((el) => el.closest('.admin-project-card'));
    expect(cards).toHaveLength(2);

    const dataTransfer = {
      setData: vi.fn(),
      getData: vi.fn(() => 'p1'),
      effectAllowed: '',
      dropEffect: ''
    };

    // Drag first card and drop onto second card
    fireEvent.dragStart(cards[0], { dataTransfer });
    fireEvent.dragOver(cards[1], { dataTransfer });
    fireEvent.drop(cards[1], { dataTransfer });

    expect(setProjectsMock).toHaveBeenCalled();
    const reordered = setProjectsMock.mock.calls[0][0];
    expect(reordered[0].id).toBe('p2');
    expect(reordered[1].id).toBe('p1');
    expect(reordered[0].order).toBe(1);
    expect(reordered[1].order).toBe(2);
  });
});
