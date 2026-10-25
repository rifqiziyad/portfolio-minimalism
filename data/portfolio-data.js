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
        image: 'assets/btn/Screenshot 2025-04-25 at 16.07.25.png',
        imageAlt: 'BTN Mobile Banking Backoffice System',
        gallery: [
          'assets/btn/Screenshot 2025-04-25 at 16.07.25.png',
          'assets/btn/Screenshot 2025-04-25 at 16.08.42.png',
          'assets/btn/Screenshot 2025-04-25 at 16.08.59.png',
          'assets/btn/Screenshot 2025-04-25 at 16.09.24.png'
        ]
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
        image: 'assets/hibank/1745218296927.jpg',
        imageAlt: 'Hibank Client Portal System',
        gallery: [
          'assets/hibank/1745218296927.jpg',
          'assets/hibank/1745218296944.jpg',
          'assets/hibank/1745218296962.jpg',
          'assets/hibank/1745218296973.jpg',
          'assets/hibank/1745218296987.jpg',
          'assets/hibank/1745218297004.jpg',
          'assets/hibank/1745218297015.jpg'
        ]
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
        image: 'assets/cimb/c1.png',
        imageAlt: 'CIMB Niaga OCTO Click Revamp',
        gallery: [
          'assets/cimb/c1.png',
          'assets/cimb/c2.png',
          'assets/cimb/c3.png',
          'assets/cimb/c4.png',
          'assets/cimb/c5.png'
        ]
      },
      {
        id: 'project-bni',
        num: '004',
        category: 'TRANSACTIONAL BANKING',
        tag: 'CORPORATE PORTAL',
        title: 'BNI CORPORATE',
        description:
          'Advanced corporate banking web interface developed for Bank Negara Indonesia (BNI) featuring multi-level transaction authorization, liquidity dashboard, bulk payment processing, and corporate treasury management.',
        year: '2024',
        stack: 'React.js • TypeScript • Redux • Tailwind CSS • Secure REST',
        linkText: 'INQUIRE DETAILS',
        linkUrl: '#contact',
        image: 'assets/bni/bni1.JPG',
        imageAlt: 'BNI Corporate Transactional Banking Portal',
        gallery: [
          'assets/bni/bni1.JPG',
          'assets/bni/bni2.JPG',
          'assets/bni/bni3.JPG',
          'assets/bni/bni4.JPG'
        ]
      },
      {
        id: 'project-smartbox',
        num: '005',
        category: 'IOT & LOGISTICS',
        tag: 'MOBILE APPLICATION',
        title: 'SMARTBOX PLATFORM',
        description:
          'Next-generation smart locker and automated parcel delivery ecosystem. Features real-time locker telemetry, QR code authentication, user access governance, and fleet monitoring interfaces.',
        year: '2023 — 2024',
        stack: 'React Native • Flutter • TypeScript • WebSockets • Node.js',
        linkText: 'INQUIRE DETAILS',
        linkUrl: '#contact',
        image: 'assets/smartbox/s1.png',
        imageAlt: 'Smartbox Automated Locker & IoT Platform',
        gallery: [
          'assets/smartbox/s1.png',
          'assets/smartbox/s2.png',
          'assets/smartbox/s3.png',
          'assets/smartbox/s4.png',
          'assets/smartbox/s5.png'
        ]
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
      { name: 'Analisys', size: 125 },
      { name: 'Problem Solver', size: 125 },
      { name: 'Git', size: 120 },
      { name: 'Bootstrap', size: 120 }
    ],

    education: [
      {
        index: '01',
        programTag: 'UNDERGRADUATE DEGREE',
        period: 'FEB 2026 — PRESENT',
        degree: 'COMPUTER SCIENCE',
        school: 'Bina Nusantara University (BINUS Online)',
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

