import { InferGetStaticPropsType } from "next"
import { MAX_POSTS_PER_PAGE } from "../../../constants/constants"
import { MdxData, getAllPosts, getTotalPages } from "../../../lib/api"
import styles from "../../layout.module.css"
import { BlogEntry } from "../_components/BlogEntry"
import { BlogBody } from "../_components/blogbody"

// export interface GeneratedPageContentType {
//   blogPosts: MdxData[];
//   pageNumber: number;
//   totalPages: number;
// }
// export async function generateStaticParams(): Promise<GeneratedPageContentType[]> {

//   const posts = await getAllPosts();
//   posts.sort((a, b) => new Date(a.metadata.date) > new Date(b.metadata.date) ? -1 : 1);


//   const result = [];
//   const totalPagesCount = getTotalPages(posts);
//   for (let i = 1; i <= totalPagesCount; i++) {
//     const postsForPage = posts.slice((i - 1) * MAX_POSTS_PER_PAGE, i * MAX_POSTS_PER_PAGE);
//     result.push({
//       blogPosts: postsForPage,
//       pageNumber: i,
//       totalPages: totalPagesCount
//     });
//   }
//   return result;
// }

export async function getStaticPaths() {
  const posts = await getAllPosts();
  posts.sort((a, b) => new Date(a.metadata.date) > new Date(b.metadata.date) ? -1 : 1);
  const totalPagesCount = getTotalPages(posts);
  const pages = [];
  for (let i = 1; i <= totalPagesCount; i++) {
    pages.push(i);
  }
  return {
    paths: pages.map(p => ({
      params: {
        pageNumber: String(p)
      },
    })
    ),
    fallback: false, // false or "blocking"
  }
}

export async function getStaticProps(context: { params: { pageNumber: string; }; }) {
  const posts = await getAllPosts();
  posts.sort((a, b) => new Date(a.metadata.date) > new Date(b.metadata.date) ? -1 : 1);

  const i = Number(context.params.pageNumber);
  const result = posts.slice((i - 1) * MAX_POSTS_PER_PAGE, i * MAX_POSTS_PER_PAGE);
  const totalPagesCount = getTotalPages(posts);
  return {
    props: {
      blogPosts: result,
      pageNumber: i,
      totalPages: totalPagesCount
    },
  }
}

export default function Page(props: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <BlogBody currentPage={Number(props.pageNumber)} totalPages={props.totalPages}>
      <h1 className={styles.heading}>Blog Posts</h1>
      {(props.blogPosts ?? []).map((node) =>
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