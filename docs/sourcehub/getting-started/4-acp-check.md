---
title: Access Requests
---
# Check a Policy

Now that we have an existing account and created policy, we're going to seed it with some resources and evaluate some `Check` requests.

> A [`Check`](zanzibar-concept) request is how we determine if a given action on a resource by an actor is allowed. 

We are using the policy we created for our basic note app from the last step, which has a policy id of `a3cc042579639c4b36357217a197e0bb17bdbb54ff322d4b52e4bba4d19548bf`. 

First, we need to "Register" a resource object, which will create an entry in the ACP system that establishes who the owner of an object is. The command is `sourcehubd tx acp direct-policy-cmd register-object <policy-id> <resource-type> <resource-name>` where `resource-type` is `note` (as defined in the policy resources) and `resource-name` is any name we want to assign to our resource, in this case it will be `alice-grocery-list`.

The full command is:
```bash
sourcehubd tx acp direct-policy-cmd register-object a3cc042579639c4b36357217a197e0bb17bdbb54ff322d4b52e4bba4d19548bf note alice-grocery-list --from <wallet_name>
```

We now have created the `alice-grocery-list` and registered the `owner` as whatever wallet you used for `<wallet_name>`.

To verify this, we can run a request to inspect the resource owner.
```bash
sourcehubd q acp object-owner a3cc042579639c4b36357217a197e0bb17bdbb54ff322d4b52e4bba4d19548bf note alice-grocery-list
```

Which will result in something like:
![Object owner](/img/sourcehub/object-owner.png)

The interesting part here is that the `owner_id` is encoded as a [DID Key](https://w3c-ccg.github.io/did-method-key/) identifier (`did:key:zQ3sha81FK34V8PrB7rbUq9ZbUvRKQZqW5CMqyjer2YQdwFWb` which is the wallet public key we used to register the object originally).

## Add a Collaborator
After registering an object and verifying its owner, we can add a collaborator, and see how the authorization updates.

We are going to introduce a new actor `BOB` who has an identity `did:key:z6Mkmyi3eCUYJ6w2fbgpnf77STLcnMf6tuJ56RQmrFjce6XS`.

To add `BOB` as a `collaborator` (which is a specific relation defined on the [policy](example-basic-policy)) we can issue a `set-relationship <policy-id> <resource-name> <resource-id> <relation> <subject>` where `<relation>` is `collaborator` and `<subject>` is the BOB identity above (`did:key:z6Mkmyi3eCUYJ6w2fbgpnf77STLcnMf6tuJ56RQmrFjce6XS`).
```
sourcehubd tx acp direct-policy-cmd set-relationship a3cc042579639c4b36357217a197e0bb17bdbb54ff322d4b52e4bba4d19548bf note alice-grocery-list collaborator did:key:z6Mkmyi3eCUYJ6w2fbgpnf77STLcnMf6tuJ56RQmrFjce6XS --from <wallet_name>
```

We can now verify that the access to Alice's grocery list resource is properly enabled. We can issue a `verify-access-request <policy-id> <subject> <resource-name>:<resource-id>#<permission>` query which will check if the permission can be evaluated for the given resource and subject. Here we will check for the `read` permission, which according to the policy is true for `OWNERs` and `COLLABORATORs`.
```bash
sourcehubd q acp verify-access-request a3cc042579639c4b36357217a197e0bb17bdbb54ff322d4b52e4bba4d19548bf did:key:z6Mkmyi3eCUYJ6w2fbgpnf77STLcnMf6tuJ56RQmrFjce6XS note:alice-grocery-list#read
```

Which will return `valid: true`.

Let's check for a permission that Bob *shouldn't* have, like `edit` which is reserved for `OWNERs`.
```bash
sourcehubd q acp verify-access-request a3cc042579639c4b36357217a197e0bb17bdbb54ff322d4b52e4bba4d19548bf did:key:z6Mkmyi3eCUYJ6w2fbgpnf77STLcnMf6tuJ56RQmrFjce6XS note:alice-grocery-list#edit
```

Which will return `valid: false`

