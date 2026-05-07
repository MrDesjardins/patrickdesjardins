import dynamic from "next/dynamic";
import { SearchErrorBoundary } from "../../blog/search/SearchErrorBoundary";

const PhilosophySearchClient = dynamic(
  async () => await import("./PhilosophySearchClient"),
  { ssr: false },
);

export default function Page(): React.ReactElement {
  return (
    <SearchErrorBoundary>
      <PhilosophySearchClient />
    </SearchErrorBoundary>
  );
}
