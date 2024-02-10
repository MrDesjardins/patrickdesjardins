import { GetStaticPropsContext, InferGetStaticPropsType } from "next"
import { BlogBody } from "../blogbody"
import styles from "./layout.module.css"
import { allPosts, getTotalPagesCount, postFilePaths } from "../../utils/mdx"
import { MAX_POSTS_PER_PAGE } from "../../constants/constants"
import { BlogEntry } from "../blog/_components/BlogEntry"

export async function getStaticProps(
  ctx: GetStaticPropsContext<{
    pageNumber: string
  }>,
) {
  const pageNumber = 1;
  const posts = await allPosts;
  posts.sort((a, b) => new Date(a.metadata.date) > new Date(b.metadata.date) ? -1 : 1);
  const pagePost = posts.slice((pageNumber - 1) * MAX_POSTS_PER_PAGE, pageNumber * MAX_POSTS_PER_PAGE);
  return {
    props: {
      pageNumber: pageNumber,
      totalPages: getTotalPagesCount(),
      posts: pagePost
    },
  }
}

export default function Page(props: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <BlogBody currentPage={Number(props.pageNumber)} totalPages={props.totalPages}>
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