import { type AnchorHTMLAttributes, type PropsWithChildren } from "react";

export interface LinkProps
  extends PropsWithChildren,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
}

export default function Link(props: LinkProps): React.ReactElement {
  const { href, children, ...rest } = props;
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}
