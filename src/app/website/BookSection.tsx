import clsx from "clsx";
import styles from "./website.module.css";
import Image from "next/image";
import { CardFixedWidth } from "./CardFixedWidth";
export const BookSection = (): React.ReactElement => {
  return (
    <section
      id="book"
      className={clsx(styles.sectionMainpage, styles.sectionVisualOne)}
    >
      <header>Books</header>
      <div className={styles.sectionFixedWitdh}>
        <CardFixedWidth
          title="Holistic TypeScript Second Edition (TS 4.0)"
          description="A book that cover every features of TypeScript up to TypeScript 4.0."
          link="http://typescriptbook.com/"
          image={
            <Image
              className={styles.cardFixedWidthImageImg}
              alt="Screenshot of the book Holistic TypeScript Second Edition"
              src="/images/books/HolisticTypeScriptBook.jpg"
              width={200}
              height={250}
            />
          }
        />

        <CardFixedWidth
          title="TypeScript 3.0 Quick Start Guide"
          description="Work with everything you need to create TypeScript applications"
          link="https://www.packtpub.com/application-development/typescript-30-quick-start-guide/"
          image={
            <Image
              className={styles.cardFixedWidthImageImg}
              alt="Screenshot of the book TypeScript Quick Start"
              src="/images/books/booktspackt_200width.jpg"
              width={200}
              height={250}
            />
          }
        />

        <CardFixedWidth
          title="Holistic TypeScript First Edition (TS 2.8)"
          description="A book that cover every features of TypeScript up to TypeScript 2.8."
          link="http://typescriptbook.com/"
          image={
            <Image
              className={styles.cardFixedWidthImageImg}
              alt="Screenshot of the book Holistic TypeScript First Edition"
              src="/images/books/HolisticTypeScriptBook.jpg"
              width={200}
              height={250}
            />
          }
        />

        <CardFixedWidth
          title=".Net Knowledge Book Volume 6: TypeScript, React and Redux"
          description="This book is a melting pot of several articles about TypeScript, React and Redux. They are scenarios that happen in the everyday work of developers who use these technologies."
          link="https://www.amazon.com/dp/2981311077"
          image={
            <Image
              className={styles.cardFixedWidthImageImg}
              alt="Screenshot of the book .Net Knowledge Book Volume 6"
              src="/images/books/LivreBlog6_200Width.jpg"
              width={200}
              height={250}
            />
          }
        />

        <CardFixedWidth
          title=".Net Knowledge Book Volume 5: TypeScript, React and NodeJS"
          description="This book is a melting pot of several articles about TypeScript, React and NodeJs. They are scenarios that happen in the everyday work of developers who use these technologies."
          link="https://www.createspace.com/7776372"
          image={
            <Image
              className={styles.cardFixedWidthImageImg}
              alt="Screenshot of the book .Net Knowledge Book Volume 5"
              src="/images/books/LivreBlog5_200Width.png"
              width={200}
              height={250}
            />
          }
        />

        <CardFixedWidth
          title=".Net Knowledge Book Volume 4: Web Development with Asp.Net MVC, Azure and Entity Framework"
          description="This book is a melting pot of several articles about Asp.Net MVC, Entity Framework, JavaScript, CSS, C# and SQL. They are scenarios that happen in the everyday work of developers who use these technologies."
          link="https://www.createspace.com/6697657"
          image={
            <Image
              className={styles.cardFixedWidthImageImg}
              alt="Screenshot of the book .Net Knowledge Book Volume 4"
              src="/images/books/LivreBlog4_200Width.png"
              width={200}
              height={250}
            />
          }
        />

        <CardFixedWidth
          title=".Net Knowledge Book Volume 3: Web Development with Asp.Net MVC and Entity Framework"
          description="This book is a melting pot of several articles about Asp.Net MVC, Entity Framework, JavaScript, CSS, C# and SQL. They are scenarios that happen in the everyday work of developers who use these technologies."
          link="https://patrickdesjardins.com//"
          image={
            <Image
              className={styles.cardFixedWidthImageImg}
              alt="Screenshot of the book .Net Knowledge Book Volume 3"
              src="/images/books/LivreBlog3_200Width.png"
              width={200}
              height={250}
            />
          }
        />

        <CardFixedWidth
          title=".Net Knowledge Book Volume 2: Web Development with Asp.Net MVC and Entity Framework "
          description="This book is a melting pot of several articles about Asp.Net MVC, Entity Framework, JavaScript, CSS, C# and SQL. They are scenarios that happen in the everyday work of developers who use these technologies."
          link="https://www.createspace.com/4769282"
          image={
            <Image
              className={styles.cardFixedWidthImageImg}
              alt="Screenshot of the book .Net Knowledge Book Volume 2"
              src="/images/books/LivreBlog2_200Width.jpg"
              width={200}
              height={250}
            />
          }
        />

        <CardFixedWidth
          title=".Net Knowledge Book Volume 1: Web Development with Asp.Net MVC and Entity Framework"
          description="This book is a melting pot of several articles about Asp.Net MVC, Entity Framework, JavaScript, CSS, C# and SQL. They are scenarios that happen in the everyday work of developers who use these technologies."
          link="https://www.createspace.com/5060022"
          image={
            <Image
              className={styles.cardFixedWidthImageImg}
              alt="Screenshot of the book .Net Knowledge Book Volume 1"
              src="/images/books/LivreBlog1_200Width.png"
              width={200}
              height={250}
            />
          }
        />

        <CardFixedWidth
          title="Visual Studio Condensed"
          description="Visual Studio is one of the most sophisticated integrated development environments in the world today. With hundreds of features and several different editions available, it can be hard to learn your way around, and hard to know whether you're using it to its full potential. Visual Studio Condensed gives you a quick and systematic guide to the features that matter most for your productivity, tagged clearly by edition and user level."
          link="https://www.springer.com/gp/book/9781430268246"
          image={
            <Image
              className={styles.cardFixedWidthImageImg}
              alt="Screenshot of the book .Net Knowledge Book Volume 3"
              src="/images/books/apress_200width.png"
              width={200}
              height={250}
            />
          }
        />
      </div>
    </section>
  );
};
