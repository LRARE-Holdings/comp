"use client";

import { useState } from "react";
import type { Action } from "@/types/database";

type ActionWithUpdate = Action & {
  regulatory_updates: { title: string; impact_level: string } | null;
};

interface ActionListProps {
  actions: ActionWithUpdate[];
  totalActions: number;
  completedActions: number;
}

const STATUS_OPTIONS = [
  { value: "not_started", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "complete", label: "Complete" },
] as const;

export function ActionList({
  actions: initialActions,
  totalActions: initialTotal,
  completedActions: initialCompleted,
}: ActionListProps) {
  const [actions, setActions] = useState(initialActions);
  const [completedActions, setCompletedActions] = useState(initialCompleted);
  const [fadingOut, setFadingOut] = useState<Set<string>>(new Set());

  const score = initialTotal
    ? Math.round((completedActions / initialTotal) * 100)
    : 100;

  async function handleStatusChange(
    actionId: string,
    newStatus: "not_started" | "in_progress" | "complete"
  ) {
    const previousActions = [...actions];
    const previousCompleted = completedActions;

    if (newStatus === "complete") {
      // Fade out then remove
      setFadingOut((prev) => new Set(prev).add(actionId));
      setCompletedActions((prev) => prev + 1);

      setTimeout(() => {
        setActions((prev) => prev.filter((a) => a.id !== actionId));
        setFadingOut((prev) => {
          const next = new Set(prev);
          next.delete(actionId);
          return next;
        });
      }, 300);
    } else {
      setActions((prev) =>
        prev.map((a) => (a.id === actionId ? { ...a, status: newStatus } : a))
      );
    }

    try {
      const res = await fetch(`/api/actions/${actionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update");
    } catch {
      // Rollback
      setActions(previousActions);
      setCompletedActions(previousCompleted);
      setFadingOut((prev) => {
        const next = new Set(prev);
        next.delete(actionId);
        return next;
      });
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="vara-card">
          <p className="text-vara-slate text-sm font-body">Compliance Score</p>
          <p className="text-3xl font-display font-bold text-vara-success mt-1">
            {score}%
          </p>
        </div>
        <div className="vara-card">
          <p className="text-vara-slate text-sm font-body">Open Actions</p>
          <p className="text-3xl font-display font-bold text-white mt-1">
            {actions.length}
          </p>
        </div>
        <div className="vara-card">
          <p className="text-vara-slate text-sm font-body">High Priority</p>
          <p className="text-3xl font-display font-bold text-vara-danger mt-1">
            {actions.filter((a) => a.priority === "high").length}
          </p>
        </div>
        <div className="vara-card">
          <p className="text-vara-slate text-sm font-body">Completed</p>
          <p className="text-3xl font-display font-bold text-vara-blue mt-1">
            {completedActions}
          </p>
        </div>
      </div>

      <div className="vara-card">
        <h2 className="font-display font-semibold text-lg text-white mb-4">
          Outstanding Actions
        </h2>
        {actions.length > 0 ? (
          <div className="space-y-3">
            {actions.map((action) => (
              <div
                key={action.id}
                className={`flex items-start gap-4 p-4 rounded-lg bg-vara-dark/50 border border-white/5 transition-all duration-300 ${
                  fadingOut.has(action.id) ? "opacity-0 scale-95" : "opacity-100"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                    action.priority === "high"
                      ? "bg-vara-danger"
                      : action.priority === "medium"
                        ? "bg-vara-warning"
                        : "bg-vara-blue"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-body font-medium text-sm">
                    {action.title}
                  </p>
                  {action.description && (
                    <p className="text-vara-slate text-sm mt-1 line-clamp-2">
                      {action.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    {action.deadline && (
                      <span className="text-xs text-vara-slate">
                        Due{" "}
                        {new Date(action.deadline).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    )}
                  </div>
                </div>
                <select
                  value={action.status}
                  onChange={(e) =>
                    handleStatusChange(
                      action.id,
                      e.target.value as "not_started" | "in_progress" | "complete"
                    )
                  }
                  className="text-xs bg-vara-dark border border-white/10 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-vara-blue/50 shrink-0 cursor-pointer"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-vara-slate font-body">
              No outstanding actions. You&apos;re fully up to date.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
