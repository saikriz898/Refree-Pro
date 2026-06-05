import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
export * from './schema';

// Run this once to ensure tables exist
export async function ensureTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS tournaments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      venue TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      device_id TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS matches (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tournament_id UUID REFERENCES tournaments(id),
      match_number INTEGER NOT NULL,
      match_date DATE NOT NULL,
      match_time TIME NOT NULL,
      venue TEXT NOT NULL,
      referee_name TEXT,
      team_a TEXT NOT NULL,
      team_b TEXT NOT NULL,
      team_a_color TEXT DEFAULT '#E74C3C',
      team_b_color TEXT DEFAULT '#3498DB',
      squad_format TEXT NOT NULL,
      match_duration INTEGER NOT NULL,
      break_duration INTEGER NOT NULL,
      extra_time INTEGER,
      score_a INTEGER DEFAULT 0,
      score_b INTEGER DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'scheduled',
      started_at TIMESTAMP,
      halftime_at TIMESTAMP,
      second_half_started_at TIMESTAMP,
      extra_time_started_at TIMESTAMP,
      completed_at TIMESTAMP,
      is_locked BOOLEAN DEFAULT FALSE,
      device_id TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS players (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
      team TEXT NOT NULL,
      name TEXT NOT NULL,
      jersey_no INTEGER,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS goals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
      player_name TEXT NOT NULL,
      jersey_no INTEGER,
      team TEXT NOT NULL,
      goal_type TEXT NOT NULL DEFAULT 'normal',
      minute INTEGER NOT NULL,
      is_undone BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS cards (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
      player_name TEXT NOT NULL,
      jersey_no INTEGER,
      team TEXT NOT NULL,
      card_type TEXT NOT NULL,
      minute INTEGER NOT NULL,
      is_undone BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS substitutions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
      team TEXT NOT NULL,
      player_out TEXT NOT NULL,
      player_in TEXT NOT NULL,
      minute INTEGER NOT NULL,
      is_undone BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS penalty_shootout (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
      team TEXT NOT NULL,
      player_name TEXT NOT NULL,
      jersey_no INTEGER,
      kick_number INTEGER NOT NULL,
      result TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS match_timer_state (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL UNIQUE,
      started_at_unix BIGINT,
      paused_at_unix BIGINT,
      total_paused_ms BIGINT DEFAULT 0,
      is_running BOOLEAN DEFAULT FALSE,
      current_half INTEGER DEFAULT 1,
      half1_started_at_unix BIGINT,
      half2_started_at_unix BIGINT,
      extra_started_at_unix BIGINT,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS tournament_standings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
      team_name TEXT NOT NULL,
      played INTEGER DEFAULT 0,
      won INTEGER DEFAULT 0,
      drawn INTEGER DEFAULT 0,
      lost INTEGER DEFAULT 0,
      goals_for INTEGER DEFAULT 0,
      goals_against INTEGER DEFAULT 0,
      goal_difference INTEGER DEFAULT 0,
      points INTEGER DEFAULT 0,
      head_to_head_pts INTEGER DEFAULT 0,
      head_to_head_gd INTEGER DEFAULT 0,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS app_settings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      setting_key TEXT UNIQUE NOT NULL,
      setting_value TEXT,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Ensure elapsed_ms columns exist for event logs to support stop clock laps
  await sql`ALTER TABLE goals ADD COLUMN IF NOT EXISTS elapsed_ms INTEGER;`;
  await sql`ALTER TABLE cards ADD COLUMN IF NOT EXISTS elapsed_ms INTEGER;`;
  await sql`ALTER TABLE substitutions ADD COLUMN IF NOT EXISTS elapsed_ms INTEGER;`;

  // Ensure device_id columns exist to support scoped multi-tenancy without auth
  await sql`ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS device_id TEXT;`;
  await sql`ALTER TABLE matches ADD COLUMN IF NOT EXISTS device_id TEXT;`;
}
