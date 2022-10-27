import { Layout, ActivityLog } from '../../components';
import Link from 'next/link';
import { getNft } from '../../helpers';
import { getCollections } from '../../helpers/db'
import { useState, useEffect } from 'react'
import { sample } from 'lodash'
import classnames from 'classnames'
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Pagination from '@mui/material/Pagination';
import axios from 'axios'

import styles from '../../styles/Home.module.scss'

function Collection({ collection }) {
  return (
    <Link href={`/collections/${collection.slug}`}>
      <div className={classnames(styles.nft)}>
        <img src={collection.image} />
          <h3>{collection.name}</h3>
      </div>
    </Link>
  )
}

export default function Collections({ collections: initialCollections, count: initialCount }) {
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(25)
  const [count, setCount] = useState(initialCount)
  const [collections, setCollections] = useState(initialCollections)

  function onFilterChange(e, filter) {
    setFilter(filter)
  }

  async function getCollections() {
    const offset = (page - 1) * limit;
    console.log(limit, offset, filter)
    const { data: { collections = [], count } } = await axios.get('/api/get-collections', { params: { limit, offset, filter } })
    setCollections(collections)
    setCount(count)
  }

  useEffect(() => {
    setPage(1)
  }, [filter])

  useEffect(() => {
    getCollections()
  }, [page, filter, limit])

  return (
    <Layout page="update">
      <div className={classnames(styles.grid)}>
        <h2 className={classnames(styles.pagetitle)}>
          {
            filter === 'active'
              ? 'Collections currently protected by CPL'
              : 'All collections'
          }
        </h2>
        {
          // <Tabs
          //   value={filter}
          //   onChange={onFilterChange}
          // >
          //   <Tab value="all" label="All" />
          //   <Tab value="active" label="Protected" />
          //   <Tab value="inactive" label="Monitored" />
          //   <Tab value="logs" label="Activity stream" />
          // </Tabs>
        }
        {
          filter === 'logs'
            ? <ActivityLog />
            : (
              <>
              <div className={classnames(styles.nftswrap)}>
                {
                  collections.map(collection => <Collection key={collection.id} collection={collection} />)
                }
              </div>
              {
                Math.ceil(count / limit) > 1 && (
                  <Pagination
                    count={Math.ceil(count / limit)}
                    page={page}
                    onChange={(event, value) => setPage(value)}
                  />
                )
              }

              </>
            )
        }

      </div>
    </Layout>
  )
}

export async function getServerSideProps() {
  const { data, count } = await getCollections({ limit: 25, offset: 0, filter: 'all' });
  console.log(data.length)

  return {
    props: {
      collections: data,
      count
    }
  }
}