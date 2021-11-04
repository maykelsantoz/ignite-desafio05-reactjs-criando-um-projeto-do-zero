import Link from 'next/link';
import styles from './preview.module.scss';

export function PreviewButton(): JSX.Element {
  return (
    <aside className={styles.buttonContainer}>
      <Link href="/api/exit-preview">
        <a>Sair do modo Preview</a>
      </Link>
    </aside>
  );
}
