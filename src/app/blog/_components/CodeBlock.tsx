import React, { Component, DetailedHTMLProps, HTMLAttributes } from "react";
import { Highlight, themes } from "prism-react-renderer";
import clsx from "clsx";
import styles from "./CodeBlock.module.css";

/**
 * The official documentation recommend with MDX to not use the Remark plugin but to
 * rely on React component (https://www.gatsbyjs.com/plugins/gatsby-plugin-mdx/#gatsby-remark-plugins)
 *
 * The line numbers is from https://github.com/FormidableLabs/prism-react-renderer#line-numbers
 */
export const CodeBlock = (
  props: DetailedHTMLProps<HTMLAttributes<HTMLPreElement>, HTMLPreElement>,
) => {
  const childrenProps = (props.children as any).props;
  const className = childrenProps?.className ?? "";
  const meta = childrenProps?.metastring ?? "";
  const extractLinesToBeHighlighted = getLines(meta);
  const matches = className.match(/\blanguage-(\w+)(?=\s|$)/);
  let language = matches && matches.length >= 1 ? matches[1] : "js";
  if (language === "json") {
    language = "js";
  }
  return (
    <Highlight
      code={childrenProps.children}
      language={language}
      theme={themes.github}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={className}
          style={{
            textAlign: "left",
            margin: "1em 0",
            padding: "0.5em",
            overflow: "scroll",
          }}
        >
          {tokens.map((line, i) => {
            const propss = getLineProps({ line, key: i });
            propss.className = clsx(propss.className, {
              [styles.lineIsHighlighted]: extractLinesToBeHighlighted.has(
                i + 1,
              ),
            });

            return (
              <div key={i} {...propss} style={{ display: "table-row" }}>
                <span
                  style={{
                    display: "table-cell",
                    textAlign: "right",
                    paddingRight: "1em",
                    userSelect: "none",
                    opacity: 0.5,
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ display: "table-cell" }}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token, key })} />
                  ))}
                </span>
              </div>
            );
          })}
        </pre>
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
