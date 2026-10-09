export interface LegalSection {
  id: string;
  number?: string;
  title: string;
  content: string[]; // List of paragraphs (HTML formatted or plain strings)
  listItems?: string[];
  warningNote?: string;
  infoNote?: string;
}

export interface TldrItem {
  title: string;
  desc: string;
}

export interface LegalDocumentContent {
  title: string;
  subtitle: string;
  lastUpdated: string;
  version: string;
  tldrItems: TldrItem[];
  sections: LegalSection[];
}

export const TERMS_OF_SERVICE_CONTENT: LegalDocumentContent = {
  title: 'Terms of Service',
  subtitle: 'Legal terms governing your access to and use of Careto vehicle management software.',
  lastUpdated: 'October 9, 2026',
  version: 'v2.1',
  tldrItems: [
    {
      title: 'Informational Tool Only',
      desc: 'Careto tracks expenses and estimates stats. It does NOT provide professional mechanical, safety, or tax advice.',
    },
    {
      title: 'Provided "AS IS"',
      desc: 'Software and sync are provided without warranty of any kind. Back up your important receipt files.',
    },
    {
      title: 'Limitation of Liability',
      desc: 'Careto and its operators disclaim liability for vehicle damage, data loss, downtime, or reliance errors.',
    },
    {
      title: 'Binding Arbitration',
      desc: 'Disputes are resolved through individual binding arbitration, waiving class action litigation.',
    },
  ],
  sections: [
    {
      id: 'acceptance',
      number: '1.0',
      title: 'Acceptance of Terms',
      content: [
        'By downloading, accessing, browsing, or using the Careto software application ("Application", "Service", "Careto"), including any related web sites, APIs, sync services, or user documentation, you ("User" or "You") agree to be bound strictly by these Terms of Service ("Terms").',
        'If you do not agree to all of these Terms, you are expressly prohibited from using Careto and must immediately cease all use of the Application.',
      ],
    },
    {
      id: 'no-advice-disclaimer',
      number: '2.0',
      title: 'No Automotive, Financial, or Professional Advice Disclaimer',
      content: [
        'Careto is designed exclusively as an personal organizer and telemetry record-keeping tool for car expenses, mileage logs, fuel economy metrics, and service reminders.',
        'Calculations, automated estimates, service schedules, maintenance alerts, efficiency figures, fuel grade suggestions, and tax-deductible expense estimations provided by Careto are generated automatically based on user-entered data and simplified algorithms. They DO NOT constitute:',
      ],
      listItems: [
        'Professional automotive mechanical or repair advice',
        'Vehicle safety inspection, roadworthiness verification, or recall compliance guarantees',
        'Official certified financial, accounting, tax-filing, or audit-proof statements',
        'Engineering or mileage validation required for insurance claims or legal disputes',
      ],
      warningNote:
        'CRITICAL SAFETY WARNING: You remain solely responsible for the physical inspection, mechanical maintenance, safe operation, and legal compliance of your vehicle. Never rely on Careto alerts or calculations as a substitute for certified mechanic inspection or vehicle safety guidelines.',
    },
    {
      id: 'account-local-storage',
      number: '3.0',
      title: 'Local-First Storage, Offline Cache, and Sync Disclaimer',
      content: [
        'Careto utilizes a local-first architecture (including SQLite WASM, IndexedDB, and Web Storage) combined with optional cloud synchronization services. Data entered into Careto resides locally on your browser/device and may synchronize with cloud database servers when connected.',
        'You acknowledge and agree that local browser storage can be cleared, corrupted, or lost due to browser updates, clearing site data, device failure, operating system reset, or uninstallation of the Progressive Web App (PWA).',
        'Careto does not guarantee perpetual storage or automated recovery of locally cached data or uploaded receipt media. You are solely responsible for exporting data backups (via Careto JSON/ZIP export tools) and maintaining duplicate copies of critical financial receipts.',
      ],
    },
    {
      id: 'disclaimer-warranties',
      number: '4.0',
      title: 'Disclaimer of Warranties ("AS IS" & "AS AVAILABLE")',
      content: [
        'TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, CARETO IS PROVIDED STRICTLY ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITH ALL FAULTS AND WITHOUT WARRANTY OF ANY KIND.',
        'CARETO AND ITS OPERATORS, AFFILIATES, OFFICERS, EMPLOYEES, AND LICENSORS EXPRESSLY DISCLAIM ALL WARRANTIES, EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING BUT NOT LIMITED TO:',
      ],
      listItems: [
        'Implied warranties of merchantability, fitness for a particular purpose, and non-infringement',
        'Warranties that Careto will meet your requirements or achieve intended results',
        'Warranties that operation will be uninterrupted, timely, secure, error-free, or compatible with any device or browser update',
        'Warranties as to the accuracy, completeness, or reliability of any data, calculation, telemetry result, or reminder notification',
      ],
    },
    {
      id: 'limitation-liability',
      number: '5.0',
      title: 'Limitation of Liability & Total Cap on Damages',
      content: [
        'TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL CARETO, ITS CREATORS, OPERATORS, CONTRIBUTORS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, CONSEQUENTIAL, INCIDENTAL, SPECIAL, PUNITIVE, OR EXEMPLARY DAMAGES WHATSOEVER, INCLUDING WITHOUT LIMITATION:',
      ],
      listItems: [
        'Damages for loss of profits, revenue, data, goodwill, or business interruption',
        'Vehicle mechanical breakdown, engine damage, tire failure, or collision arising from missed service reminders or inaccurate telemetry logs',
        'Loss of uploaded receipt images, corrupted database tables, or failed cloud synchronization',
        'Unauthorized access to, alteration of, or failure to store your vehicle records or account data',
      ],
      warningNote:
        'MAXIMUM LIABILITY CAP: Under no circumstances shall Careto’s total aggregate liability arising out of or related to these Terms or your use of the Application exceed the total amount actually paid by you to Careto in the twelve (12) months preceding the claim, or $0 USD if you use the free tier.',
    },
    {
      id: 'indemnification',
      number: '6.0',
      title: 'Indemnification',
      content: [
        'You agree to defend, indemnify, and hold harmless Careto, its operators, officers, developers, and service providers from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable legal and attorneys\' fees) arising out of or relating to:',
      ],
      listItems: [
        'Your violation of these Terms of Service or applicable laws',
        'Your use or misuse of Careto, including reliance on any maintenance alerts, calculations, or exported data',
        'Any third-party claim alleging that your vehicle data, receipt uploads, or content infringes third-party intellectual property or privacy rights',
      ],
    },
    {
      id: 'user-conduct',
      number: '7.0',
      title: 'Acceptable Use & Prohibited Conduct',
      content: [
        'You agree to use Careto only for lawful purposes in accordance with these Terms. You shall not:',
      ],
      listItems: [
        'Attempt to reverse engineer, decompile, or extract source code from Careto except as permitted by open-source licenses',
        'Upload fraudulent, malicious, or illegally obtained receipt images, malware, or harmful executable scripts',
        'Interfere with or disrupt cloud database APIs, background workers, or infrastructure powering Careto',
        'Use Careto to engage in fraudulent tax reporting or illegal vehicle odometer tampering',
      ],
    },
    {
      id: 'dispute-resolution',
      number: '8.0',
      title: 'Binding Individual Arbitration & Class Action Waiver',
      content: [
        'PLEASE READ THIS SECTION CAREFULLY. IT AFFECTS YOUR LEGAL RIGHTS, INCLUDING YOUR RIGHT TO FILE A LAWSUIT IN COURT.',
        'You and Careto agree that any dispute, claim, or controversy arising out of or relating to these Terms, Careto, or your use of the Application shall be settled through binding individual arbitration rather than in court.',
        'YOU AGREE THAT YOU MAY BRING CLAIMS AGAINST CARETO ONLY IN YOUR INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS, CONSOLIDATED, OR REPRESENTATIVE PROCEEDING.',
      ],
    },
    {
      id: 'changes-terms',
      number: '9.0',
      title: 'Modifications to Terms & Termination',
      content: [
        'Careto reserves the right to revise, update, or modify these Terms at any time. Changes become effective immediately upon publication within the Application or on the official website.',
        'Your continued use of Careto following the posting of updated Terms constitutes your explicit acceptance of the changes.',
        'Careto reserves the right to suspend or terminate your access to cloud sync or services at any time, with or without cause or notice.',
      ],
    },
  ],
};

export const PRIVACY_POLICY_CONTENT: LegalDocumentContent = {
  title: 'Privacy Policy',
  subtitle: 'How Careto collects, stores, processes, and protects your vehicle and personal data.',
  lastUpdated: 'October 9, 2026',
  version: 'v2.1',
  tldrItems: [
    {
      title: 'Local-First Privacy',
      desc: 'Your vehicle logs, mileage, and receipts stay on your device first via SQLite WASM.',
    },
    {
      title: 'Zero Data Sales',
      desc: 'We never sell, rent, monetize, or broker your personal or telemetry data to third parties.',
    },
    {
      title: 'Optional Cloud Sync',
      desc: 'Cloud sync uses encrypted transport to safely mirror data across your devices.',
    },
    {
      title: 'Full User Control',
      desc: 'You can export all data in ZIP/JSON format or purge local and server data at any time.',
    },
  ],
  sections: [
    {
      id: 'privacy-overview',
      number: '1.0',
      title: 'Privacy Overview & Principles',
      content: [
        'Careto is built around a "Privacy and Local-First" philosophy. We believe your vehicle expenses, location notes, receipt images, and driving habits belong to you.',
        'This Privacy Policy explains what information Careto collects, how it is stored locally on your device and synchronized to the cloud, and your rights regarding data access, export, and deletion.',
      ],
    },
    {
      id: 'data-collected',
      number: '2.0',
      title: 'Information We Collect',
      content: [
        'Depending on how you use Careto (offline local mode vs. cloud synced account), we collect the following categories of data:',
      ],
      listItems: [
        'Account Credentials: Email address and hashed passwords (or magic-link tokens) managed securely via Better-Auth.',
        'Vehicle & Expense Telemetry: Vehicle specifications (make, model, year, VIN), fuel logs, maintenance entries, cost amounts, odometer readings, and custom reminders.',
        'Receipt Attachments: Compressed receipt images uploaded directly to secure storage.',
        'Technical & Device Data: Browser type, operating system, PWA status, and local storage state required for synchronization.',
      ],
    },
    {
      id: 'data-storage-sync',
      number: '3.0',
      title: 'Local Storage, Cloud Sync & Architecture',
      content: [
        'Careto uses WebAssembly SQLite (SQLite WASM) and IndexedDB to store your records locally inside your browser sandbox.',
        'When signed in, Careto synchronizes changes between your local database and serverless database infrastructure (Neon) using hybrid logical clocks (HLC) for conflict resolution.',
        'Receipt images are compressed client-side before transmission to minimize storage footprint and transmission risks.',
      ],
      infoNote:
        'Offline Isolation: When using Careto in guest or offline mode, your data never leaves your browser cache unless you choose to create an account or export a ZIP backup.',
    },
    {
      id: 'use-of-data',
      number: '4.0',
      title: 'How We Use Your Data',
      content: [
        'We use collected data strictly for providing and improving the Careto experience. Specifically:',
      ],
      listItems: [
        'To calculate total cost of ownership (TCO), fuel efficiency, and expense telemetry analytics',
        'To send service and maintenance push notifications when enabled by you',
        'To synchronize vehicle records across your registered smartphones, tablets, and desktop browsers',
        'To diagnose sync conflicts, performance bottlenecks, or database migration issues',
      ],
    },
    {
      id: 'data-sharing-third-parties',
      number: '5.0',
      title: 'Third-Party Services & Zero Data Sale Guarantee',
      content: [
        'WE DO NOT SELL, RENT, SHARE, OR TRADE YOUR PERSONAL OR VEHICLE DATA WITH ADVERTISERS, DATA BROKERS, OR UNRELATED THIRD PARTIES.',
        'We only share data with essential infrastructure service providers necessary to operate the Application:',
      ],
      listItems: [
        'Cloud Database Providers: Neon Serverless Postgres for cloud account database sync.',
        'Authentication Services: Better-Auth infrastructure for credential verification and magic link dispatch.',
        'Push Services: WebPush API and browser notification dispatchers for user-requested maintenance alerts.',
      ],
    },
    {
      id: 'data-security',
      number: '6.0',
      title: 'Data Security & Transmission Disclaimers',
      content: [
        'We implement industry-standard administrative, technical, and physical security measures, including HTTPS TLS encryption in transit and hashed credential storage.',
        'However, no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to protect your data, Careto cannot guarantee absolute security against unauthorized interception, hardware exploits, or zero-day browser vulnerabilities.',
      ],
    },
    {
      id: 'user-rights-gdpr-ccpa',
      number: '7.0',
      title: 'Your Data Rights (GDPR, CCPA & Global Rights)',
      content: [
        'Regardless of your jurisdiction, Careto provides robust self-service tools for data sovereignty:',
      ],
      listItems: [
        'Right to Access & Export: You can download a complete ZIP archive containing all your database entries and receipt images anytime via Settings > Backup & Export.',
        'Right to Erasure / Deletion: You can wipe local database storage or request account deletion via Settings > Danger Zone.',
        'Right to Rectification: All logged entries and vehicle details can be modified or updated directly in the app UI.',
      ],
    },
    {
      id: 'cookies-localstorage',
      number: '8.0',
      title: 'Cookies and Browser Local Storage',
      content: [
        'Careto does not use third-party tracking cookies or advertising pixels.',
        'We use standard HTML5 LocalStorage, SessionStorage, and IndexedDB exclusively to store session tokens, theme preferences, active vehicle IDs, and cached database records.',
      ],
    },
    {
      id: 'contact-us',
      number: '9.0',
      title: 'Contact Information & Inquiries',
      content: [
        'If you have questions, privacy concerns, or data requests regarding this Privacy Policy or Careto, please contact our legal and privacy team at:',
        'Email: privacy@careto.app',
      ],
    },
  ],
};
