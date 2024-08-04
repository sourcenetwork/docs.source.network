# Distributed Key Generation

Distributed Key Generation (DKG) is a cryptographic protocol that enables a group of participants to collaboratively generate a public-private keypair in a decentralized manner. Unlike traditional key generation methods, where a single entity holds the private key, DKG ensures that the private key is never known in its entirety by any single participant. Instead, each participant holds a "share" of the private key, and a minimum threshold of participants must cooperate to perform cryptographic operations.

## Key Concepts

1. **Decentralization**:
   - **Definition**: DKG involves multiple nodes in the key generation process, preventing any single point of control or failure. Each node contributes to the creation of the keypair, and the private key is never reconstructed in its entirety by any individual node.
   - **Purpose in Orbis**: Decentralization ensures that no single entity has full control over the secrets, aligning with the security and resilience goals of Orbis.

2. **Key Shares**:
   - **Definition**: Instead of holding the complete private key, each participant in the DKG protocol holds a share of the private key. These shares are generated during the DKG process and are essential for performing any cryptographic operations that require the private key.
   - **Purpose in Orbis**: Key shares enable the system to distribute trust among multiple participants. A threshold number of shares must be combined to reconstruct the private key, ensuring that no single participant can unilaterally access the secret.

3. **Threshold Scheme**:
   - **Definition**: A threshold scheme is a cryptographic mechanism that allows a specified minimum number of participants (threshold) to cooperate in performing a cryptographic operation, such as signing or decrypting a message. The threshold is chosen during the DKG process and defines the minimum number of shares required to reconstruct the private key.
   - **Purpose in Orbis**: The threshold scheme provides a balance between security and availability. It ensures that the system remains functional even if some participants are unavailable or compromised, while also protecting against unauthorized access.

## DKG in Orbis

In the Orbis system, DKG is a foundational component that underpins the decentralized custodial model. By using DKG, Orbis achieves the following:

- **Security**: The private key is never exposed in its entirety, and no single participant can access it alone. This enhances the security of the secrets managed by Orbis.
- **Fault Tolerance**: The threshold scheme allows the system to continue functioning even if some participants are compromised or unavailable. This resilience is crucial for maintaining the availability and integrity of the secrets.
- **Trust Distribution**: By distributing key shares among multiple participants, Orbis eliminates the need for a trusted central authority, reducing the risk of centralized control and single points of failure.

## Conclusion

Distributed Key Generation (DKG) is a critical cryptographic technique that enables Orbis to maintain a decentralized and secure environment for secret management. By ensuring that the private key is never fully known by any single participant, DKG provides strong security guarantees and supports the system's overall goals of decentralization and fault tolerance. Through DKG, Orbis achieves a robust and resilient architecture for managing secrets in a decentralized manner.