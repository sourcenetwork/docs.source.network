---
sidebar_label: Relationships
sidebar_position: 80
---
# Relationships

The notable distinction of "one-to-one" relationships is that only the DocKey of the corresponding object is stored.

On the other hand, if you simply embed the Address within the Author type without the internal relational system, you can include the `@embed` directive, which will embed it within. Objects embedded inside another using the `@embed` directive do not expose a query endpoint, so they can *only* be accessed through their parent object. Additionally they are not assigned a DocKey.

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
