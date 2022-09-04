import { Layout } from '../../components';
import Link from 'next/link';
import Image from 'next/image';
import { getNft } from '../../helpers';
import { getCollections } from '../../helpers/db'
import { useState, useEffect } from 'react'
import { sample } from 'lodash'
import classnames from 'classnames'

import styles from '../../styles/Home.module.scss'

function Collection({ collection }) {
  const [nft, setNft] = useState(null);

  async function loadCollection() {
    let collectionNft;
    const nft = await getNft(sample(collection.mints).mint)
    if (collection.lookup_type === 'collection') {
      collectionNft = await getNft(collection.id)
    } else {
      if (nft?.collection?.address) {
        collectionNft = await getNft(nft.collection.address)
      }
    }
    if (!collectionNft || collectionNft.name === 'Collection NFT') {
      collectionNft = {
        name: nft.name.split('#')[0].trim(),
        symbol: nft.symbol,
        json: {
          image: nft?.json?.image
        }
      }
    }
    console.log(collectionNft)
    setNft(collectionNft)
  }

  useEffect(loadCollection, [])

  return (
    <Link href={`/collections/${collection.slug}`}>
      <div className={classnames(styles.nft)}>
        <Image src={`https://cdn.magiceden.io/rs:fill:400:400:0:0/plain/${nft?.json?.image}`} height={310} width={310} />
          <h3>{collection.name || nft?.name}</h3>
      </div>
    </Link>
  )
}

export default function Collections({ collections }) {
  return (
    <Layout page="update">
      <div className={classnames(styles.grid)}>
        <h2 className={classnames(styles.pagetitle)}>
          Collections currently protected by CPL
        </h2>
        <div className={classnames(styles.nftswrap)}>
          {
            collections.map(collection => <Collection collection={collection} />)
          }
        </div>
      </div>
    </Layout>
  )
}

export async function getServerSideProps() {
  const collections = await getCollections();

  return {
    props: {
      collections
    }
  }
}