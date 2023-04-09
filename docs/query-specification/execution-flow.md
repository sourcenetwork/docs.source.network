---
sidebar_label: Execution Flow
sidebar_position: 140
---

# Execution Flow

Understanding the execution flow of a query can help you comprehend its structure and optimize your queries. Query execution is divided into three main phases: 
- Parsing
- Planning
- Executing

## Parsing Phase

During the parsing phase, the query is processed as a string and converted into a structured Abstract Syntax Tree (AST) representation. This phase also performs semantic validation of the query structure against the schema.

## Planning Phase

The planning phase involves analyzing the query, the storage structure, and any additional indexes to determine the most efficient query execution method. This phase is highly dependent on the deployment environment and underlying storage engine, as it leverages available features and structures to optimize performance. Specific schemas may automatically create certain secondary indexes. The planning phase automatically utilizes any custom secondary indexes you have created.

## Execution Phase

The execution phase handles data scanning, filtering, and formatting. This phase follows a deterministic process in the steps taken to produce results, based on the priority of an argument and its parameters.

The priority order of arguments is as follows:

1. filter -> groupBy: Filtered Data
2. groupBy -> aggregate: Subgroups
3. aggregate -> having: Subgroups
4. having -> order: Filtered Data
5. order -> limit: Ordered Data

Each step serves a specific purpose, as described below.

1. The `filter` argument reduces the target collection (based on provided parameters and fields) into the output result set.
2. The `groupBy` argument further divides the result set into subgroups across one or more dimensions.
3. The `aggregate` phase processes each subgroup's specified fields.
4. The `having` argument filters the data based on the grouped fields or aggregate results.
5. The `order` argument organizes the result set based on the ordering (ascending or descending) of one or more field values.
6. The `limit` argument and its associated parameters restrict the size of the finalized, filtered, and ordered result set.

Refer to the image below for an example of the execution order:

![](https://i.imgur.com/Yf0KJ5A.png)