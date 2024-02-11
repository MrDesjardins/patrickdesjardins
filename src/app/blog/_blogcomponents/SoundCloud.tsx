export const SoundCloud = (props: { soundCloudLink: string }): JSX.Element => {
  return (
    <iframe
      width="100%"
      height="300"
      src={`https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/${props.soundCloudLink}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`}
    ></iframe>
  );
};
