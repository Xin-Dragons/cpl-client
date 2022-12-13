import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { FC } from 'react';
import Tooltip from '@mui/material/Tooltip';

export const Info: FC<{ tooltip: string }> = ({ tooltip }) => {
  return (
    <Tooltip title={tooltip} placement="top" arrow  sx={{ cursor: 'help' }}>
      <InfoOutlinedIcon />
    </Tooltip>
  )
}