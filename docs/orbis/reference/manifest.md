# Manifest

```json
{
    "manifest": {
        "n": 3, // N: The total number of nodes in the ring
        "t": 2, // T: The threshold number of nodes to run decryption request (T <= N)
        "dkg": "rabin", // DKG: Distributed Key Generation algorithm (available: rabin)
        "pss": "avpss", // PSS: Proactive Secret Sharing algorithm (available: avpss)
        "pre": "elgamal", // PRE: Proxy Re-Encryption algorithm (available: elgamal)
        "bulletin": "p2p", // Bulletin: The network broadcast bulletin (available: p2p, sourcehub)
        "transport": "p2p", // Transport: The overlay network transport (available: p2p)
        "authentication": "jws-did", // Authentication: The authn scheme for clients (available: jws-did)
        "authorization": "zanzi", // Authorization: The authz scheme for clients (available: zanzi, sourcehub)
        "nodes": [ // Nodes: Set of node objects identifying the initial nodes.
            {
                "id":"16Uiu2HAmLyq5HXHSFxvxmGcsnwsYPZvTDtfe3CYnWDK8jDAHhJC5",
                "address":"/ip4/127.0.0.1/tcp/9000"
            },
        ],
        "nonce": 0 // Nonce: Random value to adjust the determinstic RingID creation
    }
}
```