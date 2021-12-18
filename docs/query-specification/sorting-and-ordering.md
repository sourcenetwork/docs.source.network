---
sidebar_label: Sorting and Ordering
sidebar_position: 60
---
# Sorting and Ordering

Sorting is an integral part of any Database and Query Language. The sorting syntax is similar to filter syntax, in that we use objects, and sub-objects to indicate sorting behavior, instead of filter behavior.

The query to find all books ordered by their latest published date:
```javascript
{
    books(sort: { published_at: “desc”}) {
        title
        description
        published_at
    }
}
```
The syntax indicates:
- the field we wanted to sort on `published_at`
- direction we wanted to order by `descending`.

Sorting can be applied to multiple fields in the same query. The sort order is same as the field order in the sorted object.

The query below finds all books ordered by earliest published date and then by title descending.
```javascript
{
    books(sort: { published_at: ASC, title: DESC }) {
        title
        genre
        description
    }
}
```

You can also sort sub-object fields along with root object fields.

The query below finds all books ordered by earliest published date and then by the latest authors' birthday.
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

Sorting multiple fields simultaneously is primarily driven by the first indicated sort field (primary field). 
In the query above, it is the “published_at” date. 

The following sort field (secondary field), is used in the case that more than one records have the same value for the primary sort field. 

Assuming there are more than two sort fields, in that case, the same behavior applies, except the primary, secondary pair shifts by one element, so the 2nd field is the primary, and the 3rd is the secondary, until we reach the end of the sort fields.

In case of a single sort field and objects with same value, the documents identifier (DocKey) is used as the secondary sort field by default. This is applicable regardless of the number of sort fields. As long as the DocKey is not already included in sort fields, it acts as the final tie-breaking secondary field.

If the DocKey is included in the sort fields, any field included afterwards will never be evaluated, since all DocKeys are unique. If the sort fields are `published_at`, `id`, and `birthday`, the `birthday` sort field will never be evaluated, and should be removed from the list.

> Sorting on sub-objects from the root object is only allowed if the sub-object is not an array. If it is an array, the sort must be applied to the object field directly instead of through the root object.[color=orange]

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
         name: "John Grisham"
         books: [
            { title: "A Painted House" },
            { title: "The Guardians" }
         ]
     }
     author {
         name: "John Grisham"
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
