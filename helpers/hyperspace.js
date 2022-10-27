import { HyperspaceClient } from 'hyperspace-client-js';
import { get } from 'lodash';

const hsClient = new HyperspaceClient(process.env.HYPERSPACE_API_KEY);

const nopes = [
  'BID',
  'CANCELBID'
]

export async function getMintHistory(mint) {
  const res = await hsClient.getTokenHistory({
    condition: {
      tokenAddresses: [mint],
    }
  })

  return get(res, 'getMarketPlaceActionsByToken[0].market_place_actions').filter(item => !nopes.includes(item.type));
}

export async function getMarketplaces() {
  const res = await hsClient.getMarketplaceStatus()

  await getProjects();

  return res.getMarketPlaceStatus.mps;
}

export async function getProjects() {
  const res = await hsClient.getProjects({
    orderBy: {
      field_name: "market_cap",
      sort_order: 'DESC'
    },
    pagination_info: {
      page_size: 100
    }
  })

  console.log(res);
}