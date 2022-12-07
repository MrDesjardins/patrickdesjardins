import React from "react";
import Highlight, { defaultProps } from "prism-react-renderer";
import theme from "prism-react-renderer/themes/github";
import clsx from "clsx";
import styled from "styled-components";
import { lineIsHighlighted } from "./CodeBlock.module.css";
const Pre = styled.pre`
  text-align: left;
  margin: 1em 0;
  padding: 0.5em;
  overflow: scroll;
`;
const Line = styled.div`
  display: table-row;
`;

const LineNo = styled.span`
  display: table-cell;
  text-align: right;
  padding-right: 1em;
  user-select: none;
  opacity: 0.5;
`;

const LineContent = styled.span`
  display: table-cell;
`;

/**
 * The official documentation recommend with MDX to not use the Remark plugin but to
 * rely on React component (https://www.gatsbyjs.com/plugins/gatsby-plugin-mdx/#gatsby-remark-plugins)
 *
 * The line numbers is from https://github.com/FormidableLabs/prism-react-renderer#line-numbers
 */
export const CodeBlock = (props) => {
  const className = props.children.props.className ?? "";
  const meta = props.children.props.metastring ?? "";
  const extractLinesToBeHighlighted = getLines(meta);
  const matches = className.match(/language-(?<lang>.*)/);
  return (
    <Highlight
      {...defaultProps}
      code={props.children.props.children.trim()}
      language={matches?.groups?.lang ?? ""}
      theme={theme as any}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <Pre className={className} style={style}>
          {tokens.map((line, i) => {
            const propss = getLineProps({ line, key: i });
            propss.className = clsx(propss.className, {
              [lineIsHighlighted]: extractLinesToBeHighlighted.has(i + 1),
            });

            return (
              <Line key={i} {...propss}>
                <LineNo>{i + 1}</LineNo>
                <LineContent>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token, key })} />
                  ))}
                </LineContent>
              </Line>
            );
          })}
        </Pre>
      )}
    </Highlight>
  );
};

/**
 * Extract from the meta the information about which line to highlight
 * meta string expect to be {1,2,3} or {1,3-4} NO space with curly brackets
 */
function getLines(meta: string): Set<number> {
  const BETWEEN_CURLY_BRACKET = /^\{([0-9\,\-]+)\}$/;
  const MIN_MAX = /([0-9]+)\-([0-9]+)/;
  const lines = new Set<number>();
  const groups = meta.match(BETWEEN_CURLY_BRACKET);
  if (groups && groups[1] !== undefined) {
    const expressions = groups[1].split(",");
    for (const exp of expressions) {
      if (exp.indexOf("-") === -1) {
        lines.add(Number(exp));
      } else {
        const minMax = exp.match(MIN_MAX);
        if (minMax) {
          for (let i = Number(minMax[1]); i <= Number(minMax[2]); i++) {
            lines.add(Number(i));
          }
        }
      }
    }
  }
  return lines;
}
