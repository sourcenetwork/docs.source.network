---
sidebar_label: Relationships
sidebar_position: 80
---
# Relationships

DefraDB supports a number of common relational models that an application may need. These relations are expressed through the Document Model, which has a few differences from the standard SQL model. There are no manually created `Join Tables` which track relationships. Instead, the non-normative nature of NoSQL Document objects allows us to embed and resolve relationships as needed automatically.

Relationships are defined through the Document Schemas, using a series of GraphQL directives, and inferencing. They are always defined on both sides of the relation, meaning both objects involved in the relationship.

## One-to-One

The simplest relationship is a "one-to-one" which directly maps one document to another. The code below defines a one-to-one relationship between the `Author` and their `Address`:

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

The types of both objects are included and DefraDB infers the relationship. As a result:

- Both objects which can be queried separately.
- Each object provides field level access to its related object. 

The notable distinction of "one-to-one" relationships is that only the DocKey of the corresponding object is stored.

On the other hand, if you simply embed the Address within the Author type without the internal relational system, you can include the `@embed` directive, which will embed it within. Objects embedded inside another using the `@embed` directive do not expose a query endpoint, so they can *only* be accessed through their parent object. Additionally they are not assigned a DocKey.

## One-to-Many

A "one-to-many" relationship allows us to relate several objects of one type, to a single instance of another. 

Let us define a one-to-many relationship between an author and their books below. This example differs from the above relationship example because we relate the author to an array of books, instead of a single address.

```graphql
type Author {
    name: String
    books: [Book]
}

type Book {
    title: String
    genre: String
    description: String
    author: Author
}
```

In this case, the books object is defined within the Author object to be an array of books, indicating that *one* Author type has a relationship to *many* Book types. Internally, much like the one-to-one model, only the DocKeys are stored. However, the DocKey is only stored on one side of the relationship (the child type). In this example, only the Book type keeps a reference to its associated Author DocKey.

## Many-to-Many

A "many-to-many" relationship allows multiple instances of one type to be related to multiple instances of another type. DefraDB does not support direct many-to-many relationships. In DefraDB, many-to-many relationships are implemented using an explicit join type that connects the two related types. This simulates a many-to-many relationship by effectively creating a many-to-one-to-one-to-many pattern.

Let us define a many-to-many relationship between students and courses below. A student can enroll in many courses, and a course can have many students enrolled.

```graphql
type Student {
  name: String
  age: Int
  enrollment: [Enrollment]
}

type Course {
  title: String
  code: String
  enrollment: [Enrollment]
}

type Enrollment {
  student: Student @relation(name: "student_enrollments")
  course: Course @relation(name: "course_enrollments")
}
```

In this example, the `Enrollment` type acts as the join type that creates the many-to-many relationship between `Student` and `Course`. The join type has a one-to-many relationship with both Student and Course. Each enrollment links one student to one course. The `@relation` directive with unique names ensures that the relationships are properly distinguished.

Unlike traditional SQL databases that require manually created join tables, DefraDB uses a regular type definition for the join type. This approach leverages the non-normative nature of NoSQL document objects while maintaining clear relationship semantics through the schema.

You can query the relationships directly from either the `Student` or `Course` type, or through the intermediary `Enrollment` type.

```graphql
# Get students with their enrolled courses
query {
  Student {
    _docID
    name
    enrollment {
      course {
        title
        code
      }
    }
  }
}
```

```graphql
# Get courses with their enrolled students
query {
  Course {
    _docID
    title
    enrollment {
      student {
        name
        age
      }
    }
  }
}
```

You can also query the join type directly:

```graphql
# Get all enrollments with student and course details
query {
  Enrollment {
    student {
      name
      age
    }
    course {
      title
      code
    }
  }
}
```

This pattern is more convenient than manually querying for a student's `_docID` and then running a separate query on the `Enrollment` join type. 

DefraDB handles the traversal through the join type automatically, allowing you to express complex many-to-many queries in a single request, but it still must go through the join type.

The join type can also include additional fields specific to the relationship, such as enrollment date, grade, or status:

```graphql
type Enrollment {
  student: Student @relation(name: "student_enrollments")
  course: Course @relation(name: "course_enrollments")
  enrollmentDate: DateTime
  status: String
  grade: Float
}
```

This pattern allows you to maintain rich, contextual information about the relationship itself, not just the connection between the two types.

## Multiple Relationships

It is possible to define a collection of different relationship models. Additionally, we can define multiple relationships within a single type. Relationships containing unique types can simply be added to the types without issue. Like the following:

```graphql
type Author {
    name: String
    address: Address
    books: [Book] @relation(name: "authored_books") @index
}
```

However, in case of multiple relationships using the *same* types, you have to annotate the differences. You can use the `@relation` directive to be explicit.

```graphql
type Author {
    name: String
    written: [Book] @relation(name: "written_books")
    reviewed: [Book] @relation(name: "reviewed_books")
}

type Book {
    title: String
    genre: String
    author: Author @relation(name: "written_books")
    reviewedBy: Author @relation(name: "reviewed_books")
}
```

Here we have two relations of the same type. By default, their association would conflict because internally, type names are used to specify relations. We use the `@relation` to add a custom name to the relation. `@relation` can be added to any relationship, even if it's a duplicate type relationship. It exists to be explicit, and to change the default parameters of the relation.
