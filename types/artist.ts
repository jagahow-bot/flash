import type {
  StudioOperatingHours,
  StudioWeeklySchedule,
} from "@/types/operating-hours";

export interface Artist {
  artistId: string;
  studioId: string;
  /** 綁定的後台登入 Email，可選 */
  userEmail?: string;
  displayName: string;
  styles: string[];
  bio?: string;
  isActive: boolean;
  /** 個人每週營業設定；未設定則沿用工作室 */
  weeklySchedule?: StudioWeeklySchedule;
  /** 由 weeklySchedule 換算（讀取時填入） */
  operatingHours?: StudioOperatingHours;
}
