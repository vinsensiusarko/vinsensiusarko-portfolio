import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminSkillsTab } from '../../../src/pages/admin/tabs/AdminSkillsTab';
import { ConfirmProvider } from '../../../src/context/ConfirmContext';

vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    writeBatch: vi.fn(() => ({
      update: vi.fn(),
      commit: vi.fn().mockResolvedValue()
    }))
  };
});

describe('AdminSkillsTab Drag and Drop Reordering', () => {
  const mockSkills = [
    { id: 's1', name: 'JavaScript', category: 'language', order: 1, level: 'Experienced' },
    { id: 's2', name: 'Python', category: 'language', order: 2, level: 'Experienced' },
    { id: 's3', name: 'React', category: 'framework_tool', order: 1, level: 'Experienced' }
  ];

  it('renders skill rows with drag handles (Review Focus #5)', () => {
    render(
      <ConfirmProvider>
        <AdminSkillsTab
          skills={mockSkills}
          reloadSkills={vi.fn()}
          showToast={vi.fn()}
        />
      </ConfirmProvider>
    );

    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getAllByTitle(/Drag to reorder/i)).toHaveLength(3);
  });

  it('prevents dropping between different categories (Review Focus #5)', () => {
    const showToastMock = vi.fn();
    render(
      <ConfirmProvider>
        <AdminSkillsTab
          skills={mockSkills}
          reloadSkills={vi.fn()}
          showToast={showToastMock}
        />
      </ConfirmProvider>
    );

    const rows = screen.getAllByTitle(/Drag to reorder/i).map((el) => el.closest('.skill-item-row'));
    expect(rows).toHaveLength(3);

    const dataTransfer = {
      setData: vi.fn(),
      getData: vi.fn(() => 's1'), // JavaScript (language)
      effectAllowed: '',
      dropEffect: ''
    };

    // Drag language skill (s1) and drop onto framework skill (s3)
    fireEvent.dragStart(rows[0], { dataTransfer });
    fireEvent.dragOver(rows[2], { dataTransfer });
    fireEvent.drop(rows[2], { dataTransfer });

    // Expect warning toast and no category mutation
    expect(showToastMock).toHaveBeenCalledWith(
      expect.stringMatching(/across different categories/i),
      'warning'
    );
  });

  it('allows reordering within the same category', async () => {
    const showToastMock = vi.fn();
    const reloadSkillsMock = vi.fn();

    render(
      <ConfirmProvider>
        <AdminSkillsTab
          skills={mockSkills}
          reloadSkills={reloadSkillsMock}
          showToast={showToastMock}
        />
      </ConfirmProvider>
    );

    const rows = screen.getAllByTitle(/Drag to reorder/i).map((el) => el.closest('.skill-item-row'));

    const dataTransfer = {
      setData: vi.fn(),
      getData: vi.fn(() => 's1'), // JavaScript (language)
      effectAllowed: '',
      dropEffect: ''
    };

    // Drag language skill (s1) and drop onto another language skill (s2)
    fireEvent.dragStart(rows[0], { dataTransfer });
    fireEvent.dragOver(rows[1], { dataTransfer });
    fireEvent.drop(rows[1], { dataTransfer });

    // Toast indicates reordering success
    await waitFor(() => {
      expect(showToastMock).toHaveBeenCalledWith(
        expect.stringMatching(/Reordered "JavaScript" to position #2/i),
        'success'
      );
    });
  });
});
