import classnames from 'classnames'
import Pagination from '@mui/material/Pagination';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useState, useEffect } from 'react'
import axios from 'axios'
import { getNft } from '../../helpers'
import { Nft } from '../'

import styles from './style.module.scss'

export function Nfts({ nfts: initialNfts, count: initialCount, toggleModal, collection }) {
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [count, setCount] = useState(initialCount)
  const [limit, setLimit] = useState(20);

  const [nfts, setNfts] = useState(initialNfts)

  useEffect(() => {
    refreshNfts()
  }, [page, filter])

  function onFilterChange(e, newValue) {
    setFilter(newValue)
  }

  function cancel(e) {
    e.preventDefault();
    setSelected([])
  }

  function selectAll(e) {
    e.preventDefault();
    setSelected(nfts.map(n => n.mint))
  }

  const updateNft = mint => nft => {
    setNfts(nfts.map(n => {
      if (mint === n.mint) {
        return nft
      }
      return n
    }))
  }

  async function fetchImages() {
    const promises = nfts.map(async nft => {
      if (nft.image) {
        return nft;
      }
      const n = await getNft(nft.mint);
      return {
        ...nft,
        image: n.json.image
      }
    })

    const fetched = await Promise.all(promises);
    setNfts(fetched)
  }

  useEffect(() => {
    if (nfts.find(nft => !nft.image)) {
      fetchImages()
    }
  }, [nfts])

  async function refreshNfts() {
    const { data: { data, count } } = await axios.post('/api/get-nfts', { filter, limit, offset: (page - 1) * limit, collection: collection.id })
    setNfts(data)
    setCount(count)
  }

  const allSelected = selected.length === nfts.length

  return (
    <div className={classnames(styles.grid)}>
      <Tabs
        value={filter}
        onChange={onFilterChange}
      >
        <Tab value="outstanding" label="To turdify" />
        <Tab value="all" label="All" />
        <Tab value="turds" label="Turds" />
      </Tabs>
      <div className={classnames(styles.nftswrap)}>
        {
          nfts.map(nft => <Nft nft={nft} key={nft.mint} selected={selected.includes(nft.mint)} onClick={() => onNftClick(nft.mint)} setNft={updateNft(nft.mint)} />)
        }
        <Pagination
          count={count / limit}
          page={page}
          onChange={(event, value) => setPage(value)}
        />
        <div className={classnames(styles.nftbtnwrap)}>
          <a href="#" onClick={cancel}>Cancel</a>
          <a href="#" onClick={selectAll}>{allSelected ? 'DESELECT' : 'SELECT'} ALL</a>
          <a href="#" className={classnames(styles.turdify)} onClick={toggleModal}>
            {filter === 'turds' ? 'DETURDIFY SELECTED' : 'TURDIFY SELECTED' }
          </a>
        </div>
      </div>
    </div>
  )
}