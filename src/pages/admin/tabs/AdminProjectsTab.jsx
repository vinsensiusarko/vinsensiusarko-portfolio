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
import {
  IconArrowDown,
  IconArrowUp,
  IconBolt,
  IconCheck,
  IconClock,
  IconCloudUpload,
  IconFolderOff,
  IconGripVertical,
  IconLoader2,
  IconPencil,
  IconPhotoPlus,
  IconPlus,
  IconStar,
  IconTrash
} from '@tabler/icons-react';
import { db } from '../../../services/firebase';
import { useConfirm } from '../../../context/ConfirmContext';
import { formatRichDescription } from '../../../utils/formatDescription';
import { compressImageToBase64 } from '../../../utils/imageCompressor';
import { resolveProjectImage } from '../../../utils/resolveProjectImage';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../../components/ui/select';
import { Separator } from '../../../components/ui/separator';
import { Switch } from '../../../components/ui/switch';
import { Textarea } from '../../../components/ui/textarea';
import { AdminPageHeader } from '../components/AdminPageHeader';
import { AdminProjectsShimmer } from '../AdminShimmer';

const PROJECT_CATEGORIES = [
  'Mobile Application',
  'Web Application',
  'Backend API',
  'Desktop Application',
  'Web Portal',
  'Enterprise System'
];

const DEMO_LABELS = ['Live Demo', 'Play Store', 'App Store', 'View Site'];

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
      variant: 'danger'
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
  const liveDescPreviewHtml = formData.description.trim()
    ? formatRichDescription(formData.description)
    : '';

  return (
    <section id="tab-projects" className="flex flex-col gap-6">
      <AdminPageHeader
        title="Portfolio Projects"
        badge={`${projects.length} total`}
        description="Add, edit, drag to reorder, or delete projects displayed on the public website."
        actions={
          <Button type="button" id="btn-add-project" onClick={openAddModal}>
            <IconPlus className="size-4" stroke={1.75} data-icon="inline-start" aria-hidden="true" />
            Add New Project
          </Button>
        }
      />

      {loading ? (
        <AdminProjectsShimmer count={6} />
      ) : projects.length === 0 ? (
        <Card className="border-dashed py-12">
          <CardContent className="flex flex-col items-center gap-3 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <IconFolderOff className="size-6" stroke={1.75} aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-foreground">No projects found in Firestore</p>
              <p className="max-w-md text-sm text-muted-foreground">
                Click <strong>Add New Project</strong> or open <strong>Backup &amp; Database</strong> to seed your default portfolio projects.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div
          id="projects-grid"
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {projects.map((project, index) => {
            const imgSrc = resolveProjectImage(project);
            const isBase64 = imgSrc.startsWith('data:');
            const isFirst = index === 0;
            const isLast = index === projects.length - 1;
            const descHtml = formatRichDescription(project.description || '');
            const galleryCount = Array.isArray(project.gallery) ? project.gallery.length : 0;

            return (
              <Card
                key={project.id}
                draggable={true}
                onDragStart={(e) => handleCardDragStart(e, project)}
                onDragOver={handleCardDragOver}
                onDragEnter={() => handleCardDragEnter(project)}
                onDragLeave={(e) => handleCardDragLeave(e, project)}
                onDragEnd={handleCardDragEnd}
                onDrop={(e) => handleCardDrop(e, project)}
                className={`admin-project-card flex flex-col justify-between overflow-hidden py-0 gap-0 transition-all ${
                  draggedProjectId === project.id ? 'opacity-50 scale-[0.98]' : ''
                } ${
                  dragOverProjectId === project.id ? 'ring-2 ring-foreground border-foreground' : ''
                }`}
              >
                <div className="flex flex-col">
                  <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border bg-muted">
                    <img
                      src={imgSrc}
                      alt={project.title}
                      loading="lazy"
                      draggable="false"
                      className="size-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/assets/images/portfolio-1.png';
                      }}
                    />

                    <div
                      title="Drag to reorder"
                      className="absolute top-2.5 left-2.5 inline-flex size-8 cursor-grab items-center justify-center rounded-md border border-border/80 bg-background/90 text-foreground shadow-xs active:cursor-grabbing"
                    >
                      <IconGripVertical className="size-4" stroke={1.75} aria-hidden="true" />
                    </div>

                    <Badge
                      variant="secondary"
                      title="Display Order"
                      className="absolute top-2.5 right-2.5 border border-border/80 bg-background/90 font-mono text-xs tabular-nums text-foreground"
                    >
                      #{index + 1}
                    </Badge>
                  </div>

                  <CardContent className="flex flex-col gap-3 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                        {project.category || 'Uncategorized'}
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {project.isComingSoon ? (
                          <Badge
                            variant="outline"
                            className="border-warning/40 bg-warning/10 text-warning text-[11px]"
                          >
                            <IconClock className="size-3" stroke={1.75} aria-hidden="true" />
                            Coming Soon
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-success/40 bg-success/10 text-success text-[11px]"
                          >
                            <IconCheck className="size-3" stroke={1.75} aria-hidden="true" />
                            Live
                          </Badge>
                        )}
                        {isBase64 ? (
                          <Badge variant="secondary" className="font-mono text-[10px]">
                            <IconBolt className="size-3" stroke={1.75} aria-hidden="true" />
                            Base64
                          </Badge>
                        ) : null}
                        {galleryCount > 0 ? (
                          <Badge variant="outline" className="font-mono text-[10px] tabular-nums">
                            +{galleryCount} imgs
                          </Badge>
                        ) : null}
                      </div>
                    </div>

                    <h3 className="font-display line-clamp-1 text-base font-semibold tracking-tight text-foreground">
                      {project.title}
                    </h3>

                    <div
                      className="line-clamp-3 text-xs leading-relaxed text-muted-foreground [&_p]:m-0"
                      dangerouslySetInnerHTML={{ __html: descHtml }}
                    />

                    {(project.techStack || []).length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {(project.techStack || []).slice(0, 6).map((t, tIdx) => (
                          <Badge
                            key={tIdx}
                            variant="secondary"
                            className="px-2 py-0.5 text-[11px] font-normal"
                          >
                            {t}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </CardContent>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-border bg-muted/30 px-4 py-2.5">
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-8"
                      disabled={isFirst || isReordering}
                      title="Move Earlier (Up)"
                      aria-label={`Move ${project.title} up`}
                      onClick={() => handleMoveProject(index, -1)}
                    >
                      <IconArrowUp className="size-3.5" stroke={1.75} aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-8"
                      disabled={isLast || isReordering}
                      title="Move Later (Down)"
                      aria-label={`Move ${project.title} down`}
                      onClick={() => handleMoveProject(index, 1)}
                    >
                      <IconArrowDown className="size-3.5" stroke={1.75} aria-hidden="true" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => openEditModal(project)}
                    >
                      <IconPencil className="size-3.5" stroke={1.75} data-icon="inline-start" aria-hidden="true" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Delete ${project.title}`}
                      onClick={() => handleDelete(project)}
                    >
                      <IconTrash className="size-4" stroke={1.75} aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT PROJECT DIALOG */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingId ? 'Edit Project' : 'Add New Project'}
            </DialogTitle>
            <DialogDescription>
              Configure project metadata, cover thumbnail, screenshot gallery, and public links.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="project-title">Project Title *</Label>
                <Input
                  type="text"
                  id="project-title"
                  required
                  placeholder="e.g. Solo Parent App"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="project-category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="project-category" className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="project-order">Display Order (1 = First)</Label>
                <Input
                  type="number"
                  id="project-order"
                  min="1"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="project-tech">Tech Stack (Comma separated) *</Label>
                <Input
                  type="text"
                  id="project-tech"
                  required
                  placeholder="Flutter, Dart, Firebase"
                  value={formData.techStack}
                  onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="project-desc">Description *</Label>
              <Textarea
                id="project-desc"
                rows={4}
                required
                placeholder="Describe the project's purpose, key features, and impact..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              {liveDescPreviewHtml ? (
                <div className="rounded-lg border border-border bg-muted/40 p-3">
                  <div className="mb-1.5 font-mono text-[11px] font-medium text-muted-foreground uppercase">
                    Formatted Preview
                  </div>
                  <div
                    className="text-xs leading-relaxed text-foreground"
                    dangerouslySetInnerHTML={{ __html: liveDescPreviewHtml }}
                  />
                </div>
              ) : null}
            </div>

            <Separator />

            {/* COVER THUMBNAIL DROPZONE */}
            <div className="flex flex-col gap-2">
              <Label>Project Thumbnail (Auto-Compressed to WebP/JPEG Base64)</Label>
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
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
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-5 text-center transition-colors ${
                  dragOver
                    ? 'border-foreground bg-muted'
                    : 'border-border bg-muted/30 hover:border-foreground/50 hover:bg-muted/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageFile(e.target.files[0]);
                    }
                    e.target.value = '';
                  }}
                />
                <div className="flex size-10 items-center justify-center rounded-lg bg-background border border-border text-foreground">
                  <IconCloudUpload className="size-5" stroke={1.75} aria-hidden="true" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  Click or Drag &amp; Drop an Image Here
                </p>
                <p className="text-xs text-muted-foreground">
                  Automatically resized to 800px &amp; compressed (~40 KB). No external storage needed.
                </p>

                {previewImgSrc ? (
                  <div
                    className="mt-2 flex w-full flex-col items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="overflow-hidden rounded-lg border border-border bg-background">
                      <img
                        src={previewImgSrc}
                        alt="Cover Preview"
                        className="max-h-44 w-auto object-contain"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/assets/images/portfolio-1.png';
                        }}
                      />
                    </div>
                    <Badge variant="secondary" className="font-mono text-xs">
                      <IconBolt className="size-3" stroke={1.75} aria-hidden="true" />
                      {compressedKB
                        ? `Compressed (${compressedKB} KB)`
                        : formData.imageBase64
                          ? 'Stored as Base64'
                          : 'Current Image Loaded'}
                    </Badge>
                  </div>
                ) : null}
              </div>
            </div>

            {/* SCREENSHOT GALLERY */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label>Project Screenshot Gallery ({formData.gallery?.length || 0}/6)</Label>
                <span className="text-xs text-muted-foreground">
                  Multiple screenshots shown in Quick View detail modal
                </span>
              </div>

              <div
                role="button"
                tabIndex={0}
                onClick={() => galleryInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    galleryInputRef.current?.click();
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files) {
                    handleGalleryFiles(e.dataTransfer.files);
                  }
                }}
                className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-dashed border-border bg-muted/20 p-4 text-center transition-colors hover:border-foreground/50 hover:bg-muted/40"
              >
                <input
                  ref={galleryInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleGalleryFiles(e.target.files);
                    }
                    e.target.value = '';
                  }}
                />
                <IconPhotoPlus className="size-5 text-foreground" stroke={1.75} aria-hidden="true" />
                <p className="text-sm font-medium text-foreground">
                  Click or Drag screenshots to add to gallery (Up to 6)
                </p>
                <p className="text-xs text-muted-foreground">
                  Auto-compressed via Canvas WebP/JPEG for the multi-image detail gallery.
                </p>
              </div>

              {formData.gallery && formData.gallery.length > 0 ? (
                <div className="grid grid-cols-2 gap-2.5 pt-1 sm:grid-cols-3">
                  {formData.gallery.map((img, gIdx) => (
                    <div
                      key={gIdx}
                      className="group relative aspect-[16/10] overflow-hidden rounded-lg border border-border bg-muted"
                    >
                      <img
                        src={img}
                        alt={`Screenshot ${gIdx + 1}`}
                        className="size-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/assets/images/portfolio-1.png';
                        }}
                      />
                      <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="secondary"
                          className="size-7 bg-background/90 shadow-xs"
                          title="Set as Cover Image"
                          onClick={(e) => {
                            e.stopPropagation();
                            setGalleryImageAsCover(gIdx);
                          }}
                        >
                          <IconStar className="size-3.5" stroke={1.75} aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="size-7 shadow-xs"
                          title="Remove screenshot"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeGalleryImage(gIdx);
                          }}
                        >
                          <IconTrash className="size-3.5" stroke={1.75} aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="project-image-url">Or External / Local Image Path (Fallback)</Label>
              <Input
                type="text"
                id="project-image-url"
                placeholder="/assets/images/portfolio-1.png or https://..."
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value, imageBase64: '' })
                }
              />
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="project-github">GitHub Repository URL</Label>
                <Input
                  type="url"
                  id="project-github"
                  placeholder="https://github.com/vinsensiusarko/..."
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="project-demo">Live Demo / Store URL</Label>
                <Input
                  type="url"
                  id="project-demo"
                  placeholder="https://play.google.com/store/..."
                  value={formData.demoUrl}
                  onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="project-demo-label">Demo Button Label</Label>
                <Select
                  value={formData.demoLabel}
                  onValueChange={(value) => setFormData({ ...formData, demoLabel: value })}
                >
                  <SelectTrigger id="project-demo-label" className="w-full">
                    <SelectValue placeholder="Select label" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEMO_LABELS.map((lbl) => (
                      <SelectItem key={lbl} value={lbl}>
                        {lbl}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3.5 py-2.5">
                <Label htmlFor="project-coming-soon" className="cursor-pointer text-sm">
                  Mark as &quot;Coming Soon&quot; (Disables Links)
                </Label>
                <Switch
                  id="project-coming-soon"
                  checked={formData.isComingSoon}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isComingSoon: checked })
                  }
                />
              </div>
            </div>

            <DialogFooter className="border-t border-border pt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <IconLoader2
                      className="size-4 animate-spin"
                      stroke={1.75}
                      data-icon="inline-start"
                      aria-hidden="true"
                    />
                    Saving...
                  </>
                ) : (
                  'Save Project'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
