const WebSocket = require('ws');
const { Universal } = require('@aeternity/aepp-sdk')

const API_URL = 'https://sdk-testnet.aepps.com'
const INTERNAL_API_URL = 'https://sdk-testnet.aepps.com'
const MIDDLEWARE_URL = 'wss://testnet.mdw.aepps.com/websocket'
const NETWORK_ID = 'ae_uat'
const PUBLIC = 'ak_2TeWtqALgRAEBTR2mftuQV7KD7JoEjWFhkweTCG7Sq5TrgTmH7'
const PRIVATE = 'ad4b43f2b837f4c511bd11e4e651a848b66551a9ad8867c0ae456b82ee1ad9f4c03371b79c0470ca2b71fe45900ad780f7293adba1f26fc65017e46e6bd7af68'
const COMPILER_URL ='https://compiler.aepps.com'
const oracleId = 'ok_2TeWtqALgRAEBTR2mftuQV7KD7JoEjWFhkweTCG7Sq5TrgTmH7';

/**
 * This is a sample SDK oracle operator using an
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
    
    async function respondQuery(queryId,question,sender) {
        let optionsRespond = [responseTtl = 50, fee = 1000000000000000000];
        console.log(`Responding Query: ${queryId}`,`Question ${question}`,`Sender: ${sender}`);
        let response =`Hello, ${question}!`;
        return await client.respondToQuery(oracleId, queryId, response, optionsRespond);
    }
    async function processOracleQueries( ) {
        let queries = await client.getOracleQueries(oracleId);
        console.log('Get Oracle Queries',queries);
        queries.oracleQueries.forEach(element => { 
            retrieveQuery(element.id);
         });
    }
    async function retrieveQuery(query_id) {
        client.getQueryObject(oracleId,query_id).then((queryObj)=>{
            let request = queryObj.decode(queryObj.query).toString();
            let current_response = queryObj.decode(queryObj.response).toString();
            let sender = queryObj.senderId;
            if(current_response === '') {
                respondQuery(query_id,request,sender);
            }
        });
    }

    const ws = new WebSocket(MIDDLEWARE_URL);
    ws.on('open', function open() {
        console.log('Connected to Middleware/ Subscribing');
        ws.send(`{"op":"subscribe", "payload": "object", "target": "${oracleId}" }`);
        // resp =ws.send(`{"op":"subscribe", "payload": "key_blocks"}`);
        console.log(`Subscribed for Obj ${oracleId}`);
    });
    
    ws.on('message', function incoming(data) {
        if(data === 'connected') {
            processOracleQueries();
        }else{
            try {
                let eventObj = JSON.parse(data);
                if(eventObj.subscription ==='object') {
                    console.log(`Event for ${eventObj.payload.tx.oracle_id}, Type: ${eventObj.payload.tx.type}`);
                    if(eventObj.payload.tx.type === 'OracleQueryTx') {
                        processOracleQueries();
                    }
                }
            }catch(e) {
                console.log(`Error`,e,data);
            }
        } 
    });
}
main();