import { GetStaticPropsContext, InferGetStaticPropsType } from "next"
import { BlogBody } from "../../blogbody"
import styles from "../../layout.module.css"
import { MdxData, getMdxFileContent, getTotalPagesCount, postFilePaths } from "../../../utils/mdx"
import { BlogEntry } from "../_components/BlogEntry"
export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" }
}
export async function getStaticProps(
  ctx: GetStaticPropsContext<{
    year: string

  }>,
) {
  const year = Number(ctx.params?.year);
  const postForYear = postFilePaths.filter((file) => file.year === year);
  let post: Promise<MdxData>[] = [];
  for (const p of postForYear) {
    post.push(getMdxFileContent(p.fullPathWithFileName));
  }
  const posts = await Promise.all(post);
  return {
    props: {
      posts: posts,
      totalPages: getTotalPagesCount(),
      year:year
    },
  }
}

export default function Page(props: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <BlogBody totalPages={props.totalPages} year={props.year}>
      <h1 className={styles.heading}>Blog Posts</h1>
      {props.posts.map((node) =>
        <BlogEntry
          key={node.metadata.fileName}
          id={node.metadata.fileName}
          slug={node.metadata.slug}
          title={node.frontmatter.title as string}
          date={node.frontmatter.date as string}
          categories={node.frontmatter.categories as string[]}
        />)}
    </BlogBody>)
}