import { LAMPORTS_PER_SOL } from "@solana/web3.js"
import { Card, CardContent, FormControl, FormControlLabel, InputLabel, MenuItem, Radio, RadioGroup, Select, Typography } from "@mui/material";
import axios from "axios";
import { format } from "date-fns";
import { FC, useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer, XAxis, Tooltip, YAxis, Legend } from "recharts";
import { Stack } from "@mui/system";
import { capitalize } from "lodash";
import { useTimeframe } from "../../context/timeframe";

interface SalesOverTimeProps {
  collection: string;
}

export const SalesOverTime: FC<SalesOverTimeProps> = ({ collection }) => {
  const [sales, setSales] = useState([]);
  const { days, setDays } = useTimeframe()

  async function getSalesOverTime() {
    const params = {
      collection,
    };
    const { data } = await axios.get('/api/get-sales-over-time', { params })
    console.log(data)
    setSales(data)
  }


  useEffect(() => {
    getSalesOverTime()
  }, [])

  function formatDate(date: string, f = "dd/MM") {
    if (!date || date === 'auto') {
      return null
    }
    return format(new Date(date), f)
  }

  function formatLabel(label: string) {
    return capitalize(label.replace('_', ' '))
  }

  const filtered = sales
    .slice(sales.length - (days || sales.length), sales.length)
    .map(item => {
      return {
        ...item,
        expected_amount: item.expected_amount || 0,
        actual_amount: item.actual_amount || 0
      }
    })

  return (
    <Card sx={{ marginTop: 2 }}>
      <CardContent sx={{ width: "100%", height: "100%" }}>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Typography variant="h4">Royalties over time</Typography>
            <Select
              value={days}
              onChange={e => setDays(Number(e.target.value))}
            >
              <MenuItem value={7}>Last 7 days</MenuItem>
              <MenuItem value={30}>Last 30 days</MenuItem>
              <MenuItem value={0}>All</MenuItem>
            </Select>
          </Stack>
          <ResponsiveContainer width="100%" aspect={5.0/2.0}>
     
            <LineChart data={filtered}>
              <XAxis dataKey="segment" tickFormatter={val => formatDate(val)} />
              <YAxis tickFormatter={amount => amount / LAMPORTS_PER_SOL} />
              <Legend formatter={formatLabel}/>
              <Tooltip
              cursor={false}
                formatter={(value, name) => [
                  `${value / LAMPORTS_PER_SOL} SOL`,
                  formatLabel(name)
                ]}
                labelStyle={{ color: '#333' }}
                labelFormatter={val => formatDate(val, 'yyyy/MM/dd')}
              />
              <Line type="monotone" dataKey="expected_amount" stroke="#00C49F" strokeWidth={2} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="actual_amount" stroke="#E42575" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </Stack>
      </CardContent>
    </Card>
  )
}