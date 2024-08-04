# Multi-Party Computation

Multi-Party Computation (MPC) is a cryptographic technique that allows multiple parties to jointly compute a function over their inputs while keeping those inputs private. In the context of Orbis, MPC plays a crucial role in ensuring the security and integrity of secret management without a single point of failure.

## Key Concepts

1. [**Distributed Key Generation (DKG)**](/orbis/concepts/dkg):
   - **Definition**: A decentralized method for collaboratively generating a cryptographic keypair. All participating nodes know the public key, but no single node knows the private key. Instead, each node holds a "share" of the private key.
   - **Purpose in Orbis**: DKG is used to create a shared keypair for a Secret Ring, ensuring that the private key remains unknown to any single actor. This keypair is essential for securely encrypting secrets.

2. [**Proactive Secret Sharing (PSS)**](/orbis/concepts/pss):
   - **Definition**: An algorithm that periodically redistributes the shares of a private key among nodes without changing the long-term keypair. This process mitigates the risk of adversaries compromising the system over time.
   - **Purpose in Orbis**: PSS ensures the long-term security of the secret management system by preventing adversaries from accumulating enough shares to reconstruct the private key. It does so by periodically refreshing the shares, making it impossible for an adversary to exploit nodes indefinitely.

3. [**Proxy Re-Encryption (PRE)**](/orbis/concepts/pre):
   - **Definition**: A cryptographic mechanism that allows encrypted data (ciphertext) to be transformed from one public key to another without revealing the underlying plaintext.
   - **Purpose in Orbis**: PRE is employed to transfer encrypted secrets from the Secret Ring's public key to a requesting party's ephemeral public key. This transformation is done securely and privately, ensuring that neither the system nor the nodes involved in the process ever see the plaintext.

## MPC in Orbis

In Orbis, MPC techniques are foundational to the system's decentralized custodial model. They provide the following benefits:

- **Security**: By ensuring that no single actor can access the entire secret or private key, MPC protects against unauthorized access and single points of failure.
- **Verifiability**: The use of MPC allows for the secure verification of cryptographic operations, ensuring that only authorized parties can access secrets.
- **Byzantine Fault Tolerance**: The system can tolerate a certain number of faulty or malicious nodes without compromising the integrity of the secret management process.

## Conclusion

MPC enables Orbis to maintain a decentralized and secure environment for secret management. By leveraging DKG, PSS, and PRE, Orbis achieves a robust system that is resistant to various attack vectors while ensuring that secrets are only accessible to authorized parties. These cryptographic protocols underpin the core functionality of Orbis, making it a reliable and secure solution for decentralized custodial secret management.