import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Skill } from '../models/Skill.js';
import { UserSkill } from '../models/UserSkill.js';
import { SkillExchangeRequest } from '../models/SkillExchangeRequest.js';
import { SkillSession } from '../models/SkillSession.js';
import { Project } from '../models/Project.js';
import { ProjectTask } from '../models/ProjectTask.js';
import { ProjectMilestone } from '../models/ProjectMilestone.js';
import { ProjectDiscussion } from '../models/ProjectDiscussion.js';
import { ProjectResource } from '../models/ProjectResource.js';
import {
  ROLES,
  SKILL_LEVELS,
  SKILL_INTENTS,
  PROJECT_CATEGORIES,
  PROJECT_DIFFICULTIES,
  PROJECT_STATUSES,
  TASK_STATUSES,
  TASK_PRIORITIES,
  MILESTONE_STATUSES,
  DISCUSSION_CATEGORIES,
  RESOURCE_TYPES,
} from '../config/constants.js';

const canonicalSkills = [
  // Frontend
  { name: 'React', category: 'Frontend', description: 'Component-based library for building interactive user interfaces.' },
  { name: 'TypeScript', category: 'Frontend', description: 'Strongly typed programming language that builds on JavaScript.' },
  { name: 'Next.js', category: 'Frontend', description: 'React framework for full-stack web applications and SSR.' },
  { name: 'Tailwind CSS', category: 'Frontend', description: 'Utility-first CSS framework for rapid UI development.' },
  { name: 'Vue.js', category: 'Frontend', description: 'Progressive JavaScript framework for building modern web UIs.' },
  { name: 'Redux Toolkit', category: 'Frontend', description: 'Predictable state container for modern JavaScript apps.' },

  // Backend
  { name: 'Node.js', category: 'Backend', description: 'JavaScript runtime built on Chrome V8 engine.' },
  { name: 'Express.js', category: 'Backend', description: 'Fast, unopinionated, minimalist web framework for Node.js.' },
  { name: 'Python', category: 'Backend', description: 'High-level programming language for web, scripting, and data science.' },
  { name: 'FastAPI', category: 'Backend', description: 'Modern, fast web framework for building APIs with Python 3.8+.' },
  { name: 'Django', category: 'Backend', description: 'High-level Python web framework encouraging clean, pragmatic design.' },
  { name: 'Go', category: 'Backend', description: 'Open-source programming language for simple, fast, reliable software.' },
  { name: 'Java Spring Boot', category: 'Backend', description: 'Enterprise-grade framework for microservices and backend systems.' },

  // Database
  { name: 'MongoDB', category: 'Database', description: 'Document-oriented NoSQL database for modern apps.' },
  { name: 'PostgreSQL', category: 'Database', description: 'Powerful, open-source object-relational database system.' },
  { name: 'Redis', category: 'Database', description: 'In-memory data structure store used as database, cache, and message broker.' },
  { name: 'MySQL', category: 'Database', description: 'Popular open-source relational database management system.' },

  // AI / ML
  { name: 'PyTorch', category: 'AI/ML', description: 'Deep learning framework that accelerates research to production.' },
  { name: 'TensorFlow', category: 'AI/ML', description: 'End-to-end open source platform for machine learning.' },
  { name: 'Scikit-Learn', category: 'AI/ML', description: 'Machine learning library in Python with simple and efficient tools.' },
  { name: 'LangChain', category: 'AI/ML', description: 'Framework for developing applications powered by large language models.' },

  // DevOps & Cloud
  { name: 'Docker', category: 'DevOps/Cloud', description: 'Containerization platform to package apps and dependencies.' },
  { name: 'Kubernetes', category: 'DevOps/Cloud', description: 'Automated container orchestration, scaling, and management.' },
  { name: 'AWS', category: 'DevOps/Cloud', description: 'Comprehensive on-demand cloud computing platform.' },
  { name: 'Linux', category: 'DevOps/Cloud', description: 'Operating system kernel widely used in servers and production systems.' },
  { name: 'CI/CD Pipelines', category: 'DevOps/Cloud', description: 'Continuous integration and deployment automation workflows.' },

  // UI/UX & Mobile
  { name: 'Figma', category: 'UI/UX', description: 'Collaborative interface design and prototyping tool.' },
  { name: 'React Native', category: 'Mobile', description: 'Framework for building native mobile apps using React.' },
  { name: 'Flutter', category: 'Mobile', description: 'Google UI toolkit for building multi-platform compiled apps.' },
  { name: 'WebSockets', category: 'Backend', description: 'Full-duplex bidirectional communication protocol for realtime apps.' },
  // Data Science & Analytics
  { name: 'Pandas', category: 'AI/ML', description: 'Fast, powerful, and flexible open source data analysis and manipulation tool.' },
  { name: 'NumPy', category: 'AI/ML', description: 'Fundamental package for scientific computing with Python.' },

  // Cloud & IaC
  { name: 'Terraform', category: 'DevOps/Cloud', description: 'Infrastructure as code tool for provisioning cloud architecture.' },

  // Cybersecurity
  { name: 'Network Security', category: 'Cybersecurity', description: 'Protocols, firewalls, and practices to prevent unauthorized network intrusion.' },
  { name: 'Cryptography', category: 'Cybersecurity', description: 'Mathematical encryption algorithms, PKI, and secure hash standards.' },
  { name: 'Penetration Testing', category: 'Cybersecurity', description: 'Simulated cyberattack testing to identify exploitable vulnerabilities.' },
  { name: 'OWASP Security', category: 'Cybersecurity', description: 'Application security best practices to prevent top OWASP web vulnerabilities.' },
];

const seedUsers = [
  {
    name: 'Admin Moderator',
    email: 'admin@skillforge.dev',
    passwordHash: 'Admin@123456',
    role: ROLES.ADMIN,
    college: 'SkillForge Institute of Tech',
    branch: 'Computer Science & Engineering',
    graduationYear: 2024,
    profileImage: 'https://api.dicebear.com/7.x/bottts/svg?seed=AdminModerator',
    bio: 'Platform Administrator and System Architect at SkillForge.',
    targetRole: 'System Administrator',
    interests: ['System Architecture', 'Cloud Infrastructure', 'Mentorship'],
    socialLinks: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      portfolio: 'https://skillforge.dev',
    },
    isVerified: true,
  },
  {
    name: 'Alex Rivera',
    email: 'alex.rivera@mit.edu',
    passwordHash: 'Alex@123456',
    role: ROLES.STUDENT,
    college: 'Massachusetts Institute of Technology',
    branch: 'Computer Science',
    graduationYear: 2025,
    profileImage: 'https://api.dicebear.com/7.x/bottts/svg?seed=AlexRivera',
    bio: 'Passionate about full-stack web engineering, distributed systems, and real-time apps. Looking to exchange Python knowledge for React.',
    targetRole: 'Full Stack Engineer',
    interests: ['Web Development', 'Distributed Systems', 'Open Source'],
    socialLinks: {
      github: 'https://github.com/alexrivera-demo',
      linkedin: 'https://linkedin.com/in/alexrivera-demo',
      portfolio: 'https://alexrivera.dev',
    },
    isVerified: true,
  },
  {
    name: 'Priya Patel',
    email: 'priya.patel@stanford.edu',
    passwordHash: 'Priya@123456',
    role: ROLES.STUDENT,
    college: 'Stanford University',
    branch: 'Computer Science',
    graduationYear: 2026,
    profileImage: 'https://api.dicebear.com/7.x/bottts/svg?seed=PriyaPatel',
    bio: 'React and UI/UX developer wanting to master cloud computing and microservices backend development.',
    targetRole: 'Frontend & UI Engineer',
    interests: ['UI/UX', 'React Ecosystem', 'Cloud Architecture'],
    socialLinks: {
      github: 'https://github.com/priyapatel-demo',
      linkedin: 'https://linkedin.com/in/priyapatel-demo',
      portfolio: 'https://priyapatel.design',
    },
    isVerified: true,
  },
  {
    name: 'Marcus Chen',
    email: 'marcus.chen@mit.edu',
    passwordHash: 'Marcus@123456',
    role: ROLES.STUDENT,
    college: 'Massachusetts Institute of Technology',
    branch: 'Computer Systems & Engineering',
    graduationYear: 2025,
    profileImage: 'https://api.dicebear.com/7.x/bottts/svg?seed=MarcusChen',
    bio: 'DevOps & Cloud enthusiast specializing in Linux systems, container runtimes, and cluster infrastructure. Seeking backend collaborators.',
    targetRole: 'Cloud & DevOps Engineer',
    interests: ['Cloud Infrastructure', 'Distributed Systems', 'Open Source'],
    socialLinks: {
      github: 'https://github.com/marcuschen-demo',
      linkedin: 'https://linkedin.com/in/marcuschen-demo',
    },
    isVerified: true,
  },
];

const runSeeder = async () => {
  try {
    await connectDB();

    console.log('[Seeder] Clearing existing users, skills, and user skills...');
    await User.deleteMany({});
    await Skill.deleteMany({});
    await UserSkill.deleteMany({});
    await SkillExchangeRequest.deleteMany({});
    await SkillSession.deleteMany({});
    await Project.deleteMany({});
    await ProjectTask.deleteMany({});
    await ProjectMilestone.deleteMany({});
    await ProjectDiscussion.deleteMany({});
    await ProjectResource.deleteMany({});

    console.log('[Seeder] Inserting canonical skills catalog...');
    const insertedSkills = await Skill.insertMany(canonicalSkills);
    const skillMap = {};
    insertedSkills.forEach((s) => {
      skillMap[s.name] = s._id;
    });

    console.log('[Seeder] Inserting seed users...');
    const userMap = {};
    for (const u of seedUsers) {
      const userDoc = new User(u);
      await userDoc.save();
      userMap[userDoc.email] = userDoc._id;
    }

    // Associate Alex's Skills
    console.log("[Seeder] Associating Alex Rivera's skills and evidence...");
    const alexId = userMap['alex.rivera@mit.edu'];

    // Alex can TEACH Python
    await UserSkill.create({
      userId: alexId,
      skillId: skillMap['Python'],
      type: SKILL_INTENTS.TEACH,
      level: SKILL_LEVELS.ADVANCED,
      yearsExperience: 3,
      isVerified: true,
      evidence: [
        {
          projectName: 'Distributed Async Task Queue',
          role: 'Lead Backend Developer',
          description: 'Engineered a Redis-backed asynchronous worker pool in Python handling 5,000+ jobs/min with dead-letter queueing.',
          githubUrl: 'https://github.com/alexrivera-demo/async-task-queue',
          demoUrl: '',
        },
      ],
    });

    // Alex can TEACH Node.js
    await UserSkill.create({
      userId: alexId,
      skillId: skillMap['Node.js'],
      type: SKILL_INTENTS.TEACH,
      level: SKILL_LEVELS.INTERMEDIATE,
      yearsExperience: 2,
      isVerified: true,
      evidence: [
        {
          projectName: 'Realtime Collaborative Whiteboard API',
          role: 'Backend Architect',
          description: 'Built WebSocket-enabled REST and streaming server using Node.js, Express, and rooms.',
          githubUrl: 'https://github.com/alexrivera-demo/whiteboard-api',
          demoUrl: 'https://whiteboard-demo.alexrivera.dev',
        },
      ],
    });

    // Alex can TEACH MongoDB
    await UserSkill.create({
      userId: alexId,
      skillId: skillMap['MongoDB'],
      type: SKILL_INTENTS.TEACH,
      level: SKILL_LEVELS.INTERMEDIATE,
      yearsExperience: 2,
      isVerified: false,
      evidence: [],
    });

    // Alex WANTS TO LEARN React & Docker
    await UserSkill.create({
      userId: alexId,
      skillId: skillMap['React'],
      type: SKILL_INTENTS.LEARN,
      level: SKILL_LEVELS.INTERMEDIATE,
      yearsExperience: 0,
    });
    await UserSkill.create({
      userId: alexId,
      skillId: skillMap['Docker'],
      type: SKILL_INTENTS.LEARN,
      level: SKILL_LEVELS.BEGINNER,
      yearsExperience: 0,
    });

    // Associate Priya's Skills
    console.log("[Seeder] Associating Priya Patel's skills and evidence...");
    const priyaId = userMap['priya.patel@stanford.edu'];

    // Priya can TEACH React
    await UserSkill.create({
      userId: priyaId,
      skillId: skillMap['React'],
      type: SKILL_INTENTS.TEACH,
      level: SKILL_LEVELS.EXPERT,
      yearsExperience: 3,
      isVerified: true,
      evidence: [
        {
          projectName: 'Accessible UI Component System',
          role: 'Lead Frontend Engineer',
          description: 'Architected 35+ production WCAG 2.1 AA accessible React components with Tailwind CSS and Storybook.',
          githubUrl: 'https://github.com/priyapatel-demo/accessible-ui-system',
          demoUrl: 'https://ui-system.priyapatel.design',
        },
      ],
    });

    // Priya can TEACH Tailwind CSS
    await UserSkill.create({
      userId: priyaId,
      skillId: skillMap['Tailwind CSS'],
      type: SKILL_INTENTS.TEACH,
      level: SKILL_LEVELS.ADVANCED,
      yearsExperience: 2,
      isVerified: true,
      evidence: [
        {
          projectName: 'Modern Developer Portfolio Theme',
          role: 'Designer & Developer',
          description: 'Engineered custom responsive design tokens, dark mode toggle, and micro-interactions.',
          githubUrl: 'https://github.com/priyapatel-demo/portfolio-theme',
          demoUrl: 'https://theme.priyapatel.design',
        },
      ],
    });

    // Priya WANTS TO LEARN Python & FastAPI
    await UserSkill.create({
      userId: priyaId,
      skillId: skillMap['Python'],
      type: SKILL_INTENTS.LEARN,
      level: SKILL_LEVELS.BEGINNER,
      yearsExperience: 0,
    });
    await UserSkill.create({
      userId: priyaId,
      skillId: skillMap['FastAPI'],
      type: SKILL_INTENTS.LEARN,
      level: SKILL_LEVELS.BEGINNER,
      yearsExperience: 0,
    });

    // Associate Marcus's Skills
    console.log("[Seeder] Associating Marcus Chen's skills and evidence...");
    const marcusId = userMap['marcus.chen@mit.edu'];

    // Marcus can TEACH Docker
    await UserSkill.create({
      userId: marcusId,
      skillId: skillMap['Docker'],
      type: SKILL_INTENTS.TEACH,
      level: SKILL_LEVELS.ADVANCED,
      yearsExperience: 2.5,
      isVerified: true,
      evidence: [
        {
          projectName: 'Multi-Region Kubernetes Ingress Controller',
          role: 'DevOps Architect',
          description: 'Engineered Docker container builds and automated Helm charts for edge microservices.',
          githubUrl: 'https://github.com/marcuschen-demo/k8s-ingress',
          demoUrl: '',
        },
      ],
    });

    // Marcus can TEACH Linux & Kubernetes
    await UserSkill.create({
      userId: marcusId,
      skillId: skillMap['Linux'],
      type: SKILL_INTENTS.TEACH,
      level: SKILL_LEVELS.ADVANCED,
      yearsExperience: 3,
      isVerified: false,
    });
    await UserSkill.create({
      userId: marcusId,
      skillId: skillMap['Kubernetes'],
      type: SKILL_INTENTS.TEACH,
      level: SKILL_LEVELS.INTERMEDIATE,
      yearsExperience: 2,
      isVerified: false,
    });

    // Marcus WANTS TO LEARN Node.js & MongoDB
    await UserSkill.create({
      userId: marcusId,
      skillId: skillMap['Node.js'],
      type: SKILL_INTENTS.LEARN,
      level: SKILL_LEVELS.INTERMEDIATE,
      yearsExperience: 0,
    });
    await UserSkill.create({
      userId: marcusId,
      skillId: skillMap['MongoDB'],
      type: SKILL_INTENTS.LEARN,
      level: SKILL_LEVELS.BEGINNER,
      yearsExperience: 0,
    });

    // Seed Sample Accepted Exchange between Alex and Marcus
    console.log('[Seeder] Creating sample accepted skill exchange and session...');
    const seedExchange = await SkillExchangeRequest.create({
      senderId: alexId,
      receiverId: marcusId,
      offeredSkillIds: [skillMap['Node.js']],
      requestedSkillIds: [skillMap['Docker']],
      compatibilityScore: 94,
      matchReasons: [
        'Marcus Chen can teach you Docker (advanced level)',
        'You can teach Marcus Chen Node.js (intermediate level)',
        'Shared campus: Both attending Massachusetts Institute of Technology',
        'Common interests: Distributed Systems, Open Source',
      ],
      message: "Hey Marcus! I see you specialize in Docker and K8s. I'd love to exchange Node.js backend knowledge for containerization mentoring!",
      status: 'ACCEPTED',
    });

    // Seed Scheduled Learning Session
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 2); // 2 days from now
    scheduledDate.setHours(16, 0, 0, 0);

    await SkillSession.create({
      exchangeRequestId: seedExchange._id,
      mentorId: marcusId,
      learnerId: alexId,
      skillId: skillMap['Docker'],
      scheduledAt: scheduledDate,
      durationMinutes: 45,
      meetingUrl: 'https://meet.google.com/sf-docker-demo',
      mentorNotes: 'Agenda: 1) Dockerfile multi-stage builds, 2) docker-compose networking, 3) volume persistence patterns.',
      status: 'SCHEDULED',
    });

    // Seed Projects Catalog across 6 categories
    console.log('[Seeder] Populating realistic Project Catalog (18 projects across 6 domains)...');
    const adminId = userMap['admin@skillforge.dev'];

    const seedProjects = [
      // 1. Web Development
      {
        title: 'ForgePulse - Real-time Collaborative Code Whiteboard',
        tagline: 'Infinite digital whiteboard with live cursors, peer syntax highlighting, and reactive diagramming.',
        description: 'A production-grade collaboration platform for distributed student engineering teams. Features include infinite canvas drawing using HTML5 Canvas, WebSockets-powered cursor synchronization with delta compression, peer markdown syntax highlighting, and export to PNG/SVG.',
        category: PROJECT_CATEGORIES.WEB_DEVELOPMENT,
        difficulty: PROJECT_DIFFICULTIES.INTERMEDIATE,
        estimatedDuration: '6-8 weeks',
        teamSize: 3,
        creatorId: alexId,
        status: PROJECT_STATUSES.OPEN,
        tags: ['React', 'WebSockets', 'Canvas', 'FullStack'],
        deliverables: [
          'Multi-tenant room management with invite links',
          'Low-latency WebSocket state synchronization',
          'Export canvas to SVG, PNG, and PDF formats',
          'GitHub OAuth and repository card embeds',
        ],
        githubUrl: 'https://github.com/skillforge-demo/forge-pulse',
        requiredSkills: [
          { skillId: skillMap['React'], name: 'React', level: SKILL_LEVELS.INTERMEDIATE, isMandatory: true },
          { skillId: skillMap['WebSockets'], name: 'WebSockets', level: SKILL_LEVELS.INTERMEDIATE, isMandatory: true },
          { skillId: skillMap['Node.js'], name: 'Node.js', level: SKILL_LEVELS.INTERMEDIATE, isMandatory: true },
          { skillId: skillMap['Tailwind CSS'], name: 'Tailwind CSS', level: SKILL_LEVELS.BEGINNER, isMandatory: false },
        ],
      },
      {
        title: 'CampusBazaar - Verified University Student Marketplace',
        tagline: 'Safe peer-to-peer campus marketplace for textbooks, lab equipment, and dorm tech.',
        description: 'An authenticated campus commerce portal exclusively for college students with verified .edu emails. Allows students to list dorm furniture, course textbooks, electronics, and lab equipment with geolocation filtering and direct buyer-seller messaging.',
        category: PROJECT_CATEGORIES.WEB_DEVELOPMENT,
        difficulty: PROJECT_DIFFICULTIES.BEGINNER,
        estimatedDuration: '3-4 weeks',
        teamSize: 2,
        creatorId: priyaId,
        status: PROJECT_STATUSES.OPEN,
        tags: ['Next.js', 'MongoDB', 'Tailwind', 'Marketplace'],
        deliverables: [
          'University email verification & badge issuance',
          'Fast search with building/dorm filtering',
          'Integrated in-app buyer-seller chat',
          'Item condition grading checklist',
        ],
        githubUrl: 'https://github.com/skillforge-demo/campus-bazaar',
        requiredSkills: [
          { skillId: skillMap['Next.js'], name: 'Next.js', level: SKILL_LEVELS.BEGINNER, isMandatory: true },
          { skillId: skillMap['MongoDB'], name: 'MongoDB', level: SKILL_LEVELS.BEGINNER, isMandatory: true },
          { skillId: skillMap['Tailwind CSS'], name: 'Tailwind CSS', level: SKILL_LEVELS.BEGINNER, isMandatory: true },
        ],
      },
      {
        title: 'NexusAPI - Distributed Microservices Management Portal',
        tagline: 'Unified developer portal for API gateway routing, rate-limiting metrics, and service telemetry.',
        description: 'High-throughput developer platform providing centralized API key issuance, dynamic token-bucket rate limiting via Redis, OpenAPI specification visualization, and latency tracing across distributed services.',
        category: PROJECT_CATEGORIES.WEB_DEVELOPMENT,
        difficulty: PROJECT_DIFFICULTIES.ADVANCED,
        estimatedDuration: '8-10 weeks',
        teamSize: 4,
        creatorId: marcusId,
        status: PROJECT_STATUSES.OPEN,
        tags: ['Microservices', 'TypeScript', 'Redis', 'PostgreSQL'],
        deliverables: [
          'Distributed token-bucket rate limiting in Redis',
          'Interactive OpenAPI 3.0 test runner interface',
          'API key rotation and fine-grained scope permissions',
          'Grafana telemetry dashboard export',
        ],
        githubUrl: 'https://github.com/skillforge-demo/nexus-api',
        requiredSkills: [
          { skillId: skillMap['TypeScript'], name: 'TypeScript', level: SKILL_LEVELS.ADVANCED, isMandatory: true },
          { skillId: skillMap['PostgreSQL'], name: 'PostgreSQL', level: SKILL_LEVELS.INTERMEDIATE, isMandatory: true },
          { skillId: skillMap['Redis'], name: 'Redis', level: SKILL_LEVELS.INTERMEDIATE, isMandatory: true },
          { skillId: skillMap['Docker'], name: 'Docker', level: SKILL_LEVELS.INTERMEDIATE, isMandatory: false },
        ],
      },

      // 2. AI
      {
        title: 'OmniDoc - Multimodal RAG Document Intelligence Engine',
        tagline: 'Hybrid semantic RAG system parsing complex scientific research papers with multimodal diagrams.',
        description: 'Autonomous research assistant that extracts tabular data, figures, and textual arguments from multi-page PDF documents. Builds a hybrid dense-sparse vector index with BM25 and OpenAI/HuggingFace embeddings to deliver accurate, citation-backed answers.',
        category: PROJECT_CATEGORIES.AI,
        difficulty: PROJECT_DIFFICULTIES.ADVANCED,
        estimatedDuration: '6-8 weeks',
        teamSize: 3,
        creatorId: alexId,
        status: PROJECT_STATUSES.OPEN,
        tags: ['RAG', 'LangChain', 'Python', 'FastAPI', 'LLM'],
        deliverables: [
          'PDF chunking pipeline with vision diagram extraction',
          'Hybrid vector index (BM25 + Dense Embeddings)',
          'Exact citation coordinate grounding in PDF viewer',
          'Streaming response endpoint with token speed benchmarks',
        ],
        githubUrl: 'https://github.com/skillforge-demo/omni-doc',
        requiredSkills: [
          { skillId: skillMap['Python'], name: 'Python', level: SKILL_LEVELS.ADVANCED, isMandatory: true },
          { skillId: skillMap['LangChain'], name: 'LangChain', level: SKILL_LEVELS.INTERMEDIATE, isMandatory: true },
          { skillId: skillMap['FastAPI'], name: 'FastAPI', level: SKILL_LEVELS.INTERMEDIATE, isMandatory: true },
          { skillId: skillMap['PyTorch'], name: 'PyTorch', level: SKILL_LEVELS.INTERMEDIATE, isMandatory: false },
        ],
      },
      {
        title: 'CodeSentinel - Autonomous AI Pull Request Reviewer Agent',
        tagline: 'AI GitHub bot analyzing PR diffs for security vulnerabilities, architectural smells, and test coverage.',
        description: 'A webhook-driven GitHub Bot that triggers on opened PRs. It analyzes git unified diffs, runs AST parsing, evaluates static security posture, and posts structured markdown reviews with actionable code replacement suggestions.',
        category: PROJECT_CATEGORIES.AI,
        difficulty: PROJECT_DIFFICULTIES.INTERMEDIATE,
        estimatedDuration: '4-6 weeks',
        teamSize: 3,
        creatorId: priyaId,
        status: PROJECT_STATUSES.OPEN,
        tags: ['AI', 'Agents', 'GitHubBot', 'Python', 'DevSecOps'],
        deliverables: [
          'GitHub App webhook integration with private key signing',
          'Unified diff parser & AST syntax tree analyzer',
          'Inline contextual comment generation with code suggestions',
          'Security regression score calculation per commit',
        ],
        githubUrl: 'https://github.com/skillforge-demo/code-sentinel',
        requiredSkills: [
          { skillId: skillMap['Python'], name: 'Python', level: SKILL_LEVELS.INTERMEDIATE, isMandatory: true },
          { skillId: skillMap['LangChain'], name: 'LangChain', level: SKILL_LEVELS.INTERMEDIATE, isMandatory: true },
          { skillId: skillMap['FastAPI'], name: 'FastAPI', level: SKILL_LEVELS.BEGINNER, isMandatory: true },
        ],
      },
      {
        title: 'MedVision - Pediatric Chest X-Ray Pneumonia Classifier',
        tagline: 'Explainable deep learning classifier detecting viral vs. bacterial pneumonia from radiographs.',
        description: 'Medical imaging deep learning pipeline utilizing DenseNet-121 transfer learning on open pediatric radiograph datasets. Implements Grad-CAM visual heatmaps to highlight anatomical lung regions influencing model predictions.',
        category: PROJECT_CATEGORIES.AI,
        difficulty: PROJECT_DIFFICULTIES.INTERMEDIATE,
        estimatedDuration: '5-7 weeks',
        teamSize: 2,
        creatorId: marcusId,
        status: PROJECT_STATUSES.OPEN,
        tags: ['PyTorch', 'ComputerVision', 'Healthcare', 'DeepLearning'],
        deliverables: [
          'PyTorch data loader with image normalization and augmentation',
          'Fine-tuned DenseNet-121 model achieving >94% validation accuracy',
          'Grad-CAM heatmap overlay rendering module',
          'Interactive Streamlit inference demonstration GUI',
        ],
        githubUrl: 'https://github.com/skillforge-demo/med-vision',
        requiredSkills: [
          { skillId: skillMap['PyTorch'], name: 'PyTorch', level: SKILL_LEVELS.INTERMEDIATE, isMandatory: true },
          { skillId: skillMap['Python'], name: 'Python', level: SKILL_LEVELS.INTERMEDIATE, isMandatory: true },
          { skillId: skillMap['Scikit-Learn'], name: 'Scikit-Learn', level: SKILL_LEVELS.BEGINNER, isMandatory: false },
        ],
      },

      // 3. Data Science
      {
        title: 'AlphaQuant - Algorithmic Crypto & Equities Backtesting Platform',
        tagline: 'High-speed quantitative backtester computing Sharpe ratio, maximum drawdown, and Monte Carlo risk.',
        description: 'Modular financial quantitative backtester engineered for algorithmic traders. Processes minute-level OHLCV data, supports vectorized and event-driven execution models, calculates risk metrics, and visualizes drawdowns.',
        category: PROJECT_CATEGORIES.DATA_SCIENCE,
        difficulty: PROJECT_DIFFICULTIES.ADVANCED,
        estimatedDuration: '6-8 weeks',
        teamSize: 3,
        creatorId: alexId,
        status: PROJECT_STATUSES.OPEN,
        tags: ['Quant', 'Finance', 'Pandas', 'Python', 'Trading'],
        deliverables: [
          'Vectorized order execution engine with slippage modeling',
          'Sharpe ratio, Sortino, and Value-at-Risk calculations',
          'Monte Carlo simulation runner with 1,000 randomized iterations',
          'Highcharts/Plotly interactive candlestick equity curve',
        ],
        githubUrl: 'https://github.com/skillforge-demo/alpha-quant',
        requiredSkills: [
          { skillId: skillMap['Python'], name: 'Python', level: SKILL_LEVELS.ADVANCED, isMandatory: true },
          { skillId: skillMap['Pandas'], name: 'Pandas', level: SKILL_LEVELS.ADVANCED, isMandatory: true },
          { skillId: skillMap['PostgreSQL'], name: 'PostgreSQL', level: SKILL_LEVELS.INTERMEDIATE, isMandatory: true },
        ],
      },
      {
        title: 'ClimateLens - Global Extreme Weather Anomaly Predictor',
        tagline: 'Predictive geospatial analytics model forecasting regional heatwaves and flood risks.',
        description: 'Atmospheric time-series forecasting model trained on NOAA satellite telemetry. Employs ARIMA, Random Forests, and XGBoost to identify statistical deviation in localized precipitation and surface temperature.',
        category: PROJECT_CATEGORIES.DATA_SCIENCE,
        difficulty: PROJECT_DIFFICULTIES.INTERMEDIATE,
        estimatedDuration: '4-6 weeks',
        teamSize: 2,
        creatorId: priyaId,
        status: PROJECT_STATUSES.OPEN,
        tags: ['DataScience', 'Climate', 'Pandas', 'ScikitLearn'],
        deliverables: [
          'Automated NOAA climate telemetry ingestion pipeline',
          'Spatial-temporal feature engineering with lag windows',
          'Extreme anomaly scoring model with 88% precision',
          'Interactive Folium map with satellite overlay layers',
        ],
        githubUrl: 'https://github.com/skillforge-demo/climate-lens',
        requiredSkills: [
          { skillId: skillMap['Python'], name: 'Python', level: SKILL_LEVELS.INTERMEDIATE, isMandatory: true },
          { skillId: skillMap['Pandas'], name: 'Pandas', level: SKILL_LEVELS.INTERMEDIATE, isMandatory: true },
          { skillId: skillMap['Scikit-Learn'], name: 'Scikit-Learn', level: SKILL_LEVELS.INTERMEDIATE, isMandatory: true },
        ],
      },
      {
        title: 'RetentionAI - SaaS Subscription Churn & Lifetime Value Predictor',
        tagline: 'Customer behavioral cohort analysis and machine learning churn classification pipeline.',
        description: 'End-to-end customer analytics model identifying key behavioral risk factors leading to SaaS churn. Generates cohort retention curves, calculates customer lifetime value (LTV), and outputs targeted retention intervention strategies.',
        category: PROJECT_CATEGORIES.DATA_SCIENCE,
        difficulty: PROJECT_DIFFICULTIES.BEGINNER,
        estimatedDuration: '3-4 weeks',
        teamSize: 2,
        creatorId: adminId,
        status: PROJECT_STATUSES.OPEN,
        tags: ['Analytics', 'CustomerSuccess', 'Pandas', 'NumPy', 'ML'],
        deliverables: [
          'Cohort retention matrix heatmap',
          'XGBoost classification model with ROC curve evaluation',
          'SHAP feature importance plots identifying top churn drivers',
          'Automated customer health score CSV exporter',
        ],
        githubUrl: 'https://github.com/skillforge-demo/retention-ai',
        requiredSkills: [
          { skillId: skillMap['Python'], name: 'Python', level: SKILL_LEVELS.BEGINNER, isMandatory: true },
          { skillId: skillMap['Pandas'], name: 'Pandas', level: SKILL_LEVELS.BEGINNER, isMandatory: true },
          { skillId: skillMap['NumPy'], name: 'NumPy', level: SKILL_LEVELS.BEGINNER, isMandatory: true },
        ],
      },

      // 4. Mobile
      {
        title: 'CampusSync - Real-time Student Study Groups & Events App',
        tagline: 'Cross-platform iOS/Android mobile app to organize impromptu campus hackathons and study sessions.',
        description: 'A mobile community app connecting university students who want to study together in libraries, collaborate on homework, or organize hackathon teams. Includes push notifications and live map pins.',
        category: PROJECT_CATEGORIES.MOBILE,
        difficulty: PROJECT_DIFFICULTIES.INTERMEDIATE,
        estimatedDuration: '6-8 weeks',
        teamSize: 3,
        creatorId: priyaId,
        status: PROJECT_STATUSES.OPEN,
        tags: ['Mobile', 'ReactNative', 'Campus', 'Social'],
        deliverables: [
          'Cross-platform React Native iOS and Android builds',
          'Live campus map with cluster pins for active study groups',
          'WebSockets group chat with read receipts',
          'Push notifications via Firebase Cloud Messaging',
        ],
        githubUrl: 'https://github.com/skillforge-demo/campus-sync',
        requiredSkills: [
          { skillId: skillMap['React Native'], name: 'React Native', level: SKILL_LEVELS.INTERMEDIATE, isMandatory: true },
          { skillId: skillMap['TypeScript'], name: 'TypeScript', level: SKILL_LEVELS.INTERMEDIATE, isMandatory: true },
          { skillId: skillMap['Node.js'], name: 'Node.js', level: SKILL_LEVELS.INTERMEDIATE, isMandatory: true },
        ],
      },
      {
        title: 'NutriTrack - Collaborative Fitness Challenges & Barcode Scanner',
        tagline: 'Mobile nutrition logger with camera barcode scanning and shared group workout streaks.',
        description: 'An intuitive, fast mobile fitness app built with Flutter. Enables students to scan food nutrition labels via device camera, track daily macronutrients, and participate in peer fitness streak challenges.',
        category: PROJECT_CATEGORIES.MOBILE,
        difficulty: PROJECT_DIFFICULTIES.BEGINNER,
        estimatedDuration: '4-5 weeks',
        teamSize: 2,
        creatorId: alexId,
        status: PROJECT_STATUSES.OPEN,
        tags: ['Flutter', 'Fitness', 'Mobile', 'Health'],
        deliverables: [
          'High-speed camera barcode scanning module',
          'Daily macronutrient target progress circle widgets',
          'Peer challenge streak tracking with celebration confetti',
          'Offline-first synchronization with MongoDB',
        ],
        githubUrl: 'https://github.com/skillforge-demo/nutri-track',
        requiredSkills: [
          { skillId: skillMap['Flutter'], name: 'Flutter', level: SKILL_LEVELS.BEGINNER, isMandatory: true },
          { skillId: skillMap['MongoDB'], name: 'MongoDB', level: SKILL_LEVELS.BEGINNER, isMandatory: true },
        ],
      },
      {
        title: 'AuraWallet - Decentralized Biometric Mobile Web3 Wallet',
        tagline: 'Non-custodial mobile crypto wallet with hardware-backed secure enclave key derivation.',
        description: 'A secure mobile cryptocurrency wallet supporting EVM networks. Uses device Biometrics (FaceID/Fingerprint) and Secure Enclave keychain for encrypted seed generation, QR gas-optimized transactions, and decentralized wallet connect.',
        category: PROJECT_CATEGORIES.MOBILE,
        difficulty: PROJECT_DIFFICULTIES.ADVANCED,
        estimatedDuration: '8-10 weeks',
        teamSize: 4,
        creatorId: marcusId,
        status: PROJECT_STATUSES.OPEN,
        tags: ['Web3', 'Crypto', 'Security', 'ReactNative'],
        deliverables: [
          'Biometric hardware Secure Enclave key derivation',
          'EIP-1559 gas fee estimation and multi-network switcher',
          'WalletConnect v2 dApp QR code pairing adapter',
          'Encrypted backup export with argon2 key derivation',
        ],
        githubUrl: 'https://github.com/skillforge-demo/aura-wallet',
        requiredSkills: [
          { skillId: skillMap['React Native'], name: 'React Native', level: SKILL_LEVELS.ADVANCED, isMandatory: true },
          { skillId: skillMap['TypeScript'], name: 'TypeScript', level: SKILL_LEVELS.ADVANCED, isMandatory: true },
          { skillId: skillMap['Cryptography'], name: 'Cryptography', level: SKILL_LEVELS.INTERMEDIATE, isMandatory: true },
        ],
      },

      // 5. Cloud
      {
        title: 'CloudKube - Multi-Cluster Kubernetes Cost & Observability Daemon',
        tagline: 'Lightweight daemon scraping container telemetry and recommending node autoscaling cuts.',
        description: 'High-performance Go daemon running as a Kubernetes DaemonSet. Collects CPU/memory throttling metrics across nodes, detects zombie pods and overprovisioned limits, and estimates monthly cloud waste.',
        category: PROJECT_CATEGORIES.CLOUD,
        difficulty: PROJECT_DIFFICULTIES.ADVANCED,
        estimatedDuration: '6-8 weeks',
        teamSize: 3,
        creatorId: marcusId,
        status: PROJECT_STATUSES.OPEN,
        tags: ['Kubernetes', 'Cloud', 'Go', 'DevOps', 'FinOps'],
        deliverables: [
          'Custom Kubernetes controller written in Go',
          'Prometheus custom metrics exporter endpoint',
          'Automated CPU/memory request right-sizing recommendations',
          'Pre-configured Grafana cluster cost dashboard JSON',
        ],
        githubUrl: 'https://github.com/skillforge-demo/cloud-kube',
        requiredSkills: [
          { skillId: skillMap['Kubernetes'], name: 'Kubernetes', level: SKILL_LEVELS.ADVANCED, isMandatory: true },
          { skillId: skillMap['Go'], name: 'Go', level: SKILL_LEVELS.INTERMEDIATE, isMandatory: true },
          { skillId: skillMap['Docker'], name: 'Docker', level: SKILL_LEVELS.ADVANCED, isMandatory: true },
        ],
      },
      {
        title: 'ServerlessForge - Event-Driven Multi-Cloud Data Pipeline',
        tagline: 'Serverless streaming architecture processing cloud storage events with dead-letter queue recovery.',
        description: 'An automated serverless data processing engine. Captures file drop events in AWS S3, invokes scalable AWS Lambda processing workers, writes normalized records to PostgreSQL, and provisions all resources via Terraform.',
        category: PROJECT_CATEGORIES.CLOUD,
        difficulty: PROJECT_DIFFICULTIES.INTERMEDIATE,
        estimatedDuration: '4-6 weeks',
        teamSize: 2,
        creatorId: alexId,
        status: PROJECT_STATUSES.OPEN,
        tags: ['AWS', 'Serverless', 'Terraform', 'Cloud'],
        deliverables: [
          'Complete Terraform Infrastructure-as-Code modules',
          'AWS Lambda Python transformation workers',
          'SQS Dead Letter Queue with replay consumer',
          'CloudWatch operational alarm metrics setup',
        ],
        githubUrl: 'https://github.com/skillforge-demo/serverless-forge',
        requiredSkills: [
          { skillId: skillMap['AWS'], name: 'AWS', level: SKILL_LEVELS.INTERMEDIATE, isMandatory: true },
          { skillId: skillMap['Python'], name: 'Python', level: SKILL_LEVELS.INTERMEDIATE, isMandatory: true },
          { skillId: skillMap['Terraform'], name: 'Terraform', level: SKILL_LEVELS.BEGINNER, isMandatory: true },
        ],
      },
      {
        title: 'GitOpsDeploy - Zero-Downtime Automated CI/CD Release Engine',
        tagline: 'Battle-tested continuous integration pipeline with automated vulnerability scans and canary releases.',
        description: 'A robust CI/CD template and orchestration runner for student engineering projects. Automates linting, test suites, multi-arch Docker image compilation, container vulnerability scanning, and blue-green deployment.',
        category: PROJECT_CATEGORIES.CLOUD,
        difficulty: PROJECT_DIFFICULTIES.BEGINNER,
        estimatedDuration: '3-4 weeks',
        teamSize: 2,
        creatorId: marcusId,
        status: PROJECT_STATUSES.OPEN,
        tags: ['DevOps', 'CI/CD', 'GitOps', 'Docker', 'Linux'],
        deliverables: [
          'Reusable GitHub Actions workflow matrix with caching',
          'Trivy container image security scan gating PRs',
          'Automated semantic release versioning bot',
          'Blue-green deployment rollback automation script',
        ],
        githubUrl: 'https://github.com/skillforge-demo/gitops-deploy',
        requiredSkills: [
          { skillId: skillMap['CI/CD Pipelines'], name: 'CI/CD Pipelines', level: SKILL_LEVELS.BEGINNER, isMandatory: true },
          { skillId: skillMap['Docker'], name: 'Docker', level: SKILL_LEVELS.BEGINNER, isMandatory: true },
          { skillId: skillMap['Linux'], name: 'Linux', level: SKILL_LEVELS.BEGINNER, isMandatory: true },
        ],
      },

      // 6. Cybersecurity
      {
        title: 'VulnHunter - Automated Web Application OWASP Security Scanner',
        tagline: 'Headless dynamic application security testing (DAST) scanner checking for SQLi, XSS, and CSRF.',
        description: 'An automated security auditing tool designed to inspect web endpoints for OWASP Top 10 vulnerabilities. Performs header security evaluation, crawling for reflected XSS, SQL injection heuristics, and generates CVSS scores.',
        category: PROJECT_CATEGORIES.CYBERSECURITY,
        difficulty: PROJECT_DIFFICULTIES.ADVANCED,
        estimatedDuration: '6-8 weeks',
        teamSize: 3,
        creatorId: adminId,
        status: PROJECT_STATUSES.OPEN,
        tags: ['Cybersecurity', 'OWASP', 'PenTesting', 'AppSec'],
        deliverables: [
          'Asynchronous web crawler with headless browser verification',
          'Fuzzing engine for reflected & stored XSS payloads',
          'Automated CVSS v3.1 severity calculator',
          'Exportable executive PDF/HTML vulnerability audit report',
        ],
        githubUrl: 'https://github.com/skillforge-demo/vuln-hunter',
        requiredSkills: [
          { skillId: skillMap['Python'], name: 'Python', level: SKILL_LEVELS.ADVANCED, isMandatory: true },
          { skillId: skillMap['OWASP Security'], name: 'OWASP Security', level: SKILL_LEVELS.INTERMEDIATE, isMandatory: true },
          { skillId: skillMap['Linux'], name: 'Linux', level: SKILL_LEVELS.INTERMEDIATE, isMandatory: true },
        ],
      },
      {
        title: 'ZeroGate - Zero-Trust Identity Gateway & API Threat Proxy',
        tagline: 'High-speed reverse proxy enforcing mTLS, JWT claims, and adaptive IP reputation throttling.',
        description: 'A zero-trust identity and access gateway built in Go. Sits in front of upstream microservices, validating client mutual TLS (mTLS), inspecting OAuth2 claims, and blacklisting abusive IP subnets in Redis.',
        category: PROJECT_CATEGORIES.CYBERSECURITY,
        difficulty: PROJECT_DIFFICULTIES.INTERMEDIATE,
        estimatedDuration: '5-7 weeks',
        teamSize: 3,
        creatorId: marcusId,
        status: PROJECT_STATUSES.OPEN,
        tags: ['ZeroTrust', 'Security', 'Go', 'NetworkSecurity'],
        deliverables: [
          'High-throughput reverse proxy handling >10k req/sec',
          'Mutual TLS certificate handshake validator',
          'Dynamic IP reputation scoring cache in Redis',
          'Structured JSON security audit log streaming',
        ],
        githubUrl: 'https://github.com/skillforge-demo/zero-gate',
        requiredSkills: [
          { skillId: skillMap['Go'], name: 'Go', level: SKILL_LEVELS.INTERMEDIATE, isMandatory: true },
          { skillId: skillMap['Network Security'], name: 'Network Security', level: SKILL_LEVELS.INTERMEDIATE, isMandatory: true },
          { skillId: skillMap['Redis'], name: 'Redis', level: SKILL_LEVELS.INTERMEDIATE, isMandatory: true },
        ],
      },
      {
        title: 'NetShield - Network Packet Analyzer & Intrusion Detection System',
        tagline: 'Raw socket network traffic sniffer detecting SYN flood attacks and ARP spoofing in real time.',
        description: 'An educational Network Intrusion Detection System (NIDS) utilizing raw packet sniffing on Linux. Inspects Ethernet frames, IP headers, and TCP/UDP flags to alert on anomalous scan activity and unauthorized MITM attacks.',
        category: PROJECT_CATEGORIES.CYBERSECURITY,
        difficulty: PROJECT_DIFFICULTIES.INTERMEDIATE,
        estimatedDuration: '4-6 weeks',
        teamSize: 2,
        creatorId: alexId,
        status: PROJECT_STATUSES.OPEN,
        tags: ['NetworkSecurity', 'IDS', 'Python', 'Networking'],
        deliverables: [
          'Raw socket frame capture module with BPF filter support',
          'Port scan and SYN flood threshold detection heuristic',
          'ARP cache poisoning & duplicate IP detection',
          'Terminal dashboard visualizing live packets per second',
        ],
        githubUrl: 'https://github.com/skillforge-demo/net-shield',
        requiredSkills: [
          { skillId: skillMap['Python'], name: 'Python', level: SKILL_LEVELS.INTERMEDIATE, isMandatory: true },
          { skillId: skillMap['Network Security'], name: 'Network Security', level: SKILL_LEVELS.INTERMEDIATE, isMandatory: true },
          { skillId: skillMap['Linux'], name: 'Linux', level: SKILL_LEVELS.INTERMEDIATE, isMandatory: true },
        ],
      },
    ];

    const enrichedProjects = seedProjects.map((p) => {
      const members = [
        {
          userId: p.creatorId,
          role: 'Project Lead',
          joinedAt: new Date(),
          status: 'ACTIVE',
        },
      ];

      let requiredRoles = p.requiredRoles || [];
      if (requiredRoles.length === 0) {
        if (p.title.includes('ForgePulse')) {
          requiredRoles = [
            { roleName: 'React Developer', skills: ['React', 'Tailwind CSS'], spots: 1, filled: 0 },
            { roleName: 'Node.js Developer', skills: ['Node.js', 'WebSockets'], spots: 1, filled: 0 },
            { roleName: 'UI/UX Designer', skills: ['Tailwind CSS', 'React'], spots: 1, filled: 0 },
          ];
        } else if (p.category === PROJECT_CATEGORIES.WEB_DEVELOPMENT) {
          requiredRoles = [
            {
              roleName: 'Frontend Engineer',
              skills: p.requiredSkills
                .filter((s) => ['React', 'Next.js', 'Tailwind CSS', 'TypeScript'].includes(s.name))
                .map((s) => s.name),
              spots: 1,
              filled: 0,
            },
            {
              roleName: 'Backend Developer',
              skills: p.requiredSkills
                .filter((s) => ['Node.js', 'Express.js', 'MongoDB', 'PostgreSQL'].includes(s.name))
                .map((s) => s.name),
              spots: 1,
              filled: 0,
            },
          ];
        } else if (p.category === PROJECT_CATEGORIES.CLOUD) {
          requiredRoles = [
            { roleName: 'DevOps & Cluster Engineer', skills: ['Docker', 'Kubernetes', 'Linux'], spots: 1, filled: 0 },
            { roleName: 'Cloud Infrastructure Architect', skills: ['AWS', 'Linux'], spots: 1, filled: 0 },
          ];
        } else if (p.category === PROJECT_CATEGORIES.AI || p.category === PROJECT_CATEGORIES.DATA_SCIENCE) {
          requiredRoles = [
            { roleName: 'Machine Learning Engineer', skills: ['Python', 'PyTorch', 'LangChain'], spots: 1, filled: 0 },
            { roleName: 'Data Pipeline Specialist', skills: ['Python', 'Pandas', 'PostgreSQL'], spots: 1, filled: 0 },
          ];
        } else if (p.category === PROJECT_CATEGORIES.MOBILE) {
          requiredRoles = [
            { roleName: 'Mobile App Developer', skills: ['React Native', 'Flutter'], spots: 1, filled: 0 },
          ];
        } else {
          requiredRoles = [
            { roleName: `${p.category} Specialist`, skills: p.requiredSkills.map((s) => s.name), spots: 1, filled: 0 },
          ];
        }
      }

      return {
        ...p,
        members,
        requiredRoles,
      };
    });

    const insertedProjects = await Project.insertMany(enrichedProjects);
    console.log(`[Seeder] Successfully seeded ${seedProjects.length} projects with required roles and initial teams!`);

    // Seed Workspace for ForgePulse
    const forgePulse = insertedProjects.find((p) => p.title.includes('ForgePulse'));
    if (forgePulse) {
      console.log('[Seeder] Populating sample workspace for ForgePulse (Kanban, Milestones, Discussions, Resources)...');

      // 1. Milestones
      const m1 = await ProjectMilestone.create({
        projectId: forgePulse._id,
        title: 'Sprint 1: Architecture & Data Modeling',
        description: 'Design schemas, indexes, REST routes, and authentication flows.',
        targetDate: new Date(Date.now() - 7 * 86400000),
        status: MILESTONE_STATUSES.COMPLETED,
        completedAt: new Date(Date.now() - 2 * 86400000),
        createdBy: alexId,
      });

      const m2 = await ProjectMilestone.create({
        projectId: forgePulse._id,
        title: 'Sprint 2: Real-time Collab & Kanban Board',
        description: 'Implement WebSocket channels, task drag-and-drop, and real-time status syncing.',
        targetDate: new Date(Date.now() + 10 * 86400000),
        status: MILESTONE_STATUSES.IN_PROGRESS,
        createdBy: alexId,
      });

      const m3 = await ProjectMilestone.create({
        projectId: forgePulse._id,
        title: 'Sprint 3: CI/CD Deployment & Beta Release',
        description: 'Production containerization, Nginx ingress, and automated security scans.',
        targetDate: new Date(Date.now() + 25 * 86400000),
        status: MILESTONE_STATUSES.PLANNED,
        createdBy: alexId,
      });

      // 2. Kanban Tasks
      await ProjectTask.insertMany([
        {
          projectId: forgePulse._id,
          title: 'Design MongoDB collections with compound indexing',
          description: 'Define schemas for Projects, Tasks, Milestones, and optimize query latency.',
          status: TASK_STATUSES.DONE,
          priority: TASK_PRIORITIES.HIGH,
          assigneeId: alexId,
          dueDate: new Date(Date.now() - 3 * 86400000),
          milestoneId: m1._id,
          order: 0,
          createdBy: alexId,
        },
        {
          projectId: forgePulse._id,
          title: 'Build interactive React Kanban board UI',
          description: 'Columns: TODO, IN PROGRESS, REVIEW, DONE with status shifting and filter controls.',
          status: TASK_STATUSES.IN_PROGRESS,
          priority: TASK_PRIORITIES.URGENT,
          assigneeId: alexId,
          dueDate: new Date(Date.now() + 3 * 86400000),
          milestoneId: m2._id,
          order: 0,
          createdBy: alexId,
        },
        {
          projectId: forgePulse._id,
          title: 'Implement WebSocket channel synchronization',
          description: 'Stream task updates and active presence indicators between team collaborators.',
          status: TASK_STATUSES.REVIEW,
          priority: TASK_PRIORITIES.HIGH,
          assigneeId: alexId,
          dueDate: new Date(Date.now() + 4 * 86400000),
          milestoneId: m2._id,
          order: 0,
          createdBy: alexId,
        },
        {
          projectId: forgePulse._id,
          title: 'Design accessible Dark Mode tokens in Tailwind CSS',
          description: 'Ensure color contrast meets WCAG AAA standards and badges are visually distinct.',
          status: TASK_STATUSES.TODO,
          priority: TASK_PRIORITIES.MEDIUM,
          assigneeId: null,
          dueDate: new Date(Date.now() + 7 * 86400000),
          milestoneId: m2._id,
          order: 0,
          createdBy: alexId,
        },
        {
          projectId: forgePulse._id,
          title: 'Docker multi-stage container packaging',
          description: 'Generate minimal alpine container images and health check scripts.',
          status: TASK_STATUSES.TODO,
          priority: TASK_PRIORITIES.LOW,
          assigneeId: null,
          dueDate: new Date(Date.now() + 14 * 86400000),
          milestoneId: m3._id,
          order: 1,
          createdBy: alexId,
        },
      ]);

      // 3. Project Discussions
      await ProjectDiscussion.insertMany([
        {
          projectId: forgePulse._id,
          authorId: alexId,
          title: 'State Management: Redux Toolkit vs Zustand for collaborative cursors',
          message: 'As we add real-time mouse cursors and active typing indicators, should we keep them in Redux or separate in a lightweight Zustand store?',
          category: DISCUSSION_CATEGORIES.TECHNICAL,
          pinned: true,
          replies: [
            {
              authorId: alexId,
              message: 'Let us keep Redux for core entities and Zustand for live ephemeral canvas interactions.',
              createdAt: new Date(Date.now() - 1800000),
            },
          ],
        },
        {
          projectId: forgePulse._id,
          authorId: alexId,
          title: 'Sprint 2 Demo Date & Kanban Feature Review',
          message: 'Can we schedule our next demo on Thursday? The Kanban board column shifting is fully operational.',
          category: DISCUSSION_CATEGORIES.GENERAL,
          pinned: false,
          replies: [
            {
              authorId: alexId,
              message: 'Thursday afternoon works perfectly. Let us review the test coverage beforehand.',
              createdAt: new Date(),
            },
          ],
        },
      ]);

      // 4. Resources & Docs
      await ProjectResource.insertMany([
        {
          projectId: forgePulse._id,
          title: 'ForgePulse System Architecture & Sequence Diagrams',
          url: 'https://github.com/skillforge-demo/forge-pulse/wiki/architecture',
          type: RESOURCE_TYPES.DOCUMENTATION,
          description: 'Full REST API contract, WebSocket message schemas, and data flow diagrams.',
          addedBy: alexId,
        },
        {
          projectId: forgePulse._id,
          title: 'Figma Design System & Component Library',
          url: 'https://www.figma.com/file/forge-pulse-tokens',
          type: RESOURCE_TYPES.DESIGN,
          description: 'Design mockups, responsive layouts, color tokens, and button variants.',
          addedBy: alexId,
        },
        {
          projectId: forgePulse._id,
          title: 'ForgePulse Official GitHub Repository',
          url: 'https://github.com/skillforge-demo/forge-pulse',
          type: RESOURCE_TYPES.CODE_REPOSITORY,
          description: 'Source code repository with commit history, PR guidelines, and CI status.',
          addedBy: alexId,
        },
      ]);
    }

    console.log('\n[Seeder] Seed data successfully populated with skills, evidence, exchange requests, sessions, and projects catalog!');
    console.log('--- SAMPLE USERS CREATED: 4 (1 Admin, 3 Students)');
    console.log('1. Admin: admin@skillforge.dev / Admin@123456');
    console.log('2. Student: alex.rivera@mit.edu / Alex@123456 (Teaches: Python, Node.js, MongoDB | Learns: React, Docker)');
    console.log('3. Student: priya.patel@stanford.edu / Priya@123456 (Teaches: React, Tailwind | Learns: Python, FastAPI)');
    console.log('4. Student: marcus.chen@mit.edu / Marcus@123456 (Teaches: Docker, Linux, K8s | Learns: Node.js, MongoDB)');
    console.log('------------------------');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder] Error during seeding:', error.message);
    process.exit(1);
  }
};

runSeeder();
