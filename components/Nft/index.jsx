import { useRouter } from 'next/router';
import Link from 'next/link'
import classnames from 'classnames'
import Image from 'next/image'
import styles from './style.module.scss'

export function Nft({ nft, selected, onClick }) {
  const router = useRouter()
  return (
    <div className={classnames(styles.nft, { [styles.nftselected]: selected })} onClick={onClick}>
      <Image
        width={188}
        height={188}
        // placeholder="blur"
        src={`https://cdn.magiceden.io/rs:fill:400:400:0:0/plain/${nft?.metadata?.image}`}
      />
      <h3>{nft.name}</h3>
      {
        nft.debt && <div className={styles.debt}>Debt: { nft.debt } SOL</div>
      }
      <Link href={`/collection/${nft.collection}/mint/${nft.mint}`}>
        <a>View NFT</a>
      </Link>
    </div>
  )
}