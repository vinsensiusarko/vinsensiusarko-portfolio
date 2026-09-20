/**
 * Database Seeder Utility for vinsensiusarko
 * Migrates existing 9 projects, 11 skills, and settings into Firestore with 1 click
 */

'use strict';

const AdminSeeder = {
  initialProjects: [
    {
      title: "Chatting App",
      description: "Java-based multi-client chatting application with real-time socket communication.",
      category: "Desktop Application",
      techStack: ["Java", "Socket", "Swing"],
      githubUrl: "https://github.com/vinsensiusarko/MyChat",
      demoUrl: "",
      demoLabel: "Live Demo",
      isComingSoon: true,
      order: 1,
      image: "assets/images/portfolio-1.png"
    },
    {
      title: "SMPK Santa Maria 2 Malang Yearbook",
      description: "Interactive digital yearbook website with graduate profiles, memories, and photo galleries.",
      category: "Web Application",
      techStack: ["HTML5", "CSS3", "JavaScript", "PHP"],
      githubUrl: "https://github.com/vinsensiusarko/Yearbook-Website",
      demoUrl: "https://kanisiushs.sch.id",
      demoLabel: "Live Demo",
      isComingSoon: false,
      order: 2,
      image: "assets/images/portfolio-2.png"
    },
    {
      title: "SMP Kanisius Pati",
      description: "Official school portal providing academic announcements, school profile, and student news.",
      category: "Web Portal",
      techStack: ["WordPress", "PHP", "MySQL"],
      githubUrl: "",
      demoUrl: "https://smpkanisiuspati.sch.id",
      demoLabel: "Live Demo",
      isComingSoon: false,
      order: 3,
      image: "assets/images/portfolio-3.png"
    },
    {
      title: "SPMB UNS Solo",
      description: "Portal and landing interface for student admission registration at Universitas Sebelas Maret.",
      category: "Web Portal",
      techStack: ["Laravel", "PHP", "MySQL", "Bootstrap"],
      githubUrl: "",
      demoUrl: "https://spmb-uns-solo.web.app/",
      demoLabel: "Live Demo",
      isComingSoon: false,
      order: 4,
      image: "assets/images/portfolio-4.png"
    },
    {
      title: "Arkommerce — Admin FE",
      description: "Modern responsive administration dashboard for shoes e-commerce with order and inventory management.",
      category: "Web Application",
      techStack: ["React", "JavaScript", "CSS3", "Firebase"],
      githubUrl: "https://github.com/vinsensiusarko/arkommerce",
      demoUrl: "https://arkommerce-admin.web.app",
      demoLabel: "Live Demo",
      isComingSoon: false,
      order: 5,
      image: "assets/images/portfolio-5.png"
    },
    {
      title: "Arkommerce — Admin BE",
      description: "RESTful API backend service powering products, authentication, transactions, and admin operations.",
      category: "Backend API",
      techStack: ["Node JS", "Express", "RESTful API", "MySQL"],
      githubUrl: "https://github.com/vinsensiusarko/arkommerce",
      demoUrl: "https://arkommerce-be-production.up.railway.app",
      demoLabel: "Live Demo",
      isComingSoon: false,
      order: 6,
      image: "assets/images/portfolio-6.png"
    },
    {
      title: "PMI Malang",
      description: "Extension application connected with PMI Malang database to generate and automate reports.",
      category: "Extension App",
      techStack: ["Java", "MySQL", "Database"],
      githubUrl: "https://github.com/vinsensiusarko/PMI-Malang",
      demoUrl: "",
      demoLabel: "Live Demo",
      isComingSoon: true,
      order: 7,
      image: "assets/images/portfolio-7.png"
    },
    {
      title: "Mozaic POS App",
      description: "Commercial Point of Sale mobile application released on Google Play Store for retail & transactions.",
      category: "Mobile Application",
      techStack: ["Flutter", "Dart", "Firebase", "SQLite"],
      githubUrl: "",
      demoUrl: "https://play.google.com/store/apps/details?id=com.ciptasolutindo.mozaic_app_new",
      demoLabel: "Play Store",
      isComingSoon: false,
      order: 8,
      image: "assets/images/portfolio-8.png"
    },
    {
      title: "SMArT",
      description: "Sistem Manajemen Administrasi Terpadu — integrated administrative and institutional management system.",
      category: "Enterprise System",
      techStack: ["Laravel", "PHP", "MySQL"],
      githubUrl: "",
      demoUrl: "",
      demoLabel: "Live Demo",
      isComingSoon: true,
      order: 9,
      image: "assets/images/portfolio-9.png"
    }
  ],

  initialSkills: [
    // Languages
    { name: "HTML5", category: "language", level: "Experienced", iconType: "fontawesome", iconClass: "fa-brands fa-html5", order: 1 },
    { name: "CSS3", category: "language", level: "Experienced", iconType: "fontawesome", iconClass: "fa-brands fa-css3-alt", order: 2 },
    { name: "JavaScript", category: "language", level: "Experienced", iconType: "fontawesome", iconClass: "fa-brands fa-js", order: 3 },
    { name: "Java", category: "language", level: "Experienced", iconType: "fontawesome", iconClass: "fa-brands fa-java", order: 4 },
    { name: "Flutter", category: "language", level: "Experienced", iconType: "svg", iconClass: "", order: 5 },
    { name: "PHP", category: "language", level: "Experienced", iconType: "fontawesome", iconClass: "fa-brands fa-php", order: 6 },
    // Tools
    { name: "Laravel", category: "framework_tool", level: "Experienced", iconType: "fontawesome", iconClass: "fa-brands fa-laravel", order: 7 },
    { name: "Node JS", category: "framework_tool", level: "Intermediate", iconType: "fontawesome", iconClass: "fa-brands fa-node-js", order: 8 },
    { name: "MySQL", category: "framework_tool", level: "Experienced", iconType: "fontawesome", iconClass: "fa-solid fa-database", order: 9 },
    { name: "Git", category: "framework_tool", level: "Experienced", iconType: "fontawesome", iconClass: "fa-brands fa-git-alt", order: 10 },
    { name: "WordPress", category: "framework_tool", level: "Intermediate", iconType: "fontawesome", iconClass: "fa-brands fa-wordpress", order: 11 }
  ],

  initialProfile: {
    name: "Vinsensius Arka",
    heroGreeting: "Hello, I'm",
    typewriterRoles: ["Web Developer", "Mobile Developer"],
    bioText: "I am a passionate software developer with experience in building responsive web applications and cross-platform mobile solutions. I specialize in turning complex problems into clean, intuitive, and performant digital experiences using modern frameworks like Flutter, Laravel, and native Java. Always excited to learn, collaborate, and build impactful software.",
    expYears: "5+ years",
    expSub: "Web & Mobile Development",
    eduDegree: "Bachelors Degree",
    eduMajor: "Computer Science",
    cvUrl: "assets/docs/cv-vinsensiusarka.pdf"
  },

  initialContacts: {
    email: "me@vinsensiusarka.id",
    whatsapp: "6285179793167",
    linkedin: "https://www.linkedin.com/in/vinsensiusarka/",
    github: "https://github.com/vinsensiusarko/",
    instagram: "https://www.instagram.com/vinsensiusarko/",
    facebook: "https://www.facebook.com/vinsensiusarko/",
    twitter: "https://x.com/vinsensiusarko/"
  },

  async seedAll() {
    if (!confirm('This will seed the initial 9 projects, 11 skills, and profile settings into your Firestore database. Proceed?')) {
      return;
    }

    if (!db) {
      AdminMain.showToast('Firestore database not connected!', 'error');
      return;
    }

    const btn = document.getElementById('seed-btn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Seeding database...';
    }

    try {
      AdminMain.showToast('Starting database seeding...', 'info');

      // 1. Seed Projects
      const projectsColl = db.collection('projects');
      for (const p of this.initialProjects) {
        await projectsColl.add({
          ...p,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }

      // 2. Seed Skills
      const skillsColl = db.collection('skills');
      for (const s of this.initialSkills) {
        await skillsColl.add({
          ...s,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }

      // 3. Seed Settings
      await db.collection('settings').doc('site_settings').set({
        ...this.initialProfile,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      await db.collection('settings').doc('contact_settings').set({
        ...this.initialContacts,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      AdminMain.showToast('Database successfully seeded with all initial data!', 'success');
      
      // Reload dashboard views
      AdminProjects.loadProjects();
      AdminSkills.loadSkills();
      AdminProfile.loadProfile();
    } catch (err) {
      console.error('Seeding failed:', err);
      AdminMain.showToast('Seeding error: ' + err.message, 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-database"></i> Seed Initial Database';
      }
    }
  },

  /**
   * Export all Firestore collections to JSON file
   */
  async exportBackup() {
    if (!db) {
      AdminMain.showToast('Firestore database not connected!', 'error');
      return;
    }

    const btn = document.getElementById('export-backup-btn');
    const originalText = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Exporting...';
    }

    try {
      AdminMain.showToast('Generating database backup...', 'info');

      // Fetch Projects
      const projectsSnap = await db.collection('projects').get();
      const projects = projectsSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Convert Firestore timestamps if present
          createdAt: data.createdAt && data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
          updatedAt: data.updatedAt && data.updatedAt.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt
        };
      });

      // Fetch Skills
      const skillsSnap = await db.collection('skills').get();
      const skills = skillsSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt && data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
          updatedAt: data.updatedAt && data.updatedAt.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt
        };
      });

      // Fetch Settings
      const siteDoc = await db.collection('settings').doc('site_settings').get();
      const contactDoc = await db.collection('settings').doc('contact_settings').get();

      const siteData = siteDoc.exists ? siteDoc.data() : null;
      if (siteData && siteData.updatedAt && siteData.updatedAt.toDate) {
        siteData.updatedAt = siteData.updatedAt.toDate().toISOString();
      }

      const contactData = contactDoc.exists ? contactDoc.data() : null;
      if (contactData && contactData.updatedAt && contactData.updatedAt.toDate) {
        contactData.updatedAt = contactData.updatedAt.toDate().toISOString();
      }

      const backupData = {
        appName: "Vinsensius Arka Portfolio",
        version: "1.0",
        exportedAt: new Date().toISOString(),
        collections: {
          projects,
          skills,
          settings: {
            site_settings: siteData,
            contact_settings: contactData
          }
        }
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `arka-portfolio-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      AdminMain.showToast(`Backup exported successfully! (${projects.length} projects, ${skills.length} skills)`, 'success');
    } catch (err) {
      console.error('Export backup failed:', err);
      AdminMain.showToast('Export failed: ' + err.message, 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    }
  },

  /**
   * Import / Restore Firestore data from JSON file
   */
  async importBackup(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!db) {
      AdminMain.showToast('Firestore database not connected!', 'error');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data || (!data.collections && !data.projects)) {
          throw new Error('Invalid JSON structure: missing collections or projects.');
        }

        const projects = (data.collections && data.collections.projects) || data.projects || [];
        const skills = (data.collections && data.collections.skills) || data.skills || [];
        const settings = (data.collections && data.collections.settings) || data.settings || {};

        const confirmMsg = `Restore database from backup?\n• ${projects.length} projects\n• ${skills.length} skills\n• Profile & Contacts settings\n\nExisting documents with matching IDs will be updated.`;
        if (!confirm(confirmMsg)) {
          event.target.value = '';
          return;
        }

        AdminMain.showToast('Restoring database from backup...', 'info');

        // 1. Restore projects
        const projectsColl = db.collection('projects');
        for (const p of projects) {
          const { id, ...projectData } = p;
          if (id) {
            await projectsColl.doc(id).set({
              ...projectData,
              updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
          } else {
            await projectsColl.add({
              ...projectData,
              createdAt: firebase.firestore.FieldValue.serverTimestamp(),
              updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
          }
        }

        // 2. Restore skills
        const skillsColl = db.collection('skills');
        for (const s of skills) {
          const { id, ...skillData } = s;
          if (id) {
            await skillsColl.doc(id).set({
              ...skillData,
              updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
          } else {
            await skillsColl.add({
              ...skillData,
              createdAt: firebase.firestore.FieldValue.serverTimestamp(),
              updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
          }
        }

        // 3. Restore settings
        if (settings.site_settings) {
          await db.collection('settings').doc('site_settings').set({
            ...settings.site_settings,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
        }

        if (settings.contact_settings) {
          await db.collection('settings').doc('contact_settings').set({
            ...settings.contact_settings,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
        }

        AdminMain.showToast(`Backup restored successfully! (${projects.length} projects, ${skills.length} skills)`, 'success');

        // Reload views
        if (window.AdminProjects) AdminProjects.loadProjects();
        if (window.AdminSkills) AdminSkills.loadSkills();
        if (window.AdminProfile) AdminProfile.loadProfile();
      } catch (err) {
        console.error('Import backup failed:', err);
        AdminMain.showToast('Failed to import backup: ' + err.message, 'error');
      } finally {
        event.target.value = '';
      }
    };

    reader.onerror = () => {
      AdminMain.showToast('Failed to read file.', 'error');
      event.target.value = '';
    };

    reader.readAsText(file);
  }
};

window.AdminSeeder = AdminSeeder;
