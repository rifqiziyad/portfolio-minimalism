/**
 * PORTFOLIO DATA MODULE
 * Contains structured content for Selected Works, Timeline, Capabilities, and Education.
 * Compatible with direct file:// execution and standard web hosting.
 */

(function () {
  'use strict';

  window.PortfolioData = {
    works: [
      {
        id: 'project-btn',
        category: 'BANKING BACKOFFICE',
        title: 'BTN BACKOFFICE',
        description:
          'Banking backoffice provides a transaction dashboard, promo/info blast, account management (unregister, block, unblock), bank manager, approval, and monitoring, supported by role-based authorization to ensure security and access control according to user privileges.',
        year: '2023 - PRESENT',
        stack: 'JavaScript • React.js • Material UI • Redux',
        linkUrl: null,
        image: 'assets/btn/Screenshot 2025-04-25 at 16.07.25.webp',
        imageAlt: 'BTN Mobile Banking Backoffice System',
        gallery: [
          'assets/btn/Screenshot 2025-04-25 at 16.07.25.webp',
          'assets/btn/Screenshot 2025-04-25 at 16.08.42.webp',
          'assets/btn/Screenshot 2025-04-25 at 16.08.59.webp',
          'assets/btn/Screenshot 2025-04-25 at 16.09.24.webp'
        ]
      },
      {
        id: 'project-hibank',
        category: 'INTERNET BANKING',
        title: 'HIBANK CLIENT PORTAL',
        description:
          'Built and integrated features for Internet Banking services such as transfers, payments, and purchases.',
        year: '2024',
        stack: 'React • TypeScript • Redux Toolkit • Material UI',
        linkUrl: null,
        image: 'assets/hibank/1745218296927.webp',
        imageAlt: 'Hibank Client Portal System',
        gallery: [
          'assets/hibank/1745218296927.webp',
          'assets/hibank/1745218296944.webp',
          'assets/hibank/1745218296962.webp',
          'assets/hibank/1745218296973.webp',
          'assets/hibank/1745218296987.webp',
          'assets/hibank/1745218297004.webp',
          'assets/hibank/1745218297015.webp'
        ]
      },
      {
        id: 'project-octo',
        category: 'CUSTOMER PLATFORM',
        title: 'CIMB OCTO CLICK',
        description:
          'Revamp of the transfer feature with a more modern interface, simplified transaction flow, and enhanced security and user experience.',
        year: '2025',
        stack: 'React • TypeScript • Material UI • Tanstack',
        linkUrl: null,
        image: 'assets/cimb/c1.webp',
        imageAlt: 'CIMB Niaga OCTO Click Revamp',
        gallery: [
          'assets/cimb/c1.webp',
          'assets/cimb/c2.webp',
          'assets/cimb/c3.webp',
          'assets/cimb/c4.webp',
          'assets/cimb/c5.webp'
        ]
      },
      {
        id: 'project-bni',
        category: 'TRANSACTIONAL BANKING',
        title: 'BNI PORTAL AUTODEBIT',
        description:
          'Web-based system for managing billers, customers, and automated billing transactions, equipped with a dashboard and reporting features for operational monitoring.',
        year: '2026',
        stack: 'React.js • TypeScript • Tailwind CSS • Zustand • Tanstack.',
        linkUrl: null,
        image: 'assets/bni/bni1.webp',
        imageAlt: 'BNI Corporate Transactional Banking Portal',
        gallery: [
          'assets/bni/bni1.webp',
          'assets/bni/bni2.webp',
          'assets/bni/bni3.webp',
          'assets/bni/bni4.webp'
        ]
      },
      {
        id: 'project-smartbox',
        category: 'IOT & LOGISTICS',
        title: 'SMARTBOX INDUSTRIES',
        description:
          'Revamp of the company profile with a modern design and seamless integration to Strapi for dynamic content management.',
        year: '2025',
        stack: 'React Native • Flutter • TypeScript • WebSockets • Node.js',
        linkUrl: 'https://smartbox.build',
        image: 'assets/smartbox/s1.webp',
        imageAlt: 'Smartbox Automated Locker & IoT Platform',
        gallery: [
          'assets/smartbox/s1.webp',
          'assets/smartbox/s2.webp',
          'assets/smartbox/s3.webp',
          'assets/smartbox/s4.webp',
          'assets/smartbox/s5.webp'
        ]
      },
      {
        id: 'project-ignica',
        category: 'DIGITAL RETAIL PLATFORM',
        title: 'IGNICA',
        description:
          'Company profile website that contains product & service, case study, contact, and news sections.',
        year: '2022 — 2023',
        stack: 'JavaScript • jQuery • Bootstrap • HTML5 / CSS3',
        linkUrl: 'https://ignica.com',
        linkText: 'Visit ignica.com',
        image: 'assets/ignica/Screenshot 2023-09-13 at 09.32.34.webp',
        imageAlt: 'Ignica Digital Retail and In-Store Experience Platform',
        gallery: [
          'assets/ignica/Screenshot 2023-09-13 at 09.32.34.webp',
          'assets/ignica/Screenshot 2023-09-13 at 09.33.01.webp',
          'assets/ignica/ignica.com_(iPad Air).webp',
          'assets/ignica/ignica.com_(iPhone XR).webp'
        ]
      },
      {
        id: 'project-kasumi',
        category: 'ENTERPRISE HR SYSTEM',
        title: 'KASUMI HR MANAGEMENT',
        description:
          "Web application designed to meet the needs of our client's office. It consists of several modules, such as petty payment, general recruitment, master data, and target management.",
        year: '2021 — 2023',
        stack: 'React.js • Redux • JavaScript • CSS3 / SCSS',
        linkUrl: null,
        image: 'assets/kasumi/home page.webp',
        imageAlt: 'Kasumi Enterprise HR Management System and Workflow Portal',
        gallery: [
          'assets/kasumi/home page.webp',
          'assets/kasumi/form recruitment.webp'
        ]
      }
    ],

    career: [
      {
        id: 'career-infosys',
        period: '2023 — PRESENT',
        company: 'PT INFOSYS SOLUSI TERPADU',
        role: 'FRONTEND DEVELOPER',
        description:
          'Developed internal web applications for banking operations, including modules for customer data management, transaction approvals, and financial reporting. Built and maintained features for a customer-facing platform to handle transactions such as money transfers, balance inquiries, and transaction history using React.js.'
      },
      {
        id: 'career-boston',
        period: '2021 — 2023',
        company: 'PT BOSTON MAKMUR GEMILANG',
        role: 'FRONTEND DEVELOPER',
        description:
          'Developed internal HR management systems for desktop use, including recruitment forms, employee master data, organizational structure, and target evaluation modules. Built user-friendly interfaces using React.js tailored for non-technical HR users.'
      },
      {
        id: 'career-clairmont',
        period: '2019',
        company: 'PT PRIMA HIDUP LESTARI',
        role: 'ACCOUNTING',
        description:
          'Accustomed to using Microsoft Excel to make daily sales records and make reports on raw materials as well as entering bank mutations and entering tax invoices.'
      }
    ],

    skills: [
      { name: 'React.js', size: 175 },
      { name: 'TypeScript', size: 170 },
      { name: 'JavaScript', size: 165 },
      { name: 'Next.js', size: 155 },
      { name: 'Redux Toolkit', size: 150 },
      { name: 'Tailwind CSS', size: 150 },
      { name: 'Clean Architecture', size: 150 },
      { name: 'Material UI', size: 145 },
      { name: 'Design System', size: 145 },
      { name: 'Node.js', size: 140 },
      { name: 'HTML5', size: 140 },
      { name: 'CSS3', size: 138 },
      { name: 'SwiftUI', size: 135 },
      { name: 'Express.js', size: 132 },
      { name: 'Redux', size: 130 },
      { name: 'Swift', size: 128 },
      { name: 'Java', size: 128 },
      { name: 'MySQL', size: 126 },
      { name: 'Analysis', size: 125 },
      { name: 'Problem Solver', size: 125 },
      { name: 'Git', size: 120 },
      { name: 'Bootstrap', size: 120 }
    ],

    education: [
      {
        index: '01',
        programTag: 'UNDERGRADUATE DEGREE',
        period: '2026 — PRESENT',
        degree: 'COMPUTER SCIENCE',
        school: 'Bina Nusantara University (BINUS Online)',
        description:
          'I am pursuing a degree in Computer Science while working full-time as a Frontend Developer in the banking sector. Five courses—Operating Systems, Computer Networks, Computer Security, Human-Computer Interaction, and Specialized Platform Development—have been credited toward my degree through the Recognition of Prior Learning (RPL) process, all with a grade of A. I leverage this combination of five years of industry experience and a solid academic foundation to build web applications that are secure, well-structured, and highly scalable.'
      },
      {
        index: '02',
        programTag: 'ACCELERATED IMMERSIVE',
        period: '2021',
        degree: 'FULL STACK DEVELOPER',
        school: 'Bootcamp Fazztrack',
        description:
          'For 13 weeks, I learned to be a full stack web developer. I learned React.JS, Next.JS, Node.JS, ExpressJS, etc. Not only learning technical, in this bootcamp I also learn soft skills'
      },
      {
        index: '03',
        programTag: 'SECONDARY EDUCATION',
        period: '2016 — 2019',
        degree: 'NATURAL SCIENCE (MIPA)',
        school: 'Madrasah Aliyah Khazanah Kebajikan',
        description:
          'At school I not only study science related, but also learn Islamic religious lessons such as Fiqih, Aqidah Akhlak, Al-Quran Hadits and Sejarah Kebudayaan Islam'
      }
    ]
  };
})();

