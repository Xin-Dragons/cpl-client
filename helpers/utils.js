import {
  differenceInMonths,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
} from 'date-fns'

export function truncate(str) {
  return `${str.substring(0, 5)}...${str.substring(str.length - 5, str.length)}`
}

export function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatDate(date) {
  const ref = new Date(date)
  const months = differenceInMonths(new Date(), ref)

  if (months > 0) {
    return `${months} month${months === 1 ? '' : 's'} ago`
  }

  const days = differenceInDays(new Date(), ref)

  if (days > 0) {
    return `${days} day${days === 1 ? '' : 's'} ago`
  }

  const hours = differenceInHours(new Date(), ref)

  if (hours > 0) {
    return `About ${hours} hour${hours === 1 ? '' : 's'} ago`
  }

  const minutes = differenceInMinutes(new Date(), ref)

  if (minutes > 0) {
    return `About ${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }

  return 'Less than a minute ago'
}