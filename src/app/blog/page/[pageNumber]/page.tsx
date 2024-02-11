import { InferGetStaticPropsType } from "next"
import { MAX_POSTS_PER_PAGE } from "../../../../constants/constants"
import { MdxData, getAllPosts, getTotalPages } from "../../../../lib/api"
import styles from "../../../layout.module.css"
import { BlogEntry } from "../../_components/BlogEntry"
import { BlogBody } from "../../_components/blogbody"

// export interface GeneratedPageContentType {
//   blogPosts: MdxData[];
//   pageNumber: number;
//   totalPages: number;
// }
export async function generateStaticParams() {

  const posts = await getAllPosts();
  posts.sort((a, b) => new Date(a.metadata.date) > new Date(b.metadata.date) ? -1 : 1);


  const result = [];
  const totalPagesCount = getTotalPages(posts);
  for (let i = 1; i <= totalPagesCount; i++) {
    result.push(i);
  }

  return result.map((y) => ({ pageNumber: String(y) }));
}

// export async function getStaticPaths() {
//   const posts = await getAllPosts();
//   posts.sort((a, b) => new Date(a.metadata.date) > new Date(b.metadata.date) ? -1 : 1);
//   const totalPagesCount = getTotalPages(posts);
//   const pages = [];
//   for (let i = 1; i <= totalPagesCount; i++) {
//     pages.push(i);
//   }
//   return {
//     paths: pages.map(p => ({
//       params: {
//         pageNumber: String(p)
//       },
//     })
//     ),
//     fallback: false, // false or "blocking"
//   }
// }

// export async function getStaticProps(context: { params: { pageNumber: string; }; }) {
//   const posts = await getAllPosts();
//   posts.sort((a, b) => new Date(a.metadata.date) > new Date(b.metadata.date) ? -1 : 1);

//   const i = Number(context.params.pageNumber);
//   const result = posts.slice((i - 1) * MAX_POSTS_PER_PAGE, i * MAX_POSTS_PER_PAGE);
//   const totalPagesCount = getTotalPages(posts);
//   return {
//     props: {
//       blogPosts: result,
//       pageNumber: i,
//       totalPages: totalPagesCount
//     },
//   }
// }

export default async function Page(props: { params: { pageNumber: string } }) {

  const posts = await getAllPosts();
  posts.sort((a, b) => new Date(a.metadata.date) > new Date(b.metadata.date) ? -1 : 1);

  const currentPage = Number(props.params.pageNumber);
  const result = posts.slice((currentPage - 1) * MAX_POSTS_PER_PAGE, currentPage * MAX_POSTS_PER_PAGE);
  const totalPagesCount = getTotalPages(posts);

  return (
    <BlogBody currentPage={currentPage} totalPages={totalPagesCount}>
      <h1 className={styles.heading}>Blog Posts</h1>
      {(result ?? []).map((node) =>
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