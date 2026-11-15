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
import { db } from '../../../services/firebase';
import { useConfirm } from '../../../context/ConfirmContext';
import { SkillIcon } from '../../../components/common/SkillIcon';
import { AdminSkillsShimmer } from '../AdminShimmer';

const INITIAL_SKILL_FORM = {
  name: '',
  category: 'language',
  level: 'Experienced',
  iconType: 'fontawesome',
  iconClass: 'fa-solid fa-code',
  order: 1
};

export function AdminSkillsTab({ skills, reloadSkills, showToast, loading = false }) {
  const confirm = useConfirm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_SKILL_FORM);
  const [saving, setSaving] = useState(false);
  const [draggedSkillId, setDraggedSkillId] = useState(null);
  const [dragOverSkillId, setDragOverSkillId] = useState(null);

  const languages = skills.filter((s) => s.category === 'language');
  const frameworks = skills.filter((s) => s.category === 'framework_tool');

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
    if (draggedSkillId && draggedSkillId !== skill.id) {
      setDragOverSkillId(skill.id);
    }
  };

  const handleSkillDragLeave = (skill) => {
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

    const sourceSkill = skills.find((s) => s.id === sourceId);
    if (!sourceSkill) return;

    // Review Focus #5: Category isolation check
    if (sourceSkill.category !== targetSkill.category) {
      showToast('Cannot move skills across different categories.', 'warning');
      return;
    }

    const categorySkills = skills.filter((s) => s.category === targetSkill.category);
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
      await reloadSkills();
    } catch (err) {
      console.error('Error reordering skills via DnD:', err);
      showToast('Failed to update skill order: ' + err.message, 'error');
      await reloadSkills();
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
      iconType: skill.iconType || 'fontawesome',
      iconClass: skill.iconClass || '',
      order: skill.order || 1
    });
    setModalOpen(true);
  };

  const handleToggleLevel = async (skill) => {
    if (!db) return;
    const newLevel = skill.level === 'Experienced' ? 'Intermediate' : 'Experienced';
    try {
      await updateDoc(doc(db, 'skills', skill.id), {
        level: newLevel,
        updatedAt: serverTimestamp()
      });
      showToast(`"${skill.name}" level changed to ${newLevel}`, 'success');
      await reloadSkills();
    } catch (err) {
      console.error('Error toggling skill level:', err);
      showToast('Failed to toggle level: ' + err.message, 'error');
    }
  };

  const handleDelete = async (skill) => {
    const ok = await confirm({
      title: 'Hapus Keahlian?',
      message: `Apakah Anda yakin ingin menghapus "${skill.name}"?`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      variant: 'danger',
      icon: 'fa-solid fa-trash'
    });
    if (!ok) return;

    try {
      await deleteDoc(doc(db, 'skills', skill.id));
      showToast(`Deleted skill "${skill.name}"`, 'info');
      await reloadSkills();
    } catch (err) {
      console.error('Error deleting skill:', err);
      showToast('Failed to delete skill: ' + err.message, 'error');
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
      iconType: formData.iconType,
      iconClass: formData.iconClass.trim() || 'fa-solid fa-code',
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
        className={`skill-item-row ${draggedSkillId === skill.id ? 'is-dragging' : ''} ${dragOverSkillId === skill.id ? 'drag-target' : ''}`}
        key={skill.id}
        draggable={true}
        onDragStart={(e) => handleSkillDragStart(e, skill)}
        onDragOver={handleSkillDragOver}
        onDragEnter={() => handleSkillDragEnter(skill)}
        onDragLeave={() => handleSkillDragLeave(skill)}
        onDragEnd={handleSkillDragEnd}
        onDrop={(e) => handleSkillDrop(e, skill)}
      >
        <div className="skill-item-info">
          <div className="skill-drag-handle" title="Drag to reorder">
            <i className="fa-solid fa-grip-vertical"></i>
          </div>
          <div className="skill-item-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SkillIcon skill={skill} size="1.25rem" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', wordBreak: 'break-word' }}>
              {skill.name}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Order #{skill.order || 1}
            </div>
          </div>
        </div>
        <div className="skill-item-actions">
          <button
            type="button"
            className="btn btn-sm"
            style={{
              background: isExperienced
                ? 'rgba(16, 185, 129, 0.15)'
                : 'rgba(245, 158, 11, 0.15)',
              color: isExperienced ? '#10b981' : '#f59e0b',
              border: `1px solid ${isExperienced ? '#10b981' : '#f59e0b'}`
            }}
            onClick={() => handleToggleLevel(skill)}
            title="Click to toggle level (Experienced / Intermediate)"
          >
            <i className="fa-solid fa-sliders"></i> {skill.level}
          </button>
          <button
            type="button"
            className="btn-icon"
            style={{ width: '2rem', height: '2rem' }}
            onClick={() => openEditModal(skill)}
            title="Edit Skill"
          >
            <i className="fa-solid fa-pen" style={{ fontSize: '0.8rem' }}></i>
          </button>
          <button
            type="button"
            className="btn-icon"
            style={{
              width: '2rem',
              height: '2rem',
              color: 'var(--accent-danger)',
              borderColor: 'var(--accent-danger)'
            }}
            onClick={() => handleDelete(skill)}
            title="Delete Skill"
          >
            <i className="fa-solid fa-trash" style={{ fontSize: '0.8rem' }}></i>
          </button>
        </div>
      </div>
    );
  };

  return (
    <section id="tab-skills" className="tab-section">
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Experience &amp; Technical Skills</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Manage programming languages, frameworks, and proficiency levels (Intermediate /
              Experienced).
            </p>
          </div>
          <button
            type="button"
            id="btn-add-skill"
            className="btn btn-primary"
            onClick={openAddModal}
          >
            <i className="fa-solid fa-plus"></i> Add Skill
          </button>
        </div>

        {loading ? (
          <AdminSkillsShimmer />
        ) : (
          <div className="form-row">
            <div className="card" style={{ marginBottom: 0 }}>
              <h3
                style={{
                  fontSize: '1.05rem',
                  marginBottom: '1rem',
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '0.5rem'
                }}
              >
                <i className="fa-solid fa-code"></i> Programming Languages
              </h3>
              <div
                id="skills-languages-list"
                style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
              >
                {languages.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    No programming languages found.
                  </p>
                ) : (
                  languages.map(renderSkillRow)
                )}
              </div>
            </div>

            <div className="card" style={{ marginBottom: 0 }}>
              <h3
                style={{
                  fontSize: '1.05rem',
                  marginBottom: '1rem',
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '0.5rem'
                }}
              >
                <i className="fa-solid fa-cubes"></i> Frameworks &amp; Tools
              </h3>
              <div
                id="skills-frameworks-list"
                style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
              >
                {frameworks.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    No frameworks or tools found.
                  </p>
                ) : (
                  frameworks.map(renderSkillRow)
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ADD / EDIT SKILL MODAL */}
      <div
        id="skill-modal"
        className={`modal-backdrop ${modalOpen ? 'show' : ''}`}
        onClick={(e) => {
          if (e.target.id === 'skill-modal') setModalOpen(false);
        }}
      >
        <div className="modal-content" style={{ maxWidth: '480px' }}>
          <div className="modal-header">
            <h3 style={{ fontSize: '1.25rem' }}>{editingId ? 'Edit Skill' : 'Add Skill'}</h3>
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
              <div className="form-group">
                <label className="form-label" htmlFor="skill-name">
                  Skill Name *
                </label>
                <input
                  type="text"
                  id="skill-name"
                  className="form-input"
                  required
                  placeholder="e.g. Flutter, TypeScript, Docker"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="skill-category">
                    Category
                  </label>
                  <select
                    id="skill-category"
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="language">Programming Language</option>
                    <option value="framework_tool">Framework / Tool / DB</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="skill-level">
                    Proficiency Level
                  </label>
                  <select
                    id="skill-level"
                    className="form-select"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  >
                    <option value="Experienced">Experienced</option>
                    <option value="Intermediate">Intermediate</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="skill-icon-type">
                    Icon Type
                  </label>
                  <select
                    id="skill-icon-type"
                    className="form-select"
                    value={formData.iconType}
                    onChange={(e) => setFormData({ ...formData, iconType: e.target.value })}
                  >
                    <option value="fontawesome">Font Awesome Icon</option>
                    <option value="svg">Custom SVG (e.g. Flutter)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="skill-order">
                    Display Order
                  </label>
                  <input
                    type="number"
                    id="skill-order"
                    className="form-input"
                    min="1"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="skill-icon-class">
                  Font Awesome Class (e.g. fa-brands fa-react or fa-brands fa-flutter)
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    id="skill-icon-class"
                    className="form-input"
                    placeholder="e.g. fa-brands fa-react or fa-brands fa-flutter"
                    value={formData.iconClass}
                    onChange={(e) => setFormData({ ...formData, iconClass: e.target.value })}
                  />
                  <div
                    className="skill-item-icon"
                    style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-color)',
                      flexShrink: 0
                    }}
                    title="Live Icon Preview"
                  >
                    <SkillIcon
                      skill={{
                        name: formData.name,
                        iconClass: formData.iconClass,
                        iconType: formData.iconType
                      }}
                      size="1.25rem"
                    />
                  </div>
                </div>
                <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Flutter auto-renders as official SVG. Browse other icons at{' '}
                  <a
                    href="https://fontawesome.com/icons"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    fontawesome.com
                  </a>
                </small>
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
                {saving ? 'Saving...' : 'Save Skill'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
