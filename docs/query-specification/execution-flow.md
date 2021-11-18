---
sidebar_label: Execution Flow
sidebar_position: 140
---
<<<<<<< HEAD
# Execution Flow
=======
# Execution Flow

Understanding the execution flow of a query can help understand its structure, and help developers craft their queries. Query execution is broken down into 3 phases, `parsing`, `planning`, and `executing`. 

The `parsing` phase is the simplest; it parses the given query as a string and returns a structured AST representation. Additionally, it does some necessary semantic validation of the structure against the schema. 

The `planning` phase analyzes the query and, the given storage structure, including any additional indexes, and determines how it will execute the query. This phase is highly dependant on the deployment environment, and underlying storage engine as it attempts to exploit the available features and structure to provide optimal performance. Specific schemas will automatically create certain secondary indexes. Additionally, the developer can create custom secondary indexes to fit their use cases best, and the `planning` phase will automatically use them when available.

Finally, the `execution` phase is the bulk of the request time, as it does the data scanning, filtering, and formatting. The `execution` phase has a deterministic process regarding the steps it takes to produce the results. This is due to the priority each argument and its parameters have for one another. 

The `filter` argument has the highest priority so it's executed first, breaking down the entire target collection based on its provided parameters and fields into the output result set. Next is the `groupBy` argument, that further chunks the result set into subgroups across potentially several dimensions after the `aggregate` phase computes some function over a subgroup's given fields. Next is the `having` argument, which further filters data based on the grouped fields or aggregate results. After the `order` argument which structures the result set based on the ordering, either ascending or descending of one or more field values. Finally, the `limit` argument and its associated arguments restrict the number of the finalized, filtered, ordered result set.

Here is the basic ordering of functions
```sequence
Filter->Grouping: Filtered Data
Grouping->Aggregate: Subgroups
Aggregate->Having: Subgroups
Having->Ordering: Filtered Data
Ordering->Limiting: Ordered Data
```

Here is a simplified example of the execution order:

![](https://i.imgur.com/Yf0KJ5A.png)
>>>>>>> 0c435cfc9047efae6c56574bbabd6af493514f45
