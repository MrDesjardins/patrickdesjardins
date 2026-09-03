#!/usr/bin/env python3
"""Render the first-week oktopai progress chart used by the blog post."""

from __future__ import annotations

import argparse
from pathlib import Path

import matplotlib.pyplot as plt


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    fig, axes = plt.subplots(1, 3, figsize=(16, 7))
    fig.suptitle("oktopai: one week of measurable progress", fontsize=22, fontweight="bold")
    blue, green, orange, red = "#2563eb", "#059669", "#d97706", "#dc2626"

    teacher_labels = ["7B first\nprompt", "7B corrected\nprompt", "30B\nteacher"]
    teacher_values = [2.9, 20.5, 100.0]
    axes[0].bar(teacher_labels, teacher_values, color=[red, orange, green])
    axes[0].set_title("Teacher answer acceptance", fontweight="bold")
    axes[0].set_ylabel("Strict compiler acceptance (%)")
    axes[0].set_ylim(0, 110)
    for i, value in enumerate(teacher_values):
        axes[0].text(i, value + 3, f"{value:g}%", ha="center", fontweight="bold")

    student_labels = ["3B\nbase", "Original\nstudent", "External\nprobe"]
    student_values = [47.0, 28.5, 15.5]
    axes[1].bar(student_labels, student_values, color=[blue, orange, red])
    axes[1].set_title("Fixed held-out student gate", fontweight="bold")
    axes[1].set_ylabel("Verified tasks (%)")
    axes[1].set_ylim(0, 60)
    for i, value in enumerate(student_values):
        axes[1].text(i, value + 2, f"{value:g}%", ha="center", fontweight="bold")

    patch_labels = ["v5", "v7", "v9", "v10"]
    patch_values = [15, 15, 15, 15]
    validation_losses = [0.00751, 0.01107, 0.008005, 0.01449]
    axes[2].bar(patch_labels, patch_values, color="#93c5fd", label="compiled tasks")
    axes[2].axhline(20, linestyle="--", color="#6b7280", linewidth=1.5, label="20-task gate")
    axes[2].set_title("Patch-emitter iteration", fontweight="bold")
    axes[2].set_ylabel("Compiled tasks (of 20)")
    axes[2].set_ylim(0, 21)
    loss_axis = axes[2].twinx()
    loss_axis.plot(patch_labels, validation_losses, marker="o", linewidth=2.5, color=orange, label="validation loss")
    loss_axis.set_ylabel("Validation loss (lower is better)", color=orange)
    loss_axis.tick_params(axis="y", labelcolor=orange)
    loss_axis.set_ylim(0, 0.02)
    for i, value in enumerate(validation_losses):
        loss_axis.text(i, value + 0.0007, f"{value:g}", ha="center", color=orange, fontsize=9)
    handles, labels = axes[2].get_legend_handles_labels()
    loss_handles, loss_labels = loss_axis.get_legend_handles_labels()
    axes[2].legend(handles + loss_handles, labels + loss_labels, frameon=False, loc="lower right")
    axes[2].text(1.5, 16.2, "compiled quality stayed flat\nwhile loss fluctuated", ha="center", color="#374151")

    for axis in axes:
        axis.grid(axis="y", alpha=0.25)
        axis.set_axisbelow(True)
        axis.spines[["top", "right"]].set_visible(False)
    fig.tight_layout(rect=(0, 0.10, 1, 0.92))
    fig.text(
        0.5,
        0.01,
        "The panels use different denominators: 2,450 teacher attempts, 200 held-out student tasks, and 20 patch-emitter tasks.",
        ha="center",
        fontsize=11,
        color="#374151",
    )
    args.output.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(args.output, dpi=160, bbox_inches="tight", facecolor="white")
    print(f"wrote {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
