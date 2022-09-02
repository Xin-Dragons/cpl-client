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

export async function getMints({ collection, limit, offset = 0, filter = 'all', mints }) {
  let query = supabase
    .from('mints')
    .select('*', { count: 'exact' })

  if (collection) {
    query = query.eq('collection', collection);
  }

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

export async function markTransaction({ mint, signature }) {
  const { data, error } = await supabase
    .from('mints')
    .update({
      pending_transaction: signature
    })
    .eq('mint', mint);

  if (error) {
    console.log(error)
    throw new Error('Error marking transaction started')
  }

  return data;
}

export async function restore({ mint, signature }) {
  const { data, error } = await supabase
    .from('mints')
    .select('*')
    .eq('mint', mint)
    .limit(1)
    .single()

  if (error) {
    console.log(error)
    throw new Error('Error looking up mint to restore')
  }

  const { data: metadata } = await axios.get(data.metadata_url);

  await uploadMetadata({ collection: data.collection, publicKey: mint, metadata, filename: 'metadata.json' })
  const { data: update, error: updateError } = await supabase
    .from('mints')
    .update({
      pending_transaction: null,
      turdified: false,
      debt: null
    })
    .eq('mint', mint)

  if (error) {
    console.log(error)
    throw new Error('Error restoring NFT')
  }

  return update;
}

export async function turdify({ mints, collection, publicKey, image }) {
  const promises = mints.map(async nft => {
    const { data: meta } = await axios.get(nft.metadata_url);

    const name = `Turdified ${meta.name}`

    const newMeta = {
      name,
      description: 'This NFT has been masked as it was purchased from a zero fees marketplace. Visit creatorsprotectionleague.io to pay your dues and restore :)',
      image: 'https://fvncezpefoxrbaqqtanr.supabase.co/storage/v1/object/public/assets/default/poop.png',
      attributes: [{
        trait_type: 'Debt',
        value: nft.debt
      }],
      properties: {
        files: [
          {
            uri: nft.metadata_url,
            type: 'text/json'
          }
        ]
      }
    }

    const turdified_metadata_url = await uploadMetadata({ collection, publicKey: nft.mint, metadata: newMeta, filename: 'metadata.json' })

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