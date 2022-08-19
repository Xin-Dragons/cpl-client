import classnames from 'classnames'
import Image from 'next/image'
import styles from './style.module.scss'

export function Nft({ nft, selected, onClick }) {
  return (
    <div className={classnames(styles.nft, { [styles.nftselected]: selected })} onClick={onClick}>
      <Image
        width={188}
        height={188}
        // placeholder="blur"
        src={`https://cdn.magiceden.io/rs:fill:400:400:0:0/plain/${nft.image}`}
      />
      {
        nft.debt && <div className={styles.debt}>{ nft.debt }</div>
      }
      <h3>{nft.name}</h3>
    </div>
  )
}