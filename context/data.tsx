import { createContext, FC, useContext, useEffect, useState } from 'react'
import axios from 'axios';
import { useRouter } from 'next/router';
import { getCollectionsForWallet } from '../helpers/db';

const initial = {
  summary: [],
  leaderboard: [],
  collections: [],
  collectionInfo: {},
  mints: [],
  sort: '',
  setSort: () => {},
  publicKey: null,
  setPublicKey: () => {},
  recentSales: [],
  page: 1,
  setPage: () => {}
}

const DataContext = createContext(initial);

interface Props {
  collection?: string;
}

export const DataProvider: FC<Props> = ({ children, collection: initialCollection, publicKey: initialPublicKey }) => {
  const [collection, setCollection] = useState(initialCollection)
  const [allCollections, setAllCollections] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [recentSalesLoading, setRecentSalesLoading] = useState(false);
  const [mintsLoading, setMintsLoading] = useState(false);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [allCollectionsLoading, setAllCollectionsLoading] = useState(false);
  const [summary, setSummary] = useState([]);
  const [leaderboard, setLeaderboard] = useState<[]>([]);
  const [collections, setCollections] = useState<[]>([]);
  const [publicKey, setPublicKey] = useState<string | null>(initialPublicKey);
  const [collectionFilter, setCollectionFilter] = useState('all');
  const [collectionsForWallet, setCollectionsForWallet] = useState([])
  const [mints, setMints] = useState<[]>([])
  const [collectionInfo, setCollectionInfo] = useState<{}>([])
  const [limit, setLimit] = useState(20);
  const [sort, setSort] = useState('royalties_paid');
  const [recentSales, setRecentSales] = useState([]);
  const [page, setPage] = useState(1);
  const router = useRouter();

  async function fetchData() {
    getSummary();
    getLeaders();
    getCollections();
    getCollectionInfo();
    getMints();
    getRecentSales();
    getAllCollections()
  }

  async function getAllCollections() {
    setAllCollectionsLoading(true)
    const { data } = await axios.get('/api/get-all-collections')
    setAllCollections(data)
    setAllCollectionsLoading(false);
  }

  useEffect(() => {
    const { collection, publicKey  } = router.query;
    setCollection(collection);
    setPublicKey(publicKey);
    setPage(1)
    setLimit(20)
    setSort('royalties_paid')
  }, [router.query])

  useEffect(() => {
    getMints()
    getCollections()
  }, [sort, limit, page, publicKey, collectionFilter])

  async function getCollectionInfo() {
    const options = {
      params: {
        collection
      }
    }
    setCollectionInfo({})
    const { data } = await axios.get('/api/get-collection-info', options)
    setCollectionInfo(data)
  }

  async function getRecentSales() {
    if (!publicKey) {
      return;
    }
    const options = {
      params: {
        publicKey,
        limit: 20
      }
    }
    setRecentSalesLoading(true)
    setRecentSales([])
    const { data } = await axios.get('/api/get-recent-sales', options)
    setRecentSales(data)
    setRecentSalesLoading(false)
  }

  async function updateCollectionsForWallet() {
    if (publicKey) {
      const collections = await getCollectionsForWallet({ publicKey })
      setCollectionsForWallet(collections)
    } else {
      setCollectionsForWallet([])
    }
  }

  useEffect(() => {
    getRecentSales()
    getSummary()
    updateCollectionsForWallet()
  }, [publicKey])

  async function getMints() {
    if (!collection && !publicKey) {
      return;
    }

    setMintsLoading(true)
    
    const options = {
      params: {
        collection,
        limit,
        page,
        orderBy: sort,
        publicKey,
        collectionFilter: collectionFilter === 'all' ? null : collectionFilter
      }
    }
    setMints([])
    const { data } = await axios.get('/api/get-mints', options)
    setMints(data)
    setMintsLoading(false)
  }

  async function getSummary() {
    const options = {
      params: {
        collection,
        publicKey
      }
    }
    setSummary({})
    const { data } = await axios.get('/api/get-summary', options)
    setSummary(data)
  }

  async function getLeaders() {
    const options = {
      params: {
        collection,
        limit: 20
      }
    }
    setLeaderboardLoading(true)
    setLeaderboard([])
    const { data } = await axios.get('/api/get-leaderboard', options)
    setLeaderboard(data)
    setLeaderboardLoading(false)
  }

  async function getCollections() {
    if (collection) {
      return;
    }
    const options = {
      params: {
        limit,
        page
      }
    }
    setCollectionsLoading(true)
    const { data } = await axios.get('/api/get-collections', options)
    setCollections(data)
    setCollectionsLoading(false)
  }

  useEffect(() => {
    fetchData();
  }, [collection])

  return (
    <DataContext.Provider value={{
      summary,
      leaderboard,
      collections,
      mints,
      collectionInfo,
      sort,
      setSort,
      publicKey,
      recentSales,
      page,
      limit,
      fetchData,
      setPage,
      mintsLoading,
      collectionsLoading,
      allCollections,
      allCollectionsLoading,
      leaderboardLoading,
      recentSalesLoading,
      collectionFilter,
      setCollectionFilter,
      collectionsForWallet
      }}>
      { children }
    </DataContext.Provider>
  )
}

export function useData() {
  return useContext(DataContext)
}