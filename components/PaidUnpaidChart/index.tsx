import { Card, CardContent, Typography } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { size } from "lodash";
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useEffect, useMemo, useState } from "react";
import { Cell, Label, Pie, PieChart, ResponsiveContainer } from "recharts";
import { useData } from "../../context";
import Spinner from "../Spinner";
import { lamportsToSol } from "../../helpers";

const COLORS = ['#00C49F', '#ce266c', '#FFBB28', '#FF8042'];

interface Datum {
  name: string;
  value: number;
}

export function PaidUnpaidChart({ collection, all }: { collection?: string, all?: boolean }) {
  const [chartData, setChartData] = useState<Datum[]>([]);
  const [percentPaid, setPercentPaid] = useState(0);
  const { summary } = useData();

  useMemo(() => {
    if (!size(summary)) {
      setChartData([])
      setPercentPaid(0)
      return;
    }
    setChartData(
      [
        {
          name: 'Paid',
          value: Math.round(summary.paid / LAMPORTS_PER_SOL)
        },
        {
          name: 'Evaded',
          value: Math.round(summary.unpaid / LAMPORTS_PER_SOL)
        }
      ]
    )
    setPercentPaid((summary.paid / summary.expected_royalties * 100).toFixed(2));
  }, [summary])


  useEffect(() => {
    console.log(chartData)
  }, [chartData])
  

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ height: '100%' }}>
        <Typography variant="h4" align="center">Royalty Rate</Typography>
        {
          chartData.length
            ? (
              <ResponsiveContainer width='100%' height={308}>
                <PieChart width={400} height={308}>
                  <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={120} innerRadius={100} paddingAngle={10} label={true}>
                    <Label value={`${percentPaid}%`} position="center" style={{ fill: "#ffffff", fontSize: '2em'}} />
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )
          : <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
            <Spinner />
          </Box>
        }
        
      </CardContent>
    </Card>
  )
}