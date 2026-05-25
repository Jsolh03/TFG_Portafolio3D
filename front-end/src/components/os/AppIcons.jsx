import React from 'react';

const wrap = (children) => (
  <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

export const IconTerminal = () => wrap(
  <>
    <rect x="6" y="9" width="36" height="30" rx="3" />
    <path d="M14 21l5 4-5 4" />
    <line x1="22" y1="31" x2="32" y2="31" />
  </>
);

export const IconIDE = () => wrap(
  <>
    <polyline points="18 16 9 24 18 32" />
    <polyline points="30 16 39 24 30 32" />
    <line x1="27" y1="12" x2="21" y2="36" />
  </>
);

export const IconInfo = () => wrap(
  <>
    <circle cx="24" cy="24" r="17" />
    <line x1="24" y1="20" x2="24" y2="31" />
    <line x1="24" y1="15" x2="24" y2="15.5" strokeWidth="3.5" />
  </>
);

export const IconStar = () => wrap(
  <polygon points="24 6 29 18 42 19 32 28 35 41 24 34 13 41 16 28 6 19 19 18" />
);

export const IconDoc = () => wrap(
  <>
    <path d="M13 6h17l8 8v25a3 3 0 0 1-3 3H13a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3z" />
    <polyline points="30 6 30 14 38 14" />
    <line x1="16" y1="22" x2="32" y2="22" />
    <line x1="16" y1="28" x2="32" y2="28" />
    <line x1="16" y1="34" x2="26" y2="34" />
  </>
);

export const IconMail = () => wrap(
  <>
    <rect x="6" y="11" width="36" height="26" rx="3" />
    <polyline points="6 14 24 27 42 14" />
  </>
);

export const IconNotes = () => wrap(
  <>
    <path d="M11 6h23a3 3 0 0 1 3 3v30a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3z" />
    <line x1="13" y1="16" x2="32" y2="16" />
    <line x1="13" y1="23" x2="32" y2="23" />
    <line x1="13" y1="30" x2="25" y2="30" />
    <path d="M34 7l5 5-3 3-5-5z" fill="currentColor" stroke="none" />
  </>
);

export const IconCalc = () => wrap(
  <>
    <rect x="9" y="6" width="30" height="36" rx="3" />
    <rect x="13" y="10" width="22" height="8" />
    <circle cx="16" cy="24" r="1.6" fill="currentColor" />
    <circle cx="24" cy="24" r="1.6" fill="currentColor" />
    <circle cx="32" cy="24" r="1.6" fill="currentColor" />
    <circle cx="16" cy="31" r="1.6" fill="currentColor" />
    <circle cx="24" cy="31" r="1.6" fill="currentColor" />
    <circle cx="32" cy="31" r="1.6" fill="currentColor" />
    <circle cx="16" cy="38" r="1.6" fill="currentColor" />
    <circle cx="24" cy="38" r="1.6" fill="currentColor" />
    <circle cx="32" cy="38" r="1.6" fill="currentColor" />
  </>
);

export const IconClock = () => wrap(
  <>
    <circle cx="24" cy="24" r="17" />
    <polyline points="24 14 24 24 31 28" />
  </>
);

export const IconGallery = () => wrap(
  <>
    <rect x="6" y="9" width="36" height="30" rx="3" />
    <circle cx="17" cy="20" r="3" />
    <polyline points="42 32 31 22 12 39" />
  </>
);

export const IconSnake = () => wrap(
  <>
    <rect x="8" y="20" width="8" height="8" />
    <rect x="16" y="20" width="8" height="8" />
    <rect x="24" y="20" width="8" height="8" />
    <rect x="24" y="12" width="8" height="8" />
    <rect x="32" y="12" width="8" height="8" />
    <circle cx="38" cy="16" r="1.4" fill="currentColor" stroke="none" />
    <rect x="14" y="32" width="4" height="4" fill="currentColor" stroke="none" />
  </>
);

export const IconGithub = () => wrap(
  <>
    <path d="M24 6c-9.94 0-18 8.06-18 18 0 7.95 5.16 14.7 12.32 17.07.9.17 1.23-.39 1.23-.87v-3.06c-5.01 1.09-6.07-2.42-6.07-2.42-.82-2.08-2-2.63-2-2.63-1.64-1.12.12-1.1.12-1.1 1.81.13 2.77 1.86 2.77 1.86 1.61 2.76 4.22 1.96 5.25 1.5.16-1.17.63-1.96 1.15-2.41-3.99-.45-8.19-2-8.19-8.89 0-1.96.7-3.57 1.85-4.83-.19-.45-.8-2.28.17-4.75 0 0 1.51-.48 4.95 1.84a17.1 17.1 0 0 1 9.01 0c3.44-2.32 4.95-1.84 4.95-1.84.97 2.47.36 4.3.17 4.75 1.15 1.26 1.85 2.87 1.85 4.83 0 6.91-4.21 8.43-8.22 8.87.65.56 1.22 1.66 1.22 3.34v4.96c0 .48.33 1.05 1.24.87C36.85 38.7 42 31.95 42 24c0-9.94-8.06-18-18-18z" fill="currentColor" stroke="none" />
  </>
);

export const APP_ICON_MAP = {
  terminal: IconTerminal,
  ide:      IconIDE,
  info:     IconInfo,
  encuesta: IconStar,
  cv:       IconDoc,
  mail:     IconMail,
  notes:    IconNotes,
  calc:     IconCalc,
  clock:    IconClock,
  gallery:  IconGallery,
  snake:    IconSnake,
  github:   IconGithub
};
