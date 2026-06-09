export type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

/** 客戶 Intake 偏好仍使用上午／下午／晚上標籤 */
export type TimePeriod = "morning" | "afternoon" | "evening";

/** 排程引擎使用的每日可開始小時（由 weeklySchedule 換算） */
export type StudioOperatingHours = Partial<Record<DayOfWeek, number[]>>;

/** 每週固定營業設定 */
export interface WeekdaySchedule {
  closed: boolean;
  start: string;
  end: string;
}

export type StudioWeeklySchedule = Partial<Record<DayOfWeek, WeekdaySchedule>>;
