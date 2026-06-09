"use client";

import {
  getMockProjectsByStatus,
  mockDataSummary,
  mockStudio,
  MOCK_STUDIO_ID,
} from "@/data/mock/index";
import { useAppDictionary } from "@/components/providers/locale-provider";
import { formatMessage } from "@/lib/i18n/format";
import type { ProjectStatus } from "@/types/project";
import { getStudioStatusLabel } from "@/lib/project/status";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ALL_STATUSES: ProjectStatus[] = [
  "pending_brief",
  "quoting",
  "pending_payment",
  "deposit_submitted",
  "booked",
  "completed",
];

export function MockDataPreview() {
  const dict = useAppDictionary();
  const s = dict.setup;
  const statusCounts = ALL_STATUSES.map((status) => ({
    label: getStudioStatusLabel(status, dict),
    count: getMockProjectsByStatus(MOCK_STUDIO_ID, status).length,
  }));

  return (
    <div className="grid w-full max-w-2xl gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{s.mockReadyTitle}</CardTitle>
          <CardDescription>{s.mockReadyDescription}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <p>
            <span className="font-medium">{mockStudio.name}</span>
            <span className="text-muted-foreground"> · /{mockStudio.slug}</span>
          </p>
          <p className="text-muted-foreground">
            {formatMessage(s.mockStats, {
              users: mockDataSummary.users,
              studios: mockDataSummary.studios,
              artists: mockDataSummary.artists,
              projects: mockDataSummary.projects,
            })}
          </p>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {statusCounts.map(({ label, count }) => (
              <li
                key={label}
                className="rounded-lg border px-3 py-2 text-center"
              >
                <p className="text-lg font-semibold">{count}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{s.mockImportTitle}</CardTitle>
          <CardDescription>{s.mockImportDescription}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>{s.mockImportInstructions}</p>
        </CardContent>
      </Card>
    </div>
  );
}
