import {
  getMastodonDiscussion,
  type MastodonDiscussion,
  type MastodonDiscussionKind,
} from "../../lib/mastodon-discussions";
import styles from "./MastodonComments.module.css";

interface MastodonCommentsProps {
  kind: MastodonDiscussionKind;
  slug: string;
  discussion?: MastodonDiscussion;
}

const PROFILE_URL = "https://mastodon.social/@mrdesjardins";

export function MastodonComments(
  props: MastodonCommentsProps,
): React.ReactElement {
  const discussion =
    props.discussion ?? getMastodonDiscussion(props.kind, props.slug);

  if (discussion === undefined) {
    return (
      <section className={styles.mastodonComments} aria-labelledby="mastodon-comments">
        <h2 id="mastodon-comments">Discussion</h2>
        <p>
          Join the discussion on{" "}
          <a className={styles.mastodonLink} href={PROFILE_URL}>
            Mastodon
          </a>
          .
        </p>
      </section>
    );
  }

  return (
    <section className={styles.mastodonComments} aria-labelledby="mastodon-comments">
      <h2 id="mastodon-comments">Discussion</h2>
      <p>
        Replies are loaded from the public Mastodon thread for this article.
      </p>
      <div className={styles.mastodonActions}>
        <a className={styles.mastodonLink} href={discussion.statusUrl}>
          Reply on Mastodon
        </a>
      </div>
      <div
        data-mastodon-comments-root
        data-instance-url={discussion.instanceUrl}
        data-status-id={discussion.statusId}
        data-status-url={discussion.statusUrl}
      >
        <p className={styles.mastodonStatus}>Loading replies from Mastodon...</p>
      </div>
    </section>
  );
}
