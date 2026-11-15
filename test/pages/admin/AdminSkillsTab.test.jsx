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

    expect(screen.getAllByText('JavaScript')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Python')[0]).toBeInTheDocument();
    expect(screen.getAllByText('React')[0]).toBeInTheDocument();
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

  it('opens add skill modal with preset icon picker chips that populate form data', () => {
    render(
      <ConfirmProvider>
        <AdminSkillsTab
          skills={mockSkills}
          reloadSkills={vi.fn()}
          showToast={vi.fn()}
        />
      </ConfirmProvider>
    );

    // Each row renders a .skill-icon-box
    const iconBoxes = document.querySelectorAll('.skill-item-row .skill-icon-box');
    expect(iconBoxes.length).toBe(3);

    // Click Add Skill button
    fireEvent.click(screen.getByRole('button', { name: /Add Skill/i }));

    // Preset icon selector should be present
    expect(screen.getByText(/Preset Icons/i)).toBeInTheDocument();
    const flutterChip = screen.getByRole('button', { name: /Flutter/i });
    expect(flutterChip).toBeInTheDocument();

    // Click Flutter preset chip -> sets skill name and icon
    fireEvent.click(flutterChip);
    expect(screen.getByLabelText(/Skill Name/i)).toHaveValue('Flutter');

    // Click Dart preset chip -> sets Dart
    const dartChip = screen.getByRole('button', { name: /Dart/i });
    expect(dartChip).toBeInTheDocument();
    fireEvent.click(dartChip);
    expect(screen.getByLabelText(/Skill Name/i)).toHaveValue('Dart');

    // Click Arko CMS preset chip -> sets Arko CMS
    const arkoChip = screen.getByRole('button', { name: /Arko CMS/i });
    expect(arkoChip).toBeInTheDocument();
    fireEvent.click(arkoChip);
    expect(screen.getByLabelText(/Skill Name/i)).toHaveValue('Arko CMS');
  });

  it('switches between Font Awesome and Upload PNG/SVG icon source tabs', () => {
    render(
      <ConfirmProvider>
        <AdminSkillsTab
          skills={mockSkills}
          reloadSkills={vi.fn()}
          showToast={vi.fn()}
        />
      </ConfirmProvider>
    );

    // Click Add Skill button
    fireEvent.click(screen.getByRole('button', { name: /Add Skill/i }));

    // Switch to Upload tab
    const uploadTabBtn = screen.getByRole('button', { name: /Upload PNG \/ SVG/i });
    expect(uploadTabBtn).toBeInTheDocument();
    fireEvent.click(uploadTabBtn);

    // File input and Arko favicon shortcut should be present
    expect(screen.getByLabelText(/Upload Skill Icon/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pakai Asset Favicon Arko/i })).toBeInTheDocument();

    // Click Pakai Favicon shortcut
    fireEvent.click(screen.getByRole('button', { name: /Pakai Asset Favicon Arko/i }));
    expect(screen.getByLabelText(/Skill Name/i)).toHaveValue('Arko CMS');

    // Switch back to Font Awesome tab
    const faTabBtn = screen.getByRole('button', { name: /Font Awesome \/ Auto SVG/i });
    fireEvent.click(faTabBtn);
    expect(screen.getByLabelText(/Font Awesome Class or Tech Name/i)).toBeInTheDocument();
  });
});
