import classnames from 'classnames'
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react'
import axios from 'axios'
import { getNft } from '../../helpers'
import { Nft, Spinner } from '../'

import styles from './style.module.scss'

export function Nfts({
  nfts,
  selected,
  onNftClick,
  loading,
  collection
}) {

  const router = useRouter();

  function onClick(nft) {
    if (onNftClick) {
      return onNftClick(nft.mint)
    } else {
      router.push(`/collections/${nft.collection.slug}/mint/${nft.mint}`)
    }
  }

  return (

      <div className={classnames(styles.nftswrap)}>
        {
          loading && <div className={styles.spinnerWrapper}><Spinner /></div>
        }
        {
          !!nfts.length
            ? nfts.map(nft => <Nft nft={nft} key={nft.mint} selected={selected.includes(nft.mint)} onClick={() => onClick(nft)} />)
            : <h2>No NFTs found</h2>
        }
      </div>
  )
}