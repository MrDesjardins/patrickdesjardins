import clsx from "clsx";
import styles from "./website.module.css";
import styles2 from "./AchievementsSection.module.css";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopyright } from "@fortawesome/free-solid-svg-icons";
export const AchievementsSection = (): JSX.Element => {
  return (
    <section
      id="achievements"
      className={clsx(
        styles.sectionMainpage,
        styles.sectionVisualTwo,
        styles2.achievementContainerBackground
      )}
    >
      <div className={styles2.achievementOverlay}>
        <div className={styles2.achievementColumn1}>
          <div className={styles2.achivementTextZone}>
            <header>Just Do It!</header>
            <div className={styles2.achievementText}>
              <p>
                You know what a person worth when this one must deliver. I'm a
                balanced software engineer that can do smart designs that are
                cost-effective and maintainable. You can describe me as someone
                who enjoys simplicity, with a firm commitment and rigor that
                allow me to pursue a good delivery and innovative cadence.
              </p>
              <p>
                I do not give up, either surrender. Here are my 2017 objectives
                for example that illustrate how focus I can be to self-improve.
              </p>
            </div>
          </div>
        </div>
        <div className={styles2.achievementColumn2}>
          <div className={styles2.achievementGallery}>
            <div style={{ margin: "auto", width: 200 }}>
              <a
                href="https://stackexchange.com/users/7901"
                rel="noopener noreferrer"
              >
                <Image
                  src="https://stackexchange.com/users/flair/7901.png"
                  width={208}
                  height={58}
                  alt="profile for Patrick Desjardins on Stack Exchange, a network of free, community-driven Q&amp;A sites"
                  title="profile for Patrick Desjardins on Stack Exchange, a network of free, community-driven Q&amp;A sites"
                />
              </a>
            </div>
            <br />
            <br />
            <div style={{ margin: "auto", width: 150 }}>
              <iframe
                id="twitter-widget-0"
                scrolling="no"
                frameBorder="0"
                className="twitter-follow-button twitter-follow-button-rendered"
                title="Twitter Follow Button"
                src="http://platform.twitter.com/widgets/follow_button.f8c8d971a6ac545cf416e3c1ad4bbc65.en.html#dnt=false&amp;id=twitter-widget-0&amp;lang=en&amp;screen_name=mrdesjardins&amp;show_count=true&amp;show_screen_name=true&amp;size=m&amp;time=1504847325924"
                style={{
                  position: "static",
                  visibility: "visible",
                  width: 230,
                  height: 20,
                }}
                data-screen-name="mrdesjardins"
              ></iframe>
            </div>
            <br />
            <br />
            <div
              className="github-flair"
              style={{
                margin: "auto",
                boxSizing: "border-box",
                lineHeight: "normal",
                display: "flex",
                alignItems: "center",
                width: 290,
                height: 95,
                color: "rgb(255, 255, 255)",
                position: "relative",
                border: "2px solid rgb(3, 169, 244)",
                background: "rgb(3, 169, 244)",
                borderRadius: 3,
                padding: "5px 10px",
                fontFamily:
                  "-apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbo",
              }}
            >
              <svg
                width="30"
                height="30"
                viewBox="0 0 250 250"
                style={{
                  fill: "rgb(255, 255, 255)",
                  color: "rgb(3, 169, 244)",
                  position: "absolute",
                  top: 0,
                  right: 0,
                  border: 0,
                }}
              >
                <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path>
                <path
                  d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z"
                  fill="currentColor"
                ></path>
              </svg>
              <div
                className="avatar"
                style={{
                  textAlign: "center",
                  position: "relative",
                  width: 75,
                  height: 75,
                  marginLeft: 5,
                }}
              >
                <a
                  href="https://github.com/MrDesjardins"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    loading="lazy"
                    src="https://avatars0.githubusercontent.com/u/1014796?v=4"
                    alt="Profile Avatar"
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                    }}
                    width={128}
                    height={128}
                  />
                </a>
              </div>
              <div
                className="info"
                style={{ width: 160, textAlign: "right", fontSize: 14 }}
              >
                <div
                  className="name"
                  style={{ fontWeight: "bold", fontSize: 16 }}
                >
                  <a
                    href="https://github.com/MrDesjardins"
                    target="_blank"
                    style={{ fill: "rgb(255, 255, 255)" }}
                    rel="noreferrer"
                  >
                    MrDesjardins
                  </a>
                </div>
                <div className="meta">
                  <span title="Followers">
                    <svg
                      height="12"
                      viewBox="0 0 16 16"
                      width="12"
                      style={{ fill: "rgb(255, 255, 255)" }}
                    >
                      <path
                        fillRule="evenodd"
                        d="M16 12.999c0 .439-.45 1-1 1H7.995c-.539 0-.994-.447-.995-.999H1c-.54 0-1-.561-1-1 0-2.634 3-4 3-4s.229-.409 0-1c-.841-.621-1.058-.59-1-3 .058-2.419 1.367-3 2.5-3s2.442.58 2.5 3c.058 2.41-.159 2.379-1 3-.229.59 0 1 0 1s1.549.711 2.42 2.088C9.196 9.369 10 8.999 10 8.999s.229-.409 0-1c-.841-.62-1.058-.59-1-3 .058-2.419 1.367-3 2.5-3s2.437.581 2.495 3c.059 2.41-.158 2.38-1 3-.229.59 0 1 0 1s3.005 1.366 3.005 4"
                      ></path>
                    </svg>{" "}
                    15&nbsp;&nbsp;
                  </span>
                  <span title="Total Public Repositories">
                    <svg
                      height="12"
                      viewBox="0 0 12 16"
                      width="12"
                      style={{ fill: "rgb(255, 255, 255)" }}
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 9H3V8h1v1zm0-3H3v1h1V6zm0-2H3v1h1V4zm0-2H3v1h1V2zm8-1v12c0 .55-.45 1-1 1H6v2l-1.5-1.5L3 16v-2H1c-.55 0-1-.45-1-1V1c0-.55.45-1 1-1h10c.55 0 1 .45 1 1zm-1 10H1v2h2v-1h3v1h5v-2zm0-10H2v9h9V1z"
                      ></path>
                    </svg>{" "}
                    48&nbsp;&nbsp;
                  </span>
                  <span title="Total Public Gists">
                    <svg
                      height="12"
                      viewBox="0 0 12 16"
                      width="12"
                      style={{ fill: "rgb(255, 255, 255)" }}
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.5 5L10 7.5 7.5 10l-.75-.75L8.5 7.5 6.75 5.75 7.5 5zm-3 0L2 7.5 4.5 10l.75-.75L3.5 7.5l1.75-1.75L4.5 5zM0 13V2c0-.55.45-1 1-1h10c.55 0 1 .45 1 1v11c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1zm1 0h10V2H1v11z"
                      ></path>
                    </svg>{" "}
                    3
                  </span>
                </div>
                <div className="location">
                  <svg
                    height="12"
                    viewBox="0 0 12 16"
                    width="12"
                    style={{ fill: "rgb(255, 255, 255)" }}
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 0C2.69 0 0 2.5 0 5.5 0 10.02 6 16 6 16s6-5.98 6-10.5C12 2.5 9.31 0 6 0zm0 14.55C4.14 12.52 1 8.44 1 5.5 1 3.02 3.25 1 6 1c1.34 0 2.61.48 3.56 1.36.92.86 1.44 1.97 1.44 3.14 0 2.94-3.14 7.02-5 9.05zM8 5.5c0 1.11-.89 2-2 2-1.11 0-2-.89-2-2 0-1.11.89-2 2-2 1.11 0 2 .89 2 2z"
                    ></path>
                  </svg>
                  <span>&nbsp;United States</span>
                </div>
                <div className="blog">
                  <a
                    href="http://patrickdesjardins.com"
                    target="_blank"
                    style={{ color: "rgb(255, 255, 255)" }}
                    rel="noreferrer"
                  >
                    Blog / Website
                  </a>
                </div>
              </div>
            </div>
            <br />
            <br />
            <div className={styles2.amazonFlair}>
              <a
                href="https://www.amazon.com/Patrick-Desjardins/e/B01MZBUL14"
                rel="noopener noreferrer"
              >
                <Image
                  alt="Amazon Logo"
                  src="/images/brand-logo/amazonlogo.jpg"
                  width={32}
                  height={32}
                />
                <span>Author of 12 books</span>
              </a>
            </div>
            <br />
            <br />
            <div className={styles2.mvpFlair}>
              <Image
                alt="MVP Logo"
                src="/images/brand-logo/mvp.png"
                width={187}
                height={75}
              />

              <div>Microsoft MVP in 2013, 2014, 2021, 2022, 2023</div>
            </div>
            <br />
            <br />
            <div className={styles2.patentFlair}>
              <a href="#">
                <FontAwesomeIcon
                  icon={faCopyright}
                  style={{ width: 14, marginRight: 6 }}
                />
                6 Sole Inventor Pending Patents
              </a>
              <div style={{ color: "black" }}>
                Online Available:
                <a
                  href="https://www.freepatentsonline.com/y2019/0199645.html"
                  rel="noopener noreferrer"
                >
                  1
                </a>
                ,
                <a
                  href="https://www.freepatentsonline.com/y2018/0356957.html"
                  rel="noopener noreferrer"
                >
                  2
                </a>
                ,
                <a
                  href="https://www.freepatentsonline.com/y2018/0367478.html"
                  rel="noopener noreferrer"
                >
                  3
                </a>
                ,
                <a
                  href="https://www.freepatentsonline.com/y2017/0359434.html"
                  rel="noopener noreferrer"
                >
                  4
                </a>
                ,
                <a
                  href="https://www.freepatentsonline.com/y2018/0316637.html"
                  rel="noopener noreferrer"
                >
                  5
                </a>
                ,
                <a
                  href="https://www.freepatentsonline.com/y2018/0153458.html"
                  rel="noopener noreferrer"
                >
                  6
                </a>
                ,
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
