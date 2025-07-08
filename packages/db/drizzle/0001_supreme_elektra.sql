ALTER TABLE "players" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "players" ALTER COLUMN "total_points" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "players" ALTER COLUMN "games_played" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "players" ALTER COLUMN "wins" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "players" ALTER COLUMN "podiums" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "players" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "players" ALTER COLUMN "updated_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "game_results" ADD COLUMN "position_from_median" integer;