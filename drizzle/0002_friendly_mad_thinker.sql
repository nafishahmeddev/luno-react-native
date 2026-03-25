ALTER TABLE `accounts` ADD `created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL;--> statement-breakpoint
ALTER TABLE `accounts` ADD `updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL;--> statement-breakpoint
ALTER TABLE `categories` ADD `created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL;--> statement-breakpoint
ALTER TABLE `categories` ADD `updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL;--> statement-breakpoint
ALTER TABLE `payments` ADD `created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL;--> statement-breakpoint
ALTER TABLE `payments` ADD `updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL;--> statement-breakpoint
CREATE INDEX `payments_account_id_idx` ON `payments` (`account_id`);--> statement-breakpoint
CREATE INDEX `payments_category_id_idx` ON `payments` (`category_id`);--> statement-breakpoint
CREATE INDEX `payments_datetime_idx` ON `payments` (`datetime`);