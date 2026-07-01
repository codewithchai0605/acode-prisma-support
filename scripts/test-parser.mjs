import assert from "node:assert/strict";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { build } from "esbuild";

const outfile = path.join(os.tmpdir(), "acode-prisma-parser-test.cjs");

await build({
	entryPoints: ["src/languages/prisma/parser.js"],
	bundle: true,
	format: "cjs",
	platform: "node",
	outfile,
	logLevel: "silent",
});

let code =`
// ========================================
// Datasources
// ========================================

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
}

// ========================================
// Generators
// ========================================

generator client {
  provider        = "prisma-client-js"
  output          = "../generated/client"
  previewFeatures = ["fullTextSearch", "views"]
  binaryTargets   = ["native", "linux-musl"]
}

generator dbml {
  provider = "prisma-dbml-generator"
}

// ========================================
// Enums
// ========================================

enum Role {
  USER
  ADMIN
  MODERATOR
  SUPER_ADMIN
}

enum PostStatus {
  DRAFT
  REVIEW
  PUBLISHED
  ARCHIVED
}

// ========================================
// Models
// ========================================

model User {
  id            Int       @id @default(autoincrement())
  uuid          String    @unique @default(uuid())
  email         String    @unique
  username      String?   @db.VarChar(50)
  password      String
  age           Int?
  balance       Decimal   @default(0.00)
  avatar        Bytes?
  metadata      Json?
  isVerified    Boolean   @default(false)
  role          Role      @default(USER)
  posts         Post[]
  comments      Comment[]
  profile       Profile?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([email])
  @@index([username, role])
  @@map("users")
}

model Profile {
  id        Int      @id @default(autoincrement())
  bio       String?
  website   String?
  birthday  DateTime?
  userId    Int      @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("profiles")
}

model Post {
  id            Int          @id @default(autoincrement())
  slug          String       @unique
  title         String
  subtitle      String?
  content       String?
  summary       String?
  status        PostStatus   @default(DRAFT)
  published     Boolean      @default(false)
  publishedAt   DateTime?
  views         Int          @default(0)
  rating        Float        @default(0.0)
  authorId      Int
  author        User         @relation(fields: [authorId], references: [id])
  categoryId    Int?
  category      Category?    @relation(fields: [categoryId], references: [id])
  comments      Comment[]
  tags          PostTag[]
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@index([authorId])
  @@index([status, published])
  @@unique([authorId, slug])
  @@map("posts")
}

model Comment {
  id          Int       @id @default(autoincrement())
  message     String
  authorId    Int
  postId      Int
  author      User      @relation(fields: [authorId], references: [id])
  post        Post      @relation(fields: [postId], references: [id])
  parentId    Int?
  parent      Comment?  @relation("Replies", fields: [parentId], references: [id])
  replies     Comment[] @relation("Replies")
  createdAt   DateTime  @default(now())

  @@index([postId])
}

model Category {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  slug        String   @unique
  posts       Post[]

  @@map("categories")
}

model Tag {
  id        Int       @id @default(autoincrement())
  name      String    @unique
  posts     PostTag[]
}

model PostTag {
  postId    Int
  tagId     Int
  post       Post @relation(fields: [postId], references: [id])
  tag        Tag  @relation(fields: [tagId], references: [id])
  assignedAt DateTime @default(now())

  @@id([postId, tagId])
}

model Session {
  id            String    @id @default(cuid())
  token         String    @unique
  expiresAt     DateTime
  userId        Int
  user          User      @relation(fields: [userId], references: [id])

  @@index([expiresAt])
}

model File {
  id          Int       @id @default(autoincrement())
  filename    String
  mimeType    String
  size        BigInt
  checksum    String?
  storageKey  String @unique
  uploadedAt  DateTime @default(now())
  metadata    Json?
  @@map("files")
}

model AuditLog {
  id          BigInt      @id @default(autoincrement())
  entity      String
  entityId    String
  action      String
  payload     Json?
  createdAt   DateTime @default(now())
}

model LegacyTable {
  id      Int @id
  data    Unsupported("xml")
  @@map("legacy_table")
}`

let s = `
model User {
  id        Int      @id @default(autoincrement())
}

enum Role {
  USER
  ADMIN
}`
const require = createRequire(import.meta.url);
/**
 * @type {{ parser: import("@lezer/lr").LRParser }}
 */
const { parser } = require(outfile);

const samples = [
	{
		name: "Prisma",
		source: code,
		nodes: ["Identifier"],
	}
];

for (const sample of samples) {
	const tree = parser.parse(sample.source);
	const names = new Set();
	const errors = [];

	tree.iterate({
		enter(node) {
			names.add(node.name);
			console.log(node.name)
			if (node.type.isError) {
				errors.push([node.from, node.to]);
			}
		},
	});
	console.log(errors.join(".\n"))

	assert.equal(errors.length, 0, `${sample.name} produced parse errors`);
	assert.equal(tree.length, sample.source.length, `${sample.name} was not fully parsed`);
	for (const node of sample.nodes) {
		assert(names.has(node), `${sample.name} did not produce ${node}`);
	}
}

console.log(`Validated ${samples.length} prisma parser fixtures.`);
