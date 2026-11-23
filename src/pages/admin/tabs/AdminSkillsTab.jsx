import { useState } from 'react';
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
  IconAdjustmentsHorizontal,
  IconCloudUpload,
  IconCode,
  IconStack2,
  IconDiamond,
  IconGripVertical,
  IconIcons,
  IconInfoCircle,
  IconLoader2,
  IconPalette,
  IconPencil,
  IconPlus,
  IconSparkles,
  IconTrash
} from '@tabler/icons-react';
import { db } from '../../../services/firebase';
import { useConfirm } from '../../../context/ConfirmContext';
import { SkillIcon } from '../../../components/common/SkillIcon';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
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
import { AdminPageHeader } from '../components/AdminPageHeader';
import { AdminSkillsShimmer } from '../AdminShimmer';

const INITIAL_SKILL_FORM = {
  name: '',
  category: 'language',
  level: 'Experienced',
  iconType: 'fontawesome',
  iconClass: 'fa-solid fa-code',
  iconUrl: '',
  order: 1
};

const PRESET_ICONS = [
  { name: 'Flutter', category: 'language', iconType: 'svg', iconClass: 'fa-brands fa-flutter' },
  { name: 'Dart', category: 'language', iconType: 'svg', iconClass: 'fa-brands fa-dart' },
  { name: 'Arko CMS', category: 'framework_tool', iconType: 'image', iconUrl: '/assets/favicon.png', iconClass: 'fa-solid fa-bolt' },
  { name: 'React', category: 'framework_tool', iconType: 'fontawesome', iconClass: 'fa-brands fa-react' },
  { name: 'Next.js', category: 'framework_tool', iconType: 'fontawesome', iconClass: 'fa-solid fa-n' },
  { name: 'Vue.js', category: 'framework_tool', iconType: 'fontawesome', iconClass: 'fa-brands fa-vuejs' },
  { name: 'JavaScript', category: 'language', iconType: 'fontawesome', iconClass: 'fa-brands fa-js' },
  { name: 'TypeScript', category: 'language', iconType: 'fontawesome', iconClass: 'fa-brands fa-js' },
  { name: 'Python', category: 'language', iconType: 'fontawesome', iconClass: 'fa-brands fa-python' },
  { name: 'Java', category: 'language', iconType: 'fontawesome', iconClass: 'fa-brands fa-java' },
  { name: 'PHP', category: 'language', iconType: 'fontawesome', iconClass: 'fa-brands fa-php' },
  { name: 'Laravel', category: 'framework_tool', iconType: 'fontawesome', iconClass: 'fa-brands fa-laravel' },
  { name: 'Node JS', category: 'framework_tool', iconType: 'fontawesome', iconClass: 'fa-brands fa-node-js' },
  { name: 'HTML5', category: 'language', iconType: 'fontawesome', iconClass: 'fa-brands fa-html5' },
  { name: 'CSS3', category: 'language', iconType: 'fontawesome', iconClass: 'fa-brands fa-css3-alt' },
  { name: 'Git', category: 'framework_tool', iconType: 'fontawesome', iconClass: 'fa-brands fa-git-alt' },
  { name: 'GitHub', category: 'framework_tool', iconType: 'fontawesome', iconClass: 'fa-brands fa-github' },
  { name: 'MySQL', category: 'framework_tool', iconType: 'fontawesome', iconClass: 'fa-solid fa-database' },
  { name: 'Docker', category: 'framework_tool', iconType: 'fontawesome', iconClass: 'fa-brands fa-docker' },
  { name: 'WordPress', category: 'framework_tool', iconType: 'fontawesome', iconClass: 'fa-brands fa-wordpress' },
  { name: 'Android', category: 'framework_tool', iconType: 'fontawesome', iconClass: 'fa-brands fa-android' },
  { name: 'Linux', category: 'framework_tool', iconType: 'fontawesome', iconClass: 'fa-brands fa-linux' },
  { name: 'AWS', category: 'framework_tool', iconType: 'fontawesome', iconClass: 'fa-brands fa-aws' },
  { name: 'Tailwind CSS', category: 'framework_tool', iconType: 'fontawesome', iconClass: 'fa-solid fa-wind' },
  { name: 'Firebase', category: 'framework_tool', iconType: 'fontawesome', iconClass: 'fa-solid fa-fire' }
];

export function AdminSkillsTab({ skills, setSkills, reloadSkills, showToast, loading = false }) {
  const confirm = useConfirm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_SKILL_FORM);
  const [saving, setSaving] = useState(false);
  const [draggedSkillId, setDraggedSkillId] = useState(null);
  const [dragOverSkillId, setDragOverSkillId] = useState(null);

  const languages = (skills || [])
    .filter((s) => s.category === 'language')
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  const frameworks = (skills || [])
    .filter((s) => s.category === 'framework_tool')
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const handleSkillDragStart = (e, skill) => {
    e.dataTransfer.setData('text/plain', skill.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedSkillId(skill.id);
  };

  const handleSkillDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleSkillDragEnter = (skill) => {
    if (!draggedSkillId || draggedSkillId === skill.id) return;
    const sourceSkill = skills.find((s) => s.id === draggedSkillId);
    if (sourceSkill && sourceSkill.category === skill.category) {
      setDragOverSkillId(skill.id);
    }
  };

  const handleSkillDragLeave = (e, skill) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    if (dragOverSkillId === skill.id) {
      setDragOverSkillId(null);
    }
  };

  const handleSkillDragEnd = () => {
    setDraggedSkillId(null);
    setDragOverSkillId(null);
  };

  const handleSkillDrop = async (e, targetSkill) => {
    e.preventDefault();
    const sourceId = draggedSkillId || e.dataTransfer.getData('text/plain');
    setDraggedSkillId(null);
    setDragOverSkillId(null);

    if (!sourceId || sourceId === targetSkill.id || !db) return;

    const sourceSkill = (skills || []).find((s) => s.id === sourceId);
    if (!sourceSkill) return;

    if (sourceSkill.category !== targetSkill.category) {
      showToast('Cannot move skills across different categories.', 'warning');
      return;
    }

    const previousSkills = skills;
    const categorySkills = (skills || [])
      .filter((s) => s.category === targetSkill.category)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    const sourceIdx = categorySkills.findIndex((s) => s.id === sourceId);
    const targetIdx = categorySkills.findIndex((s) => s.id === targetSkill.id);
    if (sourceIdx === -1 || targetIdx === -1) return;

    const reorderedCategory = [...categorySkills];
    const [moved] = reorderedCategory.splice(sourceIdx, 1);
    reorderedCategory.splice(targetIdx, 0, moved);

    const normalized = reorderedCategory.map((s, idx) => ({
      ...s,
      order: idx + 1
    }));

    if (setSkills) {
      const updatedSkills = (skills || []).map((s) => {
        if (s.category === targetSkill.category) {
          const match = normalized.find((item) => item.id === s.id);
          return match || s;
        }
        return s;
      });
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('portfolio_skills_cache', JSON.stringify(updatedSkills));
        }
      } catch {
        // ignore
      }
      setSkills(updatedSkills);
    }

    try {
      const batch = writeBatch(db);
      normalized.forEach((s) => {
        batch.update(doc(db, 'skills', s.id), {
          order: s.order,
          updatedAt: serverTimestamp()
        });
      });
      await batch.commit();
      showToast(`Reordered "${moved.name}" to position #${targetIdx + 1}!`, 'success');
      if (reloadSkills) await reloadSkills();
    } catch (err) {
      console.error('Error reordering skills via DnD:', err);
      if (setSkills) setSkills(previousSkills);
      showToast('Failed to update skill order: ' + err.message, 'error');
      if (reloadSkills) await reloadSkills();
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      ...INITIAL_SKILL_FORM,
      order: skills.length + 1
    });
    setModalOpen(true);
  };

  const openEditModal = (skill) => {
    setEditingId(skill.id);
    setFormData({
      name: skill.name || '',
      category: skill.category || 'language',
      level: skill.level || 'Experienced',
      iconType: skill.iconType || (skill.iconUrl ? 'upload' : 'fontawesome'),
      iconClass: skill.iconClass || '',
      iconUrl: skill.iconUrl || '',
      order: skill.order || 1
    });
    setModalOpen(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('image/') && !file.name.endsWith('.svg')) {
      showToast('Hanya file gambar (PNG, SVG, WebP) yang didukung.', 'error');
      return;
    }

    if (file.size > 1024 * 1024) {
      showToast('Ukuran file terlalu besar! Maksimal 1 MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const base64 = loadEvent.target.result;
      setFormData((prev) => ({
        ...prev,
        iconType: 'upload',
        iconUrl: base64
      }));
      showToast(`Icon "${file.name}" berhasil diunggah!`, 'success');
    };
    reader.onerror = () => {
      showToast('Gagal membaca file gambar.', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleUseFavicon = () => {
    setFormData((prev) => ({
      ...prev,
      name: prev.name || 'Arko CMS',
      iconType: 'upload',
      iconUrl: '/assets/favicon.png'
    }));
    showToast('Asset Favicon Arko berhasil dipilih!', 'info');
  };

  const handleRemoveUploadedIcon = () => {
    setFormData((prev) => ({
      ...prev,
      iconType: 'fontawesome',
      iconUrl: '',
      iconClass: prev.iconClass || 'fa-solid fa-code'
    }));
  };

  const handleToggleLevel = async (skill) => {
    if (!db) return;
    const newLevel = skill.level === 'Experienced' ? 'Intermediate' : 'Experienced';
    const previousSkills = skills;
    if (setSkills) {
      const updatedSkills = (skills || []).map((s) =>
        s.id === skill.id ? { ...s, level: newLevel } : s
      );
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('portfolio_skills_cache', JSON.stringify(updatedSkills));
        }
      } catch {
        // ignore
      }
      setSkills(updatedSkills);
    }
    try {
      await updateDoc(doc(db, 'skills', skill.id), {
        level: newLevel,
        updatedAt: serverTimestamp()
      });
      showToast(`"${skill.name}" level changed to ${newLevel}`, 'success');
      if (reloadSkills) await reloadSkills();
    } catch (err) {
      console.error('Error toggling skill level:', err);
      if (setSkills) setSkills(previousSkills);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('portfolio_skills_cache', JSON.stringify(previousSkills));
        }
      } catch {
        // ignore
      }
      showToast('Failed to toggle level: ' + err.message, 'error');
      if (reloadSkills) await reloadSkills();
    }
  };

  const handleDelete = async (skill) => {
    const ok = await confirm({
      title: 'Hapus Keahlian?',
      message: `Apakah Anda yakin ingin menghapus "${skill.name}"?`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      variant: 'danger'
    });
    if (!ok) return;

    const previousSkills = skills;
    if (setSkills) {
      const updatedSkills = (skills || []).filter((s) => s.id !== skill.id);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('portfolio_skills_cache', JSON.stringify(updatedSkills));
        }
      } catch {
        // ignore
      }
      setSkills(updatedSkills);
    }

    try {
      await deleteDoc(doc(db, 'skills', skill.id));
      showToast(`Deleted skill "${skill.name}"`, 'info');
      if (reloadSkills) await reloadSkills();
    } catch (err) {
      console.error('Error deleting skill:', err);
      if (setSkills) setSkills(previousSkills);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('portfolio_skills_cache', JSON.stringify(previousSkills));
        }
      } catch {
        // ignore
      }
      showToast('Failed to delete skill: ' + err.message, 'error');
      if (reloadSkills) await reloadSkills();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!db) return;
    setSaving(true);

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      level: formData.level,
      iconType: formData.iconType || (formData.iconUrl ? 'upload' : 'fontawesome'),
      iconClass: formData.iconClass.trim() || 'fa-solid fa-code',
      iconUrl: formData.iconUrl || '',
      order: parseInt(formData.order, 10) || 1,
      updatedAt: serverTimestamp()
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'skills', editingId), payload);
        showToast(`Skill "${payload.name}" updated!`, 'success');
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, 'skills'), payload);
        showToast(`Skill "${payload.name}" added!`, 'success');
      }
      setModalOpen(false);
      await reloadSkills();
    } catch (err) {
      console.error('Error saving skill:', err);
      showToast('Failed to save skill: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const renderSkillRow = (skill) => {
    const isExperienced = skill.level === 'Experienced';
    return (
      <div
        key={skill.id}
        draggable={true}
        onDragStart={(e) => handleSkillDragStart(e, skill)}
        onDragOver={handleSkillDragOver}
        onDragEnter={() => handleSkillDragEnter(skill)}
        onDragLeave={(e) => handleSkillDragLeave(e, skill)}
        onDragEnd={handleSkillDragEnd}
        onDrop={(e) => handleSkillDrop(e, skill)}
        className={`skill-item-row flex flex-wrap items-center justify-between gap-2.5 rounded-lg border border-border bg-background/60 p-2.5 transition-all hover:bg-muted/40 ${
          draggedSkillId === skill.id ? 'opacity-50' : ''
        } ${
          dragOverSkillId === skill.id ? 'border-foreground ring-2 ring-foreground/40' : ''
        }`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <div
            title="Drag to reorder"
            className="flex size-7 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
          >
            <IconGripVertical className="size-4" stroke={1.75} aria-hidden="true" />
          </div>

          <div className="skill-icon-box flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-foreground">
            <SkillIcon skill={skill} size="1.2rem" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-foreground">{skill.name}</div>
            <div className="font-mono text-[11px] tabular-nums text-muted-foreground">
              Order #{skill.order || 1}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleToggleLevel(skill)}
            title="Click to toggle level (Experienced / Intermediate)"
            className={`h-7 gap-1.5 px-2.5 text-xs ${
              isExperienced
                ? 'border-success/40 bg-success/10 text-success hover:bg-success/15 hover:text-success'
                : 'border-warning/40 bg-warning/10 text-warning hover:bg-warning/15 hover:text-warning'
            }`}
          >
            <IconAdjustmentsHorizontal className="size-3.5" stroke={1.75} aria-hidden="true" />
            {skill.level}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => openEditModal(skill)}
            title="Edit Skill"
            aria-label={`Edit ${skill.name}`}
          >
            <IconPencil className="size-3.5" stroke={1.75} aria-hidden="true" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={() => handleDelete(skill)}
            title="Delete Skill"
            aria-label={`Delete ${skill.name}`}
          >
            <IconTrash className="size-3.5" stroke={1.75} aria-hidden="true" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <section id="tab-skills" className="flex flex-col gap-6">
      <AdminPageHeader
        title="Experience & Technical Skills"
        badge={`${(skills || []).length} total`}
        description="Manage programming languages, frameworks, and proficiency levels (Intermediate / Experienced). Drag rows within each category to reorder."
        actions={
          <Button type="button" id="btn-add-skill" onClick={openAddModal}>
            <IconPlus className="size-4" stroke={1.75} data-icon="inline-start" aria-hidden="true" />
            Add Skill
          </Button>
        }
      />

      {loading ? (
        <AdminSkillsShimmer />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="gap-4 py-5">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border px-5 pb-4">
              <CardTitle className="font-display flex items-center gap-2 text-base font-semibold">
                <IconCode className="size-4 text-muted-foreground" stroke={1.75} aria-hidden="true" />
                Programming Languages
              </CardTitle>
              <Badge variant="secondary" className="font-mono text-xs tabular-nums">
                {languages.length}
              </Badge>
            </CardHeader>
            <CardContent id="skills-languages-list" className="flex flex-col gap-2.5 px-5">
              {languages.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No programming languages found.
                </p>
              ) : (
                languages.map(renderSkillRow)
              )}
            </CardContent>
          </Card>

          <Card className="gap-4 py-5">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border px-5 pb-4">
              <CardTitle className="font-display flex items-center gap-2 text-base font-semibold">
                <IconStack2 className="size-4 text-muted-foreground" stroke={1.75} aria-hidden="true" />
                Frameworks &amp; Tools
              </CardTitle>
              <Badge variant="secondary" className="font-mono text-xs tabular-nums">
                {frameworks.length}
              </Badge>
            </CardHeader>
            <CardContent id="skills-frameworks-list" className="flex flex-col gap-2.5 px-5">
              {frameworks.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No frameworks or tools found.
                </p>
              ) : (
                frameworks.map(renderSkillRow)
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ADD / EDIT SKILL DIALOG */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingId ? 'Edit Skill' : 'Add Skill'}
            </DialogTitle>
            <DialogDescription>
              Pick a preset icon or upload a custom SVG/PNG asset for your portfolio skills section.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
            <div className="flex flex-col gap-2">
              <Label htmlFor="skill-name">Skill Name *</Label>
              <Input
                type="text"
                id="skill-name"
                required
                placeholder="e.g. Flutter, TypeScript, Docker"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="skill-category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="skill-category" className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="language">Programming Language</SelectItem>
                    <SelectItem value="framework_tool">Framework / Tool / DB</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="skill-level">Proficiency Level</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) => setFormData({ ...formData, level: value })}
                >
                  <SelectTrigger id="skill-level" className="w-full">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Experienced">Experienced</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="skill-order">Display Order</Label>
              <Input
                type="number"
                id="skill-order"
                min="1"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: e.target.value })}
              />
            </div>

            {/* ICON SOURCE SWITCHER */}
            <div className="flex flex-col gap-2">
              <Label className="flex items-center gap-1.5">
                <IconPalette className="size-4 text-muted-foreground" stroke={1.75} aria-hidden="true" />
                Icon Source &amp; Format
              </Label>
              <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/40 p-1">
                <Button
                  type="button"
                  size="sm"
                  variant={formData.iconType !== 'upload' ? 'default' : 'ghost'}
                  onClick={() => setFormData({ ...formData, iconType: 'fontawesome' })}
                >
                  <IconIcons className="size-3.5" stroke={1.75} data-icon="inline-start" aria-hidden="true" />
                  Font Awesome / Auto SVG
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={formData.iconType === 'upload' ? 'default' : 'ghost'}
                  onClick={() => setFormData({ ...formData, iconType: 'upload' })}
                >
                  <IconCloudUpload className="size-3.5" stroke={1.75} data-icon="inline-start" aria-hidden="true" />
                  Upload PNG / SVG
                </Button>
              </div>
            </div>

            {formData.iconType !== 'upload' ? (
              <>
                <div className="flex flex-col gap-2">
                  <Label className="flex items-center gap-1.5">
                    <IconSparkles className="size-4 text-muted-foreground" stroke={1.75} aria-hidden="true" />
                    Preset Icons (Click to autofill)
                  </Label>
                  <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto rounded-lg border border-border bg-muted/20 p-2.5">
                    {PRESET_ICONS.map((preset) => (
                      <Button
                        key={preset.name}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1.5 px-2.5 text-xs"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            name: preset.name,
                            category: preset.category,
                            iconType: preset.iconType,
                            iconClass: preset.iconClass,
                            iconUrl: preset.iconUrl || ''
                          });
                        }}
                      >
                        <SkillIcon skill={preset} size="0.9rem" />
                        <span>{preset.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="skill-icon-class">Font Awesome Class or Tech Name</Label>
                  <div className="flex items-center gap-2.5">
                    <Input
                      type="text"
                      id="skill-icon-class"
                      placeholder="e.g. fa-brands fa-react, fa-brands fa-dart-lang, or fa-brands fa-flutter"
                      value={formData.iconClass}
                      onChange={(e) => setFormData({ ...formData, iconClass: e.target.value })}
                    />
                    <div
                      className="skill-icon-box flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-foreground"
                      title="Live Icon Preview"
                    >
                      <SkillIcon
                        skill={{
                          name: formData.name,
                          iconClass: formData.iconClass,
                          iconType: formData.iconType,
                          iconUrl: formData.iconUrl
                        }}
                        size="1.25rem"
                      />
                    </div>
                  </div>
                  <p className="flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
                    <IconInfoCircle className="mt-0.5 size-3.5 shrink-0" stroke={1.75} aria-hidden="true" />
                    <span>
                      <strong>Auto-renders official SVG:</strong> Flutter, Dart (e.g.{' '}
                      <code className="font-mono">fa-brands fa-dart-lang</code>), &amp; Arko CMS adapt automatically to theme. Browse icons at{' '}
                      <a
                        href="https://fontawesome.com/icons"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-foreground"
                      >
                        fontawesome.com
                      </a>
                      .
                    </span>
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Label htmlFor="skill-icon-file">Upload Custom Icon (PNG / SVG)</Label>
                <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-3.5">
                  <div className="flex items-center gap-3">
                    <div
                      className="skill-icon-box flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-foreground"
                      title="Live Preview"
                    >
                      <SkillIcon
                        skill={{
                          name: formData.name,
                          iconClass: formData.iconClass,
                          iconType: 'upload',
                          iconUrl: formData.iconUrl
                        }}
                        size="1.25rem"
                      />
                    </div>
                    <Input
                      type="file"
                      id="skill-icon-file"
                      aria-label="Upload Skill Icon"
                      accept="image/png,image/svg+xml,image/webp,image/jpeg,.png,.svg"
                      onChange={handleFileUpload}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleUseFavicon}
                      title="Gunakan asset resmi Favicon Arko"
                    >
                      <IconDiamond className="size-3.5" stroke={1.75} data-icon="inline-start" aria-hidden="true" />
                      Pakai Asset Favicon Arko (/assets/favicon.png)
                    </Button>
                    {formData.iconUrl ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={handleRemoveUploadedIcon}
                      >
                        <IconTrash className="size-3.5" stroke={1.75} data-icon="inline-start" aria-hidden="true" />
                        Reset Icon
                      </Button>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Mendukung file PNG, SVG, atau WebP transparan (Maksimal 1 MB). Otomatis menyesuaikan tema dark mode &amp; light mode.
                  </p>
                </div>
              </div>
            )}

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
                  'Save Skill'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
