export interface SessionDetails {
  sessions: number;
  hoursPerSession: number;
  /** Single session: full project price. Multi-session: current session price only. */
  totalPrice: number | string;
  /** Single session: project deposit. Multi-session: current session deposit only. */
  depositRequired: number | string;
  /** Which session `totalPrice` / `depositRequired` apply to (multi-session only). */
  pricedSessionIndex?: number;
}

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
}
