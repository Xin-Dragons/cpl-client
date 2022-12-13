import { Typography } from "@mui/material"
import { FC } from "react"

export const MainTitle: FC = ({ children, onClick }) => {
  return <Typography onClick={onClick} variant="h1" sx={{ fontWeight: 'bold', fontFamily: 'Raleway', fontVariationSettings: '"wght" 1000' }} color="primary" display="inline">{children}</Typography>
}