# Setup Authorization Policy 
Before we can start storing secrets into the newly created Secret Ring, we must define our access policy. This access policy will determine the resources and permissions that users will need to authorize with to recover secrets.

This section will assume you are using the `Zanzi` Authorization GRPC Service that is included in the example `docker-compose.yaml` file from the previous step. If you are using the `SourceHub ACP` module instead, you can reference the [Create a SourceHub ACP Policy](/sourcehub/getting-started/create-a-policy) doc.

## Create a Policy

The `Zanzi` Authorization GRPC Service is a [Zanzibar](/sourcehub/concepts/zanzibar) based global decentralized authorization system. Developers write policies using our Relation-Based Access Control (RelBAC) DSL, which allows you to define resources, relations, and permissions.

- **Resources**: Generic container for some kind of "thing" you wish to gate access to or provide authorization for. It can be anything from a secret on [Orbis](/orbis), a document on [DefraDB](/defradb), or any other resource.

- **Relation**: Named connections between resources. Similar to a database table that might have relations between its schema types, so does the SourceHub ACP module. This allows us to create expressive policies that go beyond traditional *Role-Based* or *Attribute-based* access control.

- **Permissions**: Computed queries over resources, relations, and even other permissions (they're recursive!).

### Secret Resource Policy
Here we are going to create a basic policy to govern access to our secrets in Orbis.

Create a file named `orbis-policy.yaml` and paste the following:
```yaml
name: Orbis Secret Policy

resources:

  secret:
    relations:
      owner:
        types: 
          - actor
      collaborator:
        types: 
          - actor

    permissions:
      read: 
        expr: owner + collaborator
      edit: 
        expr: owner
      delete: 
        expr: owner
```

Now that we have our policy defined, we can upload it to the `Zanzi` service
```shell
orbisd client policy create -f orbis-policy.yaml
```

Which will return back the created policy ID. We can confirm the policy has been created by using the `policy describe` command.
```bash
orbisd client policy describe <policy-id>
```