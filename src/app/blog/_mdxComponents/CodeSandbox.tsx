export interface CodeSandboxProps {
  codeSandboxId: string;
}
export const CodeSandbox = (props: CodeSandboxProps): React.ReactElement => {
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
      title="Code Sandbox"
      allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
      sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
    ></iframe>
  );
};
