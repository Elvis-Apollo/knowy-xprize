import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const sourceRecords = sqliteTable("source_records", {
  id: text("id").primaryKey(),
  source: text("source").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  version: text("version").notNull(),
  updatedAt: text("updated_at").notNull(),
  url: text("url").notNull(),
});

export const intelligenceObjects = sqliteTable("intelligence_objects", {
  id: text("id").primaryKey(),
  topic: text("topic").notNull(),
  answer: text("answer").notNull(),
  findings: text("findings").notNull(),
  confidence: real("confidence").notNull(),
  status: text("status").notNull(),
  checkedAt: text("checked_at").notNull(),
});

export const intelligenceDependencies = sqliteTable("intelligence_dependencies", {
  intelligenceId: text("intelligence_id").notNull(),
  sourceId: text("source_id").notNull(),
  sourceVersion: text("source_version").notNull(),
});

export const queryHistory = sqliteTable("query_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  question: text("question").notNull(),
  mode: text("mode").notNull(),
  createdAt: text("created_at").notNull(),
});
