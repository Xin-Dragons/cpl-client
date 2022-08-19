import styles from './style.module.scss';

export function Modal({ children, setModalShowing }) {
  return <div className={styles.modalWrapper} onClick={() => setModalShowing(false)}>
    <div className={styles.modal} onClick={e => e.stopPropagation()}>
      { children }
    </div>
  </div>
}