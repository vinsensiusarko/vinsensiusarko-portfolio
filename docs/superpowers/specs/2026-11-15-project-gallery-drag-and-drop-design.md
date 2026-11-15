# Specification: Sub-Project 2 — Project Multi-Image Detail Gallery & Drag-and-Drop Reordering

- **Status**: Draft / Under Review
- **Author**: Antigravity & Vinsensius Arko
- **Date**: 2026-11-15
- **Path**: Architectural (Sub-Project 2 of 4)

---

## 1. Context & User Intent

In Sub-Project 1, we implemented the core UX upgrades (rebranding to "Arko", custom confirmation dialogs, collapsible sidebar, Show More pagination, thumbnail centering, Flutter SVG fix, and header Privacy Policy).

For **Sub-Project 2**, the user requested:
1. **Detail Gallery Project**: Clients need to browse multiple screenshots and full visual details of each project inside the Quick View modal, rather than only seeing a single static thumbnail.
2. **Drag & Drop Reordering**: The admin should be able to drag-and-drop projects and skills cards/rows directly to change their display order, instead of having to click up/down arrow buttons repeatedly.

---

## 2. Architecture & Design

### 2.1 Project Multi-Image Detail Gallery

#### Data Schema & Storage
- Document field: `gallery?: string[]` on `projects` collection in Firestore.
- Each item in `gallery` is an image string:
  - Compressed WebP/JPEG Base64 data URI (`data:image/webp;base64,...`) from the canvas compressor (~35-45KB each).
  - Or local / external URL string (`/assets/images/...` or `https://...`).
- Maximum gallery size: Capped at 6 screenshots per project to ensure document size stays well under Firestore's 1MB limit (< 300KB total).
- Backward compatibility: If `project.gallery` is undefined or empty, `allImages` defaults to `[resolveProjectImage(project)]`.

#### Admin Panel (`AdminProjectsTab.jsx`)
- In Add / Edit Project modal, add a dedicated **Project Gallery Screenshots** section:
  - Multi-image dropzone / file picker supporting selecting multiple image files simultaneously.
  - Each selected image is automatically compressed to 1000px max dimension and WebP/JPEG Base64 via Canvas.
  - Displays a preview grid of uploaded gallery images with:
    - Thumbnail preview.
    - Size indicator badge (`~38 KB`).
    - Remove button (`<i className="fa-solid fa-trash"></i>`) to delete individual screenshots.
    - "Set as Cover" button to swap with primary project image.

#### Public Quick View Modal (`ProjectModal.jsx`)
- State: `activeImageIndex` (number, default 0).
- Computed images list:
  ```javascript
  const primaryImg = resolveProjectImage(project);
  const galleryImgs = Array.isArray(project.gallery) ? project.gallery : [];
  const allImages = [primaryImg, ...galleryImgs.filter((img) => img !== primaryImg)];
  ```
- **Main Viewer**:
  - Displays `allImages[activeImageIndex]`.
  - Background ambient blur matching the current active image.
  - Image counter badge at top right: `${activeImageIndex + 1} / ${allImages.length}`.
  - Prev (`<i className="fa-solid fa-chevron-left"></i>`) and Next (`<i className="fa-solid fa-chevron-right"></i>`) floating arrow buttons when `allImages.length > 1`.
- **Keyboard Navigation**:
  - `ArrowLeft`: Navigate to previous image (wraps around).
  - `ArrowRight`: Navigate to next image (wraps around).
  - `Escape`: Closes the modal.
- **Thumbnail Strip**:
  - When `allImages.length > 1`, a horizontal scrollable thumbnail strip renders below the main viewer.
  - Active thumbnail has a highlighted glowing border and indicator dot.
  - Clicking any thumbnail updates `activeImageIndex` immediately with smooth crossfade.

---

### 2.2 Drag-and-Drop Reordering (Zero External Dependencies)

#### Native HTML5 Drag and Drop Architecture
- No heavy third-party drag-and-drop packages (`dnd-kit`, `react-beautiful-dnd`) to avoid package bloat and React 19 compatibility issues.
- Native HTML5 Drag and Drop events:
  - `onDragStart`: Captures dragging item ID and index; adds visual styling (`opacity: 0.45`, scale).
  - `onDragOver`: Calls `e.preventDefault()` to allow drop.
  - `onDragEnter`: Highlights drop target card/row with dashed accent border (`.drag-target`).
  - `onDragLeave`: Clears drop target highlight.
  - `onDrop`: Calculates new item order, applies optimistic UI update, then writes batch to Firestore.
  - `onDragEnd`: Resets drag states.

#### Projects Grid Reordering (`AdminProjectsTab.jsx`)
- Add a drag handle `<div className="drag-handle" title="Drag to reorder"><i className="fa-solid fa-grip-vertical"></i></div>` to `.admin-project-card`.
- When an item is dragged and dropped onto another card:
  - Splice array to new position.
  - Update `projects` state optimistically.
  - Execute a Firestore `writeBatch` updating each changed `order: index + 1`.
  - Display success toast: `"Projects order updated successfully"`.
  - Retain existing up/down arrow buttons for mobile and accessibility.

#### Skills Reordering (`AdminSkillsTab.jsx`)
- Apply same HTML5 drag-and-drop pattern to `.skill-item-row`.
- Scoped per category (Languages and Frameworks/Tools).
- Reorder items within the category, update batch in Firestore, and show toast.

---

## 3. Testing & Verification Plan

1. **Unit Tests (`test/components/sections/ProjectModal.test.jsx`)**:
   - Verify modal renders single image when `gallery` is absent.
   - Verify modal renders image counter, Prev/Next buttons, and thumbnail strip when `gallery` has multiple images.
   - Verify clicking Next button increments active image and wraps around.
   - Verify clicking thumbnail switches active image.
   - Verify keyboard `ArrowLeft` and `ArrowRight` navigate gallery.
2. **Unit Tests (`test/pages/admin/AdminProjectsTab.test.jsx` & `AdminSkillsTab.test.jsx`)**:
   - Verify drag handles are present on project cards and skill rows.
   - Verify gallery management controls (upload, remove) render in project modal.
3. **Full Suite & Build Verification**:
   - Run `npx vitest run` ensuring 100% tests pass.
   - Run `npm run build` ensuring clean build.
