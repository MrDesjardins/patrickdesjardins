import dynamic from "next/dynamic";
import { SearchErrorBoundary } from "./SearchErrorBoundary";

// Only rendered client-side — never during `next build`
const SearchClient = dynamic(async () => await import("./SearchClient"), {
  ssr: false,
});

export default function Page(): React.ReactElement {
  return (
    <SearchErrorBoundary>
      <SearchClient />
    </SearchErrorBoundary>
  );
}
