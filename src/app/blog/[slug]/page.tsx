import { MDXRemote } from 'next-mdx-remote/rsc';
import { MdxData, getAllPosts, getTotalPages } from '../../../lib/api';
import styles from "../../layout.module.css";
import { CodeSandbox } from "../_blogcomponents/CodeSandbox";
import { TocAzureContainerSeries } from "../_blogcomponents/TocAzureContainerSeries";
import { YouTube } from "../_blogcomponents/YouTube";
import { CodeBlock } from "../_components/CodeBlock";
import { BlogBody } from "../_components/blogbody";
import { GetStaticPaths, InferGetStaticPropsType } from 'next';
import { compileMDX } from "next-mdx-remote/rsc";
import { SoundCloud } from '../_blogcomponents/SoundCloud';
export interface GeneratedPageContentType {
  source: MdxData;
  totalPages: number;
}
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.metadata.slug })
  );
}


// export async function getStaticPaths() {
//   const posts = await getAllPosts();
//   return {
//     paths: posts.map(p => ({
//       params: {
//         slug: p.metadata.fileName
//       },
//     })
//     ),
//     fallback: false, // false or "blocking"
//   }
// }

// export async function getStaticProps(context: { params: { slug: string; }; }) {
//   const posts = await getAllPosts();
//   const totalCount = getTotalPages(posts);
//   return {
//     props: {
//       totalPages: totalCount,
//       post: posts.find((post) => post.metadata.slug === context.params.slug)
//     }
//   }
// }

export default async function Page(props: { params: { slug: string } }) {
  const posts = await getAllPosts();
  const totalPages = getTotalPages(posts);
  const post = posts.find((post) => post.metadata.slug === props.params.slug);
  if (post === undefined) {
    throw new Error("Post not found");
  }

  const { content, frontmatter } = await compileMDX({
    source: post.rawFileContent,
    options: { parseFrontmatter: true },
    components: {
      //pre: CodeBlock,
      "TocAzureContainerSeries": TocAzureContainerSeries,
      "CodeSandbox": CodeSandbox,
      "YouTube": YouTube,
      "SoundCloud": SoundCloud,

    }
  });

  return (
    <BlogBody totalPages={totalPages}>
      <h1>
        {post.frontmatter.title as string}
      </h1>
      <div className={styles.blogPostContainer}>
        <p className={styles.blogPostDate}>Posted on: {post.frontmatter.date as string}</p>
        {content}

      </div>
    </BlogBody>);
}