---
title: Create a Policy
---
# Create an ACP Policy
Now that we have a fully configured `CLI` client, we can start executing transactions and queries against the SourceHub network. Our first task will be to create a new ACP Policy.

The SourceHub ACP Module is a [Zanzibar](/sourcehub/concepts/zanzibar) based global decentralized authorization system. Developers write policies using our Relation-Based Access Control (RelBAC) DSL, which allows you to define resources, relations, and permissions.

- **Resources**: Generic container for some kind of "thing" you wish to gate access to or provide authorization for. It can be anything from a document on [DefraDB](/defradb), a Secret on [Orbis](/orbis), or any other digital resource.

- **Relation**: Named connections between resources. Similar to a database table that might have relations between its schema types, so does the SourceHub ACP module. This allows us to create expressive policies that go beyond traditional *Role-Based* or *Attribute-based* access control.

- **Permissions**: Computed queries over resources, relations, and even other permissions (they're recursive!).

## Example
Let's create a very basic example policy which defines a single resource named `note` with both an `owner` and `collaborator` relation which are both of type `actor`.

Create a file named `basic-policy.yaml` and paste the following:
```yaml
name: Basic Policy

resources:

  note:
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

Here we are also defining 3 permissions. 

The `read` permission is expressed as `owner + collaborator` which means *if* you have either an `owner` or `collaborator` relation *then* you have the `read` permission.

Both the `edit` and `delete` permissions are reserved solely for those with the `owner` relation.

:::info
Traditionally we define relations as nouns and permissions as verbs. This is because we often understand authorization as some *thing* (noun) performing some *action* (verb) on some resource. 
:::

### Upload Policy
Now that we have defined our policy, we can upload it to SourceHub.
```bash
sourcehubd tx acp create-policy basic-policy.yaml --from <wallet_name>
```

Then, to get the policy we can list the existing policies.

```bash
sourcehubd q acp policy-ids
```

![Policy IDs](/img/sourcehub/policy-ids-1.png)