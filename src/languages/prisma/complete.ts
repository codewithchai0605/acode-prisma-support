import {
  snippetCompletion as snip,
  type Completion,
  type CompletionSource,
} from "@codemirror/autocomplete"

const keywords: Completion[] = [
  { label: "model", type: "keyword", info: "Define a data model" },
  { label: "enum", type: "keyword", info: "Define an enum type" },
  { label: "datasource", type: "keyword", info: "Define a database connection" },
  { label: "generator", type: "keyword", info: "Define a Prisma client generator" },
  { label: "type", type: "keyword", info: "Define a composite type" },
  { label: "view", type: "keyword", info: "Define a database view" },
]

const types: Completion[] = [
  { label: "String", type: "type", info: "Variable-length text" },
  { label: "Int", type: "type", info: "32-bit integer" },
  { label: "BigInt", type: "type", info: "64-bit integer" },
  { label: "Float", type: "type", info: "Floating-point number" },
  { label: "Decimal", type: "type", info: "Precise decimal number" },
  { label: "Boolean", type: "type", info: "True or false value" },
  { label: "DateTime", type: "type", info: "ISO 8601 date and time" },
  { label: "Json", type: "type", info: "JSON data" },
  { label: "Bytes", type: "type", info: "Binary data" },
  { label: "Unsupported", type: "type", info: "Unsupported database type" },
]

const fieldAttributes: Completion[] = [
  { label: "@id", type: "attribute", info: "Mark field as primary key" },
  { label: "@unique", type: "attribute", info: "Field value must be unique" },
  { label: "@default", type: "attribute", info: "Set a default value" },
  { label: "@relation", type: "attribute", info: "Define a relation to another model" },
  { label: "@map", type: "attribute", info: "Map field to a different column name" },
  { label: "@updatedAt", type: "attribute", info: "Auto-update timestamp on change" },
  { label: "@createdAt", type: "attribute", info: "Auto-set timestamp on creation" },
  { label: "@ignore", type: "attribute", info: "Exclude from Prisma client" },
  { label: "@db.Text", type: "attribute", info: "Store as TEXT in database" },
  { label: "@db.VarChar", type: "attribute", info: "Store as VARCHAR(n) in database" },
  { label: "@db.Boolean", type: "attribute", info: "Boolean type" },
  { label: "@db.Integer", type: "attribute", info: "Integer type" },
  { label: "@db.SmallInt", type: "attribute", info: "Small integer type" },
  { label: "@db.BigInt", type: "attribute", info: "Big integer type" },
  { label: "@db.Real", type: "attribute", info: "Real number type" },
  { label: "@db.DoublePrecision", type: "attribute", info: "Double precision float" },
  { label: "@db.Decimal", type: "attribute", info: "Decimal type" },
  { label: "@db.DateTime", type: "attribute", info: "DateTime type" },
  { label: "@db.Date", type: "attribute", info: "Date only type" },
  { label: "@db.Time", type: "attribute", info: "Time only type" },
  { label: "@db.Timestamp", type: "attribute", info: "Timestamp type" },
  { label: "@db.Json", type: "attribute", info: "JSON type" },
  { label: "@db.JsonB", type: "attribute", info: "JSONB type (PostgreSQL)" },
  { label: "@db.Uuid", type: "attribute", info: "UUID type" },
  { label: "@db.Xml", type: "attribute", info: "XML type" },
]

const blockAttributes: Completion[] = [
  { label: "@@id", type: "attribute", info: "Define composite primary key" },
  { label: "@@unique", type: "attribute", info: "Define unique constraint on multiple fields" },
  { label: "@@index", type: "attribute", info: "Define an index on one or more fields" },
  { label: "@@map", type: "attribute", info: "Map model to a different table name" },
  { label: "@@ignore", type: "attribute", info: "Exclude model from Prisma client" },
  { label: "@@schema", type: "attribute", info: "Define schema for multi-schema support" },
]

const functions: Completion[] = [
  { label: "autoincrement()", type: "function", info: "Auto-incrementing integer" },
  { label: "uuid()", type: "function", info: "Generate UUID v4" },
  { label: "cuid()", type: "function", info: "Generate CUID" },
  { label: "now()", type: "function", info: "Current timestamp" },
  { label: "dbgenerated()", type: "function", info: "Database-generated value" },
]

const relationActions: Completion[] = [
  { label: "CASCADE", type: "constant", info: "Delete related records on delete" },
  { label: "SET_NULL", type: "constant", info: "Set relation to null on delete" },
  { label: "SET_DEFAULT", type: "constant", info: "Set to default value on delete" },
  { label: "RESTRICT", type: "constant", info: "Prevent deletion if related records exist" },
  { label: "NO_ACTION", type: "constant", info: "No action on delete (similar to RESTRICT)" },
]

const snippets: Completion[] = [
  snip("model ${name} {\n  id    Int     @id @default(autoincrement())\n  ${field} String\n  createdAt DateTime @default(now())\n}", {
    label: "model",
    type: "snippet",
    info: "Create a new model",
  }),
  snip("enum ${name} {\n  ${VALUE1}\n  ${VALUE2}\n}", {
    label: "enum",
    type: "snippet",
    info: "Create a new enum",
  }),
  snip("datasource db {\n  provider = \"${postgresql}\"\n  url      = env(\"DATABASE_URL\")\n}", {
    label: "datasource",
    type: "snippet",
    info: "Define database connection",
  }),
  snip("generator client {\n  provider = \"prisma-client-js\"\n}", {
    label: "generator",
    type: "snippet",
    info: "Define Prisma client generator",
  }),
  snip("@id @default(autoincrement())", {
    label: "@id auto",
    type: "snippet",
    info: "Auto-increment primary key",
  }),
  snip("@id @default(uuid())", {
    label: "@id uuid",
    type: "snippet",
    info: "UUID primary key",
  }),
  snip("@relation(fields: [${field}], references: [${id}], onDelete: Cascade)", {
    label: "@relation",
    type: "snippet",
    info: "Relation with cascade delete",
  }),
  snip("@@unique([${field1}, ${field2}])", {
    label: "@@unique",
    type: "snippet",
    info: "Unique constraint on multiple fields",
  }),
  snip("@@index([${field}])", {
    label: "@@index",
    type: "snippet",
    info: "Index on a field",
  }),
]

const allOptions = [
  ...keywords,
  ...types,
  ...fieldAttributes,
  ...blockAttributes,
  ...functions,
  ...relationActions,
  ...snippets,
]

export const prismaCompletion: CompletionSource = (context) => {
  const word = context.matchBefore(/\w*/)
  if (!word) return null

  if (word.from === word.to && !context.explicit) return null

  const textBefore = context.state.doc.sliceString(0, word.to)
  const lastLine = textBefore.slice(textBefore.lastIndexOf("\n") + 1)

  if (lastLine.includes("@@")) {
    return {
      from: word.from,
      options: [...blockAttributes, ...snippets.filter((s) => s.label.startsWith("@@"))],
      validFor: /^\w*$/,
    }
  }

  if (lastLine.includes("@")) {
    return {
      from: word.from,
      options: [...fieldAttributes, ...functions, ...snippets],
      validFor: /^\w*$/,
    }
  }

  if (/[=(]\s*$/.test(lastLine) || /\[\s*$/.test(lastLine)) {
    return {
      from: word.from,
      options: [...types, ...functions, ...relationActions],
      validFor: /^\w*$/,
    }
  }

  if (/:\s*$/.test(lastLine)) {
    return {
      from: word.from,
      options: [...relationActions],
      validFor: /^\w*$/,
    }
  }

  return {
    from: word.from,
    options: allOptions,
    validFor: /^\w*$/,
  }
}
