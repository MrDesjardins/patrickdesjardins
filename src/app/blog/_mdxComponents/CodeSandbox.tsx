export interface CodeSandboxProps {
  codeSandboxId: string;
  title?: string;
}
export const CodeSandbox = (props: CodeSandboxProps): React.ReactElement => {
  const title = props.title ?? `CodeSandbox example ${props.codeSandboxId}`;
  return (
    <iframe
      src={`https://codesandbox.io/embed/${props.codeSandboxId}`}
      style={{
        width: "100%",
        height: "500px",
        border: 0,
        borderRadius: "4px",
        overflow: "hidden",
      }}
      title={title}
      loading="lazy"
      allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
      sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
    >
      <a href={`https://codesandbox.io/s/${props.codeSandboxId}`}>
        Open {title}
      </a>
    </iframe>
  );
};
