import { createClient } from "@supabase/supabase-js";
import toast from 'react-hot-toast';
import { lamportsToSol, truncate } from "./utils";

const supabase = createClient(process.env.NEXT_PUBLIC_DB_URL, process.env.NEXT_PUBLIC_DB_ACCESS);

function handler(payload) {
  const after = payload.new;

  if (!after.debt && after.royalties_paid) {
    toast.success(`Royalties paid \n\nMint: ${truncate(after.mint)}\nRoyalties ${lamportsToSol(after.royalties_paid)}`, { icon: '👏', position: 'bottom-left' })
  }
}

export async function subscribe() {
  supabase
    .from('sales')
    .on('INSERT', handler)
    .on('UPDATE', handler)
    .subscribe()
}

export async function unsubscribe() {

}