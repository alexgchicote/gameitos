ALTER TABLE "players" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "players" ALTER COLUMN "total_points" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "players" ALTER COLUMN "games_played" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "players" ALTER COLUMN "wins" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "players" ALTER COLUMN "podiums" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "players" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "players" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "players" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "players" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "started_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "started_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "completed_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "game_results" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "game_results" ALTER COLUMN "created_at" SET DEFAULT now();