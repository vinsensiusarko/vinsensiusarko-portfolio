export const FALLBACK_PROJECTS = [
  {
    id: 'chatting-app',
    order: 1,
    title: 'Chatting App',
    description:
      'Java-based multi-client chatting application with real-time socket communication.',
    category: 'Desktop Application',
    image: '/assets/images/portfolio-1.png',
    techStack: ['Java', 'Socket', 'Swing', 'Networking'],
    githubUrl: 'https://github.com/vinsensiusarko/Chatting-App',
    demoUrl: '',
    demoLabel: 'Live Demo',
    isComingSoon: true
  },
  {
    id: 'kanisius-high-school',
    order: 2,
    title: 'Kanisius High School',
    description:
      'Interactive digital yearbook website with graduate profiles, memories, and photo galleries.',
    category: 'Web Application',
    image: '/assets/images/portfolio-2.png',
    techStack: ['PHP', 'MySQL', 'HTML5', 'CSS3', 'JavaScript'],
    githubUrl: 'https://github.com/vinsensiusarko/Yearbook-Website',
    demoUrl: 'https://kanisiushs.sch.id',
    demoLabel: 'Live Demo',
    isComingSoon: false
  },
  {
    id: 'kanisius-middle-school',
    order: 3,
    title: 'Kanisius Middle School',
    description:
      'Official school portal providing academic announcements, school profile, and student news.',
    category: 'Web Portal',
    image: '/assets/images/portfolio-3.png',
    techStack: ['WordPress', 'PHP', 'MySQL', 'CMS'],
    githubUrl: '',
    demoUrl: 'https://smpkanisiuspati.sch.id',
    demoLabel: 'Live Demo',
    isComingSoon: false
  },
  {
    id: 'spmb-uns-solo',
    order: 4,
    title: 'SPMB UNS Solo',
    description:
      'Portal and landing interface for student admission registration at Universitas Sebelas Maret.',
    category: 'Web Portal',
    image: '/assets/images/portfolio-4.png',
    techStack: ['Laravel', 'PHP', 'MySQL', 'Bootstrap'],
    githubUrl: '',
    demoUrl: 'https://spmb.uns.ac.id',
    demoLabel: 'Live Demo',
    isComingSoon: false
  },
  {
    id: 'arkommerce-admin-fe',
    order: 5,
    title: 'Arkommerce: Admin FE',
    description:
      'Modern responsive administration dashboard for shoes e-commerce with order and inventory management.',
    category: 'Web Application',
    image: '/assets/images/portfolio-5.png',
    techStack: ['React', 'JavaScript', 'CSS3', 'Firebase'],
    githubUrl: 'https://github.com/vinsensiusarko/admin-ecommerce-shoes-fe',
    demoUrl: 'https://arkommerce-admin.web.app',
    demoLabel: 'Live Demo',
    isComingSoon: false,
    role: 'Frontend Developer',
    period: '',
    highlights: [
      'Built responsive admin workflows for catalog, order tracking, and inventory updates.',
      'Integrated Firebase hosting and real-time REST API consumption with React.'
    ]
  },
  {
    id: 'arkommerce-admin-be',
    order: 6,
    title: 'Arkommerce: Admin BE',
    description:
      'RESTful API backend service powering products, authentication, transactions, and admin operations.',
    category: 'Backend API',
    image: '/assets/images/portfolio-6.png',
    techStack: ['Node JS', 'Express', 'RESTful API', 'MySQL'],
    githubUrl: 'https://github.com/vinsensiusarko/admin-ecommerce-shoes-be',
    demoUrl: 'https://arkommerce-be-production.up.railway.app',
    demoLabel: 'Live Demo',
    isComingSoon: false,
    role: 'Backend Developer',
    period: '',
    highlights: [
      'Designed RESTful endpoints for product management, authentication, and order transactions.',
      'Structured relational MySQL persistence and production API deployment.'
    ]
  },
  {
    id: 'pmi-malang',
    order: 7,
    title: 'PMI Malang',
    description:
      'Extension application connected with PMI Malang database to generate and automate reports.',
    category: 'Desktop Application',
    image: '/assets/images/portfolio-7.png',
    techStack: ['Java', 'MySQL', 'Database', 'Reporting'],
    githubUrl: 'https://github.com/vinsensiusarko/PMI-Malang',
    demoUrl: '',
    demoLabel: 'Live Demo',
    isComingSoon: true
  },
  {
    id: 'mozaic-pos-app',
    order: 8,
    title: 'Mozaic POS App',
    description:
      'Commercial Point of Sale mobile application released on Google Play Store for retail & transactions.',
    category: 'Mobile Application',
    image: '/assets/images/portfolio-8.png',
    techStack: ['Flutter', 'Dart', 'Firebase', 'SQLite'],
    githubUrl: '',
    demoUrl:
      'https://play.google.com/store/apps/details?id=com.ciptasolutindo.mozaic_app_new',
    demoLabel: 'Play Store',
    isComingSoon: false,
    role: 'Mobile Developer',
    period: '',
    highlights: [
      'Shipped commercial Point of Sale experience to Google Play Store using Flutter & Dart.',
      'Combined local SQLite transaction storage with Firebase cloud services.'
    ]
  },
  {
    id: 'smart-system',
    order: 9,
    title: 'SMArT',
    description:
      'Sistem Manajemen Administrasi Terpadu, integrated administrative and institutional management system.',
    category: 'Web Application',
    image: '/assets/images/portfolio-9.png',
    techStack: ['PHP', 'MySQL', 'Bootstrap', 'Management'],
    githubUrl: '',
    demoUrl: '',
    demoLabel: 'Live Demo',
    isComingSoon: true
  }
];

export const FALLBACK_SKILLS = [
  { id: 'html5', order: 1, name: 'HTML5', level: 'Experienced', category: 'language', iconClass: 'fa-brands fa-html5' },
  { id: 'css3', order: 2, name: 'CSS3', level: 'Experienced', category: 'language', iconClass: 'fa-brands fa-css3-alt' },
  { id: 'javascript', order: 3, name: 'JavaScript', level: 'Experienced', category: 'language', iconClass: 'fa-brands fa-js' },
  { id: 'java', order: 4, name: 'Java', level: 'Experienced', category: 'language', iconClass: 'fa-brands fa-java' },
  { id: 'flutter', order: 5, name: 'Flutter', level: 'Experienced', category: 'language', iconClass: 'fa-brands fa-flutter', iconType: 'svg' },
  { id: 'php', order: 6, name: 'PHP', level: 'Experienced', category: 'language', iconClass: 'fa-brands fa-php' },
  { id: 'laravel', order: 7, name: 'Laravel', level: 'Experienced', category: 'framework_tool', iconClass: 'fa-brands fa-laravel' },
  { id: 'nodejs', order: 8, name: 'Node JS', level: 'Experienced', category: 'framework_tool', iconClass: 'fa-brands fa-node-js' },
  { id: 'mysql', order: 9, name: 'MySQL', level: 'Experienced', category: 'framework_tool', iconClass: 'fa-solid fa-database' },
  { id: 'git', order: 10, name: 'Git', level: 'Experienced', category: 'framework_tool', iconClass: 'fa-brands fa-git-alt' },
  { id: 'wordpress', order: 11, name: 'WordPress', level: 'Experienced', category: 'framework_tool', iconClass: 'fa-brands fa-wordpress' }
];

export const FALLBACK_SITE_SETTINGS = {
  name: 'Vinsensius Arka',
  heroGreeting: "Hello, I'm",
  typewriterRoles: ['Web Developer', 'Mobile Developer'],
  bioText:
    'I am a passionate software developer with experience in building responsive web applications and cross-platform mobile solutions. I specialize in turning complex problems into clean, intuitive, and performant digital experiences using modern frameworks like Flutter, Laravel, and native Java. Always excited to learn, collaborate, and build impactful software.',
  expYears: '3+ years',
  expSub: 'Web & Mobile Development',
  eduDegree: 'Bachelors Degree',
  eduMajor: 'Computer Science',
  cvUrl: '/assets/docs/cv-vinsensiusarka.pdf',
  cvBase64: '',
  cvFileName: 'CV-VinsensiusArka.pdf',
  heroImage: '/assets/images/arko-pic.jpg',
  aboutImage: '/assets/images/arko-about.jpg',
  availabilityStatus: 'hidden',
  availabilityText: '',
  timeline: [
    {
      id: 'work-web-mobile',
      type: 'work',
      title: 'Web & Mobile Developer',
      organization: 'Independent & Client Projects',
      period: 'Present',
      summary:
        'Building responsive web applications, institutional portals, REST APIs, and cross-platform Flutter mobile apps.',
      tags: ['Flutter', 'React', 'Laravel', 'Node.js'],
      current: true
    },
    {
      id: 'edu-cs',
      type: 'education',
      title: 'Bachelors Degree in Computer Science',
      organization: 'Undergraduate Studies',
      period: 'Completed',
      summary:
        'Focused on software engineering, database systems, networking, and web & mobile application development.',
      tags: ['Software Engineering', 'Databases', 'Networking'],
      current: false
    }
  ]
};

export const FALLBACK_CONTACT_SETTINGS = {
  email: 'me@vinsensiusarka.id',
  whatsapp: '6285179793167',
  linkedin: 'https://www.linkedin.com/in/vinsensiusarka/',
  github: 'https://github.com/vinsensiusarko',
  instagram: 'https://www.instagram.com/vinsensiusarko/',
  facebook: 'https://www.facebook.com/vinsensiusarko/',
  twitter: 'https://x.com/vinsensiusarko'
};

export const FALLBACK_PRIVACY_POLICY = {
  title: 'Privacy Policy',
  subtitle: 'Developer Policies & User Data',
  lastUpdated: 'September 28, 2026',
  developerName: 'Vinsensius Arka',
  contactEmail: 'me@vinsensiusarka.id',
  contactWebsite: 'https://vinsensiusarka.id',
  complianceBadge: 'Google Play Store Compliant',
  highlight1Title: 'Privacy First',
  highlight1Desc:
    'We do not sell, rent, or trade your personal information to any third parties.',
  highlight2Title: 'Secure & Encrypted',
  highlight2Desc:
    'HTTPS encryption and standard security protections across all app features.',
  highlight3Title: 'Data Deletion',
  highlight3Desc:
    'Full rights to request complete deletion of your account and records anytime.',
  sectionScope:
    'Welcome to the Privacy Policy of Vinsensius Arka ("Developer", "we", "us", or "our"). This Privacy Policy applies to all mobile applications, software, tools, and digital services published and maintained under our developer account on the Google Play Store (including Mozaic POS App, Satus Mobile, and subsequent releases), as well as our official developer portfolio website.',
  sectionDataCollection:
    'We collect only the minimum necessary information required to operate, maintain, and provide the services you request. This includes account credentials, business transaction logs entered by you, and automated diagnostic device telemetry (device model, OS version, and crash logs).',
  sectionPermissions:
    'Our applications request only runtime system permissions that are strictly necessary for specific user-initiated features: Camera (for barcode/QR scanning), Storage/Files (for sales reports & backups), Network (for cloud synchronization), and Notifications (for transaction confirmations).',
  sectionThirdParty:
    'We may integrate verified third-party developer services such as Google Play Services, Google Play In-App Billing, and Google Firebase (Crashlytics, Firestore) to facilitate core infrastructure and stability monitoring.',
  sectionDataDeletion:
    'In accordance with Google Play\'s User Data & Account Deletion policies, and global privacy frameworks (such as GDPR and CCPA), you have full control over your personal data:',
  sectionContact:
    'If you have questions, comments, or concerns regarding this Privacy Policy, our data practices, or our mobile applications, please contact us:'
};
