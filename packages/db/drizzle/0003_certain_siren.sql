CREATE TABLE "game_matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"match_name" text,
	"total_players" integer NOT NULL,
	"status" text DEFAULT 'completed',
	"started_at" timestamp with time zone DEFAULT now(),
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "game_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "game_results" DROP CONSTRAINT "game_results_game_id_games_id_fk";
--> statement-breakpoint
ALTER TABLE "game_results" ALTER COLUMN "game_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "game_type_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "min_players" integer DEFAULT 2;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "max_players" integer;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "is_active" text DEFAULT 'true';--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "game_results" ADD COLUMN "game_match_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "game_matches" ADD CONSTRAINT "game_matches_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_game_type_id_game_types_id_fk" FOREIGN KEY ("game_type_id") REFERENCES "public"."game_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_results" ADD CONSTRAINT "game_results_game_match_id_game_matches_id_fk" FOREIGN KEY ("game_match_id") REFERENCES "public"."game_matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" DROP COLUMN "game_type";--> statement-breakpoint
ALTER TABLE "games" DROP COLUMN "total_players";--> statement-breakpoint
ALTER TABLE "games" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "games" DROP COLUMN "started_at";--> statement-breakpoint
ALTER TABLE "games" DROP COLUMN "completed_at";--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_name_unique" UNIQUE("name");