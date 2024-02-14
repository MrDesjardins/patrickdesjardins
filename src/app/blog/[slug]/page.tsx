import { compileMDX } from "next-mdx-remote/rsc";
import { MdxData, getAllPosts, getTotalPages } from "../../../lib/api";
import styles from "../../layout.module.css";
import { CodeSandbox } from "../_blogcomponents/CodeSandbox";
import { SoundCloud } from "../_blogcomponents/SoundCloud";
import { TocAzureContainerSeries } from "../_blogcomponents/TocAzureContainerSeries";
import { YouTube } from "../_blogcomponents/YouTube";
import { BlogBody } from "../_components/blogbody";
import rehypePrism from 'rehype-prism-plus';
import "./linenumber.css";
import "./theme.css";
import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: { slug: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const posts = await getAllPosts();
  const post = posts.find((post) => post.metadata.slug === props.params.slug);
  if (post === undefined) {
    throw new Error("Post not found");
  }

  return {
    title: "Patrick Desjardins Blog - " + String(post.frontmatter.title),
    description: String(post.frontmatter.title)
  }
}

export interface GeneratedPageContentType {
  source: MdxData;
  totalPages: number;
}
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.metadata.slug }));
}

export default async function Page(props: { params: { slug: string } }) {
  const posts = await getAllPosts();
  const totalPages = getTotalPages(posts);
  const post = posts.find((post) => post.metadata.slug === props.params.slug);
  if (post === undefined) {
    throw new Error("Post not found");
  }
  const options = {
    defaultLang: "plaintext",
    theme: "github-light",
    keepBackground: true,
  };
  const { content, frontmatter } = await compileMDX({
    source: post.rawFileContent,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        rehypePlugins: [[rehypePrism, { ignoreMissing: true }]]

      },
    },
    components: {
      TocAzureContainerSeries: TocAzureContainerSeries,
      CodeSandbox: CodeSandbox,
      YouTube: YouTube,
      SoundCloud: SoundCloud,
    },
  });

  return (
    <BlogBody totalPages={totalPages}>
      <h1>{post.frontmatter.title as string}</h1>
      <div className={styles.blogPostContainer}>
        <p className={styles.blogPostDate}>
          Posted on: {post.frontmatter.date as string}
        </p>
        {content}
      </div>
    </BlogBody>
  );
}
