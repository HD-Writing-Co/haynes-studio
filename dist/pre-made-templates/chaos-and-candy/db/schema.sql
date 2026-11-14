CREATE TABLE IF NOT EXISTS `messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`room` text NOT NULL,
	`user` text NOT NULL,
	`body` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `messages_room` ON `messages` (`room`,`id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `presence` (
	`user` text PRIMARY KEY NOT NULL,
	`room` text NOT NULL,
	`seen` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`avatar` text NOT NULL,
	`bio` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`kind` text NOT NULL,
	`owner` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `signals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`room` text NOT NULL,
	`sender` text NOT NULL,
	`recipient` text NOT NULL,
	`payload` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `signals_inbox` ON `signals` (`room`,`recipient`,`id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `voice` (
	`room` text NOT NULL,
	`session` text NOT NULL,
	`user` text NOT NULL,
	`seen` integer NOT NULL,
	PRIMARY KEY(`room`, `session`)
);

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS auth_attempts (
  bucket TEXT PRIMARY KEY,
  window INTEGER NOT NULL,
  attempts INTEGER NOT NULL
);
