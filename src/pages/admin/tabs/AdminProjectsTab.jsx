import { useState, useRef } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { useConfirm } from '../../../context/ConfirmContext';
import { formatRichDescription } from '../../../utils/formatDescription';
import { compressImageToBase64 } from '../../../utils/imageCompressor';
import { resolveProjectImage } from '../../../utils/resolveProjectImage';
import { AdminProjectsShimmer } from '../AdminShimmer';

const INITIAL_FORM = {
  title: '',
  category: 'Mobile Application',
  order: 1,
  description: '',
  techStack: '',
  imageUrl: '',
  imageBase64: '',
  gallery: [],
  githubUrl: '',
  demoUrl: '',
  demoLabel: 'Live Demo',
  isComingSoon: false
};

export function AdminProjectsTab({ projects, setProjects, reloadProjects, showToast, loading = false }) {
  const confirm = useConfirm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [compressedKB, setCompressedKB] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [draggedProjectId, setDraggedProjectId] = useState(null);
  const [dragOverProjectId, setDragOverProjectId] = useState(null);
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const openAddModal = () => {
    setEditingId(null);
    setCompressedKB(null);
    setFormData({
      ...INITIAL_FORM,
      order: projects.length + 1,
      gallery: []
    });
    setModalOpen(true);
  };

  const openEditModal = (project) => {
    setEditingId(project.id);
    setCompressedKB(null);

    const rawImg = project.image || project.imageBase64 || project.imageUrl || '';
    const isDataUri = String(rawImg).startsWith('data:');

    setFormData({
      title: project.title || '',
      category: project.category || 'Mobile Application',
      order: project.order || 1,
      description: project.description || '',
      techStack: Array.isArray(project.techStack) ? project.techStack.join(', ') : '',
      imageUrl: isDataUri ? '' : rawImg,
      imageBase64: isDataUri ? rawImg : '',
      gallery: Array.isArray(project.gallery) ? [...project.gallery] : [],
      githubUrl: project.githubUrl || '',
      demoUrl: project.demoUrl || '',
      demoLabel: project.demoLabel || 'Live Demo',
      isComingSoon: Boolean(project.isComingSoon)
    });
    setModalOpen(true);
  };

  const handleGalleryFiles = async (files) => {
    if (!files || files.length === 0) return;
    const currentGallery = formData.gallery || [];
    const availableSlots = 6 - currentGallery.length;
    if (availableSlots <= 0) {
      showToast('Maximum 6 screenshot images reached.', 'warning');
      return;
    }

    const filesToProcess = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .slice(0, availableSlots);

    if (filesToProcess.length === 0) {
      showToast('Please select valid image files.', 'error');
      return;
    }

    showToast(`Compressing ${filesToProcess.length} gallery image(s)...`, 'info');
    try {
      const compressedList = [];
      for (const file of filesToProcess) {
        const { dataUrl } = await compressImageToBase64(file, 800, 0.8);
        compressedList.push(dataUrl);
      }
      setFormData((prev) => ({
        ...prev,
        gallery: [...(prev.gallery || []), ...compressedList]
      }));
      showToast(`Added ${compressedList.length} image(s) to gallery!`, 'success');
    } catch (err) {
      console.error('Gallery compression failed:', err);
      showToast('Failed to compress gallery image(s).', 'error');
    }
  };

  const removeGalleryImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      gallery: (prev.gallery || []).filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const setGalleryImageAsCover = (indexToCover) => {
    const selectedImg = formData.gallery?.[indexToCover];
    if (!selectedImg) return;
    setFormData((prev) => {
      const oldCover = prev.imageBase64 || prev.imageUrl;
      const newGallery = [...(prev.gallery || [])];
      newGallery.splice(indexToCover, 1);
      if (oldCover && !newGallery.includes(oldCover)) {
        newGallery.unshift(oldCover);
      }
      return {
        ...prev,
        imageBase64: selectedImg,
        imageUrl: '',
        gallery: newGallery.slice(0, 6)
      };
    });
    showToast('Cover image updated from gallery!', 'success');
  };

  const handleCardDragStart = (e, project) => {
    e.dataTransfer.setData('text/plain', project.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedProjectId(project.id);
  };

  const handleCardDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleCardDragEnter = (project) => {
    if (draggedProjectId && draggedProjectId !== project.id) {
      setDragOverProjectId(project.id);
    }
  };

  const handleCardDragLeave = (e, project) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    if (dragOverProjectId === project.id) {
      setDragOverProjectId(null);
    }
  };

  const handleCardDragEnd = () => {
    setDraggedProjectId(null);
    setDragOverProjectId(null);
  };

  const handleCardDrop = async (e, targetProject) => {
    e.preventDefault();
    if (isReordering) return;

    const sourceId = draggedProjectId || e.dataTransfer.getData('text/plain');
    setDraggedProjectId(null);
    setDragOverProjectId(null);

    if (!sourceId || sourceId === targetProject.id || !db) return;

    const sourceIdx = projects.findIndex((p) => p.id === sourceId);
    const targetIdx = projects.findIndex((p) => p.id === targetProject.id);
    if (sourceIdx === -1 || targetIdx === -1) return;

    setIsReordering(true);
    const previousProjects = [...projects];
    const reordered = [...projects];
    const [moved] = reordered.splice(sourceIdx, 1);
    reordered.splice(targetIdx, 0, moved);

    const normalized = reordered.map((p, idx) => ({ ...p, order: idx + 1 }));
    setProjects(normalized);

    try {
      const batch = writeBatch(db);
      normalized.forEach((p) => {
        batch.update(doc(db, 'projects', p.id), {
          order: p.order,
          updatedAt: serverTimestamp()
        });
      });
      await batch.commit();
      showToast(`Reordered "${moved.title}" to position #${targetIdx + 1}!`, 'success');
    } catch (err) {
      console.error('Error reordering projects via DnD:', err);
      setProjects(previousProjects);
      showToast('Failed to update project order: ' + err.message, 'error');
      await reloadProjects();
    } finally {
      setIsReordering(false);
    }
  };

  const handleImageFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', 'error');
      return;
    }
    try {
      showToast('Compressing image via Canvas...', 'info');
      const { dataUrl, sizeKB } = await compressImageToBase64(file, 800, 0.8);
      setFormData((prev) => ({ ...prev, imageBase64: dataUrl, imageUrl: '' }));
      setCompressedKB(sizeKB);
      showToast(`Image compressed to ${sizeKB} KB!`, 'success');
    } catch (err) {
      console.error('Image compression failed:', err);
      showToast('Failed to compress image.', 'error');
    }
  };

  const handleMoveProject = async (index, direction) => {
    if (isReordering || !db) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    setIsReordering(true);
    const updated = [...projects];
    const currentItem = { ...updated[index] };
    const neighborItem = { ...updated[targetIndex] };

    updated[index] = neighborItem;
    updated[targetIndex] = currentItem;
    updated.forEach((p, idx) => {
      p.order = idx + 1;
    });

    setProjects(updated);

    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'projects', currentItem.id), {
        order: currentItem.order,
        updatedAt: serverTimestamp()
      });
      batch.update(doc(db, 'projects', neighborItem.id), {
        order: neighborItem.order,
        updatedAt: serverTimestamp()
      });
      await batch.commit();
      showToast(`Moved "${currentItem.title}" to #${currentItem.order}`, 'success');
    } catch (err) {
      console.error('Error reordering project:', err);
      showToast('Failed to update order: ' + err.message, 'error');
      await reloadProjects();
    } finally {
      setIsReordering(false);
    }
  };

  const handleDelete = async (project) => {
    const ok = await confirm({
      title: 'Hapus Proyek?',
      message: `Apakah Anda yakin ingin menghapus proyek "${project.title}"? Tindakan ini permanen dan tidak dapat dibatalkan.`,
      confirmText: 'Ya, Hapus Proyek',
      cancelText: 'Batal',
      variant: 'danger',
      icon: 'fa-solid fa-trash'
    });
    if (!ok) return;

    try {
      await deleteDoc(doc(db, 'projects', project.id));
      const remaining = projects.filter((p) => p.id !== project.id);
      const batch = writeBatch(db);
      let hasOrderChanges = false;

      remaining.forEach((p, idx) => {
        const expectedOrder = idx + 1;
        if (Number(p.order) !== expectedOrder) {
          p.order = expectedOrder;
          batch.update(doc(db, 'projects', p.id), { order: expectedOrder });
          hasOrderChanges = true;
        }
      });

      if (hasOrderChanges) {
        await batch.commit();
      }

      setProjects([...remaining]);
      showToast(`Deleted "${project.title}"`, 'info');
    } catch (err) {
      console.error('Error deleting project:', err);
      showToast('Failed to delete project: ' + err.message, 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!db) return;
    setSaving(true);

    const finalImage =
      formData.imageBase64 ||
      formData.imageUrl.trim() ||
      '/assets/images/portfolio-1.png';

    const payload = {
      title: formData.title.trim(),
      category: formData.category.trim(),
      order: parseInt(formData.order, 10) || 1,
      description: formData.description.trim(),
      techStack: formData.techStack
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      githubUrl: formData.githubUrl.trim(),
      demoUrl: formData.demoUrl.trim(),
      demoLabel: formData.demoLabel.trim() || 'Live Demo',
      isComingSoon: Boolean(formData.isComingSoon),
      image: finalImage,
      gallery: Array.isArray(formData.gallery) ? formData.gallery : [],
      updatedAt: serverTimestamp()
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'projects', editingId), payload);
        showToast(`Project "${payload.title}" updated!`, 'success');
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, 'projects'), payload);
        showToast(`Project "${payload.title}" created!`, 'success');
      }
      setModalOpen(false);
      await reloadProjects();
    } catch (err) {
      console.error('Error saving project:', err);
      showToast('Error saving project: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const hasPreview = Boolean(formData.imageBase64 || formData.imageUrl.trim());
  const previewImgSrc = hasPreview
    ? resolveProjectImage({
        imageBase64: formData.imageBase64,
        imageUrl: formData.imageUrl
      })
    : '';

  return (
    <section id="tab-projects" className="tab-section">
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Portfolio Projects</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Add, edit, reorder, or delete projects displayed on the public website.
            </p>
          </div>
          <button
            type="button"
            id="btn-add-project"
            className="btn btn-primary"
            onClick={openAddModal}
          >
            <i className="fa-solid fa-plus"></i> Add New Project
          </button>
        </div>

        <div id="projects-grid" className="admin-grid">
          {loading ? (
            <AdminProjectsShimmer count={6} />
          ) : projects.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1rem' }}>
              <i
                className="fa-solid fa-folder-open"
                style={{ fontSize: '2.5rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}
              ></i>
              <p style={{ color: 'var(--text-muted)' }}>
                No projects found in Firestore. Click <strong>Add New Project</strong> or go to{' '}
                <strong>Database Seeder</strong> to import your default portfolio projects.
              </p>
            </div>
          ) : (
            projects.map((project, index) => {
              const imgSrc = resolveProjectImage(project);
              const isBase64 = imgSrc.startsWith('data:');
              const isFirst = index === 0;
              const isLast = index === projects.length - 1;
              const descHtml = formatRichDescription(project.description || '');

              return (
                <div
                  className={`admin-project-card ${draggedProjectId === project.id ? 'is-dragging' : ''} ${dragOverProjectId === project.id ? 'drag-target' : ''}`}
                  key={project.id}
                  draggable={true}
                  onDragStart={(e) => handleCardDragStart(e, project)}
                  onDragOver={handleCardDragOver}
                  onDragEnter={() => handleCardDragEnter(project)}
                  onDragLeave={(e) => handleCardDragLeave(e, project)}
                  onDragEnd={handleCardDragEnd}
                  onDrop={(e) => handleCardDrop(e, project)}
                >
                  <div className="admin-project-thumb">
                    <div
                      className="admin-project-thumb-bg"
                      style={{ backgroundImage: `url('${imgSrc}')` }}
                    ></div>
                    <div className="admin-card-drag-handle" title="Drag to reorder">
                      <i className="fa-solid fa-grip-vertical"></i>
                    </div>
                    <span className="project-order-badge" title="Display Order">
                      #{index + 1}
                    </span>
                    <img
                      src={imgSrc}
                      alt={project.title}
                      loading="lazy"
                      draggable="false"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/assets/images/portfolio-1.png';
                      }}
                    />
                  </div>
                  <div className="admin-project-body">
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.35rem',
                        flexWrap: 'wrap'
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase'
                        }}
                      >
                        {project.category || 'Uncategorized'}
                      </span>
                      <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                        {project.isComingSoon ? (
                          <span
                            className="compression-badge"
                            style={{ backgroundColor: 'var(--accent-warning)' }}
                          >
                            <i className="fa-solid fa-clock"></i> Coming Soon
                          </span>
                        ) : (
                          <span
                            className="compression-badge"
                            style={{ backgroundColor: 'var(--accent-success)' }}
                          >
                            <i className="fa-solid fa-check"></i> Live
                          </span>
                        )}
                        {isBase64 && (
                          <span className="compression-badge">
                            <i className="fa-solid fa-bolt"></i> Base64
                          </span>
                        )}
                      </div>
                    </div>
                    <h3>{project.title}</h3>
                    <div
                      className="admin-project-desc"
                      dangerouslySetInnerHTML={{ __html: descHtml }}
                    />
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.35rem',
                        marginBottom: '1rem'
                      }}
                    >
                      {(project.techStack || []).map((t, tIdx) => (
                        <span
                          key={tIdx}
                          style={{
                            fontSize: '0.72rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '1rem',
                            background: 'var(--bg-card-alt)',
                            border: '1px solid var(--border-color)'
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="admin-card-actions">
                      <div className="admin-card-reorder">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          disabled={isFirst || isReordering}
                          title="Move Earlier (Up)"
                          onClick={() => handleMoveProject(index, -1)}
                        >
                          <i className="fa-solid fa-arrow-up"></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          disabled={isLast || isReordering}
                          title="Move Later (Down)"
                          onClick={() => handleMoveProject(index, 1)}
                        >
                          <i className="fa-solid fa-arrow-down"></i>
                        </button>
                      </div>
                      <div className="admin-card-buttons">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEditModal(project)}
                        >
                          <i className="fa-solid fa-pen"></i> Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(project)}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ADD / EDIT PROJECT MODAL */}
      <div
        id="project-modal"
        className={`modal-backdrop ${modalOpen ? 'show' : ''}`}
        onClick={(e) => {
          if (e.target.id === 'project-modal') setModalOpen(false);
        }}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h3 style={{ fontSize: '1.25rem' }}>
              {editingId ? 'Edit Project' : 'Add New Project'}
            </h3>
            <button
              type="button"
              className="btn-icon"
              onClick={() => setModalOpen(false)}
              aria-label="Close modal"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="project-title">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    id="project-title"
                    className="form-input"
                    required
                    placeholder="e.g. Solo Parent App"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="project-category">
                    Category *
                  </label>
                  <select
                    id="project-category"
                    className="form-select"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Mobile Application">Mobile Application</option>
                    <option value="Web Application">Web Application</option>
                    <option value="Backend API">Backend API</option>
                    <option value="Desktop Application">Desktop Application</option>
                    <option value="Web Portal">Web Portal</option>
                    <option value="Enterprise System">Enterprise System</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="project-order">
                    Display Order (1 = First)
                  </label>
                  <input
                    type="number"
                    id="project-order"
                    className="form-input"
                    min="1"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="project-tech">
                    Tech Stack (Comma separated) *
                  </label>
                  <input
                    type="text"
                    id="project-tech"
                    className="form-input"
                    required
                    placeholder="Flutter, Dart, Firebase"
                    value={formData.techStack}
                    onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="project-desc">
                  Description *
                </label>
                <textarea
                  id="project-desc"
                  className="form-textarea"
                  required
                  placeholder="Describe the project's purpose, key features, and impact..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Project Thumbnail (Auto-Compressed to WebP/JPEG Base64)
                </label>
                <div
                  className={`image-dropzone ${dragOver ? 'dragover' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleImageFile(e.dataTransfer.files[0]);
                    }
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleImageFile(e.target.files[0]);
                      }
                      e.target.value = '';
                    }}
                  />
                  <div className="dropzone-icon">
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                  </div>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    Click or Drag &amp; Drop an Image Here
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Automatically resized to 800px &amp; compressed (~40KB) — No paid storage needed!
                  </p>

                  {previewImgSrc && (
                    <div className="dropzone-preview" onClick={(e) => e.stopPropagation()}>
                      <div className="dropzone-img-box" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <img
                          src={previewImgSrc}
                          alt="Preview"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/assets/images/portfolio-1.png';
                          }}
                        />
                      </div>
                      <div style={{ marginTop: '0.65rem' }}>
                        <span className="compression-badge">
                          <i className="fa-solid fa-bolt"></i>{' '}
                          {compressedKB
                            ? `Compressed (${compressedKB} KB)`
                            : formData.imageBase64
                            ? 'Stored as Base64'
                            : 'Current Image Loaded'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>
                    Project Screenshot Gallery ({formData.gallery?.length || 0}/6)
                  </label>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Multiple screenshots shown in Quick View detail modal
                  </span>
                </div>

                <div
                  className="gallery-upload-dropzone"
                  onClick={() => galleryInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files) {
                      handleGalleryFiles(e.dataTransfer.files);
                    }
                  }}
                >
                  <input
                    ref={galleryInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files) {
                        handleGalleryFiles(e.target.files);
                      }
                      e.target.value = '';
                    }}
                  />
                  <i className="fa-solid fa-images" style={{ fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '0.35rem' }}></i>
                  <p style={{ fontWeight: 600, fontSize: '0.88rem', margin: '0 0 0.2rem 0' }}>
                    Click or Drag screenshots to add to gallery (Up to 6)
                  </p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                    Auto-compressed via Canvas WebP/JPEG — Client can view full multi-image gallery
                  </p>
                </div>

                {formData.gallery && formData.gallery.length > 0 && (
                  <div className="admin-gallery-grid">
                    {formData.gallery.map((img, gIdx) => (
                      <div className="admin-gallery-item" key={gIdx}>
                        <img
                          src={img}
                          alt={`Screenshot ${gIdx + 1}`}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/assets/images/portfolio-1.png';
                          }}
                        />
                        <div className="admin-gallery-actions">
                          <button
                            type="button"
                            className="btn-gallery-action cover"
                            title="Set as Cover Image"
                            onClick={(e) => {
                              e.stopPropagation();
                              setGalleryImageAsCover(gIdx);
                            }}
                          >
                            <i className="fa-solid fa-star"></i>
                          </button>
                          <button
                            type="button"
                            className="btn-gallery-action delete"
                            title="Remove screenshot"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeGalleryImage(gIdx);
                            }}
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="project-image-url">
                  Or External / Local Image Path (Fallback)
                </label>
                <input
                  type="text"
                  id="project-image-url"
                  className="form-input"
                  placeholder="/assets/images/portfolio-1.png or https://..."
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value, imageBase64: '' })
                  }
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="project-github">
                    GitHub Repository URL
                  </label>
                  <input
                    type="url"
                    id="project-github"
                    className="form-input"
                    placeholder="https://github.com/vinsensiusarko/..."
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="project-demo">
                    Live Demo / Store URL
                  </label>
                  <input
                    type="url"
                    id="project-demo"
                    className="form-input"
                    placeholder="https://play.google.com/store/..."
                    value={formData.demoUrl}
                    onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row" style={{ alignItems: 'center' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="project-demo-label">
                    Demo Button Label
                  </label>
                  <select
                    id="project-demo-label"
                    className="form-select"
                    value={formData.demoLabel}
                    onChange={(e) => setFormData({ ...formData, demoLabel: e.target.value })}
                  >
                    <option value="Live Demo">Live Demo</option>
                    <option value="Play Store">Play Store</option>
                    <option value="App Store">App Store</option>
                    <option value="View Site">View Site</option>
                  </select>
                </div>
                <div
                  className="form-group"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    paddingTop: '1.2rem'
                  }}
                >
                  <input
                    type="checkbox"
                    id="project-coming-soon"
                    style={{ width: '1.15rem', height: '1.15rem', cursor: 'pointer' }}
                    checked={formData.isComingSoon}
                    onChange={(e) =>
                      setFormData({ ...formData, isComingSoon: e.target.checked })
                    }
                  />
                  <label
                    htmlFor="project-coming-soon"
                    style={{ fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
                  >
                    Mark as &quot;Coming Soon&quot; (Disables Links)
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Saving...
                  </>
                ) : (
                  'Save Project'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
