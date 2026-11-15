# Sub-Project 2: Project Multi-Image Detail Gallery & Drag-and-Drop Reordering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Sub-Project 2 to provide a multi-image detail gallery (with thumbnail strip, carousel arrows, and keyboard navigation) in the public Quick View modal, multi-image upload in the Admin CMS, and native HTML5 drag-and-drop reordering for projects and skills.

**Architecture:** Project documents in Firestore store an optional `gallery: string[]` array containing compressed Base64 or URL strings. `ProjectModal` renders an interactive multi-image viewer with keyboard navigation (`ArrowLeft` / `ArrowRight`), prev/next buttons, and a thumbnail strip with active indicators. `AdminProjectsTab` and `AdminSkillsTab` implement zero-dependency native HTML5 drag-and-drop events with optimistic UI reordering and Firestore batch writes.

**Tech Stack:** React 19, Vite 6, HTML5 Drag and Drop API, Vitest 3, JSDOM, CSS Variables.

**Spec:** `docs/superpowers/specs/2026-11-15-project-gallery-drag-and-drop-design.md`

## Global Constraints

- Zero external drag-and-drop library dependencies (native HTML5 DnD only).
- Zero regressions on existing features (React 19, 4-Season Animation Engine, Confirm Dialogs, Theme tokens).
- Maximum 6 gallery images per project compressed via Canvas (~40KB each) to keep document size < 300KB.
- All new tests must be placed in the dedicated `test/` folder hierarchy.

## Review Focus

1. **Single-image backward compatibility**: When `project.gallery` is undefined or empty, `ProjectModal` must gracefully render the single primary thumbnail without empty thumbnail strips or disabled error states.
2. **Gallery keyboard navigation bounds**: Pressing `ArrowLeft` at index 0 must wrap around to the last image, and pressing `ArrowRight` at the last index must wrap around to index 0 smoothly.
3. **Modal input isolation**: Arrow keys pressed while typing in search or textarea must not trigger gallery image navigation.
4. **Optimistic DnD Reordering failure rollback**: If a Firestore `writeBatch` fails during drag-and-drop, the error must be logged, a toast shown, and previous order restored.
5. **Drag-and-Drop category isolation**: Dragging a skill from the Languages column into the Frameworks/Tools column must be prevented or handled cleanly without corrupting category classifications.

---

## Tasks

### Task 1: Public Project Detail Gallery in `ProjectModal.jsx`

**Files:**
- Modify: `src/components/sections/ProjectModal.jsx`
- Modify: `src/styles/global.css`
- Create: `test/components/sections/ProjectModal.test.jsx`

**Interfaces:**
- Input: `project: { id, title, image, imageBase64, gallery?: string[], ... }`
- State: `activeImageIndex: number`

- [x] **Step 1: Write failing test for `ProjectModal` gallery**

```javascript
// test/components/sections/ProjectModal.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectModal } from '../../../src/components/sections/ProjectModal';

describe('ProjectModal Gallery', () => {
  const singleImageProject = {
    id: 'proj-1',
    title: 'Single Image App',
    image: '/assets/images/portfolio-1.png'
  };

  const galleryProject = {
    id: 'proj-2',
    title: 'Multi Image App',
    image: '/assets/images/portfolio-1.png',
    gallery: [
      '/assets/images/portfolio-1.png',
      '/assets/images/portfolio-2.png',
      '/assets/images/portfolio-3.png'
    ]
  };

  it('renders single image without gallery strip when gallery is absent (Review Focus #1)', () => {
    render(<ProjectModal project={singleImageProject} onClose={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: /Image Gallery Thumbnails/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Previous image/i)).not.toBeInTheDocument();
  });

  it('renders gallery with counter, prev/next arrows, and thumbnail strip (Review Focus #2)', () => {
    render(<ProjectModal project={galleryProject} onClose={vi.fn()} />);
    
    // Counter badge
    expect(screen.getByText('1 / 3')).toBeInTheDocument();

    // Prev and Next buttons
    const nextBtn = screen.getByLabelText(/Next image/i);
    const prevBtn = screen.getByLabelText(/Previous image/i);
    expect(nextBtn).toBeInTheDocument();
    expect(prevBtn).toBeInTheDocument();

    // Click Next -> counter becomes 2 / 3
    fireEvent.click(nextBtn);
    expect(screen.getByText('2 / 3')).toBeInTheDocument();

    // Click Prev -> counter returns to 1 / 3
    fireEvent.click(prevBtn);
    expect(screen.getByText('1 / 3')).toBeInTheDocument();

    // Click Prev again -> wraps around to 3 / 3
    fireEvent.click(prevBtn);
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
  });

  it('supports keyboard ArrowLeft and ArrowRight navigation and Escape dismissal', () => {
    const onCloseMock = vi.fn();
    render(<ProjectModal project={galleryProject} onClose={onCloseMock} />);

    // ArrowRight -> 2 / 3
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(screen.getByText('2 / 3')).toBeInTheDocument();

    // ArrowLeft -> 1 / 3
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(screen.getByText('1 / 3')).toBeInTheDocument();

    // Escape -> triggers onClose
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onCloseMock).toHaveBeenCalled();
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/components/sections/ProjectModal.test.jsx`
Expected: FAIL with missing gallery elements

- [x] **Step 3: Implement multi-image detail gallery in `ProjectModal.jsx`**

In `src/components/sections/ProjectModal.jsx`:
- Add `const [activeImageIndex, setActiveImageIndex] = useState(0);`.
- Reset `setActiveImageIndex(0)` when `project?.id` changes.
- Compute images list:
  ```javascript
  const primaryImg = resolveProjectImage(project);
  const rawGallery = Array.isArray(project.gallery) ? project.gallery : [];
  const allImages = rawGallery.length > 0 ? Array.from(new Set([primaryImg, ...rawGallery])) : [primaryImg];
  const hasGallery = allImages.length > 1;
  const currentImg = allImages[activeImageIndex] || primaryImg;
  ```
- Handle keyboard navigation (`ArrowLeft` -> decrement with wrap, `ArrowRight` -> increment with wrap).
- In JSX:
  - Render Prev and Next buttons over the hero image when `hasGallery`.
  - Render `${activeImageIndex + 1} / ${allImages.length}` counter badge.
  - Render `<div className="project-modal-gallery-strip" role="region" aria-label="Image Gallery Thumbnails">` below the hero image with active glowing border.
- In `src/styles/global.css`: Add styles for `.project-modal-gallery-strip`, `.gallery-thumb-btn`, `.gallery-nav-btn`, `.gallery-counter-badge`.

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/components/sections/ProjectModal.test.jsx`
Expected: PASS

- [x] **Step 5: Commit**

```bash
git add src/components/sections/ProjectModal.jsx src/styles/global.css test/components/sections/ProjectModal.test.jsx
git commit -m "feat(gallery): add interactive multi-image project gallery to Quick View modal"
```

---

### Task 2: Admin Project Gallery Management in `AdminProjectsTab.jsx`

**Files:**
- Modify: `src/pages/admin/tabs/AdminProjectsTab.jsx`
- Modify: `src/styles/admin.css`
- Create: `test/pages/admin/AdminProjectsTab.test.jsx`

**Interfaces:**
- Field: `formData.gallery: string[]`
- Upload handler: `handleGalleryFiles(FileList) => Promise<void>`

- [x] **Step 1: Write test for Admin gallery management**

```javascript
// test/pages/admin/AdminProjectsTab.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AdminProjectsTab } from '../../../src/pages/admin/tabs/AdminProjectsTab';
import { ConfirmProvider } from '../../../src/context/ConfirmContext';

describe('AdminProjectsTab Gallery & Management', () => {
  it('renders project list with drag handles and action buttons', () => {
    const mockProjects = [
      { id: 'p1', title: 'Test Project 1', category: 'Web Application', order: 1 },
      { id: 'p2', title: 'Test Project 2', category: 'Mobile Application', order: 2 }
    ];

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

    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    expect(screen.getByText('Test Project 2')).toBeInTheDocument();
    expect(screen.getAllByTitle(/Drag to reorder/i)).toHaveLength(2);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/pages/admin/AdminProjectsTab.test.jsx`
Expected: FAIL with "Unable to find an element with title: /Drag to reorder/i"

- [x] **Step 3: Implement gallery upload & management in `AdminProjectsTab.jsx`**

- In `INITIAL_FORM`: add `gallery: []`.
- When opening edit modal: load `gallery: Array.isArray(project.gallery) ? project.gallery : []`.
- Add `handleGalleryFiles = async (files)`: loop through files, compress with `compressImageToBase64(file, 1000, 0.8)`, append dataUrls to `formData.gallery` (max 6 images).
- In modal body: Add Section **Project Screenshot Gallery**:
  - Multi-file dropzone / input.
  - Grid of gallery thumbnails with delete button (`removeGalleryImage(index)`) and "Set as Cover" button.
- In `handleSubmit`: include `gallery: formData.gallery` in payload.
- In `src/styles/admin.css`: Add styles for `.admin-gallery-grid`, `.admin-gallery-item`, `.gallery-item-delete`, `.gallery-item-cover`.

- [x] **Step 4: Run test and verify progress**

Run: `npx vitest run test/pages/admin/AdminProjectsTab.test.jsx`
Expected: Progressing towards Task 3 completion.

- [x] **Step 5: Commit**

```bash
git add src/pages/admin/tabs/AdminProjectsTab.jsx src/styles/admin.css
git commit -m "feat(admin): add multi-image screenshot gallery management in project modal"
```

---

### Task 3: Native HTML5 Drag-and-Drop Reordering for Projects Grid

**Files:**
- Modify: `src/pages/admin/tabs/AdminProjectsTab.jsx`
- Modify: `src/styles/admin.css`
- Test: `test/pages/admin/AdminProjectsTab.test.jsx`

**Interfaces:**
- Drag state: `draggedProjectId: string | null`, `dragOverProjectId: string | null`
- Drag handlers: `onDragStart`, `onDragEnter`, `onDragOver`, `onDragLeave`, `onDrop`, `onDragEnd`

- [x] **Step 1: Implement HTML5 Drag and Drop logic on `.admin-project-card`**

In `src/pages/admin/tabs/AdminProjectsTab.jsx`:
- Add `const [draggedId, setDraggedId] = useState(null);` and `const [dragOverId, setDragOverId] = useState(null);`.
- On `.admin-project-card`:
  - `draggable={true}`
  - Add drag handle: `<div className="admin-card-drag-handle" title="Drag to reorder"><i className="fa-solid fa-grip-vertical"></i></div>`.
  - `onDragStart={(e) => { e.dataTransfer.setData('text/plain', project.id); setDraggedId(project.id); }}`
  - `onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}`
  - `onDragEnter={() => { if (draggedId !== project.id) setDragOverId(project.id); }}`
  - `onDragLeave={() => { if (dragOverId === project.id) setDragOverId(null); }}`
  - `onDragEnd={() => { setDraggedId(null); setDragOverId(null); }}`
  - `onDrop={async (e) => { e.preventDefault(); ... }}`
- Implement drop reordering:
  - Find `sourceIdx` and `targetIdx`.
  - Splice array into new order: `const reordered = [...projects]; const [moved] = reordered.splice(sourceIdx, 1); reordered.splice(targetIdx, 0, moved);`.
  - Update `setProjects(reordered)` optimistically.
  - Execute `writeBatch` in Firestore updating each project's `order = idx + 1`.
  - Show success toast: `showToast('Project order updated!', 'success');`.
- In `src/styles/admin.css`: Add styles for `.admin-project-card.is-dragging`, `.admin-project-card.drag-target`, `.admin-card-drag-handle`.

- [x] **Step 2: Run test to verify it passes**

Run: `npx vitest run test/pages/admin/AdminProjectsTab.test.jsx`
Expected: PASS

- [x] **Step 3: Commit**

```bash
git add src/pages/admin/tabs/AdminProjectsTab.jsx src/styles/admin.css test/pages/admin/AdminProjectsTab.test.jsx
git commit -m "feat(admin): implement native HTML5 drag-and-drop reordering for project cards"
```

---

### Task 4: Native HTML5 Drag-and-Drop Reordering for Skills List

**Files:**
- Modify: `src/pages/admin/tabs/AdminSkillsTab.jsx`
- Modify: `src/styles/admin.css`
- Create: `test/pages/admin/AdminSkillsTab.test.jsx`

**Interfaces:**
- Drag state: `draggedSkillId: string | null`, `dragOverSkillId: string | null`
- Drag handlers on `.skill-item-row`

- [x] **Step 1: Write test for Admin skills drag-and-drop**

```javascript
// test/pages/admin/AdminSkillsTab.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AdminSkillsTab } from '../../../src/pages/admin/tabs/AdminSkillsTab';
import { ConfirmProvider } from '../../../src/context/ConfirmContext';

describe('AdminSkillsTab Drag and Drop Reordering', () => {
  const mockSkills = [
    { id: 's1', name: 'JavaScript', category: 'language', order: 1, level: 'Experienced' },
    { id: 's2', name: 'Python', category: 'language', order: 2, level: 'Experienced' }
  ];

  it('renders skill rows with drag handles', () => {
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
    expect(screen.getAllByTitle(/Drag to reorder/i)).toHaveLength(2);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/pages/admin/AdminSkillsTab.test.jsx`
Expected: FAIL with "Unable to find an element with title: /Drag to reorder/i"

- [x] **Step 3: Implement HTML5 Drag and Drop on `.skill-item-row`**

In `src/pages/admin/tabs/AdminSkillsTab.jsx`:
- Add `const [draggedSkillId, setDraggedSkillId] = useState(null);` and `const [dragOverSkillId, setDragOverSkillId] = useState(null);`.
- In `renderSkillRow(skill)`:
  - Add `<div className="skill-drag-handle" title="Drag to reorder"><i className="fa-solid fa-grip-vertical"></i></div>`.
  - Add `draggable={true}`, `onDragStart`, `onDragEnter`, `onDragOver`, `onDragLeave`, `onDragEnd`, and `onDrop`.
  - In `onDrop`: check that dragged skill belongs to the same category (`language` or `framework_tool`). Splice array, apply batch update to Firestore, show toast.
- In `src/styles/admin.css`: Add styles for `.skill-item-row.is-dragging`, `.skill-item-row.drag-target`, `.skill-drag-handle`.

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/pages/admin/AdminSkillsTab.test.jsx`
Expected: PASS

- [x] **Step 5: Commit**

```bash
git add src/pages/admin/tabs/AdminSkillsTab.jsx src/styles/admin.css test/pages/admin/AdminSkillsTab.test.jsx
git commit -m "feat(skills): implement native HTML5 drag-and-drop reordering for skills rows"
```

---

### Task 5: Comprehensive Integration, Test Suite & Production Build Verification

**Files:**
- Test: All files in `test/`
- Build: `dist/`

- [x] **Step 1: Run full unit test suite**

Run: `npx vitest run`
Expected: PASS across all 15 test suites and 45+ tests.

- [x] **Step 2: Run production build**

Run: `npm run build`
Expected: SUCCESS with zero warnings, zero bundle errors.

- [x] **Step 3: Commit verification and progress update**

```bash
git commit --allow-empty -m "chore: verify Sub-Project 2 test suite and production build"
```
