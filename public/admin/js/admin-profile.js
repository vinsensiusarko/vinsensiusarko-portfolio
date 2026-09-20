/**
 * Admin Profile & Settings Controller
 * Manages Site Bio, Typewriter roles, Profile & About Photos (Base64), CV Resume (Base64/Link), and Contact channels
 */

'use strict';

const AdminProfile = {
  currentCvData: null,
  currentCvFileName: null,
  currentHeroImage: null,
  heroImageRemoved: false,
  currentAboutImage: null,
  aboutImageRemoved: false,

  init() {
    this.setupPhotoDropzones();
    this.setupCvDropzone();
    this.setupForms();
  },

  /**
   * HTML5 Canvas Auto-Compressor for Profile & About Photos
   * Converts any image file to ultra-compact WebP/JPEG Base64 (~25KB - 45KB)
   */
  compressImageToBase64(file, maxWidth = 500, quality = 0.78) {
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

  setupPhotoDropzones() {
    // --- 1. HERO PHOTO DROPZONE ---
    const heroDropzone = document.getElementById('hero-dropzone');
    const heroInput = document.getElementById('hero-file-input');
    const removeHeroBtn = document.getElementById('remove-hero-photo-btn');

    if (heroDropzone && heroInput) {
      heroDropzone.addEventListener('click', (e) => {
        if (e.target.id === 'remove-hero-photo-btn' || e.target.closest('#remove-hero-photo-btn')) return;
        heroInput.click();
      });

      ['dragenter', 'dragover'].forEach(eventName => {
        heroDropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          heroDropzone.classList.add('dragover');
        });
      });

      ['dragleave', 'drop'].forEach(eventName => {
        heroDropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          heroDropzone.classList.remove('dragover');
        });
      });

      heroDropzone.addEventListener('drop', (e) => {
        if (e.dataTransfer.files && e.dataTransfer.files.length) {
          this.handleHeroFile(e.dataTransfer.files[0]);
        }
      });

      heroInput.addEventListener('change', () => {
        if (heroInput.files && heroInput.files.length) {
          this.handleHeroFile(heroInput.files[0]);
        }
      });
    }

    if (removeHeroBtn) {
      removeHeroBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.currentHeroImage = null;
        this.heroImageRemoved = true;
        const heroPreview = document.getElementById('hero-img-preview');
        const heroImg = document.getElementById('hero-preview-img');
        if (heroImg) heroImg.src = '';
        if (heroPreview) heroPreview.style.display = 'none';
        if (heroInput) heroInput.value = '';
        AdminMain.showToast('Hero photo reset to default. Click Save to apply.', 'info');
      });
    }

    // --- 2. ABOUT ME PHOTO DROPZONE ---
    const aboutDropzone = document.getElementById('about-dropzone');
    const aboutInput = document.getElementById('about-file-input');
    const removeAboutBtn = document.getElementById('remove-about-photo-btn');

    if (aboutDropzone && aboutInput) {
      aboutDropzone.addEventListener('click', (e) => {
        if (e.target.id === 'remove-about-photo-btn' || e.target.closest('#remove-about-photo-btn')) return;
        aboutInput.click();
      });

      ['dragenter', 'dragover'].forEach(eventName => {
        aboutDropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          aboutDropzone.classList.add('dragover');
        });
      });

      ['dragleave', 'drop'].forEach(eventName => {
        aboutDropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          aboutDropzone.classList.remove('dragover');
        });
      });

      aboutDropzone.addEventListener('drop', (e) => {
        if (e.dataTransfer.files && e.dataTransfer.files.length) {
          this.handleAboutFile(e.dataTransfer.files[0]);
        }
      });

      aboutInput.addEventListener('change', () => {
        if (aboutInput.files && aboutInput.files.length) {
          this.handleAboutFile(aboutInput.files[0]);
        }
      });
    }

    if (removeAboutBtn) {
      removeAboutBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.currentAboutImage = null;
        this.aboutImageRemoved = true;
        const aboutPreview = document.getElementById('about-img-preview');
        const aboutImg = document.getElementById('about-preview-img');
        if (aboutImg) aboutImg.src = '';
        if (aboutPreview) aboutPreview.style.display = 'none';
        if (aboutInput) aboutInput.value = '';
        AdminMain.showToast('About photo reset to default. Click Save to apply.', 'info');
      });
    }
  },

  async handleHeroFile(file) {
    if (!file.type.startsWith('image/')) {
      AdminMain.showToast('Please select a valid image file (PNG, JPG, WEBP)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      AdminMain.showToast('File size is larger than 5MB. Please choose a smaller image.', 'warning');
    }

    try {
      AdminMain.showToast('Compressing Hero photo...', 'info');
      const result = await this.compressImageToBase64(file, 500, 0.78);
      this.currentHeroImage = result.base64;
      this.heroImageRemoved = false;

      const previewContainer = document.getElementById('hero-img-preview');
      const previewImg = document.getElementById('hero-preview-img');
      const badge = document.getElementById('hero-compression-badge');

      if (previewImg) previewImg.src = result.base64;
      if (badge) {
        badge.innerHTML = `<i class="fa-solid fa-bolt"></i> Auto-Compressed: ${result.originalKB} KB → <strong>${result.compressedKB} KB</strong> (Ready!)`;
      }
      if (previewContainer) previewContainer.style.display = 'block';

      AdminMain.showToast(`Hero photo compressed to ${result.compressedKB} KB! Click Save to apply.`, 'success');
    } catch (err) {
      console.error('Hero image compression error:', err);
      AdminMain.showToast('Failed to process hero photo', 'error');
    }
  },

  async handleAboutFile(file) {
    if (!file.type.startsWith('image/')) {
      AdminMain.showToast('Please select a valid image file (PNG, JPG, WEBP)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      AdminMain.showToast('File size is larger than 5MB. Please choose a smaller image.', 'warning');
    }

    try {
      AdminMain.showToast('Compressing About photo...', 'info');
      const result = await this.compressImageToBase64(file, 500, 0.78);
      this.currentAboutImage = result.base64;
      this.aboutImageRemoved = false;

      const previewContainer = document.getElementById('about-img-preview');
      const previewImg = document.getElementById('about-preview-img');
      const badge = document.getElementById('about-compression-badge');

      if (previewImg) previewImg.src = result.base64;
      if (badge) {
        badge.innerHTML = `<i class="fa-solid fa-bolt"></i> Auto-Compressed: ${result.originalKB} KB → <strong>${result.compressedKB} KB</strong> (Ready!)`;
      }
      if (previewContainer) previewContainer.style.display = 'block';

      AdminMain.showToast(`About photo compressed to ${result.compressedKB} KB! Click Save to apply.`, 'success');
    } catch (err) {
      console.error('About image compression error:', err);
      AdminMain.showToast('Failed to process about photo', 'error');
    }
  },

  setupCvDropzone() {
    const cvInput = document.getElementById('cv-file-input');
    const cvBadge = document.getElementById('cv-file-badge');

    if (cvInput) {
      cvInput.addEventListener('change', () => {
        if (cvInput.files.length) {
          const file = cvInput.files[0];
          if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
            AdminMain.showToast('Please select a PDF file', 'error');
            return;
          }

          // Check size (Firestore 1MB document limit: max ~750KB for Base64)
          if (file.size > 750 * 1024) {
            AdminMain.showToast('File size is larger than 750KB. Consider providing an external link (Google Drive) or compressing the PDF.', 'warning');
          }

          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            this.currentCvData = reader.result;
            this.currentCvFileName = file.name;
            if (cvBadge) {
              const kb = Math.round(file.size / 1024);
              cvBadge.innerHTML = `<i class="fa-solid fa-file-pdf"></i> Selected: <strong>${file.name}</strong> (${kb} KB Base64 ready)`;
              cvBadge.style.display = 'inline-flex';
            }
            AdminMain.showToast(`CV file ready: ${file.name}`, 'success');
          };
        }
      });
    }
  },

  setupForms() {
    // Bio & Profile Form
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveProfile();
      });
    }

    // Contact Form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveContact();
      });
    }
  },

  async loadProfile() {
    if (!db) return;

    try {
      // Load site_settings
      const doc = await db.collection('settings').doc('site_settings').get();
      if (doc.exists) {
        const data = doc.data();
        document.getElementById('profile-name').value = data.name || 'Vinsensius Arka';
        document.getElementById('profile-greeting').value = data.heroGreeting || "Hello, I'm";
        document.getElementById('profile-typewriter').value = (data.typewriterRoles || ["Web Developer", "Mobile Developer"]).join(', ');
        document.getElementById('profile-bio').value = data.bioText || '';
        document.getElementById('profile-exp-years').value = data.expYears || '3+ years';
        document.getElementById('profile-exp-sub').value = data.expSub || 'Web & Mobile Development';
        document.getElementById('profile-edu-degree').value = data.eduDegree || 'Bachelors Degree';
        document.getElementById('profile-edu-major').value = data.eduMajor || 'Computer Science';
        document.getElementById('profile-cv-url').value = data.cvUrl || '';

        // Load Hero Photo
        if (data.heroImage) {
          this.currentHeroImage = data.heroImage;
          this.heroImageRemoved = false;
          const heroPreview = document.getElementById('hero-img-preview');
          const heroImg = document.getElementById('hero-preview-img');
          const heroBadge = document.getElementById('hero-compression-badge');
          if (heroImg) heroImg.src = data.heroImage;
          if (heroBadge) heroBadge.innerHTML = '<i class="fa-solid fa-check"></i> Custom Hero photo active';
          if (heroPreview) heroPreview.style.display = 'block';
        }

        // Load About Photo
        if (data.aboutImage) {
          this.currentAboutImage = data.aboutImage;
          this.aboutImageRemoved = false;
          const aboutPreview = document.getElementById('about-img-preview');
          const aboutImg = document.getElementById('about-preview-img');
          const aboutBadge = document.getElementById('about-compression-badge');
          if (aboutImg) aboutImg.src = data.aboutImage;
          if (aboutBadge) aboutBadge.innerHTML = '<i class="fa-solid fa-check"></i> Custom About photo active';
          if (aboutPreview) aboutPreview.style.display = 'block';
        }

        if (data.cvBase64) {
          this.currentCvData = data.cvBase64;
          this.currentCvFileName = data.cvFileName || 'CV-VinsensiusArka.pdf';
          const cvBadge = document.getElementById('cv-file-badge');
          if (cvBadge) {
            cvBadge.innerHTML = `<i class="fa-solid fa-check"></i> Custom CV PDF uploaded: <strong>${this.currentCvFileName}</strong>`;
            cvBadge.style.display = 'inline-flex';
          }
        }
      }

      // Load contact_settings
      const contactDoc = await db.collection('settings').doc('contact_settings').get();
      if (contactDoc.exists) {
        const cdata = contactDoc.data();
        document.getElementById('contact-email').value = cdata.email || 'me@vinsensiusarka.id';
        document.getElementById('contact-whatsapp').value = cdata.whatsapp || '6285179793167';
        document.getElementById('contact-linkedin').value = cdata.linkedin || 'https://www.linkedin.com/in/vinsensius-arka-a2185a229/';
        document.getElementById('contact-github').value = cdata.github || 'https://github.com/vinsensiusarko';
        document.getElementById('contact-instagram').value = cdata.instagram || 'https://www.instagram.com/vinsensiusarka/';
        document.getElementById('contact-facebook').value = cdata.facebook || 'https://www.facebook.com/vinsensiusarka/';
        document.getElementById('contact-twitter').value = cdata.twitter || 'https://x.com/vinsensiusarka';
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  },

  async saveProfile() {
    const name = document.getElementById('profile-name').value.trim();
    const heroGreeting = document.getElementById('profile-greeting').value.trim();
    const typewriterRaw = document.getElementById('profile-typewriter').value;
    const bioText = document.getElementById('profile-bio').value.trim();
    const expYears = document.getElementById('profile-exp-years').value.trim();
    const expSub = document.getElementById('profile-exp-sub').value.trim();
    const eduDegree = document.getElementById('profile-edu-degree').value.trim();
    const eduMajor = document.getElementById('profile-edu-major').value.trim();
    const cvUrl = document.getElementById('profile-cv-url').value.trim();

    const typewriterRoles = typewriterRaw.split(',').map(r => r.trim()).filter(Boolean);

    const updateData = {
      name,
      heroGreeting,
      typewriterRoles,
      bioText,
      expYears,
      expSub,
      eduDegree,
      eduMajor,
      cvUrl,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    // Handle Hero Photo
    if (this.heroImageRemoved) {
      updateData.heroImage = firebase.firestore.FieldValue.delete();
    } else if (this.currentHeroImage) {
      updateData.heroImage = this.currentHeroImage;
    }

    // Handle About Photo
    if (this.aboutImageRemoved) {
      updateData.aboutImage = firebase.firestore.FieldValue.delete();
    } else if (this.currentAboutImage) {
      updateData.aboutImage = this.currentAboutImage;
    }

    // Handle CV Base64
    if (this.currentCvData) {
      updateData.cvBase64 = this.currentCvData;
      updateData.cvFileName = this.currentCvFileName || 'CV-VinsensiusArka.pdf';
    }

    const btn = document.getElementById('save-profile-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    try {
      await db.collection('settings').doc('site_settings').set(updateData, { merge: true });
      this.heroImageRemoved = false;
      this.aboutImageRemoved = false;
      AdminMain.showToast('Profile, Bio & Photos saved successfully!', 'success');
    } catch (err) {
      console.error('Error saving profile:', err);
      AdminMain.showToast('Failed to save profile: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Save Profile & Bio Settings';
    }
  },

  async saveContact() {
    const email = document.getElementById('contact-email').value.trim();
    const whatsapp = document.getElementById('contact-whatsapp').value.trim();
    const linkedin = document.getElementById('contact-linkedin').value.trim();
    const github = document.getElementById('contact-github').value.trim();
    const instagram = document.getElementById('contact-instagram').value.trim();
    const facebook = document.getElementById('contact-facebook').value.trim();
    const twitter = document.getElementById('contact-twitter').value.trim();

    const contactData = {
      email,
      whatsapp,
      linkedin,
      github,
      instagram,
      facebook,
      twitter,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    const btn = document.getElementById('save-contact-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    try {
      await db.collection('settings').doc('contact_settings').set(contactData, { merge: true });
      AdminMain.showToast('Contact & Social settings saved successfully!', 'success');
    } catch (err) {
      console.error('Error saving contacts:', err);
      AdminMain.showToast('Failed to save contacts: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Save Contact Settings';
    }
  }
};

window.AdminProfile = AdminProfile;
