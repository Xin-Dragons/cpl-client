import classnames from 'classnames'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { getNft } from '../../helpers'
import { Nft, Spinner } from '../'

import styles from './style.module.scss'

export function Nfts({
  nfts,
  selected,
  onNftClick,
  loading
}) {

  return (

      <div className={classnames(styles.nftswrap)}>
        {
          loading && <div className={styles.spinnerWrapper}><Spinner /></div>
        }
        {
          !!nfts.length
            ? nfts.map(nft => <Nft nft={nft} key={nft.mint} selected={selected.includes(nft.mint)} onClick={() => onNftClick(nft.mint)} />)
            : <h2>No NFTs found</h2>
        }
      </div>
  )
}