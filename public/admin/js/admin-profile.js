/**
 * Admin Profile & Settings Controller
 * Manages Site Bio, Typewriter roles, CV Resume (Base64/Link), and Contact channels
 */

'use strict';

const AdminProfile = {
  currentCvData: null,
  currentCvFileName: null,

  init() {
    this.setupCvDropzone();
    this.setupForms();
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

    if (this.currentCvData) {
      updateData.cvBase64 = this.currentCvData;
      updateData.cvFileName = this.currentCvFileName || 'CV-VinsensiusArka.pdf';
    }

    const btn = document.getElementById('save-profile-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    try {
      await db.collection('settings').doc('site_settings').set(updateData, { merge: true });
      AdminMain.showToast('Profile & Bio settings saved successfully!', 'success');
    } catch (err) {
      console.error('Error saving profile:', err);
      AdminMain.showToast('Failed to save profile: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Save Profile & Bio';
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
