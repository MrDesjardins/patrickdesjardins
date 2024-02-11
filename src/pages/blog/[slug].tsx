import { MDXRemote } from 'next-mdx-remote';
import { MdxData, getAllPosts, getTotalPages } from '../../lib/api';
import styles from "../layout.module.css";
import { CodeSandbox } from "./_blogcomponents/CodeSandbox";
import { TocAzureContainerSeries } from "./_blogcomponents/TocAzureContainerSeries";
import { YouTube } from "./_blogcomponents/YouTube";
import { CodeBlock } from "./_components/CodeBlock";
import { BlogBody } from "./_components/blogbody";
import { GetStaticPaths, InferGetStaticPropsType } from 'next';

// export interface GeneratedPageContentType {
//   source: MdxData;
//   totalPages: number;
// }
// export async function generateStaticParams(): Promise<GeneratedPageContentType[]> {
//   const posts = await getAllPosts();
//   const totalPagesCount = getTotalPages(posts);
//   return posts.map((p) => ({
//     source: p,
//     totalPages: totalPagesCount
//   })
//   );
// }


export async function getStaticPaths() {
  const posts = await getAllPosts();
  return {
    paths: posts.map(p => ({
      params: {
        slug: p.metadata.fileName
      },
    })
    ),
    fallback: false, // false or "blocking"
  }
}

export async function getStaticProps(context: { params: { slug: string; }; }) {
  const posts = await getAllPosts();
  const totalCount = getTotalPages(posts);
  return {
    props: {
      totalPages: totalCount,
      post: posts.find((post) => post.metadata.slug === context.params.slug)
    }
  }
}

export default function Page(props: InferGetStaticPropsType<typeof getStaticProps>) {
  if (props.post === undefined) {
    throw new Error("Post not found");
  }
  const content = props.post.fileContent
  return (
    <BlogBody totalPages={props.totalPages}>
      <h1>
        {props.post.frontmatter.title as string}
      </h1>
      <div className={styles.blogPostContainer}>
        <p className={styles.blogPostDate}>Posted on: {props.post.frontmatter.date as string}</p>
        <MDXRemote
          {...content}
          components={{
            pre: CodeBlock,
            "TocAzureContainerSeries": TocAzureContainerSeries,
            "CodeSandbox": CodeSandbox,
            "YouTube": YouTube
          }}
        />
      </div>
    </BlogBody>);
}