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
      githubUrl: "https://github.com/vinsensiusarko/Chatting-App",
      demoUrl: "",
      demoLabel: "Live Demo",
      isComingSoon: true,
      order: 1,
      image: "assets/images/portfolio-1.png"
    },
    {
      title: "Kanisius High School",
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
      title: "Kanisius Middle School",
      description: "Official school portal providing academic announcements, school profile, and student news.",
      category: "Web Portal",
      techStack: ["WordPress", "PHP", "MySQL"],
      githubUrl: "",
      demoUrl: "https://smpkanisiuspati.sch.id",
      demoLabel: "Live Demo",
      isComingSoon: true,
      order: 3,
      image: "assets/images/portfolio-3.png"
    },
    {
      title: "SPMB UNS Solo",
      description: "Portal and landing interface for student admission registration at Universitas Sebelas Maret.",
      category: "Web Portal",
      techStack: ["Laravel", "PHP", "MySQL", "Bootstrap"],
      githubUrl: "",
      demoUrl: "https://spmb.uns.ac.id",
      demoLabel: "Live Demo",
      isComingSoon: true,
      order: 4,
      image: "assets/images/portfolio-4.png"
    },
    {
      title: "Arkommerce — Admin FE",
      description: "Modern responsive administration dashboard for shoes e-commerce with order and inventory management.",
      category: "Web Application",
      techStack: ["React", "JavaScript", "CSS3", "Firebase"],
      githubUrl: "https://github.com/vinsensiusarko/admin-ecommerce-shoes-fe",
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
      githubUrl: "https://github.com/vinsensiusarko/admin-ecommerce-shoes-be",
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
    expYears: "3+ years",
    expSub: "Web & Mobile Development",
    eduDegree: "Bachelors Degree",
    eduMajor: "Computer Science",
    cvUrl: "assets/docs/cv-vinsensiusarka.pdf"
  },

  initialContacts: {
    email: "me@vinsensiusarka.id",
    whatsapp: "6285179793167",
    linkedin: "https://www.linkedin.com/in/vinsensius-arka-a2185a229/",
    github: "https://github.com/vinsensiusarko",
    instagram: "https://www.instagram.com/vinsensiusarka/",
    facebook: "https://www.facebook.com/vinsensiusarka/",
    twitter: "https://x.com/vinsensiusarka"
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
  }
};

window.AdminSeeder = AdminSeeder;
