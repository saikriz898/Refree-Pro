import { pgTable, uuid, text, integer, boolean, timestamp, date, time, bigint } from 'drizzle-orm/pg-core';

export const tournaments = pgTable('tournaments', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  venue: text('venue').notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  status: text('status').notNull().default('active'),
  deviceId: text('device_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const matches = pgTable('matches', {
  id: uuid('id').primaryKey().defaultRandom(),
  tournamentId: uuid('tournament_id').references(() => tournaments.id),
  matchNumber: integer('match_number').notNull(),
  matchDate: date('match_date').notNull(),
  matchTime: time('match_time').notNull(),
  venue: text('venue').notNull(),
  refereeName: text('referee_name'),
  teamA: text('team_a').notNull(),
  teamB: text('team_b').notNull(),
  teamAColor: text('team_a_color').default('#E74C3C'),
  teamBColor: text('team_b_color').default('#3498DB'),
  squadFormat: text('squad_format').notNull(),
  matchDuration: integer('match_duration').notNull(),
  breakDuration: integer('break_duration').notNull(),
  extraTime: integer('extra_time'),
  scoreA: integer('score_a').default(0),
  scoreB: integer('score_b').default(0),
  status: text('status').notNull().default('scheduled'),
  startedAt: timestamp('started_at'),
  halftimeAt: timestamp('halftime_at'),
  secondHalfStartedAt: timestamp('second_half_started_at'),
  extraTimeStartedAt: timestamp('extra_time_started_at'),
  completedAt: timestamp('completed_at'),
  isLocked: boolean('is_locked').default(false),
  deviceId: text('device_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const players = pgTable('players', {
  id: uuid('id').primaryKey().defaultRandom(),
  matchId: uuid('match_id').references(() => matches.id, { onDelete: 'cascade' }).notNull(),
  team: text('team').notNull(),
  name: text('name').notNull(),
  jerseyNo: integer('jersey_no'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const goals = pgTable('goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  matchId: uuid('match_id').references(() => matches.id, { onDelete: 'cascade' }).notNull(),
  playerName: text('player_name').notNull(),
  jerseyNo: integer('jersey_no'),
  team: text('team').notNull(),
  goalType: text('goal_type').notNull().default('normal'),
  minute: integer('minute').notNull(),
  elapsedMs: integer('elapsed_ms'),
  isUndone: boolean('is_undone').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const cards = pgTable('cards', {
  id: uuid('id').primaryKey().defaultRandom(),
  matchId: uuid('match_id').references(() => matches.id, { onDelete: 'cascade' }).notNull(),
  playerName: text('player_name').notNull(),
  jerseyNo: integer('jersey_no'),
  team: text('team').notNull(),
  cardType: text('card_type').notNull(),
  minute: integer('minute').notNull(),
  elapsedMs: integer('elapsed_ms'),
  isUndone: boolean('is_undone').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const substitutions = pgTable('substitutions', {
  id: uuid('id').primaryKey().defaultRandom(),
  matchId: uuid('match_id').references(() => matches.id, { onDelete: 'cascade' }).notNull(),
  team: text('team').notNull(),
  playerOut: text('player_out').notNull(),
  playerIn: text('player_in').notNull(),
  minute: integer('minute').notNull(),
  elapsedMs: integer('elapsed_ms'),
  isUndone: boolean('is_undone').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const penaltyShootout = pgTable('penalty_shootout', {
  id: uuid('id').primaryKey().defaultRandom(),
  matchId: uuid('match_id').references(() => matches.id, { onDelete: 'cascade' }).notNull(),
  team: text('team').notNull(),
  playerName: text('player_name').notNull(),
  jerseyNo: integer('jersey_no'),
  kickNumber: integer('kick_number').notNull(),
  result: text('result').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const matchTimerState = pgTable('match_timer_state', {
  id: uuid('id').primaryKey().defaultRandom(),
  matchId: uuid('match_id').references(() => matches.id, { onDelete: 'cascade' }).notNull().unique(),
  startedAtUnix: bigint('started_at_unix', { mode: 'number' }),
  pausedAtUnix: bigint('paused_at_unix', { mode: 'number' }),
  totalPausedMs: bigint('total_paused_ms', { mode: 'number' }).default(0),
  isRunning: boolean('is_running').default(false),
  currentHalf: integer('current_half').default(1),
  half1StartedAtUnix: bigint('half1_started_at_unix', { mode: 'number' }),
  half2StartedAtUnix: bigint('half2_started_at_unix', { mode: 'number' }),
  extraStartedAtUnix: bigint('extra_started_at_unix', { mode: 'number' }),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const tournamentStandings = pgTable('tournament_standings', {
  id: uuid('id').primaryKey().defaultRandom(),
  tournamentId: uuid('tournament_id').references(() => tournaments.id, { onDelete: 'cascade' }).notNull(),
  teamName: text('team_name').notNull(),
  played: integer('played').default(0),
  won: integer('won').default(0),
  drawn: integer('drawn').default(0),
  lost: integer('lost').default(0),
  goalsFor: integer('goals_for').default(0),
  goalsAgainst: integer('goals_against').default(0),
  goalDifference: integer('goal_difference').default(0),
  points: integer('points').default(0),
  headToHeadPts: integer('head_to_head_pts').default(0),
  headToHeadGd: integer('head_to_head_gd').default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const appSettings = pgTable('app_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  settingKey: text('setting_key').unique().notNull(),
  settingValue: text('setting_value'),
  updatedAt: timestamp('updated_at').defaultNow(),
});
