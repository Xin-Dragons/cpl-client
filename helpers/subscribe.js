import { createClient } from "@supabase/supabase-js";
import toast from 'react-hot-toast';

const supabase = createClient(process.env.NEXT_PUBLIC_DB_URL, process.env.NEXT_PUBLIC_DB_ACCESS);

export async function subscribe() {
  supabase
    .from('mints')
    .on('UPDATE', payload => {
      const before = payload.old.debt;
      const after = payload.new.debt;

      if (before === after) {
        return;
      }

      if (before < after) {
        toast(`Debt logged\n\nCollection: ${after.collection}\nDebt: ${after.debt}`, { position: 'bottom-left' })
      }

      if (after < before) {
        toast('debt paid')
      }
    })
    .subscribe()
}

export async function unsubscribe() {

}