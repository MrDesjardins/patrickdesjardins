export interface YouTubeProps {
  youTubeId: string;
}
export const YouTube = (props: YouTubeProps): JSX.Element => {

  return <iframe
    style={{ width: "100%", height: "500px", border: 0, borderRadius: "4px", overflow: "hidden" }}
    src={`https://www.youtube.com/embed/${props.youTubeId}`}
    title="YouTube video player"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  ></iframe>;

};

