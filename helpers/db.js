import { createClient } from "@supabase/supabase-js";
import { v4 as uuid } from "uuid";
import axios from 'axios'
import { isUndefined } from 'lodash'
export const supabase = createClient(process.env.DB_URL, process.env.DB_SECRET);

export async function createCollection({ slug, mints, collection, type, publicKey }) {
  const model = await addCollection({ slug, collection, type, publicKey });
  await addMints({ mints, collection })

  return model;
}

export async function addCollection({ slug, collection, type, publicKey }) {
  const { data, error } = await supabase.from('collections').upsert({
    id: collection,
    slug,
    lookup_type: type,
    update_authority: publicKey
  });

  if (error) {
    console.log(error)
    throw new Error(error);
  }

  return data[0];
}

export async function addMints({ mints, collection }) {
  const { data, error } = await supabase
    .from('mints')
    .upsert(mints.map(mint => {
      const number = parseInt(mint.name.split('#')[1])
      return {
        collection,
        mint: mint.mint,
        metadata_url: mint.uri,
        name: mint.name,
        number
      }
    }))

  if (error) {
    console.log(error)
    throw new Error(error)
  }
}

export async function getCollection({ slug, update_authority }) {
  let query = supabase
    .from('collections')
    .select('*')

  if (slug) {
    query = query.eq('slug', slug)
  }

  if (update_authority) {
    query = query.eq('update_authority', update_authority)
  }

  const { data, error } = await query

  if (error) {
    console.log(error)
    throw new Error(error)
  }

  return data[0];
}

export async function getMints({ collection, limit, offset = 0, filter = 'all' }) {
  let query = supabase
    .from('mints')
    .select('*', { count: 'exact' })
    .eq('collection', collection);

  if (limit || offset) {
    query = query.range(offset, offset + limit - 1)
  }

  if (filter === 'all') {
    query = query.order('number')
  } else if (filter === 'turds') {
    query = query.is('turdified', true)
  } else if (filter === 'outstanding') {
    query = query
      .is('turdified', false)
      .not('debt', 'is', null)
  }

  const { data, count, error } = await query

  if (error && error.length) {
    console.log(error)
    throw new Error(error)
  }

  return {
    data,
    count
  };
}

export async function turdify({ mints, collection, publicKey, image }) {
  const promises = mints.map(async nft => {
    const { data: meta } = await axios.get(nft.metadata_url);

    const name = `Turdified ${meta.name}`

    const newMeta = {
      name,
      description: 'This NFT has been turdified as was purchased from a zero fees marketplace. Visit Nawww to pay your dues and deturdify :)',
      image: 'https://fvncezpefoxrbaqqtanr.supabase.co/storage/v1/object/public/assets/default/poop.png',
      attributes: {
        trait_type: 'Debt',
        value: nft.debt
      },
      properties: {
        files: [
          {
            uri: nft.metadata_url,
            type: 'text/json'
          }
        ]
      }
    }

    const turdified_metadata_url = await uploadMetadata({ collection, publicKey: nft.mint, metadata: newMeta, filename: 'turdy.json' })

    await updateNft({ mint: nft.mint, turdified_metadata_url })

    return {
      mint: nft.mint,
      uri: turdified_metadata_url
    }
  })

  const urls = await Promise.all(promises);

  return urls;
}

export async function updateNft({ mint, turdified_metadata_url, turdified }) {
  const updates = {}

  if (turdified_metadata_url) {
    updates.turdified_metadata_url = turdified_metadata_url;
  }

  if (!isUndefined(turdified)) {
    updates.turdified = turdified;
  }

  const { data, error } = await supabase
    .from('mints')
    .update(updates)
    .eq('mint', mint)

  if (error) {
    console.log(error)
    throw new Error(error)
  }
}

export async function uploadMetadata({ collection, publicKey, metadata, filename = 'metadata.json' }) {
  const filepath = `collections/${collection}/${publicKey}/json/${filename}`;
  const { data, error } = await supabase
    .storage
    .from('assets')
    .upload(filepath, JSON.stringify(metadata, null, 2), { upsert: true })

  if (error) {
    console.log(error)
    throw new Error('Error uploading metadata')
  }

  const { publicURL } = await supabase
    .storage
    .from('assets')
    .getPublicUrl(filepath);

  return publicURL;
}