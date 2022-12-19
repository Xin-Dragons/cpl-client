import { createClient } from "@supabase/supabase-js";
import { uniqBy } from "lodash";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_DB_URL as string,
  process.env.NEXT_PUBLIC_DB_ACCESS as string,
)

export async function getRpcs() {
  const { data, error } = await supabase
    .from('**rpc-providers')
    .select('url')
  
  if (error) {
    throw new Error('Error looking up RPC hosts')
  }

  return data.map(d => d.url);
}

export async function getCollection({ id, collection, firstVerifiedCreator }: { id?: string, collection?: string, firstVerifiedCreator?: string }) {
  let query = supabase
    .from('collections')
    .select('*')

  if (id) {
    query = query.eq('id', id)
  }

  if (collection) {
    query = query.eq('collection', collection)
  }

  if (firstVerifiedCreator) {
    query = query.eq('first_verified_creator', firstVerifiedCreator)
  }
  const { data, error } = await query
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error('Error looking up collection')
  }

  return data;
}

export async function getCollectionsForWallet({ publicKey }: { publicKey: string }) {
  const { data, error } = await supabase
    .from('sales')
    .select(`
      nfts(
        collection(
          *
        )
      )
    `)
    .eq('buyer', publicKey)

  if (error) {
    console.log(error)
    throw new Error('Error looking up sales for wallet');
  }

  return uniqBy(data.map(item => item.nfts.collection), item => item.id)
}