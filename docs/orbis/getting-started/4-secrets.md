# Store and Recover Secrets
Now that we have initialized our orbis nodes, defined our manifest, created the secret ring, and uploaded our policy we are finally ready to store secrets into our Ring!

## Store Secrets

To store a secret in a ring, theres a series of steps that clients must execute (thankfully our CLI Client does this all for you). The TLDR is that secrets must be 
- Encrypted to the Secret Rings DKG Public Key
- Proof-of-Encryption commitment that proves the first step is done correctly
- Client sends the encrypted secret and commitment proof, along with the authorization policy details to any of the Orbis nodes within the Secret Ring as a `store-secret` request.
- Finally the nodes broadcast the `store-secret` request amungst eachother.

To create and store a secret, we have two methods for how the client will create the authorization policy information for the `store-secret` request. These methods are called `Managed` and `Unmanaged`. 

With `Managed` authorization, the client will automatically register the required zanzibar resource to the policy when storing the secret.

The `Unmanaged` authorization has no automated registration functionality, so the caller is responsible for A) Ensuring the correct resources are registed in the policy B) They correctly create the Zanzibar authorization permission string, and ensure themselves have permission to access the supplied resource.

### Managed Example
To create a `managed` secret with policy defined in the previous step:
```bash
orbisd client --ring-id <ring-id> put "MySuperSecretInformation" --authz managed --policy <policy-id> --resource secret --permission read
```

Here the client will get the `<ring-id>` aggregate public key, encrypt `MySuperSecretInformation` to the public key, create the proof, locally generate the `<secret-id>` (determinstic), register the `<secret-id>` as a new object in the `<policy-id>` policy with ourselves set as the `owner`, craft the full permission object `<policy-id>/secret:<secret-id>#read`, and send the full `store-secret` request with all this information to the Secret Ring.

### Unmanaged Example
To create an `unmanaged` secret, first we manually register an object into the policy, then create the secret.
```bash
# Register an object called `MySecretName`
orbisd client policy register <policy-id> secret <MySecretName>
# Create the secret using the `MySecretName` authorization object
orbisd client put "MySuperSecretInformation" --authz unmanaged --permission "<policy-id>/secret:<MySecretName>#read"
```

You may have noticed the difference when executing the `unmanaged` request compared to the `managed` request is that we can manually define `<MySecretName>` instead of using the deterministically generated `<secret-id>`. This is because we seperated the `register` command from the `put` command. Moreover, we supplied the `--permission` as the fully 
qualified zanizbar tuple `<policy-id>/secret:<MySecretName>#read` as a single string.

In both examples, the finally request sent to the Secret Ring is similar, the encrypted secret is verified against the proof commitment, and finally broadcast to the network bulletin so it can be recieved by all the other nodes.

## Recover Secrets
Now that we have stored a secret, we can send a `recover` request which will trigger a Threshold [Proxy Re-Encryption](/orbis/concepts/pre) request. This request will first be authenticated to ensure the client requesting has the correct Proof-of-Possession JWS token, then authorized by each node before re-encryption. The authorization runs a `Check` call against the `Zanzi` authorization service to determine if client has the correct permission as configured when the secret was first created.

In the above example, this means the `Check` call will determine if the client has the `read` permission on the provided secret resource within the `<policy-id>` policy.

```bash
orbisd client get <secret-id>
```
> Note: You will need to replace `<secret-id>` with `<MySecretName>` if you used the `unmanaged` authorization.

This will automatically craft the proof-of-possession JWS token, intiate the proxy re-encryption request, wait for and finally decrypt the response.


## Share a Secret
To share a secret with another person, we can update the policy state so that our target subject has the necessary permissions to access the secret. From our [example policy](/orbis/getting-started/policy#create-a-policy) before our `secret` resource has an additional `collaborator` relation. Moreover, the `read` permission is the expression `owner + collaborator` which means either the `owner` or the `collaborator` can `read`.

We're going to add `Bob` identified by `did:key:z6Mkmyi3eCUYJ6w2fbgpnf77STLcnMf6tuJ56RQmrFjce6XS` as a `collaborator` so he can inheir the `read` permission and therefore access our stored secret.

:::info
Reminder, there is nothing specific about the names/labels used within our policy. Although we use the `read` permission, there is no special power or requirement to name your permission `read`, it can be any valid name.
:::

```bash
orbisd keys add bob
export BOB=$(orbisd keys show bob --did)
orbisd client policy set <policy-id> secret <secret-id> collaborator $BOB
```

We can confirm that the policy relation was created by manually running a `Check` command.
```bash
orbisd client policy check <policy-id> secret:<secret-id>#read
```
Which should return `valid: true`.

Finally `Bob` can also recover the secret
```bash
orbisd client --from bob get <secret-id>
```
