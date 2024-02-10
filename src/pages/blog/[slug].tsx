import { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { MDXRemote } from 'next-mdx-remote';
import Error from 'next/error';
import { getMdxFileContent, getTotalPagesCount, postFilePaths } from "../../utils/mdx";
import { BlogBody } from "../blogbody";
import styles from "../layout.module.css";
import { CodeBlock } from "./_components/CodeBlock";
import { TocAzureContainerSeries } from "./_blogcomponents/TocAzureContainerSeries";
import { CodeSandbox } from "./_blogcomponents/CodeSandbox";
import { YouTube } from "./_blogcomponents/YouTube";

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" }
}
export async function getStaticProps(
  ctx: GetStaticPropsContext<{
    slug: string
  }>,
) {
  const { slug } = ctx.params!

  // retrieve the MDX blog post file associated
  // with the specified slug parameter
  const postFile = postFilePaths.find((file) => file.fileName === (`${slug}.mdx`))
  if (postFile === undefined) {
    return {
      props: {
        status: 404

      },
    }
  }

  const content = await getMdxFileContent(postFile.fullPathWithFileName);

  return {
    props: {
      status: 200,
      source: content,
      totalPages: getTotalPagesCount()
    },
  }
}
export default function Page(props: InferGetStaticPropsType<typeof getStaticProps>) {
  if (props.source === undefined) {
    return <Error statusCode={props.status} />
  }
  const content = props.source.fileContent
  return (
    <BlogBody totalPages={props.totalPages}>
      <h1>
        {props.source.frontmatter.title as string}
      </h1>
      <div className={styles.blogPostContainer}>
        <p className={styles.blogPostDate}>Posted on: {props.source.frontmatter.date as string}</p>
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