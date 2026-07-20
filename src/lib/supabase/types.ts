export type GoalType = "percent" | "numeric" | "milestones";
export type GoalStatus = "active" | "done" | "paused" | "archived";
export type HabitKind = "build" | "avoid";
export type HabitCadence = "daily" | "weekly";
export type CheckinType = "morning" | "evening";
export type ReviewPeriod = "day" | "week";

export interface UsersRow {
  id: string;
  email: string;
  settings: Record<string, unknown>;
  created_at: string;
}
export interface VisionRow {
  user_id: string;
  statement: string;
  updated_at: string;
}
export interface DomainsRow {
  id: string;
  user_id: string;
  name: string;
  color: string;
  sort_order: number;
  created_at: string;
}
export interface GoalsRow {
  id: string;
  user_id: string;
  domain_id: string | null;
  title: string;
  description: string | null;
  type: GoalType;
  target_value: number | null;
  current_value: number;
  unit: string | null;
  deadline: string | null;
  status: GoalStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
export interface MilestonesRow {
  id: string;
  goal_id: string;
  title: string;
  done: boolean;
  due_date: string | null;
  sort_order: number;
  created_at: string;
}
export interface HabitsRow {
  id: string;
  user_id: string;
  name: string;
  kind: HabitKind;
  cadence: HabitCadence;
  weekly_target: number | null;
  domain_id: string | null;
  anchor: boolean;
  active: boolean;
  sort_order: number;
  created_at: string;
}
export interface HabitLogsRow {
  id: string;
  habit_id: string;
  date: string;
  done: boolean;
  value: number | null;
  note: string | null;
  created_at: string;
}
export interface CheckinsRow {
  id: string;
  user_id: string;
  date: string;
  type: CheckinType;
  intention: string | null;
  top_tasks: { title: string; goal_id?: string | null; done?: boolean }[];
  reflection: string | null;
  weight_kg: number | null;
  screen_note: string | null;
  mood: number | null;
  created_at: string;
}
export interface ConsequencesRow {
  id: string;
  user_id: string;
  source_habit_id: string | null;
  date: string;
  description: string;
  resolved: boolean;
  created_at: string;
}
export interface MetricsRow {
  id: string;
  user_id: string;
  date: string;
  key: string;
  value: number | null;
  note: string | null;
  created_at: string;
}
export interface AiReviewsRow {
  id: string;
  user_id: string;
  period: ReviewPeriod;
  date: string;
  content: string;
  model: string | null;
  created_at: string;
}
export interface PushSubscriptionsRow {
  id: string;
  user_id: string;
  endpoint: string;
  keys: Record<string, string>;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UsersRow;
        Insert: { id: string; email: string; settings?: Record<string, unknown>; created_at?: string };
        Update: Partial<UsersRow>;
        Relationships: [];
      };
      vision: {
        Row: VisionRow;
        Insert: { user_id: string; statement: string; updated_at?: string };
        Update: Partial<VisionRow>;
        Relationships: [];
      };
      domains: {
        Row: DomainsRow;
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<DomainsRow>;
        Relationships: [];
      };
      goals: {
        Row: GoalsRow;
        Insert: {
          id?: string;
          user_id: string;
          domain_id?: string | null;
          title: string;
          description?: string | null;
          type?: GoalType;
          target_value?: number | null;
          current_value?: number;
          unit?: string | null;
          deadline?: string | null;
          status?: GoalStatus;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<GoalsRow>;
        Relationships: [];
      };
      milestones: {
        Row: MilestonesRow;
        Insert: {
          id?: string;
          goal_id: string;
          title: string;
          done?: boolean;
          due_date?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<MilestonesRow>;
        Relationships: [];
      };
      habits: {
        Row: HabitsRow;
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          kind?: HabitKind;
          cadence?: HabitCadence;
          weekly_target?: number | null;
          domain_id?: string | null;
          anchor?: boolean;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<HabitsRow>;
        Relationships: [];
      };
      habit_logs: {
        Row: HabitLogsRow;
        Insert: {
          id?: string;
          habit_id: string;
          date: string;
          done?: boolean;
          value?: number | null;
          note?: string | null;
          created_at?: string;
        };
        Update: Partial<HabitLogsRow>;
        Relationships: [];
      };
      checkins: {
        Row: CheckinsRow;
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          type: CheckinType;
          intention?: string | null;
          top_tasks?: { title: string; goal_id?: string | null; done?: boolean }[];
          reflection?: string | null;
          weight_kg?: number | null;
          screen_note?: string | null;
          mood?: number | null;
          created_at?: string;
        };
        Update: Partial<CheckinsRow>;
        Relationships: [];
      };
      consequences: {
        Row: ConsequencesRow;
        Insert: {
          id?: string;
          user_id: string;
          source_habit_id?: string | null;
          date: string;
          description: string;
          resolved?: boolean;
          created_at?: string;
        };
        Update: Partial<ConsequencesRow>;
        Relationships: [];
      };
      metrics: {
        Row: MetricsRow;
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          key: string;
          value?: number | null;
          note?: string | null;
          created_at?: string;
        };
        Update: Partial<MetricsRow>;
        Relationships: [];
      };
      ai_reviews: {
        Row: AiReviewsRow;
        Insert: {
          id?: string;
          user_id: string;
          period: ReviewPeriod;
          date: string;
          content: string;
          model?: string | null;
          created_at?: string;
        };
        Update: Partial<AiReviewsRow>;
        Relationships: [];
      };
      push_subscriptions: {
        Row: PushSubscriptionsRow;
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          keys: Record<string, string>;
          created_at?: string;
        };
        Update: Partial<PushSubscriptionsRow>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      seed_levens_os: {
        Args: Record<string, never>;
        Returns: undefined;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Domain = DomainsRow;
export type Goal = GoalsRow;
export type Milestone = MilestonesRow;
export type Habit = HabitsRow;
export type HabitLog = HabitLogsRow;
export type Checkin = CheckinsRow;
export type Consequence = ConsequencesRow;
export type Metric = MetricsRow;
export type AiReview = AiReviewsRow;
export type Vision = VisionRow;
