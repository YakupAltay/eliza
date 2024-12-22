import fetchAuthKeyFromLightNode from './fetchAuthKeyFromLightNode.js';
import isURL from '../utils/isURL.js';

export default async (
  light_node_rpc_url: string,
  options: {
    method: string,
    params: any[]
  }
): Promise<any> => {
  if (!isURL(light_node_rpc_url)) {
    throw new Error('bad_request');
  }

  try {
    const celestiaAuthKey = await fetchAuthKeyFromLightNode();

    const response = await fetch(light_node_rpc_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${celestiaAuthKey}`
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: options.method,
        params: options.params
      })
    });

    const jsonResponse = await response.json();

    if (!jsonResponse.result)
      return {
        id: 1,
        jsonrpc: '2.0',
        result: []
      };

    return jsonResponse;
  } catch {
    throw new Error('fetch_error');
  };
};
