export interface YouTubeProps {
  youTubeId: string;
  title?: string;
}
export const YouTube = (props: YouTubeProps): React.ReactElement => {
  const title = props.title ?? `YouTube video ${props.youTubeId}`;
  return (
    <iframe
      style={{
        width: "100%",
        height: "500px",
        border: 0,
        borderRadius: "4px",
        overflow: "hidden",
      }}
      src={`https://www.youtube.com/embed/${props.youTubeId}`}
      title={title}
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    >
      <a href={`https://www.youtube.com/watch?v=${props.youTubeId}`}>
        Watch {title}
      </a>
    </iframe>
  );
};
