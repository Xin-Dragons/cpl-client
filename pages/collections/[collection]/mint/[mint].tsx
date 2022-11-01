import { useState, useEffect } from 'react';
import classnames from 'classnames';
import { getMint, getPrograms } from '../../../../helpers/db'
import { Layout, ActivityLog } from '../../../../components';
import { findKey, pick, intersection } from 'lodash';
import { getNft, formatDate, truncate, getDebtRepaymentTransaction, getRestoreTxn, clearNonce, signMessage } from '../../../../helpers';
import { getMintHistory, getMarketplaces } from '../../../../helpers/hyperspace';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import toast from 'react-hot-toast';
import axios from 'axios'

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

import styles from '../../../../styles/Home.module.scss'

export default function Mint({ mint, history, mps }) {
  console.log(mps)
  const [nft, setNft] = useState(null);
  const { connection } = useConnection()
  const wallet = useWallet()
  const [activity, setActivity] = useState([]);
  const [mostRecentAction, setMostRecentAction] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (wallet.connected && wallet.publicKey && wallet.publicKey.toString() === mint.collection.update_authority) {
      setIsAdmin(true)
    } else {
      setIsAdmin(false)
    }
  }, [wallet.connected, wallet.publicKey])

  // async function getTransactions() {
  //   const sigs = await connection.getSignaturesForAddress(new PublicKey(mint.mint))
  //
  //   const promises = sigs.map(async sig => {
  //     const txn = await connection.getTransaction(sig.signature);
  //
  //     if (txn.meta.err) {
  //       return null;
  //     }
  //
  //     let programName;
  //     let type;
  //     programs.forEach(program => {
  //
  //       const key = findKey(
  //         pick(program, 'purchase_log', 'listing_log', 'delisting_log', 'swap_log', 'cancel_bid_log', 'bid_log'),
  //         message => txn.meta.logMessages.includes(message)
  //       )
  //
  //       if (key) {
  //         programName = program.name;
  //         type = key;
  //       }
  //     });
  //
  //     if (!type) {
  //       const transfers = [
  //         'Program log: Instruction: TransferChecked',
  //         'Program log: Instruction: Transfer'
  //       ]
  //       if (txn.meta.logMessages.includes('Program log: Instruction: MintTo')) {
  //         type = 'mint'
  //       } else if (txn.meta.logMessages.includes('Program log: Transferring swapped item from escrow to taker...')) {
  //         type = 'swap';
  //         programName = 'FoxySwap';
  //       } else if (txn.meta.logMessages.includes('Program log: Assign the bitch tax account to the Alpha Art program')) {
  //         type = 'bitch_tax'
  //       } else if (txn.meta.logMessages.includes('Program log: Instruction: Degods Create Account')) {
  //         type = 'create_degods_account';
  //       } else if (txn.meta.logMessages.includes('Program log: add to bank whitelist')) {
  //         type = 'add_to_whitelist';
  //       } else if (txn.meta.logMessages.includes('Program log: Instruction: WhitelistMint')) {
  //         type = 'add_to_whitelist';
  //       } else if (txn.meta.logMessages.includes('Program log: stake')) {
  //         type = 'stake';
  //       } else if (txn.meta.logMessages.includes('Program log: unstake')) {
  //         type = 'unstake';
  //       } else if (intersection(txn.meta.logMessages, transfers).length) {
  //         type = 'transfer';
  //       } else if (txn.meta.logMessages.includes('Program log: Initialize the associated token account')) {
  //         type = 'create_account'
  //       } else {
  //         type = 'unknown'
  //       }
  //     }
  //
  //     if (type) {
  //       const types = {
  //         purchase_log: 'Purchased',
  //         bid_log: 'Bid placed',
  //         cancel_bid_log: 'Bid cancelled',
  //         listing_log: 'Listed',
  //         delisting_log: 'Delisted',
  //         swap_log: 'Swapped',
  //         transfer: 'Transfer',
  //         mint: 'Mint',
  //         create_account: 'Create account',
  //         bitch_tax: 'Pay Paper Hand Bitch Tax',
  //         create_degods_account: 'Create DeGods account',
  //         add_to_whitelist: 'Added to whitelist',
  //         unknown: 'Unknown action, check txn',
  //         stake: 'Staked',
  //         swap: 'Swapped',
  //         unstake: 'Unstaked'
  //       }
  //
  //       const activity = programName
  //         ? `${types[type]} on ${programName}`
  //         : types[type]
  //       return {
  //         id: sig.signature,
  //         activity,
  //         type,
  //         programName,
  //         blockTime: txn.blockTime,
  //         time: formatDate(new Date(txn?.blockTime * 1000))
  //       }
  //     }
  //
  //     return {
  //       id: sig.signature
  //     }
  //   })

    // const activity = (await Promise.all(promises)).filter(Boolean)
    // setActivity(activity);
  // }

  // useEffect(() => {
  //   if (activity.length) {
  //     const actions = [
  //       'Listed on Yawww',
  //       'Delisted on Yawww',
  //       'Purchased on Yawww',
  //       'Purchased on Magic Eden',
  //       'Swapped on Foxy Swap',
  //       'Transfer',
  //       'Listed on Magic Eden',
  //       'Unknown action, check txn'
  //     ];
  //     const mostRecentAction = activity.find(item => actions.includes(item.activity))
  //
  //     setMostRecentAction(mostRecentAction.activity)
  //   }
  // }, [activity])

  // useEffect(() => {
  //   if (nft) {
  //     getTransactions()
  //   }
  // }, [nft])

  async function updateNft() {
    const nft = await getNft(mint.mint)
    setNft(nft);
  }

  useEffect(() => {
    updateNft()
  }, [])

  async function restore() {
    try {
      if (mint.debt) {
        const tx = await getDebtRepaymentTransaction({ nft, publicKey: wallet.publicKey, debt: mint.debt })
        toast('Approve debt repayment transaction')
        const signedTransaction = await wallet.signTransaction(tx);

        const debtSig = await connection.sendRawTransaction(signedTransaction.serialize())

        const debtPromise = connection.confirmTransaction(debtSig);

        toast.promise(debtPromise, {
          loading: 'Confirming debt repayment transaction',
          success: 'Confirmed',
          error: 'Error confirming, please try again',
        });

        await debtPromise;

        await axios.post('/api/debt-paid', { mint: mint.mint, signature: debtSig, publicKey: wallet.publicKey.toString() });
      }

      const restoreTxn = await getRestoreTxn({ mint })
      const restoreSig = await connection.sendRawTransaction(restoreTxn.serialize());

      const restorePromise = connection.confirmTransaction(restoreSig);

      toast.promise(restorePromise, {
        loading: 'Confirming metadata restore transaction',
        success: 'Confirmed',
        error: 'Error confirming, please try again',
      });

      await restorePromise;

      await axios.post('/api/mark-restored', { mint: mint.mint });

      window.location.reload()

    } catch (err) {
      if (err.message.includes('Blockhash not found')) {
        // await clearNonce({ mint: mint.mint });
      }
    }
  }

  async function dismiss() {
    try {
      const signedMessage = await signMessage(wallet);
      const params = {
        signedMessage,
        mint: mint.mint
      }
      await axios.post('/api/dismiss-debt', params)
      toast.success('Debt dismissed');
      window.location.reload();

    } catch (err) {
      toast.error('Error dismissing debt, see console for more details')
      console.error(err);
    }
  }

  const debt = nft && nft.json.attributes.find(att => att.trait_type === 'CPL Debt');

  return (
    <Layout page="update">
      <div className={classnames(styles.grid)}>
        <h2 className={classnames(styles.pagetitle)}>{ nft ? nft.name || nft.json.name : 'Loading'}</h2>
        <div className={classnames(styles.nftswrap, styles.mint)}>
          {
            nft && (
              <div className={styles.nftinner}>
                <div className={styles.shrink}>
                  <img src={nft.json.image} style={{display: 'block', width: '100%'}} />
                  {
                    debt
                      ? (
                        <>
                          <h3>Outstanding CPL Debt attribibute detected</h3>
                          <pre>{JSON.stringify(debt, null, 2)}</pre>
                        </>
                      )
                      : (
                        mint.debt
                          ? (
                            <>
                              <h2>Unpaid royalties: {mint.debt} SOL</h2>
                              <>
                                <p>This item was purchased avoiding creator royalties.
                                If you are the project owner you can update the meta
                                to log the outstanding debt as a new trait: &quot;CPL Debt&quot;</p>

                                <p>This property can be used internally to limit access
                                to certain featured or functionality.</p>

                                <p>Alternatively you can choose to update the image and
                                metadata until the outstanding creator royalties are paid.</p>
                              </>

                            </>
                          )
                          : (
                            <>
                              <h2>No debt property has been added</h2>
                              <p>We advise you check the transaction history
                              carefully before updating any details on this NFT</p>
                            </>
                          )
                      )
                  }
                  {
                    mint.restore_txn && <button onClick={restore}>Restore</button>
                  }

                  {
                    isAdmin && mint.debt && (
                      <button onClick={dismiss}>Dismiss debt</button>
                    )
                  }

                </div>
                <div className={styles.grow}>
                  <h3>Marketplace activity</h3>
                  <Table>
                    <TableBody>
                      {
                        history.map(item => (
                          <TableRow key={item.id} className={classnames({ [styles.royaltyAvoided]: item.signature === mint.last_sale_transaction && mint.debt })}>
                            <TableCell>
                              <a className={styles.pink} href={`https://solscan.io/tx/${item.signature}`} target="_blank" rel="noreferrer">{truncate(item.signature)}</a>
                            </TableCell>
                            <TableCell>
                              {mps.find(m => m.marketplace_program_id === item.marketplace_program_id).display_name}
                            </TableCell>
                            <TableCell>{ item.type }</TableCell>
                            <TableCell>{ formatDate(item.block_timestamp * 1000) }</TableCell>
                          </TableRow>
                        ))
                      }
                  </TableBody>
                  </Table>
                </div>
              </div>
            )
          }
        </div>
      </div>
    </Layout>
  )
}


export async function getServerSideProps(ctx) {
  const mint = await getMint({ mint: ctx.params.mint });
  const mps = await getMarketplaces()
  const history = await getMintHistory(ctx.params.mint);

  return {
    props: {
      mint,
      history,
      mps
    }
  }
}