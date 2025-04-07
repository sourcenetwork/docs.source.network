---
sidebar_label: Schema Relationship Guide
sidebar_position: 50
---
# Schema Relationships in DefraDB

In modern application development, structuring data effectively is crucial for performance and maintainability.  

DefraDB offers robust schema management capabilities that allow organizations to define and manage relationships between different data types.  

This guide provides a comprehensive overview of schema relationships in DefraDB, focusing on one-to-one and one-to-many relationships, their implementation, and best practices.

## Overview

Schemas in DefraDB enable development teams to enforce a structured format on data types, ensuring type safety and structural integrity.  
This structure allows applications to maintain consistent data formats, facilitating efficient data management and retrieval.

When establishing relationships between different data types, development teams must consider various factors to ensure data integrity and optimal performance.  
DefraDB supports several types of relationships, including:

- **One-to-One Relationship**:  
  A single instance of one data type is associated with a single instance of another data type. For example, a `User` entity may have one `Profile`.

- **One-to-Many/Many-to-One Relationship**:  
  A single instance of one data type is associated with multiple instances of another data type. For instance, an `Author` may have multiple `Books`, with each `Book` referencing one `Author`.

- **Many-to-Many Relationship**:  
  Multiple instances of one data type are associated with multiple instances of another data type. For example, multiple `Students` can enroll in multiple `Courses`.  
  > ⚠️ Note: Many-to-many relationships are currently not supported natively by DefraDB but can be implemented through intermediary techniques.

## Relationship Management in DefraDB

DefraDB manages relationships by automatically handling the correlation between data types, including the creation and management of primary and foreign keys.  
Developers specify the type of relationship (e.g., one-to-one, one-to-many), and DefraDB manages the underlying details, such as which side maintains the foreign key.

When querying related data, it's generally more efficient to query from the primary side to the secondary side.  
DefraDB utilizes type joins to simplify these operations, reducing the complexity typically associated with manual join definitions.

## Implementing One-to-One Relationships

In a one-to-one relationship, each instance of a data type is associated with a single instance of another data type.  
For example, consider a `User` with a corresponding `Address`.

### Defining the Schema

```graphql
type User {
  name: String
  username: String
  age: Int
  address: Address @primary
}

type Address {
  streetNumber: String
  streetName: String
  country: String
  user: User
}
```

In this schema, the User type has a primary relationship with the Address type.
DefraDB automatically manages the foreign keys based on this definition.

### Creating and Updating Instances

1. Create the Address instance:

    ```graphql
    mutation {
      create_Address(input: {
        streetNumber: "123",
        streetName: "Test Road",
        country: "Canada"
      }) {
        _key
      }
    }
    ```

1. Create the User instance, referencing the Address:

    ```graphql
    mutation {
      create_User(input: {
        name: "Alice", 
        username: "awesomealice", 
        age: 35, 
        address_id: "address_instance_key"
      }) {
        _key
      }
    }
    ```

The `address_id` should correspond to the `_key` returned when the `Address` instance was created.

### Querying the Data

  ```graphql
    query {
      User {
        name
        username
        age
        Address {
          streetNumber
          streetName
          country
        }
      }
    }
  ```

This query fetches the `User` details along with the associated `Address`.

## Implementing One-to-Many Relationships

In a one-to-many relationship, a single instance of one data type is associated with multiple instances of another data type. For example, an Author with multiple Books.

### Defining the Schema

```graphql
type Author {
  name: String
  dateOfBirth: DateTime
  authoredBooks: [Book]
}

type Book {
  name: String
  description: String
  genre: String
  author: Author
}
```
> Note: `authoredBooks` is optional, and is only required if users wish to traverse the relationship from this side.

Here, the Author type has a list of authoredBooks, establishing the one-to-many relationship.

### Creating and Updating Instances

1. Create the Author instance:

    ```graphql
    mutation {
      create_Author(input: {
        name: "Saadi",
        dateOfBirth: "1210-07-23T03:46:56.647Z"
      }) {
        _key
      }
    }
    ```

1. Create Book instances, referencing the Author:

    ```graphql
    mutation {
      create_Book(input: {
        name: "Gulistan",
        genre: "Poetry",
        author_id: "author_instance_key"
      }) {
        _key
      }
    }
    ```

Repeat the book creation mutation for each book authored by the Author.

### Querying the Data

  ```graphql
  query {
    Author {
      name
      dateOfBirth
      authoredBooks {
        name
        genre
        description
      }
    }
  }
```

This query fetches the Author details along with all associated Books.

## Current Limitations and Future Outlook

While DefraDB offers robust support for one-to-one and one-to-many relationships, there are current limitations:

- **Many-to-Many Relationships**:
  Direct support is not available but can be implemented using intermediary types (also called join tables or junction tables) that hold references to both related types.

- **Cascading Deletes**:
  Currently, DefraDB does not automatically delete associated records when a parent record is deleted.
  Developers must manage these deletions manually to maintain data integrity.

- **Advanced Validation Rules**:
  DefraDB’s current validation features are limited and may not cover all complex data integrity scenarios out-of-the-box.

## Best Practices

- **Design Relationships Early**:
  Plan schema relationships during the initial stages of your application design to avoid costly migrations later.

- **Use Descriptive Field Names**:
  Clearly indicate relationship direction and semantics using intuitive field names.

- **Maintain Consistency**:
  Ensure uniform naming conventions and relationship structures across schemas to improve readability and maintainability.

- **Document Schema Decisions**:
  Keep thorough documentation of how relationships are defined and why certain design decisions were made.

## Conclusion

DefraDB’s schema relationship features enable developers to model real-world scenarios with structured and interrelated data. Understanding how to define and query one-to-one and one-to-many relationships allows for efficient data modeling and querying. Although there are some current limitations, the platform is evolving, and continued improvements will enhance its flexibility and power.
