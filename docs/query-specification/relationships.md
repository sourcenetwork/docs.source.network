---
sidebar_label: Relationships
sidebar_position: 80
---
<<<<<<< HEAD
# Relationships
=======
# Relationships

DefraDB supports a number of common relational models that an application may need. These relations are expressed through the Document Model, which has a few differences from the standard SQL model. There are no manually created "Join Tables" which track relationships. Instead, the non-normative nature of NoSQL Document objects allows us to embed and resolve relationships as needed automatically. 

Relationships are defined through the Document Schemas, using a series of GraphQL directives, and inferencing. They are always defined on both sides of the relation, meaning both objects involved in the relationship.

#### One-to-One
The simplest relationship is a "one-to-one". Which directly maps one document to another.

Let us define a one-to-one relationship between an Author and their Address

```graphql
type Author {
    name: String
    address: Address @primary
}

type Address {
    number: Integer
    streetName: String
    city: String
    postal: String
    author: Author
}
```

Here we simply include the respective types in both objects, and DefraDB infers the relationship. This will create two different objects, each of which is independently queryable, and each of which provides field level access to its related object. The notable distinction of "one-to-one" relationships is that only the DocKey of the corresponding object is stored.

If we wanted to simply embed the Address within the Author type, without the internal relational system, we can include the `@embed` directive, which will embed it within. Objects embedded inside another using the `@embed` directive do not expose a query endpoint, so they can *only* be accessed through their parent object. Additionally they are not assigned a DocKey.


<!-- *todo*: Should we imply `@relation` directive whenever a type is within another, as in the example above Or, should we be explicit and require the `@relation` directive if we want a relation, and use a `@embed` directive behavior by default instead. [color=orange]
-->

<!--- Here we need to specify a relationship between these types using the `@relation` directive. This tells DefraDB to track the ID of the object, in place of the entire object. If didn't specify `@relation` then in the one-to-one model, the object and all of its fields/data would be directly embedded inside the parent object. --->

#### One-to-Many
A "one-to-many" relationship allows us to relate several of one type, to a single instance of another. 

Let us define a one-to-many relationship between an author and their books. This example differs from the above relationship example because we relate the author to an array of books, instead of a single address.

```graphql
type Author {
    name string
    books [Book]
}

type Book {
    title string
    genre string
    description string
    author Author
}
```

Here we define the books object within the Author object to be an array of books, which indicates the Author type has a relationship to *many* Book types. Internally, much like the one-to-one model, only the DocKeys are stored. However in this relationship, the DocKey is only stored on one side of the relationship, specifically the child type. In this example only the Book type keeps a reference to its associated Author DocKey.

> We are investigating methods for storing a non-normative array on the parent object that is efficient to maintain (inserts, deletes) and, as well as providing a secondary index for one-to-many relationships. The non-normative array method should only be used for small cardinality lists. E.g., Lists with a low and bounded number of elements.[color=green]

#### Many-to-Many
![](https://img.shields.io/badge/Status-TODO-yellow)

#### Multiple Relationships

It is possible to define a collection of different relationship models. Additionally, we can define multiple relationships within a single type.

Relationships that contain unique types, can simply be added to the types without issue. Like the following.
```graphql
type Author {
    name: String
    address: Address
    books: [Book] @relation("authored_books") @index
}
```

However, if we have multiple relationships using the *same* types, we need to annotate the differences. We will use the `@relation` directive to be explicit.
```graphql
type Author {
    name: String
    written: [Book] @relation(name: "written_books")
    reviewed: [Book] @relation(name: "reviewed_books")
}

type Book {
    title: String
    genre: String
    author Author @relation(name: "written_books")
    reviewedBy Author @relation(name: "reviewed_books")
}
```

Here we have two relations of the same type; by default, their association would conflict because internally type names are used to specify relations. We use the `@relation` to add a custom name to the relation. `@relation` can be added to any relationship, regardless of if it's a duplicate type relationship. It exists to be explicit, and to change the default parameters of the relation.
>>>>>>> 0c435cfc9047efae6c56574bbabd6af493514f45
