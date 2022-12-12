import { createContext, FC, useContext, useEffect, useState } from 'react'
import axios from 'axios';
import { useRouter } from 'next/router';

const initial = {
  summary: [],
  leaderboard: [],
  collections: [],
  collectionInfo: {},
  mints: [],
  mintSort: '',
  setMintSort: () => {},
  publicKey: null,
  setPublicKey: () => {},
  recentSales: []
}

const DataContext = createContext(initial);

interface Props {
  collection?: string;
}

export const DataProvider: FC<Props> = ({ children, collection: initialCollection, publicKey: initialPublicKey }) => {
  const [collection, setCollection] = useState(initialCollection)
  const [summary, setSummary] = useState([]);
  const [leaderboard, setLeaderboard] = useState<[]>([]);
  const [collections, setCollections] = useState<[]>([]);
  const [publicKey, setPublicKey] = useState<string | null>(initialPublicKey);
  const [mints, setMints] = useState<[]>([])
  const [collectionInfo, setCollectionInfo] = useState<{}>([])
  const [mintLimit, setMintLimit] = useState(20);
  const [mintOffset, setMintOffset] = useState(0);
  const [mintSort, setMintSort] = useState('royalties_paid');
  const [recentSales, setRecentSales] = useState([]);
  const router = useRouter();

  async function fetchData() {
    getSummary();
    getLeaders();
    getCollections();
    getCollectionInfo();
    getMints();
    getRecentSales;
  }

  useEffect(() => {
    const { collection, publicKey  } = router.query;
    setCollection(collection);
    setPublicKey(publicKey);
  }, [router.query])

  useEffect(() => {
    getMints()
  }, [mintSort, mintLimit, mintOffset, publicKey])

  async function getCollectionInfo() {
    if (!collection) {
      return;
    }
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
        limit: 10
      }
    }
    setRecentSales([])
    const { data } = await axios.get('/api/get-recent-sales', options)
    setRecentSales(data)
  }

  useEffect(() => {
    getRecentSales()
    getSummary()
  }, [publicKey])

  async function getMints() {
    if (!collection && !publicKey) {
      return;
    }
    
    const options = {
      params: {
        collection,
        limit: mintLimit,
        offset: mintOffset,
        orderBy: mintSort,
        publicKey
      }
    }
    setMints([])
    const { data } = await axios.get('/api/get-mints', options)
    setMints(data)
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
        limit: 10
      }
    }
    setLeaderboard([])
    const { data } = await axios.get('/api/get-leaderboard', options)
    setLeaderboard(data)
  }

  async function getCollections() {
    if (collection) {
      return;
    }
    const options = {
      params: {
        limit: 10
      }
    }
    const { data } = await axios.get('/api/get-collections', options)
    setCollections(data)
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
      mintSort,
      setMintSort,
      publicKey,
      recentSales
      }}>
      { children }
    </DataContext.Provider>
  )
}

export function useData() {
  return useContext(DataContext)
}