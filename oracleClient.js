const { Universal } = require('@aeternity/aepp-sdk')

const API_URL = 'https://sdk-testnet.aepps.com'
const INTERNAL_API_URL = 'https://sdk-testnet.aepps.com'
const NETWORK_ID = 'ae_uat'
const PUBLIC = 'ak_2TeWtqALgRAEBTR2mftuQV7KD7JoEjWFhkweTCG7Sq5TrgTmH7'
const PRIVATE = 'ad4b43f2b837f4c511bd11e4e651a848b66551a9ad8867c0ae456b82ee1ad9f4c03371b79c0470ca2b71fe45900ad780f7293adba1f26fc65017e46e6bd7af68'
const COMPILER_URL ='https://compiler.aepps.com'
const oracleId = 'ok_2TeWtqALgRAEBTR2mftuQV7KD7JoEjWFhkweTCG7Sq5TrgTmH7';

/**
 * This is a sample SDK oracle client using an
 * Oracle Id Previously Registered
 */
const main = async () => {

    const ae = await Universal({
        networkId: NETWORK_ID,
        url: API_URL,
        internalUrl: INTERNAL_API_URL,
        keypair: { publicKey: PUBLIC, secretKey: PRIVATE },
        compilerUrl: COMPILER_URL
    });
    let client = ae;
    let options = [ttl = 50, fee = 100000000000 ];
    let query = 'World';
    console.log(`Asking Oracle: ${query}?`);
    let q = await client.postQueryToOracle(oracleId,query,options)
    console.log(`Query Id: ${q.id} awaiting response....`);
    let pollOptions = [attempts= 20 , interval=5000];
    let response =  await q.pollForResponse(pollOptions);
    console.log('Got Response: ',response.decode().toString());
};
main();