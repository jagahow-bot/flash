import { Timestamp } from "firebase/firestore";
import type { TimeSlot } from "@/types/session-details";

export interface FirestoreTimeSlot {
  startTime: Timestamp;
  endTime: Timestamp;
}

export function toFirestoreTimeSlot(slot: TimeSlot): FirestoreTimeSlot {
  return {
    startTime: Timestamp.fromDate(slot.startTime),
    endTime: Timestamp.fromDate(slot.endTime),
  };
}

export function fromFirestoreTimeSlot(slot: FirestoreTimeSlot): TimeSlot {
  return {
    startTime: slot.startTime.toDate(),
    endTime: slot.endTime.toDate(),
  };
}

export function toDate(value: Date | Timestamp | string | number): Date {
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  return new Date(value);
}
