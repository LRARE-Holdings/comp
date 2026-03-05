"use client";

import { cn, formatDate } from "@/lib/utils";
import type { RegulatoryUpdate } from "@/types/database";
import { useMemo, useState } from "react";

type FeedUpdate = Pick<
  RegulatoryUpdate,
  | "id"
  | "title"
  | "summary"
  | "impact_level"
  | "publication_date"
  | "practice_areas"
  | "source_url"
>;

const IMPACT_OPTIONS: Array<{ value: RegulatoryUpdate["impact_level"]; label: string }> = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "info", label: "Info" },
];

function impactBadgeClass(impact: RegulatoryUpdate["impact_level"]) {
  if (impact === "high") return "vara-badge-high";
  if (impact === "medium") return "vara-badge-medium";
  if (impact === "low") return "vara-badge-low";
  return "vara-badge-info";
}

export function FeedFilterList({
  updates,
  practiceAreas,
}: {
  updates: FeedUpdate[];
  practiceAreas: string[];
}) {
  const [selectedImpacts, setSelectedImpacts] = useState<RegulatoryUpdate["impact_level"][]>(
    []
  );
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  function toggleImpact(impact: RegulatoryUpdate["impact_level"]) {
    setSelectedImpacts((prev) =>
      prev.includes(impact)
        ? prev.filter((value) => value !== impact)
        : [...prev, impact]
    );
  }

  function toggleArea(area: string) {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((value) => value !== area) : [...prev, area]
    );
  }

  const filteredUpdates = useMemo(
    () =>
      updates.filter((update) => {
        const impactMatch =
          selectedImpacts.length === 0 || selectedImpacts.includes(update.impact_level);
        const areaMatch =
          selectedAreas.length === 0 ||
          update.practice_areas.some((area) => selectedAreas.includes(area));

        return impactMatch && areaMatch;
      }),
    [updates, selectedImpacts, selectedAreas]
  );

  return (
    <div>
      <div className="vara-card mb-6 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-vara-slate mb-2">Impact level</p>
          <div className="flex flex-wrap gap-2">
            {IMPACT_OPTIONS.map((option) => {
              const active = selectedImpacts.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    impactBadgeClass(option.value),
                    "transition-opacity",
                    active ? "opacity-100 ring-1 ring-white/20" : "opacity-50 hover:opacity-80"
                  )}
                  onClick={() => toggleImpact(option.value)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {practiceAreas.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wide text-vara-slate mb-2">Practice area</p>
            <div className="flex flex-wrap gap-2">
              {practiceAreas.map((area) => {
                const active = selectedAreas.includes(area);
                return (
                  <button
                    key={area}
                    type="button"
                    className={cn(
                      "vara-badge-info transition-opacity",
                      active
                        ? "opacity-100 ring-1 ring-white/20"
                        : "opacity-50 hover:opacity-80"
                    )}
                    onClick={() => toggleArea(area)}
                  >
                    {area}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {filteredUpdates.length > 0 ? (
        <div className="space-y-4">
          {filteredUpdates.map((update) => (
            <div key={update.id} className="vara-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={impactBadgeClass(update.impact_level)}>
                      {update.impact_level.toUpperCase()}
                    </span>
                    <span className="text-xs text-vara-slate">{formatDate(update.publication_date)}</span>
                  </div>
                  <h3 className="font-display font-semibold text-white text-lg mb-2">
                    {update.title}
                  </h3>
                  {update.summary && (
                    <p className="text-vara-slate text-sm leading-relaxed mb-3">{update.summary}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {update.practice_areas.map((area) => (
                      <span
                        key={area}
                        className="text-xs bg-white/5 text-vara-slate px-2 py-1 rounded"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
                {update.source_url && (
                  <a
                    href={update.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-vara-blue hover:underline text-sm shrink-0"
                  >
                    SRA source &rarr;
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="vara-card text-center py-12">
          <p className="text-vara-slate font-body">
            No updates match your selected filters.
          </p>
        </div>
      )}
    </div>
  );
}
