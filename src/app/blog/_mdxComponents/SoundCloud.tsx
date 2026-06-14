export const SoundCloud = (props: {
  soundCloudLink: string;
  title?: string;
}): React.ReactElement => {
  const title = props.title ?? `SoundCloud audio ${props.soundCloudLink}`;
  const soundCloudUrl = `https://api.soundcloud.com/${props.soundCloudLink}`;
  return (
    <iframe
      title={title}
      width="100%"
      height="300"
      loading="lazy"
      src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(soundCloudUrl)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`}
    >
      <a href={soundCloudUrl}>Listen to {title}</a>
    </iframe>
  );
};
