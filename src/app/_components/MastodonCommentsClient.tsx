import { useEffect, useMemo, useState } from "react";
import styles from "./MastodonComments.module.css";

export interface MastodonCommentsClientProps {
  instanceUrl: string;
  statusId: string;
  statusUrl: string;
}

interface MastodonStatus {
  id: string;
  in_reply_to_id?: string | null;
  url?: string | null;
  created_at: string;
  content: string;
  spoiler_text?: string;
  replies_count?: number;
  account: {
    display_name: string;
    acct: string;
    avatar?: string;
    url?: string;
  };
}

interface MastodonContext {
  descendants: MastodonStatus[];
}

interface ReplyNode {
  status: MastodonStatus;
  children: ReplyNode[];
}

type LoadState =
  | { kind: "loading" }
  | { kind: "loaded"; repliesCount: number; replies: ReplyNode[] }
  | { kind: "error" };

const MAX_VISIBLE_NESTING_DEPTH = 3;

function textFromHtml(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  return (doc.body.textContent ?? "").replace(/\n{3,}/g, "\n\n").trim();
}

function formatTimestamp(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function buildReplyTree(
  rootStatusId: string,
  replies: MastodonStatus[],
): ReplyNode[] {
  const nodes = new Map<string, ReplyNode>();
  for (const reply of replies) {
    nodes.set(reply.id, { status: reply, children: [] });
  }

  const roots: ReplyNode[] = [];
  for (const reply of replies) {
    const node = nodes.get(reply.id);
    if (node === undefined) {
      continue;
    }

    const parentId = reply.in_reply_to_id ?? rootStatusId;
    const parent = nodes.get(parentId);
    if (parentId !== rootStatusId && parent !== undefined) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function flattenReplyNodes(nodes: ReplyNode[]): ReplyNode[] {
  return nodes.flatMap((node) => [
    { status: node.status, children: [] },
    ...flattenReplyNodes(node.children),
  ]);
}

function renderReplyNode(
  node: ReplyNode,
  depth: number,
  fallbackStatusUrl: string,
): React.ReactElement {
  const reply = node.status;
  const hasWarning = (reply.spoiler_text ?? "").trim().length > 0;
  const replyUrl = reply.url ?? fallbackStatusUrl;
  const visibleChildren =
    depth >= MAX_VISIBLE_NESTING_DEPTH
      ? flattenReplyNodes(node.children)
      : node.children;
  const childDepth =
    depth >= MAX_VISIBLE_NESTING_DEPTH
      ? MAX_VISIBLE_NESTING_DEPTH
      : depth + 1;
  const childContainerStyle: React.CSSProperties & {
    "--mastodon-reply-depth": number;
  } = {
    "--mastodon-reply-depth": childDepth,
  };

  return (
    <article className={styles.mastodonReply} key={reply.id}>
      <div className={styles.mastodonReplyHeader}>
        {reply.account.avatar !== undefined &&
        reply.account.avatar.trim() !== "" ? (
          <img
            alt=""
            className={styles.mastodonAvatar}
            loading="lazy"
            src={reply.account.avatar}
          />
        ) : null}
        <div className={styles.mastodonAuthorBlock}>
          <span className={styles.mastodonAuthor}>
            {reply.account.display_name.trim() !== ""
              ? reply.account.display_name
              : reply.account.acct}
          </span>
          <span className={styles.mastodonAcct}>@{reply.account.acct}</span>
          <a className={styles.mastodonTimestamp} href={replyUrl}>
            {formatTimestamp(reply.created_at)}
          </a>
          <a className={styles.mastodonLink} href={replyUrl}>
            Reply
          </a>
        </div>
      </div>
      {hasWarning ? (
        <p className={styles.mastodonWarning}>
          Content warning: {reply.spoiler_text}.{" "}
          <a className={styles.mastodonLink} href={replyUrl}>
            Read on Mastodon
          </a>
          .
        </p>
      ) : (
        <p className={styles.mastodonReplyText}>
          {textFromHtml(reply.content)}
        </p>
      )}
      {visibleChildren.length > 0 ? (
        <div
          className={styles.mastodonReplyChildren}
          style={childContainerStyle}
        >
          {visibleChildren.map((child) =>
            renderReplyNode(child, childDepth, fallbackStatusUrl),
          )}
        </div>
      ) : null}
    </article>
  );
}

export function MastodonCommentsClient(
  props: MastodonCommentsClientProps,
): React.ReactElement {
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const apiBase = useMemo(
    () => props.instanceUrl.replace(/\/+$/, ""),
    [props.instanceUrl],
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadReplies(): Promise<void> {
      try {
        const [statusResponse, contextResponse] = await Promise.all([
          fetch(`${apiBase}/api/v1/statuses/${props.statusId}`, {
            signal: controller.signal,
          }),
          fetch(`${apiBase}/api/v1/statuses/${props.statusId}/context`, {
            signal: controller.signal,
          }),
        ]);
        if (!statusResponse.ok || !contextResponse.ok) {
          throw new Error("Mastodon API request failed");
        }
        const status = (await statusResponse.json()) as MastodonStatus;
        const context = (await contextResponse.json()) as MastodonContext;
        setState({
          kind: "loaded",
          repliesCount: status.replies_count ?? context.descendants.length,
          replies: buildReplyTree(props.statusId, context.descendants),
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setState({ kind: "error" });
      }
    }

    void loadReplies();

    return () => {
      controller.abort();
    };
  }, [apiBase, props.statusId]);

  if (state.kind === "loading") {
    return <p className={styles.mastodonStatus}>Loading replies from Mastodon...</p>;
  }

  if (state.kind === "error") {
    return (
      <p className={styles.mastodonStatus}>
        Replies could not be loaded here.{" "}
        <a className={styles.mastodonLink} href={props.statusUrl}>
          Open the Mastodon thread
        </a>
        .
      </p>
    );
  }

  return (
    <>
      <p className={styles.mastodonStatus}>
        {state.repliesCount === 1
          ? "1 public reply"
          : `${state.repliesCount} public replies`}
      </p>
      {state.replies.length > 0 ? (
        <div className={styles.mastodonReplies}>
          {state.replies.map((reply) =>
            renderReplyNode(reply, 0, props.statusUrl),
          )}
        </div>
      ) : null}
    </>
  );
}
