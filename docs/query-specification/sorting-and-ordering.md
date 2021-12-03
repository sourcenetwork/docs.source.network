---
sidebar_label: Sorting and Ordering
sidebar_position: 60
---
# Sorting and Ordering

Sorting is an integral part of any Database and Query Language. The sorting syntax is similar to the filter syntax, in that we use objects, and sub-objects to indicate sorting behavior, instead of filter behavior.

Let's find all books ordered by their latest published date
```javascript
{
    books(sort: { published_at: “desc”}) {
        title
        description
        published_at
    }
}
```

Here we indicated which field we wanted to sort on (published_at) and which direction we wanted to order by (descending).

Fields may be sorted either Ascending or Descending.

Sorting can be applied to multiple fields in the same query. The order of which sort is applied first, is the same as the field order in the sort object. 

Let's find all books ordered by earliest published date and then by title descending
```javascript
{
    books(sort: { published_at: ASC, title: DESC }) {
        title
        genre
        description
    }
}
```

Additionally we can sort on sub-object fields along with root object fields.

Let’s find all books ordered by earliest published date and then by the latest authors' birthday
```javascript
{
    books(sort: { published_at: ASC, author: { birthday: DESC }}) {
        title
        description
        published_at
        author {
            name
            birthday
        }
    }
}
```

Sorting on multiple fields at once behavior is primarily driven by the first indicated sort field, called the primary field. In the above example, this would be the “published_at” date. The following sort field, called the secondary field, is used in the case that more than one record has the same value for the primary sort field. Suppose than two sort fields are indicated. In that case, the same behavior applies, except the primary, secondary pair shifts by one element, so the 2nd field is the primary, and the 3rd is the secondary, until we reach the end of the sort fields.

If only a single sort field is given, and objects have the same value, then by default the documents identifier (DocKey) is used as the secondary sort field. This generally applies regardless of how many sort fields are given. So long as the DocKey is not already included sort fields, it is always the final tie-breaking secondary field.

A direct result of the DocKey sort behavior algorithm is that if the DocKey is included in the queries sort fields, any field included afterward will never be evaluated, since all DocKeys are unique. Given fields (published_at, id, birthday), the birthday sort field will never be evaluated, and should be removed from the list.

> Sorting on sub-objects from the root object is only allowed if the subobject is not an array. If it is an array, the sort must be applied to the object field directly instead of through the root object. [color=orange]

*So, instead of*
```javascript
{
    authors(sort: { name: DESC, books: { title: ASC }}) {
        name
        books {
            title
        }
    }
}
```
*We need*
```javascript
{
    authors(sort: { name: DESC }) {
        name
        books(sort: { title: ASC }) {
            title
        }
    }
}
```

> This is because root level filters and order apply to the root object only. If we did allow this version, it would be ambigiuous from the developers' point of view if the ordering applied to the order of the root object compared to its sibling objects or if the ordering applied solely to the sub-object. Suppose we allowed it, and enforced the semantics of root level sorting on array sub objects to act as a sorting mechanism for the root object. In that case, there is no obvious way to determine which value in the array is used for the root order. [color=orange]
>
> This means that if we had the following objects in the database:
```javascript
 [
     author {
         name: "John Grissam"
         books: [
            { title: "A Painted House" },
            { title: "The Guardians" }
         ]
     }
     author {
         name: "John Grissam"
         books: [
            { title: "Camino Winds" },
         ]
     }
     author {
         name: "John LeCare"
         books: [
             { title: "Tinker, Tailor, Soldier, Spy"}
         ]
     }
 ]
```
> and the following query [color=orange]
```javascript
{
    authors(sort: { name: DESC, books: { title: ASC }}) {
        name
        books {
            title
        }
    }
}
```

```javascript
books(filter: {_id: [1]}) {
    title 
    genre
    description
}
```

> Since we have two authors with the same name (John Grisham), the sort object `(sort: { name: "desc", books: { title: "asc" }}` would suggest we sort duplicate authors using `books: { title: "asc" }` as the secondary sort field. However, because the books field is an array of objects, there is no single value for the title to compare easily. [color=orange]
>
> Therefore, sorting on array sub objects from the root field is ***strictly*** not allowed.
