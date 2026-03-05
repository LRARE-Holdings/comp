"use client";

import { useState, useMemo } from "react";
import type { RegulatoryUpdate } from "@/types/database";
import { formatDate } from "@/lib/utils";

type ImpactLevel = "high" | "medium" | "low" | "info";

const IMPACT_LEVELS: ImpactLevel[] = ["high", "medium", "low", "info"];

interface FeedFilterProps {
  updates: RegulatoryUpdate[];
  firmPracticeAreas: string[];
}

export function FeedFilter({ updates, firmPracticeAreas }: FeedFilterProps) {
  const [activeImpacts, setActiveImpacts] = useState<Set<ImpactLevel>>(
    new Set()
  );
  const [activePracticeAreas, setActivePracticeAreas] = useState<Set<string>>(
    new Set()
  );

  function toggleImpact(level: ImpactLevel) {
    setActiveImpacts((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  }

  function togglePracticeArea(area: string) {
    setActivePracticeAreas((prev) => {
      const next = new Set(prev);
      if (next.has(area)) next.delete(area);
      else next.add(area);
      return next;
    });
  }

  const filteredUpdates = useMemo(() => {
    return updates.filter((update) => {
      if (
        activeImpacts.size > 0 &&
        !activeImpacts.has(update.impact_level as ImpactLevel)
      ) {
        return false;
      }
      if (activePracticeAreas.size > 0) {
        const hasOverlap = update.practice_areas.some((area) =>
          activePracticeAreas.has(area)
        );
        if (!hasOverlap) return false;
      }
      return true;
    });
  }, [updates, activeImpacts, activePracticeAreas]);

  const isFiltering = activeImpacts.size > 0 || activePracticeAreas.size > 0;

  return (
    <>
      <div className="vara-card mb-6">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs text-vara-slate font-body mb-2 uppercase tracking-wider">
              Impact Level
            </p>
            <div className="flex flex-wrap gap-2">
              {IMPACT_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => toggleImpact(level)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                    activeImpacts.has(level)
                      ? `vara-badge-${level} ring-1 ring-white/20`
                      : activeImpacts.size === 0
                        ? `vara-badge-${level}`
                        : "bg-white/5 text-vara-slate/40 border border-white/5"
                  }`}
                >
                  {level.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {firmPracticeAreas.length > 0 && (
            <div>
              <p className="text-xs text-vara-slate font-body mb-2 uppercase tracking-wider">
                Practice Area
              </p>
              <div className="flex flex-wrap gap-2">
                {firmPracticeAreas.map((area) => (
                  <button
                    key={area}
                    onClick={() => togglePracticeArea(area)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                      activePracticeAreas.has(area)
                        ? "border-vara-blue bg-vara-blue/10 text-white"
                        : "border-white/10 text-vara-slate hover:border-white/20"
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {isFiltering && (
        <p className="text-vara-slate text-sm font-body mb-4">
          {filteredUpdates.length} update
          {filteredUpdates.length !== 1 ? "s" : ""} matching filters
        </p>
      )}

      {filteredUpdates.length > 0 ? (
        <div className="space-y-4">
          {filteredUpdates.map((update) => (
            <div key={update.id} className="vara-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={
                        update.impact_level === "high"
                          ? "vara-badge-high"
                          : update.impact_level === "medium"
                            ? "vara-badge-medium"
                            : update.impact_level === "low"
                              ? "vara-badge-low"
                              : "vara-badge-info"
                      }
                    >
                      {update.impact_level.toUpperCase()}
                    </span>
                    <span className="text-xs text-vara-slate">
                      {formatDate(update.publication_date)}
                    </span>
                  </div>
                  <h3 className="font-display font-semibold text-white text-lg mb-2">
                    {update.title}
                  </h3>
                  {update.summary && (
                    <p className="text-vara-slate text-sm leading-relaxed mb-3">
                      {update.summary}
                    </p>
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
            {isFiltering
              ? "No updates match your filters."
              : "No regulatory updates yet. Check back soon."}
          </p>
        </div>
      )}
    </>
  );
}
