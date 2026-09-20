/**
 * Admin Skills Controller
 * Manages Skills CRUD and Proficiency Toggle
 */

'use strict';

const AdminSkills = {
  skills: [],
  currentEditId: null,

  init() {
    this.setupForm();
  },

  setupForm() {
    const form = document.getElementById('skill-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveSkill();
      });
    }
  },

  async loadSkills() {
    if (!db) return;
    const containerLang = document.getElementById('skills-languages-container');
    const containerTools = document.getElementById('skills-tools-container');

    if (!containerLang || !containerTools) return;

    containerLang.innerHTML = '<p><i class="fa-solid fa-spinner fa-spin"></i> Loading skills...</p>';
    containerTools.innerHTML = '<p><i class="fa-solid fa-spinner fa-spin"></i> Loading skills...</p>';

    try {
      const snapshot = await db.collection('skills').orderBy('order', 'asc').get();
      this.skills = [];
      snapshot.forEach(doc => {
        this.skills.push({ id: doc.id, ...doc.data() });
      });

      this.renderSkillsList();
      if (window.AdminMain) AdminMain.updateStats();
    } catch (err) {
      console.error('Error loading skills:', err);
      containerLang.innerHTML = '<p style="color:var(--accent-danger)">Error loading skills</p>';
      containerTools.innerHTML = '<p style="color:var(--accent-danger)">Error loading skills</p>';
      AdminMain.showToast('Failed to load skills: ' + err.message, 'error');
    }
  },

  renderSkillsList() {
    const containerLang = document.getElementById('skills-languages-container');
    const containerTools = document.getElementById('skills-tools-container');

    const languages = this.skills.filter(s => s.category === 'language');
    const tools = this.skills.filter(s => s.category === 'framework_tool');

    containerLang.innerHTML = this.buildSkillsTable(languages);
    containerTools.innerHTML = this.buildSkillsTable(tools);
  },

  buildSkillsTable(items) {
    if (items.length === 0) {
      return '<p style="color:var(--text-muted); font-size:0.9rem;">No skills added in this category yet.</p>';
    }

    let html = `
      <div style="display:flex; flex-direction:column; gap:0.6rem;">
    `;

    items.forEach((skill) => {
      const isExp = skill.level === 'Experienced';
      const levelBadge = isExp
        ? '<span class="compression-badge" style="background-color: var(--accent-success); cursor:pointer;" onclick="AdminSkills.toggleLevel(\'' + skill.id + '\', \'' + skill.level + '\')" title="Click to toggle level">Experienced</span>'
        : '<span class="compression-badge" style="background-color: var(--accent-info); cursor:pointer;" onclick="AdminSkills.toggleLevel(\'' + skill.id + '\', \'' + skill.level + '\')" title="Click to toggle level">Intermediate</span>';

      let iconPreview = '';
      if (skill.iconType === 'svg') {
        iconPreview = '<i class="fa-solid fa-code" title="Custom SVG"></i>';
      } else {
        iconPreview = `<i class="${skill.iconClass || 'fa-solid fa-code'}"></i>`;
      }

      html += `
        <div class="skill-item-row">
          <div class="skill-item-info">
            <div class="skill-item-icon">${iconPreview}</div>
            <div style="min-width: 0;">
              <strong style="font-size:0.98rem; display:block; word-break:break-word;">${skill.name}</strong>
              <small style="color:var(--text-muted);">${skill.category === 'language' ? 'Language' : 'Framework/Tool'}</small>
            </div>
          </div>
          <div class="skill-item-actions">
            ${levelBadge}
            <button class="btn btn-secondary btn-sm" onclick="AdminSkills.openEditModal('${skill.id}')" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
            <button class="btn btn-danger btn-sm" onclick="AdminSkills.deleteSkill('${skill.id}', '${skill.name}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
      `;
    });

    html += '</div>';
    return html;
  },

  openCreateModal(defaultCategory = 'language') {
    this.currentEditId = null;
    document.getElementById('skill-modal-title').textContent = 'Add New Skill';
    document.getElementById('skill-form').reset();
    document.getElementById('skill-category').value = defaultCategory;
    document.getElementById('skill-order').value = this.skills.length + 1;

    AdminMain.openModal('skill-modal');
  },

  openEditModal(id) {
    const skill = this.skills.find(s => s.id === id);
    if (!skill) return;

    this.currentEditId = id;
    document.getElementById('skill-modal-title').textContent = 'Edit Skill';
    document.getElementById('skill-name').value = skill.name || '';
    document.getElementById('skill-category').value = skill.category || 'language';
    document.getElementById('skill-level').value = skill.level || 'Experienced';
    document.getElementById('skill-icon-type').value = skill.iconType || 'fontawesome';
    document.getElementById('skill-icon-class').value = skill.iconClass || '';
    document.getElementById('skill-order').value = skill.order || 1;

    AdminMain.openModal('skill-modal');
  },

  async saveSkill() {
    const name = document.getElementById('skill-name').value.trim();
    const category = document.getElementById('skill-category').value;
    const level = document.getElementById('skill-level').value;
    const iconType = document.getElementById('skill-icon-type').value;
    const iconClass = document.getElementById('skill-icon-class').value.trim();
    const order = parseInt(document.getElementById('skill-order').value) || 1;

    if (!name) {
      AdminMain.showToast('Please enter skill name', 'error');
      return;
    }

    const skillData = {
      name,
      category,
      level,
      iconType,
      iconClass,
      order,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    const saveBtn = document.getElementById('save-skill-btn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    try {
      if (this.currentEditId) {
        await db.collection('skills').doc(this.currentEditId).update(skillData);
        AdminMain.showToast('Skill updated!', 'success');
      } else {
        skillData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('skills').add(skillData);
        AdminMain.showToast('New skill added!', 'success');
      }

      AdminMain.closeModal('skill-modal');
      this.loadSkills();
    } catch (err) {
      console.error('Error saving skill:', err);
      AdminMain.showToast('Failed to save skill: ' + err.message, 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = 'Save Skill';
    }
  },

  async toggleLevel(id, currentLevel) {
    const newLevel = currentLevel === 'Experienced' ? 'Intermediate' : 'Experienced';
    try {
      await db.collection('skills').doc(id).update({
        level: newLevel,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      AdminMain.showToast(`Updated to ${newLevel}!`, 'success');
      this.loadSkills();
    } catch (err) {
      console.error('Error toggling skill level:', err);
      AdminMain.showToast('Failed to update: ' + err.message, 'error');
    }
  },

  async deleteSkill(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await db.collection('skills').doc(id).delete();
      AdminMain.showToast('Skill deleted', 'success');
      this.loadSkills();
    } catch (err) {
      console.error('Error deleting skill:', err);
      AdminMain.showToast('Failed to delete: ' + err.message, 'error');
    }
  }
};

window.AdminSkills = AdminSkills;
