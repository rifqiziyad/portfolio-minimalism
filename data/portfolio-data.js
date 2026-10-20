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
        num: '001',
        category: 'BANKING BACKOFFICE',
        tag: 'INTERNAL PLATFORM',
        title: 'BTN BACKOFFICE',
        description:
          'A mission-critical backoffice platform engineered to monitor transactions, govern sensitive user records, and orchestrate dynamic in-app features within Bank BTN’s mobile banking ecosystem.',
        year: '2024',
        stack: 'JavaScript • React.js • Material UI • Redux',
        linkText: 'INQUIRE DETAILS',
        linkUrl: '#contact',
        image: 'assets/project-1.jpg',
        imageAlt: 'BTN Mobile Banking Backoffice System'
      },
      {
        id: 'project-hibank',
        num: '002',
        category: 'INTERNET BANKING',
        tag: 'CLIENT PORTAL',
        title: 'HIBANK PORTAL',
        description:
          'Architected and integrated comprehensive Internet Banking modules for Hibank, including inter-bank fund transfers, real-time bill payments, account summaries, and financial transaction processing.',
        year: '2024',
        stack: 'React • TypeScript • Redux Toolkit • Material UI',
        linkText: 'INQUIRE DETAILS',
        linkUrl: '#contact',
        image: 'assets/project-2.jpg',
        imageAlt: 'Hibank Client Portal System'
      },
      {
        id: 'project-octo',
        num: '003',
        category: 'CUSTOMER PLATFORM',
        tag: 'SYSTEM REVAMP',
        title: 'OCTO CLICK',
        description:
          'Full-scale modernization of CIMB Niaga OCTO Click\'s fund transfer ecosystem. Refactored multi-stage transaction flows, optimized user feedback states, and enforced banking security standards.',
        year: '2024 — 2025',
        stack: 'React • TypeScript • Material UI • REST API',
        linkText: 'INQUIRE DETAILS',
        linkUrl: '#contact',
        image: 'assets/project-3.jpg',
        imageAlt: 'CIMB Niaga OCTO Click Revamp'
      }
    ],

    timeline: [
      {
        id: 'prod-card-1',
        wrapId: 'timeline-wrap-1',
        docks: [
          { posClass: 'dock-top', id: 'prod-dock-c1-top', dotClass: '' },
          { posClass: 'dock-bottom', id: 'prod-dock-c1-bottom', dotClass: '' }
        ],
        year: '2021 — 2023',
        heading: 'PT BOSTON MAKMUR GEMILANG',
        text: 'Developed internal desktop-based HR management systems (Kasumi) including recruitment forms, employee master data, organizational structure, and target evaluation modules using React.js and Redux. Built modern web solutions including Ignica.'
      },
      {
        id: 'prod-card-2',
        wrapId: 'timeline-wrap-2',
        docks: [
          { posClass: 'dock-left', id: 'prod-dock-c2-left', dotClass: 'purple' },
          { posClass: 'dock-bottom', id: 'prod-dock-c2-bottom', dotClass: 'purple' }
        ],
        year: '2023 — 2024',
        heading: 'PT INFOSYS SOLUSI TERPADU',
        text: 'Engineered desktop-based internal banking web applications with React.js for transaction approvals, customer data governance, and financial reporting. Collaborated closely with backend engineers and QA teams to guarantee strict API and security compliance.'
      },
      {
        id: 'prod-card-3',
        wrapId: 'timeline-wrap-3',
        docks: [
          { posClass: 'dock-right', id: 'prod-dock-c3-right', dotClass: '' },
          { posClass: 'dock-bottom', id: 'prod-dock-c3-bottom', dotClass: '' }
        ],
        year: '2025 — PRESENT',
        heading: 'PT INFOSYS SOLUSI TERPADU',
        text: 'Spearheading frontend architecture for critical Internet Banking services and transaction revamp initiatives (OCTO Click CIMB Niaga, Hibank Client Portal, BTN Mobile Banking Backoffice) with strict banking security compliance, TypeScript, and Redux Toolkit.'
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
      { name: 'Banking Security', size: 145 },
      { name: 'Node.js', size: 140 },
      { name: 'HTML5 / CSS3', size: 140 },
      { name: 'RESTful APIs', size: 138 },
      { name: 'SwiftUI', size: 135 },
      { name: 'Express.js', size: 132 },
      { name: 'Redux Flow', size: 130 },
      { name: 'Swift', size: 128 },
      { name: 'Java', size: 128 },
      { name: 'MySQL', size: 126 },
      { name: 'JSON Schemas', size: 125 },
      { name: 'QA Handshake', size: 125 },
      { name: 'Git', size: 120 },
      { name: 'Bootstrap', size: 120 }
    ],

    education: [
      {
        index: '01',
        programTag: 'UNDERGRADUATE DEGREE',
        period: 'FEB 2026 — PRESENT',
        degree: 'COMPUTER SCIENCE',
        school: 'Binus Online',
        description:
          'Pendidikan tinggi formal yang berfokus pada rekayasa perangkat lunak, struktur data dan algoritma, komputasi terdistribusi, serta perancangan sistem berbasis teknologi informasi modern.'
      },
      {
        index: '02',
        programTag: 'ACCELERATED IMMERSIVE',
        period: 'MAY 2021 — AUG 2021',
        degree: 'FULL STACK DEVELOPER',
        school: 'Bootcamp Fazztrack',
        description:
          'Pelatihan intensif pengembangan aplikasi web end-to-end dengan penekanan pada modern JavaScript, React ecosystem, arsitektur REST API, dan integrasi basis data.'
      },
      {
        index: '03',
        programTag: 'SECONDARY EDUCATION',
        period: 'JUN 2016 — APR 2019',
        degree: 'NATURAL SCIENCE (MIPA)',
        school: 'Madrasah Aliyah Khazanah Kebajikan',
        description:
          'Fondasi analitis, logika matematika, sains alamiah, dan metodologi pemecahan masalah sistematis.'
      }
    ]
  };
})();

