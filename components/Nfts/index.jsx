import classnames from 'classnames'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { getNft } from '../../helpers'
import { Nft } from '../'

import styles from './style.module.scss'

export function Nfts({
  nfts,
  selected,
  onNftClick
}) {

  return (

      <div className={classnames(styles.nftswrap)}>
        {
          nfts.map(nft => <Nft nft={nft} key={nft.mint} selected={selected.includes(nft.mint)} onClick={() => onNftClick(nft.mint)} />)
        }
      </div>
  )
}