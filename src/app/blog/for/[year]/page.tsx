import { GetStaticPropsContext, InferGetStaticPropsType } from "next"
import { BlogBody } from "../../_components/blogbody"
import styles from "../../../layout.module.css"
import { BlogEntry } from "../../_components/BlogEntry"
import { FIRST_YEAR, LAST_YEAR } from "../../../../constants/constants"
import { MdxData, getAllPosts, getTotalPages, getTotalPagesCount } from "../../../../lib/api"
export interface GeneratedPageContentType {
  blogPosts: MdxData[];
  year: number;
  totalPages: number;
}
export async function generateStaticParams() {
  const years = [];
  for (let year = LAST_YEAR; year >= FIRST_YEAR; year--) {
    years.push(year);
  }
  return years.map((y) => ({ year: String(y) }));

}


// export async function getStaticPaths() {
//   const years = [];
//   for (let year = LAST_YEAR; year >= FIRST_YEAR; year--) {
//     years.push(year);
//   }

//   return {
//     paths: years.map(p => ({
//       params: {
//         year: String(p)
//       },
//     })
//     ),
//     fallback: false, // false or "blocking"
//   }
// }

// export async function getStaticProps(context: { params: { year: string; }; }) {
//   const posts = await getAllPosts();
//   const totalPages = getTotalPages(posts);
//   const year = Number(context.params.year);
//   const postForYear = posts.filter((file) => file.metadata.year === year);
//   return {
//     props: {
//       blogPosts: postForYear,
//       year: year,
//       totalPages: totalPages
//     },
//   }
// }

export default async function Page(props: { params: { year: string } }) {
  const year = Number(props.params.year);
  const posts = await getAllPosts();
  const totalPages = getTotalPages(posts);
  const postForYear = posts.filter((file) => file.metadata.year === year);

  return (
    <BlogBody totalPages={totalPages} year={year}>
      <h1 className={styles.heading}>Blog Posts</h1>
      {(postForYear ?? []).map((node) =>
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