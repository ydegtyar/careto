import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import type { LegalSection } from './LegalContent';
import styles from './LegalLayout.module.scss';

export function LegalSectionView({ section }: { section: LegalSection }) {
  return (
    <section key={section.id} id={section.id} className={styles.section}>
      {section.number && <span className={styles.sectionNumber}>Section {section.number}</span>}
      <h2 className={styles.sectionTitle}>{section.title}</h2>

      <div className={styles.sectionBody}>
        {section.content.map((paragraph: string, idx: number) => (
          <p key={`${section.id}-p-${idx}`}>{paragraph}</p>
        ))}

        {section.listItems && section.listItems.length > 0 && (
          <ul>
            {section.listItems.map((item: string, idx: number) => (
              <li key={`${section.id}-item-${idx}`}>{item}</li>
            ))}
          </ul>
        )}

        {section.warningNote && (
          <div className={styles.warningBox}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 700,
                marginBottom: 4,
              }}
            >
              <WarningAmberIcon fontSize="small" />
              <span>Legal Disclaimer & Warning</span>
            </div>
            {section.warningNote}
          </div>
        )}

        {section.infoNote && (
          <div className={styles.infoBox}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 700,
                marginBottom: 4,
              }}
            >
              <InfoOutlinedIcon fontSize="small" />
              <span>Notice</span>
            </div>
            {section.infoNote}
          </div>
        )}
      </div>
    </section>
  );
}
