/**
 * Admin Projects Controller
 * Handles Projects CRUD, Drag-and-Drop Image Compression (HTML5 Canvas Base64), and Reordering
 */

'use strict';

const AdminProjects = {
  projects: [],
  currentEditId: null,
  currentBase64Image: null,
  isReordering: false,

  init() {
    this.setupDropzone();
    this.setupForm();
  },

  /**
   * HTML5 Canvas Auto-Compressor
   * Converts any image file to ultra-compact WebP/JPEG Base64 (~30KB - 70KB)
   */
  compressImageToBase64(file, maxWidth = 800, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Scale proportionally to maxWidth
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Export as WebP, fallback to JPEG
          let base64 = canvas.toDataURL('image/webp', quality);
          if (!base64.startsWith('data:image/webp')) {
            base64 = canvas.toDataURL('image/jpeg', quality);
          }

          const originalKB = Math.round(file.size / 1024);
          const compressedKB = Math.round((base64.length * 0.75) / 1024);

          resolve({
            base64,
            originalKB,
            compressedKB
          });
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  },

  setupDropzone() {
    const dropzone = document.getElementById('project-dropzone');
    const fileInput = document.getElementById('project-file-input');
    const previewContainer = document.getElementById('project-img-preview');
    const previewImg = document.getElementById('preview-img-element');
    const badge = document.getElementById('compression-info-badge');

    if (!dropzone || !fileInput) return;

    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files.length) {
        this.handleFileSelect(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files.length) {
        this.handleFileSelect(fileInput.files[0]);
      }
    });
  },

  async handleFileSelect(file) {
    if (!file.type.startsWith('image/')) {
      AdminMain.showToast('Please upload an image file (PNG, JPG, WEBP)', 'error');
      return;
    }

    try {
      AdminMain.showToast('Compressing image...', 'info');
      const result = await this.compressImageToBase64(file);
      this.currentBase64Image = result.base64;

      const previewContainer = document.getElementById('project-img-preview');
      const previewImg = document.getElementById('preview-img-element');
      const badge = document.getElementById('compression-info-badge');

      if (previewImg) previewImg.src = result.base64;
      if (badge) {
        badge.innerHTML = `<i class="fa-solid fa-bolt"></i> Auto-Compressed: ${result.originalKB} KB → <strong>${result.compressedKB} KB</strong> (Ready!)`;
      }
      if (previewContainer) previewContainer.style.display = 'block';

      // Clear external URL input if file is uploaded
      const urlInput = document.getElementById('project-image-url');
      if (urlInput) urlInput.value = '';

      AdminMain.showToast(`Compressed to ${result.compressedKB} KB!`, 'success');
    } catch (err) {
      console.error('Compression error:', err);
      AdminMain.showToast('Failed to process image', 'error');
    }
  },

  setupForm() {
    const form = document.getElementById('project-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveProject();
      });
    }

    // Toggle Coming Soon checkbox interaction
    const comingSoonCheckbox = document.getElementById('project-is-coming-soon');
    const demoUrlInput = document.getElementById('project-demo-url');
    if (comingSoonCheckbox && demoUrlInput) {
      comingSoonCheckbox.addEventListener('change', () => {
        if (comingSoonCheckbox.checked) {
          demoUrlInput.placeholder = 'Optional / disabled when Coming Soon';
        } else {
          demoUrlInput.placeholder = 'https://example.com';
        }
      });
    }
  },

  async loadProjects(showLoading = true) {
    if (!db) return;
    const container = document.getElementById('projects-list-container');
    if (!container) return;

    if (showLoading) {
      container.innerHTML = '<div style="text-align:center; padding: 2rem;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><p>Loading projects...</p></div>';
    }

    try {
      const snapshot = await db.collection('projects').orderBy('order', 'asc').get();
      this.projects = [];
      snapshot.forEach(doc => {
        this.projects.push({ id: doc.id, ...doc.data() });
      });

      // Self-heal: ensure every project has a sequential, unique 1..N order
      let needsHeal = false;
      const seenOrders = new Set();
      for (let i = 0; i < this.projects.length; i++) {
        const order = this.projects[i].order;
        if (order === undefined || order === null || seenOrders.has(order) || order !== i + 1) {
          needsHeal = true;
          break;
        }
        seenOrders.add(order);
      }

      if (needsHeal && this.projects.length > 0) {
        // Auto-heal duplicate or inconsistent orders in the background
        this.normalizeProjectOrders();
      }

      this.renderProjectsList();
      if (window.AdminMain) AdminMain.updateStats();
    } catch (error) {
      console.error('Error loading projects:', error);
      if (showLoading) {
        container.innerHTML = '<p style="color:var(--accent-danger);">Failed to load projects from Firestore.</p>';
      }
      AdminMain.showToast('Could not load projects: ' + error.message, 'error');
    }
  },

  async normalizeProjectOrders() {
    if (!db || !this.projects.length) return;
    try {
      const batch = db.batch();
      let hasChanges = false;
      this.projects.forEach((proj, i) => {
        const correctOrder = i + 1;
        if (proj.order !== correctOrder) {
          proj.order = correctOrder;
          batch.update(db.collection('projects').doc(proj.id), { order: correctOrder });
          hasChanges = true;
        }
      });
      if (hasChanges) {
        await batch.commit();
        console.log('Project orders automatically normalized and synchronized.');
      }
    } catch (err) {
      console.warn('Could not auto-normalize project orders:', err);
    }
  },

  formatRichDescription(text) {
    if (!text) return '';
    const escapeHtml = (str) => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    };

    const lines = text.split(/\r?\n/);
    let html = '';
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) {
        if (inList) { html += '</div>'; inList = false; }
        continue;
      }

      const olMatch = line.match(/^(\d+)[\.\)]\s+(.*)/);
      const ulMatch = line.match(/^[-*•]\s+(.*)/);

      if (olMatch) {
        if (!inList) { html += '<div class="rich-list-group">'; inList = true; }
        html += `
          <div class="rich-list-item">
            <span class="rich-number-badge">${olMatch[1]}</span>
            <span class="rich-item-text">${escapeHtml(olMatch[2])}</span>
          </div>
        `;
      } else if (ulMatch) {
        if (!inList) { html += '<div class="rich-list-group">'; inList = true; }
        html += `
          <div class="rich-list-item">
            <span class="rich-check-badge"><i class="fa-solid fa-circle-check"></i></span>
            <span class="rich-item-text">${escapeHtml(ulMatch[1])}</span>
          </div>
        `;
      } else {
        if (inList) { html += '</div>'; inList = false; }
        html += `<p class="rich-desc-p">${escapeHtml(line)}</p>`;
      }
    }

    if (inList) html += '</div>';
    return html;
  },

  renderProjectsList() {
    const container = document.getElementById('projects-list-container');
    if (!container) return;

    if (this.projects.length === 0) {
      container.innerHTML = `
        <div class="card" style="text-align: center; padding: 3rem 1.5rem;">
          <i class="fa-solid fa-folder-open" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
          <h3>No projects found</h3>
          <p style="color: var(--text-muted); margin-bottom: 1.5rem;">You can add your first project or use the Seeder tab to import your 9 existing projects.</p>
          <button class="btn btn-primary" onclick="AdminProjects.openCreateModal()"><i class="fa-solid fa-plus"></i> Add First Project</button>
        </div>
      `;
      return;
    }

    let html = '<div class="admin-grid">';
    this.projects.forEach((proj, index) => {
      let imgSrc = proj.image || '../assets/images/portfolio-1.png';
      if (imgSrc.startsWith('assets/')) {
        imgSrc = '../' + imgSrc;
      }
      const comingSoonBadge = proj.isComingSoon
        ? '<span class="compression-badge" style="background-color: var(--accent-warning);"><i class="fa-solid fa-clock"></i> Coming Soon</span>'
        : '<span class="compression-badge" style="background-color: var(--accent-success);"><i class="fa-solid fa-check"></i> Live</span>';

      const techBadges = (proj.techStack || [])
        .map(t => `<span style="display:inline-block; font-size:0.75rem; background:var(--bg-card-alt); border:1px solid var(--border-color); padding:0.15rem 0.5rem; border-radius:1rem; margin-right:0.3rem; margin-bottom:0.3rem;">${t}</span>`)
        .join('');

      const formattedDesc = this.formatRichDescription(proj.description || '');
      const orderNumber = index + 1;
      const isFirst = index === 0;
      const isLast = index === this.projects.length - 1;
      const isBusy = this.isReordering;

      // Safe escaped title for single-quoted JS arguments
      const safeTitle = (proj.title || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");

      html += `
        <div class="admin-project-card" data-project-id="${proj.id}">
          <div class="admin-project-thumb">
            <span class="project-order-badge" style="position: absolute; top: 0.65rem; left: 0.65rem; z-index: 3; background: rgba(15, 23, 42, 0.78); backdrop-filter: blur(6px); color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.2); font-size: 0.75rem; font-weight: 700; padding: 0.15rem 0.55rem; border-radius: var(--radius-pill); box-shadow: 0 2px 6px rgba(0,0,0,0.35);" title="Project Order: ${orderNumber}">#${orderNumber}</span>
            <div class="admin-project-thumb-bg" style="background-image: url('${imgSrc}');"></div>
            <img src="${imgSrc}" alt="${proj.title}" loading="lazy" />
          </div>
          <div class="admin-project-body">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.5rem; margin-bottom:0.5rem;">
              <h3 style="min-width:0; flex:1; word-break:break-word; font-size:1.1rem; font-weight:600; margin:0;">${proj.title}</h3>
              <div style="flex-shrink:0;">${comingSoonBadge}</div>
            </div>
            <div class="admin-project-desc">${formattedDesc}</div>
            <div style="margin-bottom:1rem;">${techBadges}</div>
            <div class="admin-card-actions">
              <div class="admin-card-reorder">
                <button class="btn btn-secondary btn-sm" onclick="AdminProjects.moveProject(${index}, -1)" ${isFirst || isBusy ? 'disabled' : ''} title="Move Up"><i class="fa-solid fa-arrow-up"></i></button>
                <button class="btn btn-secondary btn-sm" onclick="AdminProjects.moveProject(${index}, 1)" ${isLast || isBusy ? 'disabled' : ''} title="Move Down"><i class="fa-solid fa-arrow-down"></i></button>
              </div>
              <div class="admin-card-buttons">
                <button class="btn btn-secondary btn-sm" onclick="AdminProjects.openEditModal('${proj.id}')"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
                <button class="btn btn-danger btn-sm" onclick="AdminProjects.deleteProject('${proj.id}', '${safeTitle}')"><i class="fa-solid fa-trash"></i></button>
              </div>
            </div>
          </div>
        </div>
      `;
    });
    html += '</div>';
    container.innerHTML = html;
  },

  openCreateModal() {
    this.currentEditId = null;
    this.currentBase64Image = null;

    document.getElementById('project-modal-title').textContent = 'Add New Project';
    document.getElementById('project-form').reset();
    document.getElementById('project-img-preview').style.display = 'none';
    document.getElementById('project-order').value = this.projects.length + 1;

    AdminMain.openModal('project-modal');
  },

  openEditModal(id) {
    const proj = this.projects.find(p => p.id === id);
    if (!proj) return;

    const currentIndex = this.projects.indexOf(proj);
    this.currentEditId = id;
    this.currentBase64Image = proj.image || null;

    document.getElementById('project-modal-title').textContent = 'Edit Project';
    document.getElementById('project-title').value = proj.title || '';
    document.getElementById('project-desc').value = proj.description || '';
    document.getElementById('project-category').value = proj.category || 'Web Application';
    document.getElementById('project-tech').value = (proj.techStack || []).join(', ');
    document.getElementById('project-github-url').value = proj.githubUrl || '';
    document.getElementById('project-demo-url').value = proj.demoUrl || '';
    document.getElementById('project-demo-label').value = proj.demoLabel || 'Live Demo';
    document.getElementById('project-is-coming-soon').checked = !!proj.isComingSoon;
    document.getElementById('project-order').value = proj.order || (currentIndex + 1);

    const previewContainer = document.getElementById('project-img-preview');
    const previewImg = document.getElementById('preview-img-element');
    const badge = document.getElementById('compression-info-badge');

    if (proj.image) {
      previewImg.src = proj.image.startsWith('assets/') ? '../' + proj.image : proj.image;
      badge.innerHTML = '<i class="fa-solid fa-image"></i> Current Image Loaded';
      previewContainer.style.display = 'block';
    } else {
      previewContainer.style.display = 'none';
    }

    AdminMain.openModal('project-modal');
  },

  async saveProject() {
    const title = document.getElementById('project-title').value.trim();
    const description = document.getElementById('project-desc').value.trim();
    const category = document.getElementById('project-category').value;
    const techRaw = document.getElementById('project-tech').value;
    const githubUrl = document.getElementById('project-github-url').value.trim();
    const demoUrl = document.getElementById('project-demo-url').value.trim();
    const demoLabel = document.getElementById('project-demo-label').value;
    const isComingSoon = document.getElementById('project-is-coming-soon').checked;
    const order = parseInt(document.getElementById('project-order').value) || (this.currentEditId ? 1 : this.projects.length + 1);
    const externalUrl = document.getElementById('project-image-url')?.value.trim();

    if (!title) {
      AdminMain.showToast('Please enter a project title', 'error');
      return;
    }

    const techStack = techRaw.split(',').map(t => t.trim()).filter(Boolean);
    const finalImage = this.currentBase64Image || externalUrl || 'assets/images/portfolio-1.png';

    const projectData = {
      title,
      description,
      category,
      techStack,
      githubUrl,
      demoUrl,
      demoLabel,
      isComingSoon,
      order,
      image: finalImage,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    const saveBtn = document.getElementById('save-project-btn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    try {
      if (this.currentEditId) {
        await db.collection('projects').doc(this.currentEditId).update(projectData);
        AdminMain.showToast('Project updated successfully!', 'success');
      } else {
        projectData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('projects').add(projectData);
        AdminMain.showToast('New project added successfully!', 'success');
      }

      AdminMain.closeModal('project-modal');
      await this.loadProjects();
    } catch (err) {
      console.error('Error saving project:', err);
      AdminMain.showToast('Error saving project: ' + err.message, 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = 'Save Project';
    }
  },

  async deleteProject(id, title) {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      AdminMain.showToast('Deleting project...', 'info');
      await db.collection('projects').doc(id).delete();
      AdminMain.showToast('Project deleted successfully', 'success');

      // Remove from local array and re-normalize remaining orders
      this.projects = this.projects.filter(p => p.id !== id);
      await this.normalizeProjectOrders();
      this.renderProjectsList();
      if (window.AdminMain) AdminMain.updateStats();
    } catch (err) {
      console.error('Error deleting project:', err);
      AdminMain.showToast('Failed to delete: ' + err.message, 'error');
    }
  },

  async moveProject(index, offset) {
    if (this.isReordering) return;

    const targetIndex = index + offset;
    if (targetIndex < 0 || targetIndex >= this.projects.length) return;

    this.isReordering = true;

    // 1. Instantly swap in memory (Optimistic UI update)
    const [movedItem] = this.projects.splice(index, 1);
    this.projects.splice(targetIndex, 0, movedItem);

    // 2. Re-render instantly so the user sees immediate feedback without spinner or screen jumping
    this.renderProjectsList();

    // 3. Sync all affected orders to Firestore
    try {
      AdminMain.showToast('Saving new order...', 'info');
      const batch = db.batch();
      let hasChanges = false;

      this.projects.forEach((proj, i) => {
        const correctOrder = i + 1;
        if (proj.order !== correctOrder) {
          proj.order = correctOrder;
          batch.update(db.collection('projects').doc(proj.id), { order: correctOrder });
          hasChanges = true;
        }
      });

      if (hasChanges) {
        await batch.commit();
        AdminMain.showToast('Project order updated!', 'success');
      }
    } catch (err) {
      console.error('Error reordering projects:', err);
      AdminMain.showToast('Failed to reorder: ' + err.message, 'error');
      // On failure, rollback from Firestore
      await this.loadProjects(false);
    } finally {
      this.isReordering = false;
      this.renderProjectsList(); // Refresh buttons enabled/disabled states
    }
  }
};

window.AdminProjects = AdminProjects;
