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

export async function activateCollection({ collection, mints, publicKey }) {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('id', collection)
    .limit(1)
    .single();

  if (error) {
    throw new Error('Error looking up collection')
  }

  if (data.update_authority !== publicKey) {
    throw new Error('Update authority mismatch');
  }

  const { data: mintsLookup, error: mintsError } = await supabase
    .from('mints')
    .select('*')
    .eq('collection', collection)

  if (mintsError) {
    throw new Error('Error looking up mints');
  }

  const updates = mints
    .filter(mint => !mintsLookup.find(m => m.mint === mint.mint))
    .map(mint => {
      const number = parseInt(mint.name.split('#')[1])
      return {
        collection,
        mint: mint.mint,
        metadata_url: mint.uri,
        name: mint.name,
        number
      }
    })

  const { data: update, error: updateError } = await supabase
    .from('mints')
    .upsert(updates)

  if (updateError) {
    console.log(updateError)
    throw new Error('Error adding mints to collection');
  }

  const { data: collectionUpdate, error: collectionUpdateError } = await supabase
    .from('collections')
    .update({ active: true })
    .eq('id', collection)

  if (collectionUpdateError) {
    throw new Error('Error activating collection')
  }
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
    .select('*, images(uri)')

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

export async function getAllMints() {
  const { data, error } = await supabase
    .from('mints')
    .select('*, collection(slug)')

  if (error) {
    throw new Error('Error getting mints')
  }

  return data;
}

export async function getMints({ collection, limit, offset = 0, filter = 'all', mints, onlyMints }) {
  let query = supabase
    .from('mints')
    .select('*, collection(id, slug)', { count: 'exact' })

  if (collection) {
    query = query.eq('collection', collection);
  }

  if (limit || offset) {
    query = query.range(offset, offset + limit - 1)
  }

  if (filter === 'all') {
    query = query.order('number')
  } else if (filter === 'restore') {
    query = query.is('turdified', true)
  } else if (filter === 'sold') {
    query = query
      .is('turdified', false)
      .not('debt', 'is', null)
  } else if (filter === 'listed') {
    query = query
      .is('listed', true)
      .is('debt', null)
  } else if (filter === 'active') {
    query = query.is('collection.active', true)
  }

  const { data, count, error } = await query

  if (error && error.length) {
    console.log(error)
    throw new Error(error)
  }

  if (onlyMints) {
    return data.map(item => item.mint)
  }

  return {
    data,
    count
  };
}

export async function markDelisted({ collection, mints }) {
  const { data, error } = await supabase
    .from('mints')
    .update({
      listed: false
    })
    .eq('collection', collection)
    .in('mint', mints)

  if (error) {
    throw new Error(error)
  }

  return data;
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

export async function saveImage({ image, collection }) {
  const { data, error } = await supabase
    .from('images')
    .insert({ uri: image, collection })

  if (error) {
    throw new Error('Error saving uploaded image');
  }
}

export async function getNonce({ mint }) {
  const { data, error } = await supabase
    .from('nonce_accounts')
    .select('*')
    .eq('mint', mint)

  if (error) {
    throw new Error('Error looking up nonce account for mint')
  }

  return data && data[0];
}

export async function addNonce({ mint, public_key, nonce_account_auth }) {
  const { data, error } = await supabase
    .from('nonce_accounts')
    .insert({
      mint,
      public_key,
      nonce_account_auth
    })

  if (error) {
    throw new Error('Error adding nonce account')
  }

  const { data: mintTxn, error: mintError } = await supabase
    .from('mints')
    .update({
      nonce_account: public_key
    })
    .eq('mint', mint)

  if (mintError) {
    throw new Error('Error updating nonce account on mint')
  }
}

export async function debtPaid({ mint, signature, publicKey }) {
  const { data, error } = await supabase
    .from('mints')
    .update({ debt: null })
    .eq('mint', mint);

  if (error) {
    console.log(error)
    throw new Error('Error marking debt paid')
  }

  const { data: log, error: logError } = await supabase
    .from('log')
    .insert({
      sig: signature,
      mint,
      type: 'debt-repayment',
      public_key: publicKey
    })

  if (logError) {
    throw new Error('Error logging debt paid')
  }
}

export async function markRestored({ mint }) {
  const { data, error } = await supabase
    .from('mints')
    .update({ turdified: false, restore_txn: null, debt: null })
    .eq('mint', mint);

  if (error) {
    throw new Error('Error marking NFT updated')
  }
}

export async function getPrograms() {
  const { data, error } = await supabase
    .from('programs')
    .select('*')

  if (error) {
    throw new Error('Error looking up programs')
  }

  return data;
}

export async function dismissDebt({ mint }) {
  const { data, error } = await supabase
    .from('mints')
    .update({ debt:  null })
    .eq('mint', mint)

  if (error) {
    throw new Error('Error dismissing debt')
  }

  return data;
}

export async function getCollectionByMint({ mint }) {
  const { data, error } = await supabase
    .from('mints')
    .select('collection(*)')
    .eq('mint', mint)
    .limit(1)
    .single();

  if (error) {
    throw new Error('Unable to find mint')
  }

  return data.collection;
}

export async function getMint({ mint, collection }) {
  let query = supabase
    .from('mints')
    .select('*, collection(*)')
    .eq('mint', mint)
    .limit(1)
    .single()

  if (collection) {
    query = query.eq('collection', collection)
  }

  const { data, error } = await query;

  if (error) {
    console.log(error)
    throw new Error('Error looking up mint')
  }

  return data
}

export async function turdify({ mints, collection, publicKey, imagePath, type }) {
  const promises = mints.map(async mint => {
    const item = await getMint({ mint, collection });
    const { data: meta } = await axios.get(item.metadata_url);

    if (type === 'mark') {
      meta.attributes.push({
        trait_type: 'CPL Debt',
        value: item.debt
      })
    } else {
      meta.name = `Tainted ${meta.name}`;
      meta.description = 'This NFT has been masked as it was purchased from a zero fees marketplace. Visit cpl.wtf to pay your dues and restore :)';
      meta.image = 'https://fvncezpefoxrbaqqtanr.supabase.co/storage/v1/object/public/assets/default/poop.png';
      meta.attributes = [{
        trait_type: 'CPL Debt',
        value: item.debt
      }]
      meta.properties = {
        files: [
          {
            uri: item.metadata_url,
            type: 'text/json'
          }
        ]
      }
    }

    const turdified_metadata_url = await uploadMetadata({ collection, publicKey: item.mint, metadata: meta, filename: 'metadata.json' })

    await updateNft({ mint, turdified_metadata_url })

    return {
      mint,
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

export async function getCollections({ limit = 25, offset = 0, filter } = {}) {
  let query = supabase
    .from('collections')
    .select(`
      *,
      mints (mint)
    `, { count: 'exact' })
    .range(offset, offset + limit - 1)

  if (filter === 'active') {
    query = query.is('active', true)
  } else if (filter === 'inactive') {
    query = query.not('active', 'is', true)
  }

  const { data, count, error } = await query;

  if (error) {
    console.log(error)
    throw new Error('Error looking up collections')
  }

  return { count, data };
}

export async function getLogs({ limit, offset, filter, collection }) {
  let query = supabase
    .from('log')
    .select(`
      *,
      mint!inner(mint, collection, collection(slug))
    `, { count: 'exact' })
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false })

  if (filter !== 'all') {
    query = query.eq('type', filter)
  }

  if (collection) {
    query = query.filter('mint.collection', 'eq', collection)
  }

  const { data, count, error } = await query;

  if (error) {
    throw new Error('Unable to lookup logs')
  }

  return {
    logs: data,
    count
  }
}

export async function updateMeta({ items, collection }) {
  const { data: mints, error: mintError } = await supabase
    .from('mints')
    .select('*')
    .eq('collection', collection)
    .in('mint', items.map(item => item.mint));

  if (mintError) {
    throw new Error('Error looking up mints to update')
  }

  const updates = mints.map(item => {
    const turdified_metadata_url = items.find(i => i.mint === item.mint).uri;
    return {
      ...item,
      turdified_metadata_url
    }
  })

  const { data, error } = await supabase
    .from('mints')
    .upsert(updates)
    .eq('collection', collection);

  if (error) {
    console.log(error)
    throw new Error('Error saving restore txn')
  }
}

export async function updateRestoreTxns({ items, collection }) {
  const { data: mints, error: mintError } = await supabase
    .from('mints')
    .select('*')
    .eq('collection', collection)
    .in('mint', items.map(item => item.mint));

  if (mintError) {
    throw new Error('Error looking up mints to update')
  }

  const updates = mints.map(item => {
    const restore_txn = items.find(i => i.mint === item.mint).restore_txn;
    return {
      ...item,
      restore_txn
    }
  })

  const { data, error } = await supabase
    .from('mints')
    .upsert(updates)
    .eq('collection', collection);

  if (error) {
    console.log(error)
    throw new Error('Error saving restore txn')
  }
}

export async function upload({ file, collection }) {
  const path = `uploads/${collection}/${file.originalname}`;
  const { data, error } = await supabase.storage
    .from('assets')
    .upload(path, file.buffer, { upsert: true, contentType: file.mimetype, cacheControl: '1' });

  if (error) {
    throw new Error('Error uploading')
  }

  const { publicURL, error: err } = supabase
    .storage
    .from('assets')
    .getPublicUrl(path)

  return publicURL
}

export async function getRpcUrls() {
  const { data, error } = await supabase
    .from('rpc_urls')
    .select('*')
    .is('active', true)

  if (error) {
    throw new Error('Error looking up RPC URLS')
  }

  return data.map(d => d.url)
}