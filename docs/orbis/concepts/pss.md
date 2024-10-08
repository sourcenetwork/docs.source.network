# Proactive Secret Sharing

Proactive Secret Sharing (PSS) is a cryptographic protocol that enhances the security of a shared secret over time by periodically refreshing the shares held by participants. This process prevents adversaries from accumulating shares to eventually reconstruct the secret key. PSS is crucial in systems where long-term security is paramount, as it mitigates the risk of a compromise that may occur gradually over time.

## Key Concepts
1. **Secret Shares**:
   - **Definition**: In PSS, a secret (such as a private key) is divided into shares, with each participant holding one share. The secret can only be reconstructed with a sufficient number of shares, known as the threshold.
   - **Purpose in Orbis**: By distributing shares among multiple nodes, Orbis ensures that no single entity has complete control over the private key, enhancing the system's security.

2. **Share Refreshing**:
   - **Definition**: The process of periodically updating the secret shares without changing the underlying secret. This process prevents adversaries from collecting enough shares over time to reconstruct the secret.
   - **Purpose in Orbis**: Share refreshing ensures that even if some shares are compromised, the secret remains secure as the shares are periodically updated, nullifying the compromised shares' usefulness.

3. **Epochs**:
   - **Definition**: Time intervals at the end of which the shares are refreshed. The length of an epoch is determined based on the security requirements and threat model.
   - **Purpose in Orbis**: Epochs provide a temporal boundary for when shares must be refreshed, ensuring that the system maintains its security properties over time.

#### PSS, DKG, and PRE in Orbis

In the Orbis system, PSS works alongside [Distributed Key Generation (DKG)](/orbis/concepts/dkg) and [Proxy Re-Encryption (PRE)](/orbis/concepts/pre) to provide a comprehensive and secure framework for secret management:

- **DKG**: DKG is responsible for the initial generation of a shared keypair, with the private key split into shares distributed among participants. These shares are essential for performing cryptographic operations securely.
- **PSS**: While DKG establishes the initial distribution of secret shares, PSS ensures the long-term security of the system by periodically refreshing these shares. This prevents the gradual accumulation of shares by adversaries, thus protecting the secret's confidentiality.
- **PRE**: PRE utilizes the public key generated by DKG and the shares maintained and refreshed by PSS to securely transfer ciphertext between different public keys. PSS ensures that the private key shares used in creating ReKeys remain secure over time, maintaining the integrity of the re-encryption process.

Together, DKG, PSS, and PRE form a robust security model in Orbis. DKG initiates a secure keypair, PSS maintains the security of the keypair over time, and PRE facilitates the secure and private transfer of encrypted secrets.

## Conclusion
Proactive Secret Sharing (PSS) is a critical component in ensuring the long-term security and integrity of the Orbis system. By periodically refreshing secret shares, PSS prevents adversaries from exploiting compromised shares over time. When combined with [Distributed Key Generation (DKG)](/orbis/concepts/dkg) and [Proxy Re-Encryption (PRE)](/orbis/concepts/pre), PSS provides a resilient and secure framework for decentralized custodial secret management. This combination ensures that secrets are managed securely, remain confidential, and are accessible only to authorized parties.





