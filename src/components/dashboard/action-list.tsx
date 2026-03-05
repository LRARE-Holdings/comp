"use client";

import { cn } from "@/lib/utils";
import type { Action } from "@/types/database";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type ActionStatus = Action["status"];

type ActionListItem = Pick<
  Action,
  "id" | "title" | "description" | "deadline" | "priority" | "status" | "completed_at"
>;

const STATUS_OPTIONS: Array<{ value: ActionStatus; label: string }> = [
  { value: "not_started", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "complete", label: "Complete" },
];

export function ActionList({ initialActions }: { initialActions: ActionListItem[] }) {
  const router = useRouter();
  const [actions, setActions] = useState<ActionListItem[]>(initialActions);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [exitingIds, setExitingIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const pendingSet = useMemo(() => new Set(pendingIds), [pendingIds]);
  const exitingSet = useMemo(() => new Set(exitingIds), [exitingIds]);

  async function updateActionStatus(actionId: string, status: ActionStatus) {
    const previousActions = actions;
    let removeTimer: ReturnType<typeof setTimeout> | null = null;
    setError(null);
    setPendingIds((prev) => [...prev, actionId]);

    setActions((prev) =>
      prev.map((action) =>
        action.id === actionId
          ? {
              ...action,
              status,
            }
          : action
      )
    );

    if (status === "complete") {
      setExitingIds((prev) => [...prev, actionId]);
      removeTimer = setTimeout(() => {
        setActions((prev) => prev.filter((action) => action.id !== actionId));
      }, 300);
    }

    try {
      const response = await fetch(`/api/actions/${actionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update action status");
      }

      const updatedAction = (await response.json()) as Action;

      if (status === "complete") {
        setExitingIds((prev) => prev.filter((id) => id !== actionId));
        router.refresh();
      } else {
        setActions((prev) =>
          prev.map((action) =>
            action.id === actionId
              ? {
                  ...action,
                  status: updatedAction.status,
                  completed_at: updatedAction.completed_at,
                }
              : action
          )
        );
        router.refresh();
      }
    } catch {
      if (removeTimer) {
        clearTimeout(removeTimer);
      }
      setActions(previousActions);
      setExitingIds((prev) => prev.filter((id) => id !== actionId));
      setError("Could not update action status. Please try again.");
    } finally {
      setPendingIds((prev) => prev.filter((id) => id !== actionId));
    }
  }

  if (actions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-vara-slate font-body">
          No outstanding actions. You&apos;re fully up to date.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-vara-danger">{error}</p>}

      {actions.map((action) => (
        <div
          key={action.id}
          className={cn(
            "flex items-start gap-4 p-4 rounded-lg bg-vara-dark/50 border border-white/5 transition-all duration-300",
            exitingSet.has(action.id)
              ? "opacity-0 translate-x-2 scale-[0.98]"
              : "opacity-100 translate-x-0 scale-100"
          )}
        >
          <div
            className={cn(
              "w-2 h-2 rounded-full mt-2 shrink-0",
              action.priority === "high"
                ? "bg-vara-danger"
                : action.priority === "medium"
                  ? "bg-vara-warning"
                  : "bg-vara-blue"
            )}
          />

          <div className="flex-1 min-w-0">
            <p className="text-white font-body font-medium text-sm">{action.title}</p>
            {action.description && (
              <p className="text-vara-slate text-sm mt-1 line-clamp-2">{action.description}</p>
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

              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  action.status === "complete"
                    ? "bg-vara-success/15 text-vara-success"
                    : action.status === "in_progress"
                      ? "bg-vara-warning/15 text-vara-warning"
                      : "bg-white/5 text-vara-slate"
                )}
              >
                {STATUS_OPTIONS.find((option) => option.value === action.status)?.label}
              </span>
            </div>
          </div>

          <label className="sr-only" htmlFor={`action-status-${action.id}`}>
            Update status
          </label>
          <select
            id={`action-status-${action.id}`}
            className="vara-input text-sm py-2 px-3 min-w-[140px]"
            value={action.status}
            onChange={(event) =>
              void updateActionStatus(action.id, event.target.value as ActionStatus)
            }
            disabled={pendingSet.has(action.id)}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
