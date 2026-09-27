/**
 * Admin Privacy Policy Controller
 * Manages Google Play Store & Web Privacy Policy settings in Firestore
 */

'use strict';

const AdminPrivacy = {
  defaultData: {
    title: "Privacy Policy",
    subtitle: "Developer Policies & User Data",
    lastUpdated: "September 28, 2026",
    developerName: "Vinsensius Arka",
    contactEmail: "me@vinsensiusarka.id",
    contactWebsite: "https://vinsensiusarka.id",
    complianceBadge: "Google Play Store Compliant",
    highlight1Title: "Privacy First",
    highlight1Desc: "We do not sell, rent, or trade your personal information to any third parties.",
    highlight2Title: "Secure & Encrypted",
    highlight2Desc: "HTTPS encryption and standard security protections across all app features.",
    highlight3Title: "Data Deletion",
    highlight3Desc: "Full rights to request complete deletion of your account and records anytime.",
    sectionScope: "Welcome to the Privacy Policy of Vinsensius Arka (\"Developer\", \"we\", \"us\", or \"our\"). This Privacy Policy applies to all mobile applications, software, tools, and digital services published and maintained under our developer account on the Google Play Store (including Mozaic POS App, Satus Mobile, and subsequent releases), as well as our official developer portfolio website.",
    sectionDataCollection: "We collect only the minimum necessary information required to operate, maintain, and provide the services you request. This includes account credentials, business transaction logs entered by you, and automated diagnostic device telemetry (device model, OS version, and crash logs).",
    sectionPermissions: "Our applications request only runtime system permissions that are strictly necessary for specific user-initiated features: Camera (for barcode/QR scanning), Storage/Files (for sales reports & backups), Network (for cloud synchronization), and Notifications (for transaction confirmations).",
    sectionThirdParty: "We may integrate verified third-party developer services such as Google Play Services, Google Play In-App Billing, and Google Firebase (Crashlytics, Firestore) to facilitate core infrastructure and stability monitoring.",
    sectionDataDeletion: "You have full rights to request complete deletion of your account and all associated operational records anytime by contacting us at me@vinsensiusarka.id. We process and confirm all deletion requests within 7-14 business days.",
    sectionContact: "For any privacy-related inquiries, data access requests, or security concerns regarding any of our applications or website, please reach out to developer Vinsensius Arka via email at me@vinsensiusarka.id or visit our website at https://vinsensiusarka.id."
  },

  init() {
    this.setupForm();
    this.setupTodayButton();
  },

  setupTodayButton() {
    const todayBtn = document.getElementById('set-privacy-today-btn');
    if (todayBtn) {
      todayBtn.addEventListener('click', () => {
        this.setTodayDate();
      });
    }
  },

  setTodayDate() {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const now = new Date();
    const formatted = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    const dateInput = document.getElementById('privacy-last-updated');
    if (dateInput) {
      dateInput.value = formatted;
      AdminMain.showToast(`Date updated to: ${formatted}`, 'info');
    }
  },

  setupForm() {
    const form = document.getElementById('privacy-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.savePrivacyPolicy();
      });
    }

    const resetBtn = document.getElementById('reset-privacy-defaults-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (!confirm('Are you sure you want to reset all form fields to default policy text? (Changes will not be saved until you click Save)')) return;
        this.populateForm(this.defaultData);
        AdminMain.showToast('Reset form fields to default values', 'info');
      });
    }
  },

  populateForm(data) {
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val !== undefined && val !== null ? val : '';
    };

    setVal('privacy-title', data.title || this.defaultData.title);
    setVal('privacy-subtitle', data.subtitle || this.defaultData.subtitle);
    setVal('privacy-last-updated', data.lastUpdated || this.defaultData.lastUpdated);
    setVal('privacy-developer-name', data.developerName || this.defaultData.developerName);
    setVal('privacy-contact-email', data.contactEmail || this.defaultData.contactEmail);
    setVal('privacy-contact-website', data.contactWebsite || this.defaultData.contactWebsite);
    setVal('privacy-compliance-badge', data.complianceBadge || this.defaultData.complianceBadge);

    // 3 Highlights
    setVal('privacy-highlight-1-title', data.highlight1Title || this.defaultData.highlight1Title);
    setVal('privacy-highlight-1-desc', data.highlight1Desc || this.defaultData.highlight1Desc);
    setVal('privacy-highlight-2-title', data.highlight2Title || this.defaultData.highlight2Title);
    setVal('privacy-highlight-2-desc', data.highlight2Desc || this.defaultData.highlight2Desc);
    setVal('privacy-highlight-3-title', data.highlight3Title || this.defaultData.highlight3Title);
    setVal('privacy-highlight-3-desc', data.highlight3Desc || this.defaultData.highlight3Desc);

    // Policy Sections
    setVal('privacy-section-scope', data.sectionScope || this.defaultData.sectionScope);
    setVal('privacy-section-collection', data.sectionDataCollection || this.defaultData.sectionDataCollection);
    setVal('privacy-section-permissions', data.sectionPermissions || this.defaultData.sectionPermissions);
    setVal('privacy-section-third-party', data.sectionThirdParty || this.defaultData.sectionThirdParty);
    setVal('privacy-section-deletion', data.sectionDataDeletion || this.defaultData.sectionDataDeletion);
    setVal('privacy-section-contact', data.sectionContact || this.defaultData.sectionContact);
  },

  async loadPrivacyPolicy() {
    if (!db) return;

    try {
      const doc = await db.collection('settings').doc('privacy_policy').get();
      if (doc.exists) {
        this.populateForm(doc.data());
      } else {
        // First time initialization: populate defaults
        this.populateForm(this.defaultData);
      }
    } catch (err) {
      console.error('Error loading privacy policy:', err);
      // Fallback to defaults
      this.populateForm(this.defaultData);
    }
  },

  async savePrivacyPolicy() {
    const getVal = (id) => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : '';
    };

    const updateData = {
      title: getVal('privacy-title') || this.defaultData.title,
      subtitle: getVal('privacy-subtitle') || this.defaultData.subtitle,
      lastUpdated: getVal('privacy-last-updated') || this.defaultData.lastUpdated,
      developerName: getVal('privacy-developer-name') || this.defaultData.developerName,
      contactEmail: getVal('privacy-contact-email') || this.defaultData.contactEmail,
      contactWebsite: getVal('privacy-contact-website') || this.defaultData.contactWebsite,
      complianceBadge: getVal('privacy-compliance-badge') || this.defaultData.complianceBadge,

      highlight1Title: getVal('privacy-highlight-1-title') || this.defaultData.highlight1Title,
      highlight1Desc: getVal('privacy-highlight-1-desc') || this.defaultData.highlight1Desc,
      highlight2Title: getVal('privacy-highlight-2-title') || this.defaultData.highlight2Title,
      highlight2Desc: getVal('privacy-highlight-2-desc') || this.defaultData.highlight2Desc,
      highlight3Title: getVal('privacy-highlight-3-title') || this.defaultData.highlight3Title,
      highlight3Desc: getVal('privacy-highlight-3-desc') || this.defaultData.highlight3Desc,

      sectionScope: getVal('privacy-section-scope') || this.defaultData.sectionScope,
      sectionDataCollection: getVal('privacy-section-collection') || this.defaultData.sectionDataCollection,
      sectionPermissions: getVal('privacy-section-permissions') || this.defaultData.sectionPermissions,
      sectionThirdParty: getVal('privacy-section-third-party') || this.defaultData.sectionThirdParty,
      sectionDataDeletion: getVal('privacy-section-deletion') || this.defaultData.sectionDataDeletion,
      sectionContact: getVal('privacy-section-contact') || this.defaultData.sectionContact,

      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    const saveBtn = document.getElementById('save-privacy-btn');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving Policy...';
    }

    try {
      await db.collection('settings').doc('privacy_policy').set(updateData, { merge: true });
      AdminMain.showToast('Privacy Policy updated and synced live!', 'success');
    } catch (err) {
      console.error('Error saving privacy policy:', err);
      AdminMain.showToast('Failed to save privacy policy: ' + err.message, 'error');
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fa-solid fa-shield-halved"></i> Save Privacy Policy Settings';
      }
    }
  }
};

window.AdminPrivacy = AdminPrivacy;
