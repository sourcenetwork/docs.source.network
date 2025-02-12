---
date: 2023-09-08
title: Zanzibar Access Control
---

# Introduction

Zanzibar was first introduced by Google in their [whitepaper](https://research.google/pubs/pub48190/). It is an authorization service which powers Google's services. Its main purpose boils down to answering Access Requests, which in plain English can be translated to the question

> Can user U do operation O over object A?

The remainder of this article introduces Zanzibar's Access Control model, how it was designed to fulfill Access Requests and propose a model to aid understanding.

## Relation Based Access Control Model

The field of Access Control is a branch which studies how to manage who or what can operate a certain resource within a system, which is to say, whether something has a permission to do something.
Zanzibar is an implementation which closely resembles the model known as ["Relation Based Access Control"](https://ieeexplore.ieee.org/abstract/document/4725889/)(RelBAC).

The primary idea behind RelBAC is that objects within a system have relations amongst themselves, and through these relations the system can resolve Access Requests.
This notion of relations should feel familiar to Relational Databases and Class Diagrams in Object Oriented Modeling.

To illustrate RelBAC take the familiar example of: "a book is written by an author".
From that sentence we can identify two entities, "book" and "author.
Furthermore there exists a relation between these two entities, a book was *authored* by an author.
The key to RelBAC is noticing that this relation can be used to derive permissions.
The book's author should be able to read and edit their own book - meaning the operations "read" and "edit" should be allowed for an author.

These relations exist in virtually every problem domain, so much so there are specialized languages dedicated to representing those relations, such as Description Logic.
RelBAC exploits these relations in order to figure out permissions.

## Zanzibar's RelBAC

A very important concept drawn from Zanzibar is that of Relation Tuples, which are used to represent a Relation between system objects.

The Relation Tuple is defined as:

```
tuple := (object, relation, user)
object := namespace:id
user :=  object | (object, relation)
relation := string
namespace := string
id := string
```

A Relation Tuple is a 3-tuple which contains a reference to an object, some named relation and an user.
The 3-tuple `(article:zanzibar, publisher, corporation:google)` represents a relationship between the zanzibar article and the google corporation.

More interestingly however is the variant of `user` given by the pair `(object, relation)`, in Zanzibar's white paper this pair is called `userset`.
The userset is a convenient way to express a group of users.
The users given by the userset is the set of all users which are referenced in a relationship with the same object and relation as the userset.

Example:
Take the userset `(group:engineering, member)` and the tuples:

- `(group:engineering, member, user:bob)` 
- `(group:engineering, member, user:alice)`.

The userset `(group:engineering, member)` expands to the users `bob` and `alice`.

Effectively usersets add a layer of indirection to the Relation Tuple.
A Tuple can specify an Userset, and the Userset's Tuples can in turn specify an Userset.
The Relation Tuple was designed to support recursive definitions.

## The Relation Graph

A key insight to grok Zanzibar is to notice that a set of Tuples defines a Graph, let's call it the Relation Graph.

In order to vizualise this fact, notice that a Relation Tuple can be rewritten as a pair of pairs: ((object, relation), (object, relation)), let's call the object-relation pairs Relation Nodes.
The first pair is given by the tuple's Object and Relation as per usual, the second pair is taken to be an userset.
If we assume relations can be empty, this representation covers all cases mentioned in the original definition.

With this interpretation, we can start to see the relation graph taking shape.
Each Relation Tuple actually defines an Edge in the Relation Graph.
Each Node in the Relation Graph is given by an object-relation pair.

As an example, take the tuples:
- ("file:readme", "owner", "bob")
- ("file:readme", "owner", "bob")
- ("file:readme", "reader", "group:engineering", "member")
- ("group:engineering", "member", "alice")

Would look like this as a graph:

![Relation Graph Example](/img/sourcehub/relgraph-simple.png)

The Relation Graph is a view over the set of all objects in a system and the relations between these objects.
Through the relation graph it's possible to answer questions such as "does user U have relation R with object O"?
We can answer that question by starting at the node given by (O, R) and walking through the graph looking for U.
If we take relation R to represent a permission or an operation such as "read", "write", "delete" or whatever, we can use the Relation Graph to answer the originally posed as the object of study within the field of Access Control.

## Userset Rewrite Rules

The Relation Tuples model a generic and powerful system to represent Relations and consequently Permissions in a system.
With that said, Tuples are very bare bones, which leads to a redundant tuples.
Historically, grouping relations and grouping objects proved to be extremely useful in access control.
From a theoretical perspective, these features are required for Zanzibar to be considered a "Relation Based Access Control" implementation.

Zanzibars "Userset Rewrite Rules" addresses these issues.

### Rewrite Rule Briefing

Userset Rewrite Rules aren't extremely intuitive.

A Rule can be thought of as a function which takes an object-relation pair (ie Relation Node) and returns a set of Relation Nodes which are interpreted as descendents of the input node.
Example: let A be a Relation Node and R be a Rewrite Rule: R(A) returns a set of Relation Nodes which are descedents of A.
Rules are associated to Relations.

A final remark: rules are evaluated during runtime, for every Relation Node Zanzibar encounters while searching through the Relation Graph.


### Permissions Hierarchy & Computed Usersets

Permission Hierarchy is a big word for a simple idea.
It basically means that permission to do some operation implies permission to do some other "weaker" operation.

ie. the permission to write (in most cases) implies the permission to read beforehand.

From a practical perspective, this feature greatly reduces the administrative burden and complexity associated to managing rules in an Access Control System.

Take for instance the previous Relation Graph, repeated here for convenience.

![Relation Graph Example](/img/sourcehub/relgraph-simple.png)

Note that Bob is both a "reader" and an "owner".
Suppose that in our system "owner" should always imply "reader", there's an additional cost associate with maintaining these redundant Tuples.

In Zanzibar there is a Rule for associating Relations, the "Computed Userset" rule.

A Computed Userset is a rule defined for some Relation name which dynamically adds another Node to the Relation Graph.

As a way of an example, let's add a Rule such that "owner" implies "reader".
In Zanzibar that would be done by adding a `Computed Userset("owner")` Rule to the `reader` Relation.

Now, let's walk through an example to see how Zanzibar handles that.
Suppose we ask Zanzibar to check whether "bob" is a "reader" of "file:readme", zanzibar would:

1. start at the node `("file:readme", "reader")` and look for any rules associated to the `reader` relation.
2. With the `Computed Userset("owner")` rule, it would create a new Relation Node `("file:readme", "owner")` and set it as a successor of `("file:readme", "reader")`
3. Continue the search through `("file:readme", "owner")`

![Computed Userset Evaluation](/img/sourcehub/cu-annotated.png)

Using a Computed Userset we successfully added a rule to Zanzibar which automatically derives one relation from another.
This enable users to define a set of global rules for a relation as opposed to adding additional Relation Tuples for each object in the system.
This powerful mechanism greatly decreases the maintainability cost associated to Relation Tuples.

### Object Hierarchy & Tuple to Userset

Before diving into the Tuple to Userset rule it's important to recall the main idea behind RelBAC: the relations among system objects can be used to derive permissiosn and fulfill Access Requests.

We have seen how to relate objects to users using Relation Tuples.
Usersets allows us to define hierarchy between users and group them.
The missing link so far is how can we use Zanzibar to create Relations between Objects and consequently group them.
That's where the Tuple to Userset comes in.

To motivate this topic, we shall use the familiar example of a file system permission system.
Filesystems are composed of directories, files and users.
Users owns files and directories, directories contains files and for this example read permission over a directory implies read permission over all files in a directory.

Let the Tuples in the system be illustrated by the following Relation Graph:

![File system example](/img/sourcehub/ttu-relgraph.png)

The problem at hand is: how to declare that Bob's readme file is under Alice's home directory.
Furthermore, how can we declare that Alice should be able to read file readme, since it is contained in her directory.

One way to solve the problem regarding the permission is to create a Relation Tuple from the file to the directory.
The tuple `(file:/home/readme, reader, (directory:/home, owner))` will do the trick, by adding the set of directory owners as readers.

![File System Relation Graph with Relation from File to Directory owners](/img/sourcehub/ttu-relgraph-2.png)

This solves the permission problem but a problem remains, this approach creates no relation between the file and the directory themselves.
The Relation Tuple only states that directory owners are also file readers.

What we really want is to declare a relation between a file and directory and from that relation get to the set of directory owners, as shown in the following image:

![File System Relation Graph parent relation](/img/sourcehub/ttu-relgraph-3.png)

From the image we see that the file is related to its directory through the `parent` relation.
This representation explicitly outlines how files and directories are associated in the system.
All that is missing is tracing a path from the `/home/readme, reader` node to the `/home, owner` node, completing the chain.

This *could* be done by using a Computed Userset rule pointing from reader to parent and an additional Relation Tuple between the `/home` node and `/home, owner` but that still blurs the line between what is an actual Relation between objects and Access Control rules.
The Tuple to Userset rule solves this exact problem.

The Tuple to Userset rule is essentially a Tuple query chained with a Computed Userset rule.
It takes two arguments: a "Tupleset Filter" and a "Computed Userset Relation".
The rule first rewrites the current Relation Node using the Tupleset Filter, with the new node it then fetches all successors of that node.
With the resulting successor set, it performs a Computed Userset Rewrite using the supplied "Computed Userset Relation".

The Tuple to Userset rule is very powerful in that it allows the application to declare a Relation between two objects, thus allowing object hiearchies as we've just explored.

Note however that the main benefit of the `Tuple to Userset` is the fact that it allows an application to create only Tuples which expresses Relations, without requiring additional Tuples which would otherwise exist only for deriving Permission rules.
This may seem trivial but it has profound implications, the fact that Zazibar supports Relations like these, means that the Application - which ultimately is responsible for creating the Tuples - need not be aware that a Relation Tuple from `/home/readme` to the parent directory needs to be created.
The rules of access control are inconsequential at the application layer, being contained entirely within Zanzibar.
The Tuple to Userset is fundamental to decouple Permission and Access Control logic from the application because it supports complex hiearchies between objects to be translated into Access Control rules.

Finally, let's see the TupleToUserset in action.

Let the Rule `TupleToUserset(tupleset_filter: "parent", computed_userset: "reader")` be associated with the "reader" relation and assume the same Relation Tuples shown above.

Evaluating the TupleToUserset rule requires the following steps:

1. start at the Relation Node `(file:/home/readme, reader)`.
2. Evaluate Rule `TupleToUserset(tupleset_filter: "parent", computed_userset: "reader")`
3. Build a filter using "tupleset_relation" -> `(file:readme, parent)`
4. Fetch all successors of the filter built in step 3 -> `[(directory:/home)]`
5. Apply a Computed Userset rewrite rule using the provided "computed_userset" relation for each Relation Node fetched -> `[(directory:/home, reader)]`

Another explanation is given the following image:

![Tuple to Userset Evaluation](/img/sourcehub/ttu-eval.png)

Effectively, the Tuple to Userset added a path from the `/home/readme, reader` node to the `/home, owner` nodes.
The following image shows the edges the rule added:

![](/img/sourcehub/ttu-relgraph-annotated.png)

### Rewrite Rule Expression

One final passing note about Rewrite Rules: in Zanzibar a relation can have multiple rewrite rules.
These rewrite rules are combined to form Rewrite Rule expressions.

Each Rewrite Rule effectively returns a set of Relation Nodes (or userset) which are combined using the operation defined in the Rewrite Rule Expression.
Rules are joined using the familiar set operators: union, difference and intersection.

The set operations are applied to the resulting set of Nodes resulting from evaluating each Rewrite Rule.
This evaluated final set of Nodes is effectively all the successors from a parent Relation Node.

## Conclusion

We've seen how the Relation Tuples actually define a Graph of object-relations, which in turn can be used to resolve Access Requests
We've also seen how Usersets enables grouping users and applying a Relation to a set of users.
Finally, we explored how the Userset Rewrite Rules can be used to define a Relation Hierarchy and how it supports Object hiearchies; both of these features are critical to ensure that Access Control Logic stays within Zanzibar.

Although the initial mention of the Relation Graph was extremely helpful to illustrate how it works, the reality is that the actual Relation Graph is dynamically built by Zanzibar from the Relation Tuples and by evaluating the Relation Rewrite Rules.
The synergy between these two concepts is what powers Zanzibar's Access Control Model.

Under that point of view, we can think of Zanzibar's API as operating over the dynamic Relation Graph.
The `Check` API call is equivalent to the graph reachability problem.
`Expand` is used as a debug tool to dump the Goal Tree used while evaluating the recursive expansion of Rewrite Rules and sucessor fetching.


# References

- Zanzibar: https://research.google/pubs/pub48190/
- RelBAC: https://ieeexplore.ieee.org/abstract/document/4725889/