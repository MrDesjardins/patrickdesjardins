import { type CSSProperties, type ImgHTMLAttributes } from "react";

export interface ImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "width" | "height"> {
  src: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
}

export default function Image(props: ImageProps): React.ReactElement {
  const { fill, priority, style, loading, ...rest } = props;
  const computedStyle: CSSProperties | undefined = fill === true
    ? {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        ...style,
      }
    : style;

  return (
    <img
      {...rest}
      loading={priority === true ? "eager" : (loading ?? "lazy")}
      style={computedStyle}
    />
  );
}
