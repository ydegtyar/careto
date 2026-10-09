import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GavelIcon from '@mui/icons-material/Gavel';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PrintIcon from '@mui/icons-material/Print';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import Button from '@mui/material/Button';
import { Link, useNavigate } from '@tanstack/react-router';
import type React from 'react';
import { useEffect, useState } from 'react';
import type { LegalDocumentContent } from './LegalContent';
import styles from './LegalLayout.module.scss';
import { LegalSectionView } from './LegalSectionView';

interface Props {
  document: LegalDocumentContent;
  docType: 'terms' | 'privacy';
}

export const LegalLayout: React.FC<Props> = ({ document, docType }) => {
  const navigate = useNavigate();
  const [activeSectionId, setActiveSectionId] = useState<string>(document.sections[0]?.id ?? '');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 120;
      for (const section of document.sections) {
        const el = window.document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSectionId(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [document.sections]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.container}>
      {/* Header section */}
      <header className={styles.header}>
        <div className={styles.badgeRow}>
          <Button
            size="small"
            variant="text"
            startIcon={<ArrowBackIcon fontSize="small" />}
            onClick={() => navigate({ to: '/' })}
            sx={{ color: '#94a3b8', px: 1, textTransform: 'none' }}
          >
            Back to App
          </Button>

          <span className={styles.pill}>
            {docType === 'terms' ? (
              <GavelIcon sx={{ fontSize: 14 }} />
            ) : (
              <ShieldOutlinedIcon sx={{ fontSize: 14 }} />
            )}
            Legal Software Spec
          </span>

          <span className={styles.meta}>
            Last Updated: <strong>{document.lastUpdated}</strong> • Version {document.version}
          </span>
        </div>

        <h1 className={styles.title}>{document.title}</h1>
        <p className={styles.subtitle}>{document.subtitle}</p>

        <div className={styles.actionsRow}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: '#e2e8f0',
              '&:hover': { borderColor: 'rgba(255, 255, 255, 0.4)' },
              textTransform: 'none',
              borderRadius: '8px',
            }}
          >
            Print / Save PDF
          </Button>

          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/terms" style={{ textDecoration: 'none' }}>
              <Button
                variant={docType === 'terms' ? 'contained' : 'outlined'}
                size="small"
                sx={{
                  textTransform: 'none',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                }}
              >
                Terms of Service
              </Button>
            </Link>
            <Link to="/privacy" style={{ textDecoration: 'none' }}>
              <Button
                variant={docType === 'privacy' ? 'contained' : 'outlined'}
                size="small"
                sx={{
                  textTransform: 'none',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                }}
              >
                Privacy Policy
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* TL;DR Summary Grid */}
      {document.tldrItems && document.tldrItems.length > 0 && (
        <section className={styles.tldrBox} aria-label="Summary Highlights">
          <div className={styles.tldrHeader}>
            <InfoOutlinedIcon sx={{ fontSize: 18 }} />
            <span>TL;DR Key Takeaways & Summary</span>
          </div>

          <div className={styles.tldrGrid}>
            {document.tldrItems.map((item) => (
              <div key={item.title} className={styles.tldrCard}>
                <div className={styles.tldrCardTitle}>{item.title}</div>
                <div className={styles.tldrCardDesc}>{item.desc}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Two column layout with sticky sidebar and article */}
      <div className={styles.layoutGrid}>
        {/* Sticky Table of Contents Sidebar */}
        <aside className={styles.sidebar}>
          <nav className={styles.tocBox} aria-label="Table of Contents">
            <div className={styles.tocTitle}>Table of Contents</div>
            <ul className={styles.tocList}>
              {document.sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className={`${styles.tocLink} ${activeSectionId === s.id ? styles.active : ''}`}
                  >
                    {s.number ? `${s.number} ` : ''}
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content Article */}
        <article className={styles.article}>
          {document.sections.map((section) => (
            <LegalSectionView key={section.id} section={section} />
          ))}
        </article>
      </div>
    </div>
  );
};
