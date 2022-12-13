import { FC } from "react";

import styles from './style.module.scss'

export const Burger: FC = ({ open = false, onChange }) => {
  return (
    <div className={styles.burger}>
      <label htmlFor="check">
        <input type="checkbox" id="check" checked={open} onChange={onChange} /> 
        <span></span>
        <span></span>
        <span></span>
      </label>
    </div>
  )
}