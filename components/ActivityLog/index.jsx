import { useRef, useState, useEffect } from 'react';
import classnames from 'classnames'
import Link from 'next/link';
import { Spinner } from '../'

import { formatDate, truncate } from '../../helpers'

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TablePagination from '@mui/material/TablePagination';

import axios from 'axios'

import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes
} from 'date-fns'

import styles from './style.module.scss'

export function ActivityLog({ collection }) {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)

  function onFilterChange(e, filter) {
    setFilter(filter);
  }

  const intervalRef = useRef(null)

  useEffect(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(getLogs, 5000)
    return () => {
      clearInterval(intervalRef.current);
    }
  }, [page, rowsPerPage, filter])

  function handleChangePage(event, newPage) {
    setPage(newPage)
  }

  function handleChangeRowsPerPage(event) {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }

  async function getLogs() {
    const limit = rowsPerPage;
    const offset = page * limit;
    setLoading(true)
    const { data: { logs, count } } = await axios.get('/api/get-logs', { params: { limit, offset, filter, collection } });

    setLogs(logs)
    setCount(count)
    setLoading(false)
  }

  useEffect(() => {
    getLogs()
  }, [rowsPerPage, page, filter])

  const columns = [
    {
      id: 'image',
      label: loading && <Spinner small />,
      format: row => <img width={50} height={50} src={row.image} className={styles.img} />
    },
    {
      id: 'name',
      label: 'Name',
      format: row => <Link href={`/collection/${row.collection}/mint/${row.mint}`}><a>{row.name}</a></Link>
    },
    {
      id: 'id',
      label: 'Transaction ID',
      format: row => <a href={`https://solscan.io/tx/${row.id}`}>{truncate(row.id)}</a>
    },
    {
      id: 'Time',
      label: 'Time',
      format: row => formatDate(row.date)
    },
    {
      id: 'type',
      label: 'Type'
    },
    {
      id: 'mint',
      label: 'Mint address',
      format: row => truncate(row.mint)
    }
  ]

  return (
    <Paper sx={{ width: '100%' }}>
      <Tabs
        value={filter}
        onChange={onFilterChange}
      >
        <Tab value="all" label="All" />
        <Tab value="purchase" label="Sales" />
        <Tab value="list" label="Listings" />
        <Tab value="delist" label="Delistings" />
      </Tabs>
      <TableContainer className={styles.activityLog}>
        <Table sx={{ minWidth: 650 }} aria-label="Sales">
          <TableHead>
            <TableRow>
              {
                columns.map(column => (
                  <TableCell key={column.id} component="th">{column.label}</TableCell>
                ))
              }
            </TableRow>
          </TableHead>
          <TableBody>
            {
              logs.map((row, index) => (
                <TableRow
                  key={row.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  className={classnames({ [styles.odd]: index % 2 })}
                >
                  {
                    columns.map(col => (
                      <TableCell
                        key={col.id}
                      >
                        {
                          col.format ? col.format(row, index) : row[col.id]
                        }
                      </TableCell>
                    ))
                  }

                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={count}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  )
}