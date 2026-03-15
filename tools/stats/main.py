import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BLOG_POSTS_DIR = os.path.join(SCRIPT_DIR, "../../src/_posts/")


def count_posts_per_year(posts_dir: str) -> dict[str, int]:
    counts: dict[str, int] = {}
    for year in sorted(os.listdir(posts_dir)):
        year_path = os.path.join(posts_dir, year)
        if os.path.isdir(year_path) and year.isdigit():
            mdx_files = [f for f in os.listdir(year_path) if f.endswith(".mdx")]
            counts[year] = len(mdx_files)
    return counts


def print_stats(counts: dict[str, int]) -> None:
    total = sum(counts.values())
    print(f"Blog posts per year ({total} total)\n")
    print(f"{'Year':<8} {'Count':>6}  Bar")
    print("-" * 50)
    max_count = max(counts.values()) if counts else 1
    bar_width = 40
    for year, count in counts.items():
        bar_len = round(count / max_count * bar_width)
        bar = "#" * bar_len
        print(f"{year:<8} {count:>6}  {bar}")


def generate_chart(counts: dict[str, int], output_path: str) -> None:
    try:
        import matplotlib.pyplot as plt
    except ImportError:
        print("\nmatplotlib not installed — skipping chart generation.", file=sys.stderr)
        print("Install with: uv add matplotlib", file=sys.stderr)
        return

    years = list(counts.keys())
    values = list(counts.values())

    fig, ax = plt.subplots(figsize=(12, 6))
    bars = ax.bar(years, values, color="#4f86c6", edgecolor="white", linewidth=0.5)

    for bar, val in zip(bars, values):
        ax.text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + 0.5,
            str(val),
            ha="center",
            va="bottom",
            fontsize=9,
        )

    ax.set_xlabel("Year", fontsize=12)
    ax.set_ylabel("Number of blog posts", fontsize=12)
    ax.set_title("Blog posts per year", fontsize=14, fontweight="bold")
    ax.set_xticks(range(len(years)))
    ax.set_xticklabels(years, rotation=45, ha="right")
    ax.yaxis.grid(True, linestyle="--", alpha=0.7)
    ax.set_axisbelow(True)

    plt.tight_layout()
    plt.savefig(output_path, dpi=150)
    print(f"\nChart saved to: {output_path}")


if __name__ == "__main__":
    counts = count_posts_per_year(BLOG_POSTS_DIR)
    print_stats(counts)

    chart_path = os.path.join(SCRIPT_DIR, "posts_per_year.png")
    generate_chart(counts, chart_path)
