# Document Model

As mentioned above, DefraDB uses a Document API model, which is distinctive from traditional SQL models. The main differences rely on the normative nature of data within SQL versus the more simplistic Document model. The benefits of the Document Model are because how closely your data state is able to represent your application state, which gives rise to the concept that Document stores in the NoSQL world are more “Developer Friendly”. SQL was designed from an academic, formally defined perspective, which makes it very “Teachable” and easier. for professors to teach it within an educational setting. In most Database 101 classes, we first learn about Relational Algebra, a strictly defined formal language for expressing relationships between data, and SQL is a widespread implementation of this formal language. It allows for fine-tuned query expressions; however, it is very disconnected from both the Application state and conceptual models humans rely on to reason about data.

As a result, GraphQL is a perfect pairing for Document Model databases as the GraphQL schema system closely resembles both Application state, and common Document model Schemas, which results in the least number of context switches when trying to reason about how your application state persists to your datastore. The downside is the lack of expressionism compared to SQL; however, SQLs powerful expressions are inherently required by its complex data model. Using a more simplistic data model doesn’t require as powerful expressions to reason about. SQL relies on normalized data, indirection, join tables, and more, which make constructing queries hyper-specific to SQL, and even implementation-specific between SQL options. Document Models have a more flexible system, which doesn’t enforce normalization, and can more easily represent relations and embeddings between types.