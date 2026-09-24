import styles from "./ExternalFormatsBanner.module.css";

export interface ExternalFormatsBannerProps {
  youtubeUrl?: string;
  spotifyUrl?: string;
  philpapersUrl?: string;
}

interface FormatLinkProps {
  href: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

function FormatLink(props: FormatLinkProps): React.ReactElement {
  return (
    <a className={styles.link} href={props.href} target="_blank" rel="noopener noreferrer">
      <span className={styles.icon} aria-hidden="true">{props.icon}</span>
      <span className={styles.copy}>
        <span className={styles.label}>{props.label}</span>
        <span className={styles.description}>{props.description}</span>
      </span>
      <span className={styles.arrow} aria-hidden="true">↗</span>
    </a>
  );
}

function YouTubeIcon(): React.ReactElement {
  return <svg viewBox="0 0 24 24" focusable="false"><path d="M21.6 7.2a2.8 2.8 0 0 0-2-2C17.8 4.7 12 4.7 12 4.7s-5.8 0-7.6.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 1.9 12a29 29 0 0 0 .5 4.8 2.8 2.8 0 0 0 2 2c1.8.5 7.6.5 7.6.5s5.8 0 7.6-.5a2.8 2.8 0 0 0 2-2 29 29 0 0 0 .5-4.8 29 29 0 0 0-.5-4.8Z" /><path className={styles.iconCutout} d="m10 15.3 5-3.3-5-3.3v6.6Z" /></svg>;
}

function SpotifyIcon(): React.ReactElement {
  return <svg viewBox="0 0 24 24" focusable="false"><circle cx="12" cy="12" r="9.5" /><path className={styles.iconCutout} d="M7.2 10.2c3.3-.9 7.1-.7 10 .6M7.8 13c2.7-.7 5.7-.5 8 .5M8.8 15.6c2-.4 4-.3 5.7.3" /></svg>;
}

function PhilPapersIcon(): React.ReactElement {
  return <svg viewBox="0 0 24 24" focusable="false"><path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H19v17H7.5A2.5 2.5 0 0 0 5 21.5v-17Z" /><path className={styles.iconCutout} d="M8 6h7M8 9h7M8 12h5M5 17.5c.7-.5 1.5-.7 2.5-.7H19" /></svg>;
}

export function ExternalFormatsBanner(props: ExternalFormatsBannerProps): React.ReactElement | null {
  const links: FormatLinkProps[] = [];
  if (props.youtubeUrl !== undefined) links.push({ href: props.youtubeUrl, label: "YouTube", description: "Watch the video", icon: <YouTubeIcon /> });
  if (props.spotifyUrl !== undefined) links.push({ href: props.spotifyUrl, label: "Spotify", description: "Listen to the podcast", icon: <SpotifyIcon /> });
  if (props.philpapersUrl !== undefined) links.push({ href: props.philpapersUrl, label: "PhilPapers", description: "Read the paper", icon: <PhilPapersIcon /> });
  if (links.length === 0) return null;

  return <aside className={styles.banner} aria-label="Available formats">
    <div className={styles.heading}>Also available as</div>
    <div className={styles.links}>{links.map((link) => <FormatLink key={link.label} {...link} />)}</div>
  </aside>;
}
