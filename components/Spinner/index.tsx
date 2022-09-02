import classnames from 'classnames';
import { FC } from 'react';
import styles from './style.module.scss';

type SpinnerProps = {
  className?: string;
  small?: boolean;
}

export const Spinner: FC<SpinnerProps> = ({ className, small }) => {
  return <div className={classnames(styles.spinner, className, { [styles.small]: small })} />
}

export default Spinner;