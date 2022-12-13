import { FC } from "react"

interface Props {
  width: number,
  height: number,
  src: string
}

export const MagicEdenImage: FC<Props> = ({ width, height, src }) => {
  return <img width={width} height={height} src={`https://cdn.magiceden.io/rs:fill:400:400:0:0/plain/${src}`} />
}