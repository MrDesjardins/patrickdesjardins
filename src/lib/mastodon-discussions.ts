import discussions from "../data/mastodon-discussions.json";

export type MastodonDiscussionKind = "blog" | "philosophy";

export interface MastodonDiscussion {
  instanceUrl: string;
  statusId: string;
  statusUrl: string;
  postedAt: string;
}

export type MastodonDiscussionRegistry = Record<
  MastodonDiscussionKind,
  Record<string, MastodonDiscussion>
>;

const registry = discussions as MastodonDiscussionRegistry;

export function getMastodonDiscussion(
  kind: MastodonDiscussionKind,
  slug: string,
): MastodonDiscussion | undefined {
  return registry[kind]?.[slug];
}

