export default function dynamic<TProps extends object>(
  _loader: () => Promise<{ default: React.ComponentType<TProps> }>,
  _options?: { ssr?: boolean },
): React.ComponentType<TProps> {
  return function DynamicPlaceholder(): React.ReactElement {
    return <div data-dynamic-placeholder="" />;
  };
}
