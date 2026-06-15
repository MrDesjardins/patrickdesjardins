import * as runtime from "react/jsx-runtime";
import { jsx, jsxs } from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import { useEffect, createElement } from "react";
import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";
import clsx from "clsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopyright, faPaperPlane, faMapMarker, faRss, faGraduationCap, faCertificate } from "@fortawesome/free-solid-svg-icons";
import { faTwitter, faLinkedin, faGithub, faStackOverflow, faAmazon, faYoutube } from "@fortawesome/free-brands-svg-icons";
import fs from "fs";
import path from "path";
import { evaluate } from "@mdx-js/mdx";
import rehypePrism from "rehype-prism-plus";
import remarkGfm from "remark-gfm";
const htmlstyle = "app_layout__htmlstyle";
const bodystyle = "app_layout__bodystyle";
const container$1 = "app_layout__container";
const topMenu = "app_layout__topMenu";
const topHeader = "app_layout__topHeader";
const topHeaderMyName = "app_layout__topHeaderMyName";
const topHeaderBlog = "app_layout__topHeaderBlog";
const homeContent = "app_layout__homeContent";
const homeContentTitles = "app_layout__homeContentTitles";
const textOnPicture = "app_layout__textOnPicture";
const topPicture = "app_layout__topPicture";
const topHeaderAnchorLink = "app_layout__topHeaderAnchorLink";
const wrapper = "app_layout__wrapper";
const imageWrapper = "app_layout__imageWrapper";
const styles$b = {
  htmlstyle,
  bodystyle,
  container: container$1,
  topMenu,
  topHeader,
  topHeaderMyName,
  topHeaderBlog,
  homeContent,
  homeContentTitles,
  textOnPicture,
  topPicture,
  topHeaderAnchorLink,
  wrapper,
  imageWrapper
};
const gaMeasurementId = "";
const buildCommit = "local";
const buildTime = "local";
function isTelemetryEnabled() {
  return typeof window !== "undefined" && typeof window.gtag === "function" && gaMeasurementId !== void 0 && gaMeasurementId.length > 0;
}
function sendTelemetryEvent(eventName, params = {}) {
  var _a;
  if (!isTelemetryEnabled()) {
    return;
  }
  (_a = window.gtag) == null ? void 0 : _a.call(window, "event", eventName, {
    ...params,
    build_commit: buildCommit,
    build_time: buildTime
  });
}
const trackedMetrics = /* @__PURE__ */ new Set(["CLS", "LCP", "INP", "FCP", "TTFB"]);
function reportMetric(metric) {
  const metricName = String(metric.name);
  if (!trackedMetrics.has(metricName)) {
    return;
  }
  sendTelemetryEvent("web_vital", {
    metric_name: metricName,
    metric_value: Math.round(metric.value),
    metric_rating: String(metric.rating)
  });
}
function WebVitals() {
  useEffect(() => {
    onCLS(reportMetric);
    onFCP(reportMetric);
    onINP(reportMetric);
    onLCP(reportMetric);
    onTTFB(reportMetric);
  }, []);
  return null;
}
function OutboundLinkTelemetry() {
  useEffect(() => {
    const handleClick = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const link = target.closest("a");
      if (link === null) {
        return;
      }
      const href = link.getAttribute("href");
      if (href === null || href.startsWith("/") || href.startsWith("#")) {
        return;
      }
      let url;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.hostname === window.location.hostname) {
        return;
      }
      sendTelemetryEvent("outbound_link_click", {
        link_host: url.hostname
      });
    };
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);
  return null;
}
const metadata$3 = {
  title: "Patrick Desjardins",
  description: "Software engineering blog by Patrick Desjardins — distributed systems, TypeScript, machine learning, and career growth."
};
function RootLayout$1({
  children
}) {
  return /* @__PURE__ */ jsx("html", { lang: "en", className: styles$b.htmlstyle, children: /* @__PURE__ */ jsxs("body", { className: styles$b.bodystyle, children: [
    /* @__PURE__ */ jsx(WebVitals, {}),
    /* @__PURE__ */ jsx(OutboundLinkTelemetry, {}),
    children
  ] }) });
}
const blogbodystyle = "app_blog_layout__blogbodystyle";
const styles$a = {
  blogbodystyle
};
function RootLayout({
  children
}) {
  return /* @__PURE__ */ jsx("div", { className: styles$a.blogbodystyle, children });
}
function Image(props2) {
  const { fill, priority, style, loading, ...rest } = props2;
  const computedStyle = fill === true ? {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    ...style
  } : style;
  return /* @__PURE__ */ jsx(
    "img",
    {
      ...rest,
      loading: priority === true ? "eager" : loading ?? "lazy",
      style: computedStyle
    }
  );
}
const sectionMainpage = "app_website_website__sectionMainpage";
const sectionPhilosophySub = "app_website_website__sectionPhilosophySub";
const sectionPhilosophyCta = "app_website_website__sectionPhilosophyCta";
const sectionFixedWitdh = "app_website_website__sectionFixedWitdh";
const sectionFixedWitdhContent = "app_website_website__sectionFixedWitdhContent";
const sectionVisualOne = "app_website_website__sectionVisualOne";
const sectionVisualTwo = "app_website_website__sectionVisualTwo";
const sectionVisualOneSubHeader = "app_website_website__sectionVisualOneSubHeader";
const cardFixedWidthImage = "app_website_website__cardFixedWidthImage";
const cardFixedWidthImageImg = "app_website_website__cardFixedWidthImageImg";
const sectionSingleFixedWidth = "app_website_website__sectionSingleFixedWidth";
const styles$9 = {
  sectionMainpage,
  sectionPhilosophySub,
  sectionPhilosophyCta,
  sectionFixedWitdh,
  sectionFixedWitdhContent,
  sectionVisualOne,
  sectionVisualTwo,
  sectionVisualOneSubHeader,
  cardFixedWidthImage,
  cardFixedWidthImageImg,
  sectionSingleFixedWidth
};
const sectionAboutMeContainer = "app_website_AboutMeSection__sectionAboutMeContainer";
const sectionAboutMeContainerContent = "app_website_AboutMeSection__sectionAboutMeContainerContent";
const styles2$8 = {
  sectionAboutMeContainer,
  sectionAboutMeContainerContent
};
const AboutMeSection = () => {
  return /* @__PURE__ */ jsxs(
    "section",
    {
      id: "about-me",
      className: clsx(styles$9.sectionMainpage, styles$9.sectionVisualTwo),
      children: [
        /* @__PURE__ */ jsx("h2", { children: "About Me" }),
        /* @__PURE__ */ jsxs("div", { className: styles2$8.sectionAboutMeContainer, children: [
          /* @__PURE__ */ jsxs("div", { className: styles2$8.sectionAboutMeContainerContent, children: [
            /* @__PURE__ */ jsx("h5", { children: "Polyvalent" }),
            /* @__PURE__ */ jsx("p", { children: "I adjust rapidly and efficiently to any environment. The proof is in my life. I have relocated from a French world to an English one. Changing countries and leaving my comfort zone to embrace new ones. At the same time, I moved between many teams and projects while being promoted continuously. I had to learn new technologies quickly and be efficient within a few days. As a result, I am rising from top companies to incredible ones while moving across the United States." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles2$8.sectionAboutMeContainerContent, children: [
            /* @__PURE__ */ jsx("h5", { children: "Leader" }),
            /* @__PURE__ */ jsx("p", { children: "In every position, I took the lead to improve the current situation or put practices in place with the people around me. I am not a loud talker, but I regularly bring pieces to every system for a final result that could benefit every engineer and company. I cannot stay in place and do the minimum -- I am naturally an entrepreneur and want to innovate and push the limit of every assignment. I convey my love of efficiency to everyone who works with me and share as much as possible by presenting, emailing, or Slack any detail to bolster the team." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles2$8.sectionAboutMeContainerContent, children: [
            /* @__PURE__ */ jsx("h5", { children: "Doer" }),
            /* @__PURE__ */ jsx("p", { children: 'Expert in doing: think, plan, and execute. I design and write just enough to have the team understand the direction and lift apparent impediments. I master balancing analyzing and coding, giving me a steady delivery cadence. I polish user interfaces gradually while bringing more features that, with time, create the best experience for the user. Same for performance, usability, and tests: iterating is the key to success. I introduce a "wow" factor and innovations to surpass expectations at every step.' })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles2$8.sectionAboutMeContainerContent, children: [
            /* @__PURE__ */ jsx("h5", { children: "Naturally Initiative Seeker" }),
            /* @__PURE__ */ jsx("p", { children: "My innate nature gave me the quality to find solutions to any problems. My experiences, motivation, and capability to learn fast are handy for zooming my way into fixing any existing codebase. It is the same with engineering solutions that require adjustment quickly or when facing a customer's challenging requirements." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles2$8.sectionAboutMeContainerContent, children: [
            /* @__PURE__ */ jsx("h5", { children: "Sharer" }),
            /* @__PURE__ */ jsx("p", { children: "While performing my main tasks, I thrive on discovering initiatives to improve my team and the products. In addition, I am known to communicate visually and often by creating web prototypes rapidly." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles2$8.sectionAboutMeContainerContent, children: [
            /* @__PURE__ */ jsx("h5", { children: "Fast Pareto Practitioner" }),
            /* @__PURE__ */ jsx("p", { children: "I lean toward simple and fast solutions with a preference to do the heavy 80% of the work using 20% of my time. I truly excel working on the breath instead of working in-depth. I prefer working iteratively to achieve the best solution over time." })
          ] })
        ] })
      ]
    }
  );
};
function Link(props2) {
  const { href, children, ...rest } = props2;
  return /* @__PURE__ */ jsx("a", { href, ...rest, children });
}
const PhilosophySection = () => {
  return /* @__PURE__ */ jsxs(
    "section",
    {
      id: "philosophy",
      className: clsx(styles$9.sectionMainpage, styles$9.sectionVisualTwo),
      children: [
        /* @__PURE__ */ jsx("h2", { children: "Philosophy" }),
        /* @__PURE__ */ jsx("h3", { className: styles$9.sectionPhilosophySub, children: "Personal Essays and Notes" }),
        /* @__PURE__ */ jsxs("div", { className: styles$9.sectionSingleFixedWidth, children: [
          /* @__PURE__ */ jsx("p", { children: "Alongside my technical writing, I keep a separate space for philosophy: longer-form essays, careful argument, and notes that deserve a different pace and tone from day-to-day engineering posts." }),
          /* @__PURE__ */ jsx("p", { children: "I will be trying to write more personal essays and notes here. I will be writing about my life, my thoughts, my experiences, and my opinions. I will also focus on AI and its impact on our lives." }),
          /* @__PURE__ */ jsx("p", { className: styles$9.sectionPhilosophyCta, children: /* @__PURE__ */ jsx(Link, { href: "/philosophy", children: "Open the philosophy journal" }) })
        ] })
      ]
    }
  );
};
const achievementContainerBackground = "app_website_AchievementsSection__achievementContainerBackground";
const achivementTextZone = "app_website_AchievementsSection__achivementTextZone";
const achievementText = "app_website_AchievementsSection__achievementText";
const achievementOverlay = "app_website_AchievementsSection__achievementOverlay";
const achievementGallery = "app_website_AchievementsSection__achievementGallery";
const patentFlair = "app_website_AchievementsSection__patentFlair";
const amazonFlair = "app_website_AchievementsSection__amazonFlair";
const mvpFlair = "app_website_AchievementsSection__mvpFlair";
const styles2$7 = {
  achievementContainerBackground,
  achivementTextZone,
  achievementText,
  achievementOverlay,
  achievementGallery,
  patentFlair,
  amazonFlair,
  mvpFlair
};
const AchievementsSection = () => {
  return /* @__PURE__ */ jsx(
    "section",
    {
      id: "achievements",
      className: clsx(
        styles$9.sectionMainpage,
        styles$9.sectionVisualTwo,
        styles2$7.achievementContainerBackground
      ),
      children: /* @__PURE__ */ jsxs("div", { className: styles2$7.achievementOverlay, children: [
        /* @__PURE__ */ jsx("div", { className: styles2$7.achievementColumn1, children: /* @__PURE__ */ jsxs("div", { className: styles2$7.achivementTextZone, children: [
          /* @__PURE__ */ jsx("h2", { children: "Just Do It!" }),
          /* @__PURE__ */ jsxs("div", { className: styles2$7.achievementText, children: [
            /* @__PURE__ */ jsx("p", { children: "You know what a person worth when this one must deliver. I'm a balanced software engineer that can do smart designs that are cost-effective and maintainable. You can describe me as someone who enjoys simplicity, with a firm commitment and rigor that allow me to pursue a good delivery and innovative cadence." }),
            /* @__PURE__ */ jsx("p", { children: "I do not give up, either surrender. Here are my 2017 objectives for example that illustrate how focus I can be to self-improve." })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: styles2$7.achievementColumn2, children: /* @__PURE__ */ jsxs("div", { className: styles2$7.achievementGallery, children: [
          /* @__PURE__ */ jsx("div", { style: { margin: "auto", width: 200 }, children: /* @__PURE__ */ jsx(
            "a",
            {
              href: "https://stackexchange.com/users/7901",
              rel: "noopener noreferrer",
              children: /* @__PURE__ */ jsx(
                Image,
                {
                  src: "https://stackexchange.com/users/flair/7901.png",
                  width: 208,
                  height: 58,
                  alt: "profile for Patrick Desjardins on Stack Exchange, a network of free, community-driven Q&A sites",
                  title: "profile for Patrick Desjardins on Stack Exchange, a network of free, community-driven Q&A sites"
                }
              )
            }
          ) }),
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "github-flair",
              style: {
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
                fontFamily: "-apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbo"
              },
              children: [
                /* @__PURE__ */ jsxs(
                  "svg",
                  {
                    width: "30",
                    height: "30",
                    viewBox: "0 0 250 250",
                    style: {
                      fill: "rgb(255, 255, 255)",
                      color: "rgb(3, 169, 244)",
                      position: "absolute",
                      top: 0,
                      right: 0,
                      border: 0
                    },
                    children: [
                      /* @__PURE__ */ jsx("path", { d: "M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z" }),
                      /* @__PURE__ */ jsx(
                        "path",
                        {
                          d: "M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z",
                          fill: "currentColor"
                        }
                      )
                    ]
                  }
                ),
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "avatar",
                    style: {
                      textAlign: "center",
                      position: "relative",
                      width: 75,
                      height: 75,
                      marginLeft: 5
                    },
                    children: /* @__PURE__ */ jsx(
                      "a",
                      {
                        href: "https://github.com/MrDesjardins",
                        target: "_blank",
                        rel: "noopener noreferrer",
                        children: /* @__PURE__ */ jsx(
                          Image,
                          {
                            loading: "lazy",
                            src: "https://avatars0.githubusercontent.com/u/1014796?v=4",
                            alt: "Profile Avatar",
                            style: {
                              width: "100%",
                              height: "100%",
                              borderRadius: "50%"
                            },
                            width: 128,
                            height: 128
                          }
                        )
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: "info",
                    style: { width: 160, textAlign: "right", fontSize: 14 },
                    children: [
                      /* @__PURE__ */ jsx(
                        "div",
                        {
                          className: "name",
                          style: { fontWeight: "bold", fontSize: 16 },
                          children: /* @__PURE__ */ jsx(
                            "a",
                            {
                              href: "https://github.com/MrDesjardins",
                              target: "_blank",
                              style: { fill: "rgb(255, 255, 255)" },
                              rel: "noreferrer",
                              children: "MrDesjardins"
                            }
                          )
                        }
                      ),
                      /* @__PURE__ */ jsxs("div", { className: "meta", children: [
                        /* @__PURE__ */ jsxs("span", { title: "Followers", children: [
                          /* @__PURE__ */ jsx(
                            "svg",
                            {
                              height: "12",
                              viewBox: "0 0 16 16",
                              width: "12",
                              style: { fill: "rgb(255, 255, 255)" },
                              children: /* @__PURE__ */ jsx(
                                "path",
                                {
                                  fillRule: "evenodd",
                                  d: "M16 12.999c0 .439-.45 1-1 1H7.995c-.539 0-.994-.447-.995-.999H1c-.54 0-1-.561-1-1 0-2.634 3-4 3-4s.229-.409 0-1c-.841-.621-1.058-.59-1-3 .058-2.419 1.367-3 2.5-3s2.442.58 2.5 3c.058 2.41-.159 2.379-1 3-.229.59 0 1 0 1s1.549.711 2.42 2.088C9.196 9.369 10 8.999 10 8.999s.229-.409 0-1c-.841-.62-1.058-.59-1-3 .058-2.419 1.367-3 2.5-3s2.437.581 2.495 3c.059 2.41-.158 2.38-1 3-.229.59 0 1 0 1s3.005 1.366 3.005 4"
                                }
                              )
                            }
                          ),
                          " ",
                          "15  "
                        ] }),
                        /* @__PURE__ */ jsxs("span", { title: "Total Public Repositories", children: [
                          /* @__PURE__ */ jsx(
                            "svg",
                            {
                              height: "12",
                              viewBox: "0 0 12 16",
                              width: "12",
                              style: { fill: "rgb(255, 255, 255)" },
                              children: /* @__PURE__ */ jsx(
                                "path",
                                {
                                  fillRule: "evenodd",
                                  d: "M4 9H3V8h1v1zm0-3H3v1h1V6zm0-2H3v1h1V4zm0-2H3v1h1V2zm8-1v12c0 .55-.45 1-1 1H6v2l-1.5-1.5L3 16v-2H1c-.55 0-1-.45-1-1V1c0-.55.45-1 1-1h10c.55 0 1 .45 1 1zm-1 10H1v2h2v-1h3v1h5v-2zm0-10H2v9h9V1z"
                                }
                              )
                            }
                          ),
                          " ",
                          "48  "
                        ] }),
                        /* @__PURE__ */ jsxs("span", { title: "Total Public Gists", children: [
                          /* @__PURE__ */ jsx(
                            "svg",
                            {
                              height: "12",
                              viewBox: "0 0 12 16",
                              width: "12",
                              style: { fill: "rgb(255, 255, 255)" },
                              children: /* @__PURE__ */ jsx(
                                "path",
                                {
                                  fillRule: "evenodd",
                                  d: "M7.5 5L10 7.5 7.5 10l-.75-.75L8.5 7.5 6.75 5.75 7.5 5zm-3 0L2 7.5 4.5 10l.75-.75L3.5 7.5l1.75-1.75L4.5 5zM0 13V2c0-.55.45-1 1-1h10c.55 0 1 .45 1 1v11c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1zm1 0h10V2H1v11z"
                                }
                              )
                            }
                          ),
                          " ",
                          "3"
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "location", children: [
                        /* @__PURE__ */ jsx(
                          "svg",
                          {
                            height: "12",
                            viewBox: "0 0 12 16",
                            width: "12",
                            style: { fill: "rgb(255, 255, 255)" },
                            children: /* @__PURE__ */ jsx(
                              "path",
                              {
                                fillRule: "evenodd",
                                d: "M6 0C2.69 0 0 2.5 0 5.5 0 10.02 6 16 6 16s6-5.98 6-10.5C12 2.5 9.31 0 6 0zm0 14.55C4.14 12.52 1 8.44 1 5.5 1 3.02 3.25 1 6 1c1.34 0 2.61.48 3.56 1.36.92.86 1.44 1.97 1.44 3.14 0 2.94-3.14 7.02-5 9.05zM8 5.5c0 1.11-.89 2-2 2-1.11 0-2-.89-2-2 0-1.11.89-2 2-2 1.11 0 2 .89 2 2z"
                              }
                            )
                          }
                        ),
                        /* @__PURE__ */ jsx("span", { children: " United States" })
                      ] }),
                      /* @__PURE__ */ jsx("div", { className: "blog", children: /* @__PURE__ */ jsx(
                        "a",
                        {
                          href: "https://patrickdesjardins.com",
                          target: "_blank",
                          style: { color: "rgb(255, 255, 255)" },
                          rel: "noreferrer",
                          children: "Blog / Website"
                        }
                      ) })
                    ]
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsx("div", { className: styles2$7.amazonFlair, children: /* @__PURE__ */ jsxs(
            "a",
            {
              href: "https://www.amazon.com/Patrick-Desjardins/e/B01MZBUL14",
              rel: "noopener noreferrer",
              children: [
                /* @__PURE__ */ jsx(
                  Image,
                  {
                    alt: "Amazon Logo",
                    src: "/images/brand-logo/amazonlogo.jpg",
                    width: 32,
                    height: 32
                  }
                ),
                /* @__PURE__ */ jsx("span", { children: "Author of 12 books" })
              ]
            }
          ) }),
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsxs("div", { className: styles2$7.mvpFlair, children: [
            /* @__PURE__ */ jsx(
              Image,
              {
                alt: "MVP Logo",
                src: "/images/brand-logo/mvp.png",
                width: 187,
                height: 75
              }
            ),
            /* @__PURE__ */ jsx("div", { children: "Microsoft MVP in 2013, 2014, 2021, 2022, 2023" })
          ] }),
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsxs("div", { className: styles2$7.patentFlair, children: [
            /* @__PURE__ */ jsxs("span", { children: [
              /* @__PURE__ */ jsx(
                FontAwesomeIcon,
                {
                  icon: faCopyright,
                  style: { width: 14, marginRight: 6 }
                }
              ),
              "6 Sole Inventor Pending Patents"
            ] }),
            /* @__PURE__ */ jsxs("div", { style: { color: "black" }, children: [
              "Online Available:",
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.freepatentsonline.com/y2019/0199645.html",
                  rel: "noopener noreferrer",
                  children: "1"
                }
              ),
              ",",
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.freepatentsonline.com/y2018/0356957.html",
                  rel: "noopener noreferrer",
                  children: "2"
                }
              ),
              ",",
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.freepatentsonline.com/y2018/0367478.html",
                  rel: "noopener noreferrer",
                  children: "3"
                }
              ),
              ",",
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.freepatentsonline.com/y2017/0359434.html",
                  rel: "noopener noreferrer",
                  children: "4"
                }
              ),
              ",",
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.freepatentsonline.com/y2018/0316637.html",
                  rel: "noopener noreferrer",
                  children: "5"
                }
              ),
              ",",
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.freepatentsonline.com/y2018/0153458.html",
                  rel: "noopener noreferrer",
                  children: "6"
                }
              ),
              ","
            ] })
          ] })
        ] }) })
      ] })
    }
  );
};
const CardFixedWidth = (props2) => {
  return /* @__PURE__ */ jsxs("div", { className: styles$9.sectionFixedWitdhContent, children: [
    /* @__PURE__ */ jsx("h5", { children: props2.title }),
    /* @__PURE__ */ jsx("p", { className: styles$9.cardFixedWidthImage, children: props2.image }),
    /* @__PURE__ */ jsx("p", { children: props2.description }),
    /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("a", { href: props2.link, target: "_blank", rel: "noopener noreferrer", children: "Link" }) })
  ] });
};
const BookSection = () => {
  return /* @__PURE__ */ jsxs(
    "section",
    {
      id: "book",
      className: clsx(styles$9.sectionMainpage, styles$9.sectionVisualOne),
      children: [
        /* @__PURE__ */ jsx("h2", { children: "Books" }),
        /* @__PURE__ */ jsxs("div", { className: styles$9.sectionFixedWitdh, children: [
          /* @__PURE__ */ jsx(
            CardFixedWidth,
            {
              title: "W3H, What, Why, How - Full Stack Distributed System Design",
              description: "A +800 pages book about distributed system design",
              link: "https://www.amazon.com/dp/B0DKFJJT53",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  className: styles$9.cardFixedWidthImageImg,
                  alt: "Screenshot of the W3H, What, Why, How Distributed System Book",
                  src: "/images/books/w3h_200width.png",
                  width: 200,
                  height: 250
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            CardFixedWidth,
            {
              title: "Holistic TypeScript Second Edition (TS 4.0)",
              description: "A book that cover every features of TypeScript up to TypeScript 4.0.",
              link: "https://typescriptbook.com/",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  className: styles$9.cardFixedWidthImageImg,
                  alt: "Screenshot of the book Holistic TypeScript Second Edition",
                  src: "/images/books/HolisticTypeScriptBook.jpg",
                  width: 200,
                  height: 250
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            CardFixedWidth,
            {
              title: "TypeScript 3.0 Quick Start Guide",
              description: "Work with everything you need to create TypeScript applications",
              link: "https://www.packtpub.com/application-development/typescript-30-quick-start-guide/",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  className: styles$9.cardFixedWidthImageImg,
                  alt: "Screenshot of the book TypeScript Quick Start",
                  src: "/images/books/booktspackt_200width.jpg",
                  width: 200,
                  height: 250
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            CardFixedWidth,
            {
              title: "Holistic TypeScript First Edition (TS 2.8)",
              description: "A book that cover every features of TypeScript up to TypeScript 2.8.",
              link: "https://typescriptbook.com/",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  className: styles$9.cardFixedWidthImageImg,
                  alt: "Screenshot of the book Holistic TypeScript First Edition",
                  src: "/images/books/HolisticTypeScriptBook.jpg",
                  width: 200,
                  height: 250
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            CardFixedWidth,
            {
              title: ".Net Knowledge Book Volume 6: TypeScript, React and Redux",
              description: "This book is a melting pot of several articles about TypeScript, React and Redux. They are scenarios that happen in the everyday work of developers who use these technologies.",
              link: "https://www.amazon.com/dp/2981311077",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  className: styles$9.cardFixedWidthImageImg,
                  alt: "Screenshot of the book .Net Knowledge Book Volume 6",
                  src: "/images/books/LivreBlog6_200Width.jpg",
                  width: 200,
                  height: 250
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            CardFixedWidth,
            {
              title: ".Net Knowledge Book Volume 5: TypeScript, React and NodeJS",
              description: "This book is a melting pot of several articles about TypeScript, React and NodeJs. They are scenarios that happen in the everyday work of developers who use these technologies.",
              link: "https://www.createspace.com/7776372",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  className: styles$9.cardFixedWidthImageImg,
                  alt: "Screenshot of the book .Net Knowledge Book Volume 5",
                  src: "/images/books/LivreBlog5_200Width.png",
                  width: 200,
                  height: 250
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            CardFixedWidth,
            {
              title: ".Net Knowledge Book Volume 4: Web Development with Asp.Net MVC, Azure and Entity Framework",
              description: "This book is a melting pot of several articles about Asp.Net MVC, Entity Framework, JavaScript, CSS, C# and SQL. They are scenarios that happen in the everyday work of developers who use these technologies.",
              link: "https://www.createspace.com/6697657",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  className: styles$9.cardFixedWidthImageImg,
                  alt: "Screenshot of the book .Net Knowledge Book Volume 4",
                  src: "/images/books/LivreBlog4_200Width.png",
                  width: 200,
                  height: 250
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            CardFixedWidth,
            {
              title: ".Net Knowledge Book Volume 3: Web Development with Asp.Net MVC and Entity Framework",
              description: "This book is a melting pot of several articles about Asp.Net MVC, Entity Framework, JavaScript, CSS, C# and SQL. They are scenarios that happen in the everyday work of developers who use these technologies.",
              link: "https://patrickdesjardins.com/",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  className: styles$9.cardFixedWidthImageImg,
                  alt: "Screenshot of the book .Net Knowledge Book Volume 3",
                  src: "/images/books/LivreBlog3_200Width.png",
                  width: 200,
                  height: 250
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            CardFixedWidth,
            {
              title: ".Net Knowledge Book Volume 2: Web Development with Asp.Net MVC and Entity Framework ",
              description: "This book is a melting pot of several articles about Asp.Net MVC, Entity Framework, JavaScript, CSS, C# and SQL. They are scenarios that happen in the everyday work of developers who use these technologies.",
              link: "https://www.createspace.com/4769282",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  className: styles$9.cardFixedWidthImageImg,
                  alt: "Screenshot of the book .Net Knowledge Book Volume 2",
                  src: "/images/books/LivreBlog2_200Width.jpg",
                  width: 200,
                  height: 250
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            CardFixedWidth,
            {
              title: ".Net Knowledge Book Volume 1: Web Development with Asp.Net MVC and Entity Framework",
              description: "This book is a melting pot of several articles about Asp.Net MVC, Entity Framework, JavaScript, CSS, C# and SQL. They are scenarios that happen in the everyday work of developers who use these technologies.",
              link: "https://www.createspace.com/5060022",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  className: styles$9.cardFixedWidthImageImg,
                  alt: "Screenshot of the book .Net Knowledge Book Volume 1",
                  src: "/images/books/LivreBlog1_200Width.png",
                  width: 200,
                  height: 250
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            CardFixedWidth,
            {
              title: "Visual Studio Condensed",
              description: "Visual Studio is one of the most sophisticated integrated development environments in the world today. With hundreds of features and several different editions available, it can be hard to learn your way around, and hard to know whether you're using it to its full potential. Visual Studio Condensed gives you a quick and systematic guide to the features that matter most for your productivity, tagged clearly by edition and user level.",
              link: "https://www.springer.com/gp/book/9781430268246",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  className: styles$9.cardFixedWidthImageImg,
                  alt: "Screenshot of the book .Net Knowledge Book Volume 3",
                  src: "/images/books/apress_200width.png",
                  width: 200,
                  height: 250
                }
              )
            }
          )
        ] })
      ]
    }
  );
};
const video = "app_website_Conference__video";
const videoContainer = "app_website_Conference__videoContainer";
const firstVideo = "app_website_Conference__firstVideo";
const styles2$6 = {
  video,
  videoContainer,
  firstVideo
};
const ConferencesSection = () => {
  return /* @__PURE__ */ jsxs(
    "section",
    {
      id: "conferences",
      className: clsx(styles$9.sectionMainpage, styles$9.sectionVisualOne),
      children: [
        /* @__PURE__ */ jsx("h2", { children: "CONFERENCES" }),
        /* @__PURE__ */ jsx("h3", { children: "Limited list with public recorded presentation only" }),
        /* @__PURE__ */ jsxs("div", { className: styles2$6.firstVideo, children: [
          /* @__PURE__ */ jsx("div", { children: "Croatia 2018, Split Conference" }),
          /* @__PURE__ */ jsx("div", { className: styles2$6.videoContainer, children: /* @__PURE__ */ jsx(
            "iframe",
            {
              className: styles2$6.video,
              title: "Patrick Desjardins - Croatia 2018 Split Conference presentation",
              src: "https://www.youtube.com/embed/QWtNhelMv-k?rel=0&controls=1&showinfo=0",
              allow: "autoplay; encrypted-media; fullscreen",
              allowFullScreen: true
            }
          ) })
        ] })
      ]
    }
  );
};
const contactContainer = "app_website_ContactsSection__contactContainer";
const contactDetail = "app_website_ContactsSection__contactDetail";
const contactContainer2 = "app_website_ContactsSection__contactContainer2";
const contactSection = "app_website_ContactsSection__contactSection";
const styles2$5 = {
  contactContainer,
  contactDetail,
  contactContainer2,
  contactSection
};
const ContactSection = () => {
  return /* @__PURE__ */ jsxs(
    "section",
    {
      id: "contact",
      className: clsx(
        styles$9.sectionMainpage,
        styles$9.sectionVisualOne,
        styles2$5.contactSection
      ),
      children: [
        /* @__PURE__ */ jsx("h2", { children: "Contact" }),
        /* @__PURE__ */ jsx("h3", { children: "You can contact me directly by email or use social media" }),
        /* @__PURE__ */ jsxs("div", { className: styles2$5.contactContainer, children: [
          /* @__PURE__ */ jsxs("div", { className: styles2$5.contactDetail, children: [
            /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faPaperPlane }),
            /* @__PURE__ */ jsx("h5", { children: /* @__PURE__ */ jsx("a", { href: "mailto:mrdesjardins@gmail.com", children: "mrdesjardins@gmail.com" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles2$5.contactDetail, children: [
            /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faMapMarker }),
            /* @__PURE__ */ jsx("h5", { children: "United States, California" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles2$5.contactContainer2, children: [
          /* @__PURE__ */ jsx("div", { className: styles2$5.contactDetail, children: /* @__PURE__ */ jsx(
            "a",
            {
              href: "https://twitter.com/mrdesjardins",
              target: "_blank",
              rel: "noopener noreferrer",
              title: "Patrick Desjardins Twitter Account Page",
              children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faTwitter })
            }
          ) }),
          /* @__PURE__ */ jsx("div", { className: styles2$5.contactDetail, children: /* @__PURE__ */ jsx(
            "a",
            {
              href: "https://linkedin.com/in/patrickdesjardins",
              target: "_blank",
              rel: "noopener noreferrer",
              title: "Patrick Desjardins LinkedIn Account Page",
              children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faLinkedin })
            }
          ) }),
          /* @__PURE__ */ jsx("div", { className: styles2$5.contactDetail, children: /* @__PURE__ */ jsx(
            "a",
            {
              href: "https://github.com/MrDesjardins",
              target: "_blank",
              rel: "noopener noreferrer",
              title: "Patrick Desjardins Github Account Page",
              children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faGithub })
            }
          ) }),
          /* @__PURE__ */ jsx("div", { className: styles2$5.contactDetail, children: /* @__PURE__ */ jsx(
            "a",
            {
              href: "https://stackexchange.com/users/7901",
              target: "_blank",
              rel: "noopener noreferrer",
              title: "Patrick Desjardins Stack Exchange Account Page",
              children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faStackOverflow })
            }
          ) }),
          /* @__PURE__ */ jsx("div", { className: styles2$5.contactDetail, children: /* @__PURE__ */ jsx(
            "a",
            {
              href: "https://www.amazon.com/Patrick-Desjardins/e/B01MZBUL14",
              target: "_blank",
              rel: "noopener noreferrer",
              title: "Patrick Desjardins Amazon Author Page",
              children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faAmazon })
            }
          ) }),
          /* @__PURE__ */ jsx("div", { className: styles2$5.contactDetail, children: /* @__PURE__ */ jsx(
            "a",
            {
              href: "https://www.youtube.com/channel/UCKBBbMaq3Q-MirzMecdJZCQ",
              target: "_blank",
              rel: "noopener noreferrer",
              title: "Patrick Desjardins Youtube Page",
              children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faYoutube })
            }
          ) }),
          /* @__PURE__ */ jsx("div", { className: styles2$5.contactDetail, children: /* @__PURE__ */ jsx(
            "a",
            {
              href: "https://patrickdesjardins.com/rss.xml",
              target: "_blank",
              rel: "noopener noreferrer",
              title: "Patrick Desjardins RSS Blog",
              children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faRss })
            }
          ) })
        ] })
      ]
    }
  );
};
const educationSection = "app_website_EducationSection__educationSection";
const styles2$4 = {
  educationSection
};
const EducationSection = () => {
  return /* @__PURE__ */ jsxs(
    "section",
    {
      id: "education",
      className: clsx(
        styles$9.sectionMainpage,
        styles$9.sectionVisualTwo,
        styles2$4.educationSection
      ),
      children: [
        /* @__PURE__ */ jsx("h2", { children: "Education" }),
        /* @__PURE__ */ jsx("div", { className: styles$9.sectionFixedWitdh, children: /* @__PURE__ */ jsxs("ul", { children: [
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faGraduationCap }),
            /* @__PURE__ */ jsx("p", { children: "Master Degree 4 years in Machine Learning at Georgia Tech (Atlanta, USA)" })
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faGraduationCap }),
            /* @__PURE__ */ jsx("p", { children: "Bachelor Degree 4 years in Software Engineering at University ETS (Montreal, Canada)" })
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faGraduationCap }),
            /* @__PURE__ */ jsx("p", { children: "Pre-University 3 years in Computer Science (Montreal, Canada)" })
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faCertificate }),
            /* @__PURE__ */ jsx("p", { children: "26 Plurasight and Udemy Classes" })
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faCertificate }),
            /* @__PURE__ */ jsx("p", { children: "10 Microsoft Certifications" })
          ] })
        ] }) })
      ]
    }
  );
};
const historyContainerBackground = "app_website_HistorySection__historyContainerBackground";
const historyOverlay = "app_website_HistorySection__historyOverlay";
const historyOverlayColumn1 = "app_website_HistorySection__historyOverlayColumn1";
const historyOverlayColumn2 = "app_website_HistorySection__historyOverlayColumn2";
const styles2$3 = {
  historyContainerBackground,
  historyOverlay,
  historyOverlayColumn1,
  historyOverlayColumn2
};
const HistorySection = () => {
  return /* @__PURE__ */ jsx(
    "section",
    {
      id: "past",
      className: clsx(
        styles$9.sectionMainpage,
        styles$9.sectionVisualTwo,
        styles2$3.historyContainerBackground
      ),
      children: /* @__PURE__ */ jsxs("div", { className: styles2$3.historyOverlay, children: [
        /* @__PURE__ */ jsxs("div", { className: styles2$3.historyOverlayColumn1, children: [
          /* @__PURE__ */ jsx("h2", { children: "Past and Present" }),
          /* @__PURE__ */ jsx("p", { children: "During elementary and high school I did competitive karate and won more than 250 prizes over 9 years. Finish twice second in Germany in 1990 in the world championship. I continued my scholarship with three years in Montreal CEGEP in computer science and followed with four years at the University named École de Technologie Supérieur (ETS). During these years I worked on many side projects and always been a top performer. One of my side projects became a small venture and grew to above 65 000 users." }),
          /* @__PURE__ */ jsx("p", { children: "Mid part of University, I developed for few companies where I could use my web expertise to help a variety of software written in many languages like Asp, Asp.Net, Asp.Net MVC and I was a strong advocate to make website cross-browser wich the arrival of JQuery helped the whole process." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles2$3.historyOverlayColumn2, children: [
          /* @__PURE__ */ jsx("p", { children: "I continued doing formation and got my Microsoft Certified Professional Developer (MCPD) et Microsoft Certified Solutions Developer (MCSD). The more the years advanced, the less I was doing VB or PHP or Java and the more I was touching C#, Net, Entity Framework and JavaScript." }),
          /* @__PURE__ */ jsx("p", { children: "In 2013, I became one of the sixth Canadian to be a Microsoft MVP in Asp.Net/IIS. A title that I got for two years in a row until I left Montreal to dwell in Redmond (WA) to work for Microsoft for three years. In 2017, I moved to Silicon Valley to join Netflix as a senior software engineer, bringing my React, Redux, TypeScript expertise into a brand new system that Netflix's partner uses to help to carry a third of the worldwide bandwidth. In parallel, I started a master degree in machine learning at Georgia Tech University, maintain few open source projects, and I deliver presentations at conferences." })
        ] })
      ] })
    }
  );
};
const CourseSection = () => {
  return /* @__PURE__ */ jsxs(
    "section",
    {
      id: "course",
      className: clsx(styles$9.sectionMainpage, styles$9.sectionVisualOne),
      children: [
        /* @__PURE__ */ jsx("h2", { children: "Courses" }),
        /* @__PURE__ */ jsxs("div", { className: styles$9.sectionFixedWitdh, children: [
          /* @__PURE__ */ jsx(
            CardFixedWidth,
            {
              title: "Youtube Channel on TypeScript",
              description: "Weekly episode on many series like gRPC, GraphQL, TypeScript and more web developments",
              link: "https://www.youtube.com/channel/UCKBBbMaq3Q-MirzMecdJZCQ",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  className: styles$9.cardFixedWidthImageImg,
                  alt: "Screenshot of me",
                  src: "/images/portfolio/youtube.jpg",
                  width: 350,
                  height: 350
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            CardFixedWidth,
            {
              title: "Learn TypeScript",
              description: "If you’re looking to move beyond vanilla JavaScript and take your skills to the next level, then you’ve come to the right place. TypeScript is an in-demand language that sits on top of JavaScript. That means you can do everything you can in JavaScript with TypeScript, but also enjoy countless other perks including support for JS libraries, NPM, static typing, and much more.",
              link: "https://typescriptbook.com/",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  className: styles$9.cardFixedWidthImageImg,
                  alt: "Screenshot of the online course",
                  src: "/images/portfolio/course3.jpg",
                  width: 350,
                  height: 350
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            CardFixedWidth,
            {
              title: "Building Pro Web Apps with TypeScript",
              description: "In-depth content balanced with tutorials that put the theory into practice. The focus of this course is on giving you both the understanding and the practical examples that will allow you indulge in the art web development with TypeScript 2.x while taking you through core programming concepts.",
              link: "https://www.packtpub.com/application-development/building-pro-web-apps-typescript-2x-video",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  className: styles$9.cardFixedWidthImageImg,
                  alt: "Screenshot of the online course",
                  src: "/images/portfolio/course2.jpg",
                  width: 350,
                  height: 350
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            CardFixedWidth,
            {
              title: "Rapid Web Application with Typescript ",
              description: "A fast-paced guide that will take you on a journey through the various new features of TypeScript, with the help of real-world, practical videos that show you how to dive right into web application development using TypeScript’s essential.",
              link: "https://www.packtpub.com/application-development/rapid-web-application-development-typescript-2x-video",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  className: styles$9.cardFixedWidthImageImg,
                  alt: "Screenshot of the online course",
                  src: "/images/portfolio/course1.jpg",
                  width: 350,
                  height: 350
                }
              )
            }
          )
        ] })
      ]
    }
  );
};
const overlay = "app_website_NeonGlowOverlay__overlay";
const bodyA = "app_website_NeonGlowOverlay__bodyA";
const bodyB = "app_website_NeonGlowOverlay__bodyB";
const bodyC = "app_website_NeonGlowOverlay__bodyC";
const stoolL = "app_website_NeonGlowOverlay__stoolL";
const stoolR = "app_website_NeonGlowOverlay__stoolR";
const tableE = "app_website_NeonGlowOverlay__tableE";
const styles$8 = {
  overlay,
  bodyA,
  bodyB,
  bodyC,
  stoolL,
  stoolR,
  tableE
};
const BODY_PATH = "M 552,147 C 566,145 595,156 610,174 C 622,190 624,212 622,232 C 620,252 614,268 603,282 C 597,294 588,304 578,310 C 596,309 635,310 667,320 C 688,328 708,346 708,374 C 708,402 694,446 668,486 C 650,515 632,535 618,552 C 622,562 624,574 622,582 C 610,586 598,587 596,587 C 596,612 597,648 598,683 L 506,683 C 507,648 508,612 508,587 C 505,587 493,586 481,582 C 479,574 481,562 486,552 C 472,535 454,515 436,486 C 410,446 396,402 396,374 C 396,346 416,328 437,320 C 469,310 508,309 526,310 C 516,304 507,294 501,282 C 490,268 484,252 482,232 C 480,212 482,190 494,174 C 509,156 538,145 552,147 Z";
const LEFT_STOOL_PATH = "M 77,683 L 75,395 L 57,395 L 57,367 L 183,367 L 183,395 L 164,395 L 166,683";
const RIGHT_STOOL_PATH = "M 938,683 L 937,395 L 923,395 L 923,367 L 1048,367 L 1048,395 L 1034,395 L 1036,683";
const TABLE_PATH = "M 200,463 L 900,463";
function NeonGlowOverlay() {
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      className: styles$8.overlay,
      viewBox: "0 0 1105 683",
      preserveAspectRatio: "xMidYMid slice",
      xmlns: "http://www.w3.org/2000/svg",
      "aria-hidden": "true",
      children: [
        /* @__PURE__ */ jsxs("defs", { children: [
          /* @__PURE__ */ jsxs("filter", { id: "neonAmbient", x: "-80%", y: "-80%", width: "260%", height: "260%", children: [
            /* @__PURE__ */ jsx("feGaussianBlur", { stdDeviation: "12", result: "blur" }),
            /* @__PURE__ */ jsxs("feMerge", { children: [
              /* @__PURE__ */ jsx("feMergeNode", { in: "blur" }),
              /* @__PURE__ */ jsx("feMergeNode", { in: "SourceGraphic" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("filter", { id: "neonCorona", x: "-40%", y: "-40%", width: "180%", height: "180%", children: [
            /* @__PURE__ */ jsx("feGaussianBlur", { stdDeviation: "4", result: "blur" }),
            /* @__PURE__ */ jsxs("feMerge", { children: [
              /* @__PURE__ */ jsx("feMergeNode", { in: "blur" }),
              /* @__PURE__ */ jsx("feMergeNode", { in: "blur" }),
              /* @__PURE__ */ jsx("feMergeNode", { in: "SourceGraphic" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("filter", { id: "neonFilament", x: "-15%", y: "-15%", width: "130%", height: "130%", children: [
            /* @__PURE__ */ jsx("feGaussianBlur", { stdDeviation: "1", result: "blur" }),
            /* @__PURE__ */ jsxs("feMerge", { children: [
              /* @__PURE__ */ jsx("feMergeNode", { in: "blur" }),
              /* @__PURE__ */ jsx("feMergeNode", { in: "SourceGraphic" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "path",
          {
            className: styles$8.bodyA,
            d: BODY_PATH,
            fill: "none",
            stroke: "rgba(255,40,5,0.30)",
            strokeWidth: "2",
            filter: "url(#neonAmbient)"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            className: styles$8.bodyA,
            d: BODY_PATH,
            fill: "none",
            stroke: "rgba(255,60,10,0.80)",
            strokeWidth: "2",
            filter: "url(#neonCorona)"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            className: styles$8.bodyA,
            d: BODY_PATH,
            fill: "none",
            stroke: "rgba(255,200,160,1.00)",
            strokeWidth: "1",
            filter: "url(#neonFilament)"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            className: styles$8.bodyB,
            d: BODY_PATH,
            fill: "none",
            stroke: "rgba(255,40,5,0.30)",
            strokeWidth: "2",
            filter: "url(#neonAmbient)"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            className: styles$8.bodyB,
            d: BODY_PATH,
            fill: "none",
            stroke: "rgba(255,60,10,0.80)",
            strokeWidth: "2",
            filter: "url(#neonCorona)"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            className: styles$8.bodyB,
            d: BODY_PATH,
            fill: "none",
            stroke: "rgba(255,200,160,1.00)",
            strokeWidth: "1",
            filter: "url(#neonFilament)"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            className: styles$8.bodyC,
            d: BODY_PATH,
            fill: "none",
            stroke: "rgba(255,40,5,0.30)",
            strokeWidth: "2",
            filter: "url(#neonAmbient)"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            className: styles$8.bodyC,
            d: BODY_PATH,
            fill: "none",
            stroke: "rgba(255,60,10,0.80)",
            strokeWidth: "2",
            filter: "url(#neonCorona)"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            className: styles$8.bodyC,
            d: BODY_PATH,
            fill: "none",
            stroke: "rgba(255,200,160,1.00)",
            strokeWidth: "1",
            filter: "url(#neonFilament)"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            className: styles$8.stoolL,
            d: LEFT_STOOL_PATH,
            fill: "none",
            stroke: "rgba(255,40,5,0.30)",
            strokeWidth: "2",
            filter: "url(#neonAmbient)"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            className: styles$8.stoolL,
            d: LEFT_STOOL_PATH,
            fill: "none",
            stroke: "rgba(255,60,10,0.80)",
            strokeWidth: "2",
            filter: "url(#neonCorona)"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            className: styles$8.stoolL,
            d: LEFT_STOOL_PATH,
            fill: "none",
            stroke: "rgba(255,200,160,1.00)",
            strokeWidth: "1",
            filter: "url(#neonFilament)"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            className: styles$8.stoolR,
            d: RIGHT_STOOL_PATH,
            fill: "none",
            stroke: "rgba(255,40,5,0.30)",
            strokeWidth: "2",
            filter: "url(#neonAmbient)"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            className: styles$8.stoolR,
            d: RIGHT_STOOL_PATH,
            fill: "none",
            stroke: "rgba(255,60,10,0.80)",
            strokeWidth: "2",
            filter: "url(#neonCorona)"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            className: styles$8.stoolR,
            d: RIGHT_STOOL_PATH,
            fill: "none",
            stroke: "rgba(255,200,160,1.00)",
            strokeWidth: "1",
            filter: "url(#neonFilament)"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            className: styles$8.tableE,
            d: TABLE_PATH,
            fill: "none",
            stroke: "rgba(255,40,5,0.30)",
            strokeWidth: "2",
            filter: "url(#neonAmbient)"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            className: styles$8.tableE,
            d: TABLE_PATH,
            fill: "none",
            stroke: "rgba(255,60,10,0.80)",
            strokeWidth: "2",
            filter: "url(#neonCorona)"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            className: styles$8.tableE,
            d: TABLE_PATH,
            fill: "none",
            stroke: "rgba(255,200,160,1.00)",
            strokeWidth: "1",
            filter: "url(#neonFilament)"
          }
        )
      ]
    }
  );
}
const OpenSourceSection = () => {
  return /* @__PURE__ */ jsxs(
    "section",
    {
      id: "open-source",
      className: clsx(styles$9.sectionMainpage, styles$9.sectionVisualOne),
      children: [
        /* @__PURE__ */ jsx("h2", { children: "Open Source" }),
        /* @__PURE__ */ jsxs("div", { className: styles$9.sectionFixedWitdh, children: [
          /* @__PURE__ */ jsx(
            CardFixedWidth,
            {
              title: "Python Discord Schedule Bot",
              description: "Main maintainer. Creation of a Discord bot that ask who will be available to play on a daily basis. The bot generates statistics about who play with whom, handle timezone, provides audio messages when people join the voice channel and more.",
              link: "https://github.com/MrDesjardins/python-discord-scheduler-bot",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  className: styles$9.cardFixedWidthImageImg,
                  alt: "Screenshot of the Discord bot",
                  src: "/images/portfolio/DiscordBot.png",
                  width: 350,
                  height: 350
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            CardFixedWidth,
            {
              title: "TypeScript Real Time Pixel",
              description: "Main maintainer. Docker containers of a SolidJS frontend server and a NodeJS Socker.IO server for a small realtime pixel game where users place pixel to create image.",
              link: "https://github.com/MrDesjardins/realtimepixel",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  className: styles$9.cardFixedWidthImageImg,
                  alt: "Screenshot of the realtime pixel game",
                  src: "/images/portfolio/realtimepixelgame.png",
                  width: 350,
                  height: 350
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            CardFixedWidth,
            {
              title: "Gym Water Application",
              description: "Main maintainer. SolidJS frontend application that communicate to a backend to change a Raspberri Pi GPIO pin to turn on/off a water pump. The project goals was to provide a user interface to a system that would automatically adjust weight using water for a home gym pulley system.",
              link: "https://github.com/MrDesjardins/gym-water-app",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  className: styles$9.cardFixedWidthImageImg,
                  alt: "Screenshot of a workout screen of the gym app",
                  src: "/images/portfolio/gym-water-dev-panel.png",
                  width: 350,
                  height: 350
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            CardFixedWidth,
            {
              title: "TypeScript Hilbert Curve",
              description: "Main maintainer. TypeScript implementation of the Hilbert Curve algorithm. The project contains Github workflow that build the project for CommonJS and EcmaScript, has a matrix of NodeJS/OS version, unit tests and performance tests.",
              link: "https://github.com/MrDesjardins/hilbert-curve-ts/",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  className: styles$9.cardFixedWidthImageImg,
                  alt: "Screenshot of the a 2d representation of a third order Hilbert Curve",
                  src: "/images/portfolio/hilbertcurve.png",
                  width: 350,
                  height: 350
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            CardFixedWidth,
            {
              title: "Data Access Gateway Chrome Extension",
              description: "Main maintainer. The goal of this Chrome Extension is to receive statistics about how the data is fetched and saved by the library. Build with TypeScript.",
              link: "https://github.com/MrDesjardins/dataaccessgatewaychromeextension",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  className: styles$9.cardFixedWidthImageImg,
                  alt: "Screenshot of the Chrome extension for the Data Access gateway",
                  src: "/images/portfolio/dagextension.jpg",
                  width: 350,
                  height: 350
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            CardFixedWidth,
            {
              title: "Data Access Gateway",
              description: "Main maintainer. The goal of this TypeScript/JavaScript library is to provide a tiny abstraction to cache data when performing remote HTTP(s) API calls. It eases the request by caching the data in memory and/or in the browser memory with a limited set of options. The cache works with two levels of cache: the first one is a memory cache and the second use IndexDB as a persistent cache.",
              link: "https://github.com/MrDesjardins/dataaccessgateway",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  className: styles$9.cardFixedWidthImageImg,
                  alt: "Screenshot of a UML diagram of the Data Access Gateway library",
                  src: "/images/portfolio/daglib.jpg",
                  width: 350,
                  height: 350
                }
              )
            }
          )
        ] })
      ]
    }
  );
};
const statisticContainer = "app_website_StatisticsSection__statisticContainer";
const statisticContainerCard = "app_website_StatisticsSection__statisticContainerCard";
const styles2$2 = {
  statisticContainer,
  statisticContainerCard
};
const FIRST_YEAR = 2011;
const PHILOSOPHY_FIRST_YEAR = 2026;
const LAST_YEAR = (/* @__PURE__ */ new Date()).getFullYear();
const MAX_POSTS_PER_PAGE = 10;
const CodeSandbox = (props2) => {
  const title = props2.title ?? `CodeSandbox example ${props2.codeSandboxId}`;
  return /* @__PURE__ */ jsx(
    "iframe",
    {
      src: `https://codesandbox.io/embed/${props2.codeSandboxId}`,
      style: {
        width: "100%",
        height: "500px",
        border: 0,
        borderRadius: "4px",
        overflow: "hidden"
      },
      title,
      loading: "lazy",
      allow: "accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking",
      sandbox: "allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts",
      children: /* @__PURE__ */ jsxs("a", { href: `https://codesandbox.io/s/${props2.codeSandboxId}`, children: [
        "Open ",
        title
      ] })
    }
  );
};
const SoundCloud = (props2) => {
  const title = props2.title ?? `SoundCloud audio ${props2.soundCloudLink}`;
  const soundCloudUrl = `https://api.soundcloud.com/${props2.soundCloudLink}`;
  return /* @__PURE__ */ jsx(
    "iframe",
    {
      title,
      width: "100%",
      height: "300",
      loading: "lazy",
      src: `https://w.soundcloud.com/player/?url=${encodeURIComponent(soundCloudUrl)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`,
      children: /* @__PURE__ */ jsxs("a", { href: soundCloudUrl, children: [
        "Listen to ",
        title
      ] })
    }
  );
};
const TocAzureContainerSeries = () => {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h2", { children: "Azure Blog Posts: Docker Images & Kubernetes" }),
    /* @__PURE__ */ jsxs("ol", { children: [
      /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "/blog/azure-docker-container-repository", children: "How to host Docker images on Microsoft Azure" }) }),
      /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "/blog/azure-docker-container-repository-github", children: "How to use Kubernetes with Microsoft Azure and GitHub and how to debug if it does not workout" }) }),
      /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "/blog/azure-intro-kubernetes", children: "An Introduction to Microsoft Azure and Kubernetes using Helm and Docker Images" }) }),
      /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "/blog/azure-kubernetes-public-access", children: "How to Access your Web Application on Kubernetes Azure" }) }),
      /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "/blog/azure-kubernetes-pod-debug-crash", children: "How to Debug a Kubernetes Pod that Crash at Startup (works on Microsoft Azure Kubernetes)?" }) }),
      /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "/blog/helmchart-introduction", children: "How to use Helm Chart to configure dynamically your Kubernetes file for beginner?" }) })
    ] })
  ] });
};
const YouTube = (props2) => {
  const title = props2.title ?? `YouTube video ${props2.youTubeId}`;
  return /* @__PURE__ */ jsx(
    "iframe",
    {
      style: {
        width: "100%",
        height: "500px",
        border: 0,
        borderRadius: "4px",
        overflow: "hidden"
      },
      src: `https://www.youtube.com/embed/${props2.youTubeId}`,
      title,
      loading: "lazy",
      allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
      children: /* @__PURE__ */ jsxs("a", { href: `https://www.youtube.com/watch?v=${props2.youTubeId}`, children: [
        "Watch ",
        title
      ] })
    }
  );
};
function isDevelopment() {
  return process.env.BLOG_ENV === "development";
}
const ROOT_POSTS_PATH = path.join(process.cwd(), "/src/_posts");
const ROOT_PHILOSOPHY_PATH = path.join(
  process.cwd(),
  "/src/_philosophy"
);
function parseFrontmatter(content) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(content);
  const rawFrontmatter = (match == null ? void 0 : match[1]) ?? "";
  const body = match === null ? content : content.slice(match[0].length);
  const parsed = {};
  const lines = rawFrontmatter.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const scalar = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(lines[i]);
    if (scalar === null) {
      continue;
    }
    const [, key, rawValue] = scalar;
    if (rawValue === "") {
      const values = [];
      while (i + 1 < lines.length && /^\s*-\s+/.test(lines[i + 1])) {
        i += 1;
        values.push(
          lines[i].replace(/^\s*-\s+/, "").trim().replace(/^["']|["']$/g, "")
        );
      }
      parsed[key] = values;
    } else {
      parsed[key] = rawValue.trim().replace(/^["']|["']$/g, "");
    }
  }
  return {
    frontmatter: {
      title: typeof parsed.title === "string" ? parsed.title : "",
      date: typeof parsed.date === "string" ? parsed.date : "",
      categories: Array.isArray(parsed.categories) ? parsed.categories : []
    },
    body
  };
}
function getAllMdxFilesWithoutContent(collectionRoot = ROOT_POSTS_PATH) {
  const files = [];
  for (let y = FIRST_YEAR; y <= LAST_YEAR; y++) {
    const filePath = path.join(collectionRoot, String(y));
    if (!fs.existsSync(filePath)) {
      continue;
    }
    const fules = fs.readdirSync(filePath).filter((p) => /\.mdx?$/.test(p));
    for (const f of fules) {
      files.push({
        year: y,
        date: y.toString(),
        fileName: f,
        fullPathWithFileName: path.join(filePath, f),
        slug: f.slice(0, f.lastIndexOf("."))
      });
    }
  }
  return files;
}
async function getMdxFileContent(fullPathWithFileName) {
  const fileContent = await fs.promises.readFile(fullPathWithFileName, "utf8");
  const { frontmatter, body } = parseFrontmatter(fileContent);
  const evaluated = await evaluate(body, {
    ...runtime,
    baseUrl: import.meta.url,
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      [rehypePrism, { ignoreMissing: true, defaultLanguage: "plaintext" }]
    ]
  });
  const Content = evaluated.default;
  const content = createElement(Content, {
    components: {
      TocAzureContainerSeries,
      CodeSandbox,
      YouTube,
      SoundCloud
    }
  });
  const fileName = extractFileFromFullFilePath(fullPathWithFileName);
  const slug = extractSlugFromFileName(fileName);
  const year = extractYearFromStringDate(frontmatter.date);
  return {
    metadata: {
      fullPathWithFileName,
      fileName,
      slug,
      year,
      date: frontmatter.date
    },
    contentReact: content,
    rawFileContent: fileContent,
    frontmatter
  };
}
async function getMdxFileMetadata(fullPathWithFileName) {
  const fileContent = await fs.promises.readFile(fullPathWithFileName, "utf8");
  const { frontmatter } = parseFrontmatter(fileContent);
  const fileName = extractFileFromFullFilePath(fullPathWithFileName);
  const slug = extractSlugFromFileName(fileName);
  const year = extractYearFromStringDate(frontmatter.date);
  return {
    metadata: {
      fullPathWithFileName,
      fileName,
      slug,
      year,
      date: frontmatter.date
    },
    rawFileContent: fileContent,
    frontmatter
  };
}
function extractFileFromFullFilePath(fullPathWithFileName) {
  return fullPathWithFileName.slice(fullPathWithFileName.lastIndexOf("/") + 1);
}
function extractSlugFromFileName(fileName) {
  return fileName.slice(0, fileName.lastIndexOf("."));
}
function extractYearFromStringDate(date) {
  return Number(date.slice(0, 4));
}
function getTotalPages(posts) {
  const allPostCount = posts.length;
  const totalPages = Math.ceil(allPostCount / MAX_POSTS_PER_PAGE);
  return totalPages;
}
async function fetchAllPostsFiltered(collectionRoot) {
  const post = [];
  const postFilePaths = getAllMdxFilesWithoutContent(collectionRoot);
  for (const p of postFilePaths) {
    post.push(getMdxFileMetadata(p.fullPathWithFileName));
  }
  const posts = await Promise.all(post);
  const today = /* @__PURE__ */ new Date();
  const blogUntil = isDevelopment() ? new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()) : today;
  blogUntil.setUTCHours(23, 59, 59, 999);
  return posts.filter((p) => new Date(p.metadata.date) <= blogUntil);
}
async function getPostBySlug(slug) {
  for (let y = LAST_YEAR; y >= FIRST_YEAR; y--) {
    for (const ext of [".mdx", ".md"]) {
      const filePath = path.join(ROOT_POSTS_PATH, String(y), `${slug}${ext}`);
      if (fs.existsSync(filePath)) {
        return await getMdxFileContent(filePath);
      }
    }
  }
  return void 0;
}
async function getPhilosophyPostBySlug(slug) {
  for (let y = LAST_YEAR; y >= FIRST_YEAR; y--) {
    for (const ext of [".mdx", ".md"]) {
      const filePath = path.join(
        ROOT_PHILOSOPHY_PATH,
        String(y),
        `${slug}${ext}`
      );
      if (fs.existsSync(filePath)) {
        return await getMdxFileContent(filePath);
      }
    }
  }
  return void 0;
}
let getAllPostsResult;
let getAllPhilosophyPostsResult;
async function getAllPosts() {
  if (getAllPostsResult === void 0) {
    getAllPostsResult = await fetchAllPostsFiltered(ROOT_POSTS_PATH);
  }
  return [...getAllPostsResult];
}
async function getAllPhilosophyPosts() {
  if (getAllPhilosophyPostsResult === void 0) {
    getAllPhilosophyPostsResult = await fetchAllPostsFiltered(ROOT_PHILOSOPHY_PATH);
  }
  return [...getAllPhilosophyPostsResult];
}
function countBlogArticles() {
  let counter = 0;
  for (let y = FIRST_YEAR; y <= LAST_YEAR; y++) {
    const filePath = `${ROOT_POSTS_PATH}/${y}`;
    if (!fs.existsSync(filePath)) {
      continue;
    }
    const fules = fs.readdirSync(filePath).filter((path2) => /\.mdx?$/.test(path2));
    counter += fules.length;
  }
  return counter;
}
const StatisticsSection = () => {
  const blogCount = countBlogArticles();
  return /* @__PURE__ */ jsx(
    "section",
    {
      id: "experiences",
      className: clsx(styles$9.sectionMainpage, styles$9.sectionVisualOne),
      children: /* @__PURE__ */ jsxs("div", { className: styles2$2.statisticContainer, children: [
        /* @__PURE__ */ jsxs("div", { className: styles2$2.statisticContainerCard, children: [
          /* @__PURE__ */ jsx("div", { className: "counterup-photo", children: /* @__PURE__ */ jsx(
            Image,
            {
              alt: "Screenshot of the book TypeScript Quick Start",
              src: "/images/counterup/1.png",
              width: 65,
              height: 65
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "counterup-content", children: [
            /* @__PURE__ */ jsx("h5", { className: "count-number", children: "13" }),
            /* @__PURE__ */ jsx("h6", { children: "Companies" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles2$2.statisticContainerCard, children: [
          /* @__PURE__ */ jsx("div", { className: "counterup-photo", children: /* @__PURE__ */ jsx(
            Image,
            {
              alt: "Screenshot of the book TypeScript Quick Start",
              src: "/images/counterup/2.png",
              width: 65,
              height: 65
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "counterup-content", children: [
            /* @__PURE__ */ jsx("h5", { className: "count-number", children: (/* @__PURE__ */ new Date()).getFullYear() - 2004 + 1 }),
            /* @__PURE__ */ jsx("h6", { children: "Years of programming" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles2$2.statisticContainerCard, children: [
          /* @__PURE__ */ jsx("div", { className: "counterup-photo", children: /* @__PURE__ */ jsx(
            Image,
            {
              alt: "Screenshot of the book TypeScript Quick Start",
              src: "/images/counterup/3.png",
              width: 65,
              height: 65
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "counterup-content", children: [
            /* @__PURE__ */ jsx("h5", { className: "count-number", children: "28" }),
            /* @__PURE__ */ jsx("h6", { children: "Projects finished" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles2$2.statisticContainerCard, children: [
          /* @__PURE__ */ jsx("div", { className: "counterup-photo", children: /* @__PURE__ */ jsx(
            Image,
            {
              alt: "Screenshot of the book TypeScript Quick Start",
              src: "/images/counterup/4.png",
              width: 65,
              height: 65
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "counterup-content", children: [
            /* @__PURE__ */ jsx("h5", { className: "count-number", children: blogCount }),
            /* @__PURE__ */ jsxs("h6", { children: [
              /* @__PURE__ */ jsx(Link, { href: "/blog", children: "Blog" }),
              "  Articles"
            ] })
          ] })
        ] })
      ] })
    }
  );
};
const cardWithImageContainer = "app_website_CardWithImage__cardWithImageContainer";
const cardWithImageContainerImage = "app_website_CardWithImage__cardWithImageContainerImage";
const cardWithImageContainerText = "app_website_CardWithImage__cardWithImageContainerText";
const styles2$1 = {
  cardWithImageContainer,
  cardWithImageContainerImage,
  cardWithImageContainerText
};
const CardWithImage = (props2) => {
  return /* @__PURE__ */ jsxs("div", { className: styles2$1.cardWithImageContainer, children: [
    /* @__PURE__ */ jsx("div", { className: styles2$1.cardWithImageContainerImage, children: /* @__PURE__ */ jsx("p", { className: styles$9.cardFixedWidthImage, children: props2.image }) }),
    /* @__PURE__ */ jsxs("div", { className: styles2$1.cardWithImageContainerText, children: [
      /* @__PURE__ */ jsx("h5", { children: props2.title }),
      /* @__PURE__ */ jsx("h6", { children: props2.subtitle }),
      /* @__PURE__ */ jsx("p", { children: props2.description })
    ] })
  ] });
};
const technologiesColumn = "app_website_TechnologiesSection__technologiesColumn";
const styles2 = {
  technologiesColumn
};
const TechnologiesSection = () => {
  const imageSize = 110;
  return /* @__PURE__ */ jsxs(
    "section",
    {
      id: "technologies",
      className: clsx(styles$9.sectionMainpage, styles$9.sectionVisualTwo),
      children: [
        /* @__PURE__ */ jsx("h2", { children: "Technologies" }),
        /* @__PURE__ */ jsxs("div", { className: styles2.technologiesColumn, children: [
          /* @__PURE__ */ jsx(
            CardWithImage,
            {
              title: "Web Framework",
              subtitle: "JavaScript, JQuery, Angular, React, Flux, Redux",
              description: "I have built a dozen of web applications and web sites with many technologies. From classic ASP, to PHP, to ASP.NET with form or MVC I have embraced many eras where Internet Explorer was king and dethroned by Firefox and now Chrome. I built websites with custom frameworks to the most popular and recent with Angular and React.",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  alt: "Screenshot of Netflix",
                  src: "/images/icon_pencil.png",
                  width: imageSize,
                  height: imageSize
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            CardWithImage,
            {
              title: "TypeScript and C#",
              subtitle: "Professional TypeScript and C# developer",
              description: "I have been writing C# for more than a decade and recently have focused mostly in TypeScript on many different scale project from few developers to almost a thousand. I love how TypeScript enhances JavaScript to be more efficient and reduce errors. I've been doing internal formation, created online classes and wrote many posts on the subject.",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  alt: "Screenshot of Netflix",
                  src: "/images/icon_star.png",
                  width: imageSize,
                  height: imageSize
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            CardWithImage,
            {
              title: "AZURE AND AWS",
              subtitle: "Develop but also deploy!",
              description: "I have many Linux VPS around the worlds but moved in the last few years on Azure. Recently I had to touch AWS as well. Not only it's easier, faster but it also encourages better practice to separate systems to be more resilient.",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  alt: "Screenshot of Netflix",
                  src: "/images/icon_cloud.png",
                  width: imageSize,
                  height: imageSize
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            CardWithImage,
            {
              title: "GraphQL",
              subtitle: "Server and Client",
              description: "I created many GraphQL servers that are leveraging backend technologies like gRPC and Protobuf to generate TypeScript automatically. A firm believer that GraphQL improves the velocity of the consumers of the information for web applications and scripts.",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  alt: "Screenshot of Netflix",
                  src: "/images/icon_rocket.png",
                  width: imageSize,
                  height: imageSize
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            CardWithImage,
            {
              title: "FLUENT IN MANY SYSTEMS",
              subtitle: "Windows or Mac, VSTS or Jira/Atlassian, it does not matter",
              description: "I have been working mostly with Microsoft technologies but have experience on other systems. I am a fast learner, and even under high pressure like at Netflix, I was able to switch from a Windows to Mac environment within a few days. I am also quick to do 180 degrees. Configuring VSTS, or Jenkins or accessing third-party API is not an issue.",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  alt: "Screenshot of Netflix",
                  src: "/images/icon_building.png",
                  width: imageSize,
                  height: imageSize
                }
              )
            }
          )
        ] })
      ]
    }
  );
};
const WorkSection = () => {
  return /* @__PURE__ */ jsxs(
    "section",
    {
      id: "work",
      className: clsx(styles$9.sectionMainpage, styles$9.sectionVisualOne),
      children: [
        /* @__PURE__ */ jsx("h2", { children: "My Work" }),
        /* @__PURE__ */ jsx("div", { className: styles$9.sectionVisualOneSubHeader, children: "An excerpt of some of my works from the last few years. See resume for full entries" }),
        /* @__PURE__ */ jsx("h3", { children: "Professional Application" }),
        /* @__PURE__ */ jsxs("div", { className: styles$9.sectionFixedWitdh, children: [
          /* @__PURE__ */ jsx(
            CardFixedWidth,
            {
              title: "Roblox",
              description: "Driving technical excellence and strategic innovation across Roblox core operations. Lead the development of high-impact internal products that empower teams and shape the future of how Roblox operate. ",
              link: "https://www.roblox.com/",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  className: styles$9.cardFixedWidthImageImg,
                  alt: "Screenshot of Roblox",
                  src: "/images/portfolio/Roblox_Tilt_Black.svg",
                  width: 350,
                  height: 350
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            CardFixedWidth,
            {
              title: "Adobe - Adobe Express",
              description: "Leading the content production engineering themes, which include smarter content experiences and scale external creator base for Adobe Express",
              link: "https://www.adobe.com/express/",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  className: styles$9.cardFixedWidthImageImg,
                  alt: "Screenshot of Adobe Express",
                  src: "/images/portfolio/adobeExpress.png",
                  width: 350,
                  height: 350
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            CardFixedWidth,
            {
              title: "Jump Trading - Order Management System",
              description: "Web application to handle US equity orders from quantitative researcher algorithms. The web application displays real-time orders to the trader. The traders manage orders using the system and can customize how to display the data using a custom-made dashboard system. The dashboard consists of widgets with customizable connections to push information from one to another for highly unique visualization tailored to each trader.",
              link: "https://www.jumptrading.com/",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  className: styles$9.cardFixedWidthImageImg,
                  alt: "Screenshot of Jump Trading",
                  src: "/images/portfolio/jumpTrading.png",
                  width: 350,
                  height: 350
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            CardFixedWidth,
            {
              title: "Netflix - Partner Portal",
              description: "Open Connect ISP partners with embedded Open Connect Appliances\n      (OCAs) can use the Open Connect Partner Portal to do some basic\n      monitoring of the appliances in their network and some other\n      administrative tasks. Created and responsible for the whole\n      portal.",
              link: "https://openconnect.netflix.com/en/partner-portal/",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  className: styles$9.cardFixedWidthImageImg,
                  alt: "Screenshot of Netflix",
                  src: "/images/portfolio/netflix.jpg",
                  width: 350,
                  height: 350
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            CardFixedWidth,
            {
              title: "Microsoft - Teams Web App",
              description: "Developed in Microsoft Teams web application pre-release and\n      post-release version 1. Responsible for the notifications and\n      feeds.",
              link: "https://teams.microsoft.com/",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  className: styles$9.cardFixedWidthImageImg,
                  alt: "Screenshot of Microsoft Teams",
                  src: "/images/portfolio/microsoftteam.jpg",
                  width: 350,
                  height: 350
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            CardFixedWidth,
            {
              title: "Microsoft - VSTS Delivery Timeline",
              description: "Leader for the front-end of the page named Delivery Timeline\n      Plan which was the first page built entirely in React and Flux.\n      Heavily optimized to support thousand of complex components with\n      virtual scrolling and lazy loading.",
              link: "https://marketplace.visualstudio.com/items?itemName=ms.vss-plans",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  className: styles$9.cardFixedWidthImageImg,
                  alt: "Screenshot of Microsoft Visual Studio Delivery Timeline",
                  src: "/images/portfolio/vstsplan.jpg",
                  width: 350,
                  height: 350
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            CardFixedWidth,
            {
              title: "Microsoft - VSTS Dashboard",
              description: "Main developer on the rebuilt of VSTS Dashboard. Responsible to\n      create to implement the grid system, the concept of the edit\n      mode, the blade menu for configurations and catalog of widgets.\n      Worked on the third-party SDK as well as creating few widgets.",
              link: "https://www.visualstudio.com/en-us/docs/report/dashboards",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  className: styles$9.cardFixedWidthImageImg,
                  alt: "Screenshot of Microsoft Visual Studio Dashboard",
                  src: "/images/portfolio/vstsdashboard.jpg",
                  width: 350,
                  height: 350
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            CardFixedWidth,
            {
              title: "Microsoft - MSDN",
              description: "Part of the team that maintened MSDN.com. Participated to the\n        recast of the editing system to be more open for external\n        contributions.",
              link: "https://msdn.microsoft.com/en-us",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  className: styles$9.cardFixedWidthImageImg,
                  alt: "Screenshot of Microsoft VSTS Dashboard",
                  src: "/images/portfolio/msdn.jpg",
                  width: 350,
                  height: 350
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            CardFixedWidth,
            {
              title: "CDPQ - CMG",
              description: "Developing the whole application architecture, acting as a team leader for the team and coding critical part of the software. Private web application to handle the management of financial assets.",
              link: "https://www.cdpq.com/en/home",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  className: styles$9.cardFixedWidthImageImg,
                  alt: "Screenshot of CDPQ",
                  src: "/images/portfolio/cdpq.jpg",
                  width: 350,
                  height: 350
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            CardFixedWidth,
            {
              title: "CDPQ - DRT",
              description: "Took the lead of an existing project by modernizing the user experience with drag and drop features and remove the dry CRUD website experience into a rich web application. Private web application to handle data, risks and transactions of billion of dollards.",
              link: "https://www.cdpq.com/en/home",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  className: styles$9.cardFixedWidthImageImg,
                  alt: "Screenshot of CDPQ",
                  src: "/images/portfolio/cdpq.jpg",
                  width: 350,
                  height: 350
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            CardFixedWidth,
            {
              title: "CDPQ - RDP",
              description: "Advisor to guide the team with best practices for web and testings. Performance improvements and usability improvements of the existing system.",
              link: "https://www.cdpq.com/en/home",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  className: styles$9.cardFixedWidthImageImg,
                  alt: "Screenshot of CDPQ",
                  src: "/images/portfolio/cdpq.jpg",
                  width: 350,
                  height: 350
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            CardFixedWidth,
            {
              title: "Dynacom - Nutcache",
              description: "I had the role of a Web expert for a team constituted of 6 developers for the whole 8 months. It was their first web project and I had to guide them for best practices for the architecture of the software but also with the use of Asp.Net MVC. I was the first resource for everything concerning Javascript and CSS",
              link: "https://www.nutcache.com/",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  className: styles$9.cardFixedWidthImageImg,
                  alt: "Screenshot of Nutcache",
                  src: "/images/portfolio/nutcache.jpg",
                  width: 350,
                  height: 350
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            CardFixedWidth,
            {
              title: "Tenrox (Upland) - Timesheet.com",
              description: "Working in many areas of the existing systems to improve features. Worked mainly in the visual graph that allowed to configure the flow of work.",
              link: "https://timesheet.com/",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  className: styles$9.cardFixedWidthImageImg,
                  alt: "Screenshot of Tenrox TimeSheet",
                  src: "/images/portfolio/tenrox.jpg",
                  width: 350,
                  height: 350
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            CardFixedWidth,
            {
              title: "StockVirtual.Com",
              description: "Owner of StockVirtual.com which is a Asp.Net MVC, Entity Framework, Redis website hosted on Azure that has above 65 000 users that trade stocks in a safe virtualized environment. Thousands of unit tests, Application Insight for telemetry, Stride for transactions and SendGrid for email.",
              link: "https://stockvirtual.com/",
              image: /* @__PURE__ */ jsx(
                Image,
                {
                  className: styles$9.cardFixedWidthImageImg,
                  alt: "Screenshot of StockVirtual.com",
                  src: "/images/portfolio/stockvirtual.jpg",
                  width: 350,
                  height: 350
                }
              )
            }
          )
        ] })
      ]
    }
  );
};
const metadata$2 = {
  title: "Patrick Desjardins Website and Blog",
  description: "Patrick Desjardins Website and Blog"
};
function Index() {
  return /* @__PURE__ */ jsx("div", { className: styles$b.container, children: /* @__PURE__ */ jsxs("main", { children: [
    /* @__PURE__ */ jsx("header", { className: styles$b.topMenu, children: /* @__PURE__ */ jsxs("nav", { className: styles$b.topHeader, "aria-label": "Primary", children: [
      /* @__PURE__ */ jsx(Link, { className: styles$b.topHeaderMyName, href: "/", children: "Patrick Desjardins" }),
      /* @__PURE__ */ jsx("a", { href: "#about-me", className: styles$b.topHeaderAnchorLink, children: "About Me" }),
      /* @__PURE__ */ jsx("a", { href: "#work", className: styles$b.topHeaderAnchorLink, children: "Works" }),
      /* @__PURE__ */ jsx("a", { href: "#technologies", className: styles$b.topHeaderAnchorLink, children: "Technologies" }),
      /* @__PURE__ */ jsx("a", { href: "#achievements", className: styles$b.topHeaderAnchorLink, children: "Achievements" }),
      /* @__PURE__ */ jsx("a", { href: "#experiences", className: styles$b.topHeaderAnchorLink, children: "Experiences" }),
      /* @__PURE__ */ jsx("a", { href: "#past", className: styles$b.topHeaderAnchorLink, children: "Past" }),
      /* @__PURE__ */ jsx("a", { href: "#conferences", className: styles$b.topHeaderAnchorLink, children: "Conferences" }),
      /* @__PURE__ */ jsx("a", { href: "#contact", className: styles$b.topHeaderAnchorLink, children: "Contact" }),
      /* @__PURE__ */ jsx(Link, { href: "/blog", className: styles$b.topHeaderBlog, children: "Blog" }),
      /* @__PURE__ */ jsx(Link, { href: "/philosophy", className: styles$b.topHeaderBlog, children: "Philosophy" })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: styles$b.wrapper, children: [
      /* @__PURE__ */ jsx("div", { className: styles$b.textOnPicture, children: /* @__PURE__ */ jsxs("div", { className: styles$b.homeContent, children: [
        /* @__PURE__ */ jsxs("h1", { children: [
          "Patrick",
          /* @__PURE__ */ jsx("strong", { children: "Desjardins" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: styles$b.homeContentTitles, children: [
          "Roblox Principal Software Engineer",
          /* @__PURE__ */ jsx("br", {}),
          "Formerly Netflix/Jump Trading/Microsoft/Adobe"
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: styles$b.imageWrapper, children: /* @__PURE__ */ jsx(
        Image,
        {
          priority: true,
          className: styles$b.topPicture,
          alt: "Patrick Desjardins sitting at Netflix Building F",
          src: "/images/backgrounds/patrickdesjardinsatnetflix.jpg",
          fill: true,
          style: {
            objectFit: "cover"
          }
        }
      ) }),
      /* @__PURE__ */ jsx(NeonGlowOverlay, {})
    ] }),
    /* @__PURE__ */ jsx(AboutMeSection, {}),
    /* @__PURE__ */ jsx(WorkSection, {}),
    /* @__PURE__ */ jsx(BookSection, {}),
    /* @__PURE__ */ jsx(OpenSourceSection, {}),
    /* @__PURE__ */ jsx(TechnologiesSection, {}),
    /* @__PURE__ */ jsx(CourseSection, {}),
    /* @__PURE__ */ jsx(AchievementsSection, {}),
    /* @__PURE__ */ jsx(StatisticsSection, {}),
    /* @__PURE__ */ jsx(EducationSection, {}),
    /* @__PURE__ */ jsx(HistorySection, {}),
    /* @__PURE__ */ jsx(ConferencesSection, {}),
    /* @__PURE__ */ jsx(PhilosophySection, {}),
    /* @__PURE__ */ jsx(ContactSection, {})
  ] }) });
}
const blogEntry$1 = "app_blog__components_BlogEntry__blogEntry";
const blogEntryArticleTitle$1 = "app_blog__components_BlogEntry__blogEntryArticleTitle";
const blogEntryDate$1 = "app_blog__components_BlogEntry__blogEntryDate";
const blogEntryDetails$1 = "app_blog__components_BlogEntry__blogEntryDetails";
const styles$7 = {
  blogEntry: blogEntry$1,
  blogEntryArticleTitle: blogEntryArticleTitle$1,
  blogEntryDate: blogEntryDate$1,
  blogEntryDetails: blogEntryDetails$1
};
const container = "app_blog__components_BlogCategories__container";
const item = "app_blog__components_BlogCategories__item";
const styles$6 = {
  container,
  item
};
const BlogCategories = (props2) => {
  var _a;
  return /* @__PURE__ */ jsx("span", { className: styles$6.container, children: (_a = props2.categories ?? []) == null ? void 0 : _a.map((c) => /* @__PURE__ */ jsx("span", { className: styles$6.item, children: c }, c)) });
};
const BlogEntry = (props2) => {
  return /* @__PURE__ */ jsxs("article", { className: styles$7.blogEntry, children: [
    /* @__PURE__ */ jsx("h2", { className: styles$7.blogEntryArticleTitle, children: /* @__PURE__ */ jsx(Link, { href: `/blog/${props2.slug}`, children: props2.title }) }),
    /* @__PURE__ */ jsxs("div", { className: styles$7.blogEntryDetails, children: [
      /* @__PURE__ */ jsxs("span", { className: styles$7.blogEntryDate, children: [
        "Posted: ",
        props2.date
      ] }),
      /* @__PURE__ */ jsx(BlogCategories, { categories: props2.categories })
    ] })
  ] });
};
const BlogBody$1 = "app_blog__components_BlogBody__BlogBody";
const main$1 = "app_blog__components_BlogBody__main";
const heading$1 = "app_blog__components_BlogBody__heading";
const siteTitle$1 = "app_blog__components_BlogBody__siteTitle";
const navLinks$1 = "app_blog__components_BlogBody__navLinks";
const navLinkItem$1 = "app_blog__components_BlogBody__navLinkItem";
const navLinkText$1 = "app_blog__components_BlogBody__navLinkText";
const blogTopPicture = "app_blog__components_BlogBody__blogTopPicture";
const paginationBar$1 = "app_blog__components_BlogBody__paginationBar";
const paginationTitle$1 = "app_blog__components_BlogBody__paginationTitle";
const currentLink$1 = "app_blog__components_BlogBody__currentLink";
const paginationLinks$1 = "app_blog__components_BlogBody__paginationLinks";
const blogPictureContainer = "app_blog__components_BlogBody__blogPictureContainer";
const totalBlogPost = "app_blog__components_BlogBody__totalBlogPost";
const styles$5 = {
  BlogBody: BlogBody$1,
  main: main$1,
  heading: heading$1,
  siteTitle: siteTitle$1,
  navLinks: navLinks$1,
  navLinkItem: navLinkItem$1,
  navLinkText: navLinkText$1,
  blogTopPicture,
  paginationBar: paginationBar$1,
  paginationTitle: paginationTitle$1,
  currentLink: currentLink$1,
  paginationLinks: paginationLinks$1,
  blogPictureContainer,
  totalBlogPost
};
function BlogBody(props2) {
  const years = [];
  for (let i = LAST_YEAR; i >= FIRST_YEAR; i--) {
    years.push(i);
  }
  const pages = [];
  if (props2.totalPages !== void 0 && props2.totalPages > 0) {
    for (let i = 1; i <= props2.totalPages; i++) {
      pages.push(i);
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: styles$5.BlogBody, children: [
    /* @__PURE__ */ jsxs("header", { children: [
      /* @__PURE__ */ jsx("h1", { className: styles$5.siteTitle, children: "Patrick Desjardins Blog" }),
      /* @__PURE__ */ jsx("nav", { "aria-label": "Blog", children: /* @__PURE__ */ jsxs("ul", { className: styles$5.navLinks, children: [
        /* @__PURE__ */ jsx("li", { className: styles$5.navLinkItem, children: /* @__PURE__ */ jsx(Link, { className: styles$5.navLinkText, href: "/", children: "Main Page" }) }),
        /* @__PURE__ */ jsx("li", { className: styles$5.navLinkItem, children: /* @__PURE__ */ jsx(Link, { className: styles$5.navLinkText, href: "/blog", children: "Blog" }) }),
        /* @__PURE__ */ jsx("li", { className: styles$5.navLinkItem, children: /* @__PURE__ */ jsx(Link, { className: styles$5.navLinkText, href: "/blog/search", children: "Search" }) }),
        /* @__PURE__ */ jsx("li", { className: styles$5.navLinkItem, children: /* @__PURE__ */ jsx(Link, { className: styles$5.navLinkText, href: "/philosophy", children: "Philosophy" }) }),
        years.map((y) => {
          return /* @__PURE__ */ jsx("li", { className: styles$5.navLinkItem, children: /* @__PURE__ */ jsx(
            Link,
            {
              className: clsx({
                [styles$5.navLinkText]: true,
                [styles$5.currentLink]: y === props2.year
              }),
              href: `/blog/for/${y}`,
              children: y
            }
          ) }, y);
        })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: styles$5.blogPictureContainer, children: /* @__PURE__ */ jsx(
        Image,
        {
          className: styles$5.blogTopPicture,
          alt: "Patrick Desjardins picture from a conference",
          src: "/images/backgrounds/patrickdesjardins_conference_bw.webp",
          width: 800,
          height: 260
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs("main", { className: styles$5.main, children: [
      /* @__PURE__ */ jsx("h2", { className: styles$5.heading, children: props2.topTitle }),
      props2.children
    ] }),
    pages.length > 0 || props2.totalBlogPost !== void 0 ? /* @__PURE__ */ jsxs("footer", { children: [
      pages.length > 0 ? /* @__PURE__ */ jsxs("div", { className: styles$5.paginationBar, children: [
        /* @__PURE__ */ jsx("div", { className: styles$5.paginationTitle, children: "Chronological Blog Articles by Page" }),
        /* @__PURE__ */ jsx("div", { className: styles$5.paginationLinks, children: pages.map((page) => {
          return /* @__PURE__ */ jsx(
            Link,
            {
              className: clsx({
                [styles$5.currentLink]: page === props2.currentPage
              }),
              href: `/blog/page/${page}`,
              children: page
            },
            page
          );
        }) })
      ] }) : null,
      props2.totalBlogPost === void 0 ? null : /* @__PURE__ */ jsxs("div", { className: styles$5.totalBlogPost, children: [
        "Total Blog Posts: ",
        props2.totalBlogPost
      ] })
    ] }) : null
  ] });
}
function sortByMetadataDateDesc(a, b) {
  return new Date(a.metadata.date) > new Date(b.metadata.date) ? -1 : 1;
}
const metadata$1 = {
  title: "Patrick Desjardins Blog",
  description: "Patrick Desjardins Blog"
};
async function Page$9() {
  const pageNumber = 1;
  const posts = await getAllPosts();
  const totalPage = getTotalPages(posts);
  posts.sort(sortByMetadataDateDesc);
  const pagePost = posts.slice(
    (pageNumber - 1) * MAX_POSTS_PER_PAGE,
    pageNumber * MAX_POSTS_PER_PAGE
  );
  const computedBlogProps = {
    pageNumber,
    totalPages: totalPage
  };
  const totalBlogPost2 = posts.length;
  return /* @__PURE__ */ jsx(
    BlogBody,
    {
      currentPage: Number(computedBlogProps.pageNumber),
      totalPages: computedBlogProps.totalPages,
      topTitle: "Blog Posts",
      totalBlogPost: totalBlogPost2,
      children: pagePost.map((node) => /* @__PURE__ */ jsx(
        BlogEntry,
        {
          id: node.metadata.fileName,
          slug: node.metadata.slug,
          title: node.frontmatter.title,
          date: node.frontmatter.date,
          categories: node.frontmatter.categories
        },
        node.metadata.fileName
      ))
    }
  );
}
function Page$8() {
  return /* @__PURE__ */ jsx("div", { id: "blog-search-root" });
}
const blogPostContainer$1 = "app_blog__slug__Page__blogPostContainer";
const blogPostDate$1 = "app_blog__slug__Page__blogPostDate";
const styles$4 = {
  blogPostContainer: blogPostContainer$1,
  blogPostDate: blogPostDate$1
};
async function generateMetadata$5(props2) {
  const post = await getPostBySlug(props2.params.slug);
  if (post === void 0) {
    throw new Error("Post not found");
  }
  return {
    title: "Patrick Desjardins Blog - " + post.frontmatter.title,
    description: post.frontmatter.title
  };
}
async function Page$7(props2) {
  const posts = await getAllPosts();
  const totalPages = getTotalPages(posts);
  const post = await getPostBySlug(props2.params.slug);
  if (post === void 0) {
    throw new Error("Post not found");
  }
  return /* @__PURE__ */ jsx(
    BlogBody,
    {
      totalPages,
      topTitle: post.frontmatter.title,
      children: /* @__PURE__ */ jsxs("div", { className: styles$4.blogPostContainer, children: [
        /* @__PURE__ */ jsxs("p", { className: styles$4.blogPostDate, children: [
          "Posted on: ",
          post.frontmatter.date
        ] }),
        post.contentReact
      ] })
    }
  );
}
async function generateMetadata$4(props2) {
  return {
    title: "Patrick Desjardins Blog - Year " + String(props2.params.year),
    description: "Patrick Desjardins Blog - Year " + String(props2.params.year)
  };
}
async function Page$6(props2) {
  const year = Number(props2.params.year);
  const posts = await getAllPosts();
  const totalPages = getTotalPages(posts);
  const postForYear = posts.filter((file) => file.metadata.year === year).sort(sortByMetadataDateDesc);
  return /* @__PURE__ */ jsx(BlogBody, { totalPages, year, topTitle: "Blog Posts", children: postForYear.map((node) => /* @__PURE__ */ jsx(
    BlogEntry,
    {
      id: node.metadata.fileName,
      slug: node.metadata.slug,
      title: node.frontmatter.title,
      date: node.frontmatter.date,
      categories: node.frontmatter.categories
    },
    node.metadata.fileName
  )) });
}
async function generateMetadata$3(props2) {
  return {
    title: "Patrick Desjardins Blog - Page number " + String(props2.params.pageNumber),
    description: "Patrick Desjardins Blog - Page number " + String(props2.params.pageNumber)
  };
}
async function Page$5(props2) {
  const posts = await getAllPosts();
  posts.sort(sortByMetadataDateDesc);
  const currentPage = Number(props2.params.pageNumber);
  const result = posts.slice(
    (currentPage - 1) * MAX_POSTS_PER_PAGE,
    currentPage * MAX_POSTS_PER_PAGE
  );
  const totalPagesCount = getTotalPages(posts);
  return /* @__PURE__ */ jsx(
    BlogBody,
    {
      currentPage,
      totalPages: totalPagesCount,
      topTitle: "Blog Posts",
      children: result.map((node) => /* @__PURE__ */ jsx(
        BlogEntry,
        {
          id: node.metadata.fileName,
          slug: node.metadata.slug,
          title: node.frontmatter.title,
          date: node.frontmatter.date,
          categories: node.frontmatter.categories
        },
        node.metadata.fileName
      ))
    }
  );
}
const blogEntry = "app_philosophy__components_PhilosophyEntry__blogEntry";
const blogEntryArticleTitle = "app_philosophy__components_PhilosophyEntry__blogEntryArticleTitle";
const blogEntryDetails = "app_philosophy__components_PhilosophyEntry__blogEntryDetails";
const blogEntryDate = "app_philosophy__components_PhilosophyEntry__blogEntryDate";
const styles$3 = {
  blogEntry,
  blogEntryArticleTitle,
  blogEntryDetails,
  blogEntryDate
};
const PhilosophyEntry = (props2) => {
  return /* @__PURE__ */ jsxs("article", { className: styles$3.blogEntry, children: [
    /* @__PURE__ */ jsx("h2", { className: styles$3.blogEntryArticleTitle, children: /* @__PURE__ */ jsx(Link, { href: `/philosophy/${props2.slug}`, children: props2.title }) }),
    /* @__PURE__ */ jsxs("div", { className: styles$3.blogEntryDetails, children: [
      /* @__PURE__ */ jsxs("span", { className: styles$3.blogEntryDate, children: [
        "Posted: ",
        props2.date
      ] }),
      /* @__PURE__ */ jsx(BlogCategories, { categories: props2.categories })
    ] })
  ] });
};
const blogBodyShell = "app_philosophy__components_PhilosophyBlogBody__blogBodyShell";
const main = "app_philosophy__components_PhilosophyBlogBody__main";
const siteTitle = "app_philosophy__components_PhilosophyBlogBody__siteTitle";
const siteSubtitle = "app_philosophy__components_PhilosophyBlogBody__siteSubtitle";
const paperEdge = "app_philosophy__components_PhilosophyBlogBody__paperEdge";
const navLinks = "app_philosophy__components_PhilosophyBlogBody__navLinks";
const navLinkItem = "app_philosophy__components_PhilosophyBlogBody__navLinkItem";
const navLinkText = "app_philosophy__components_PhilosophyBlogBody__navLinkText";
const currentLink = "app_philosophy__components_PhilosophyBlogBody__currentLink";
const heading = "app_philosophy__components_PhilosophyBlogBody__heading";
const paginationBar = "app_philosophy__components_PhilosophyBlogBody__paginationBar";
const paginationTitle = "app_philosophy__components_PhilosophyBlogBody__paginationTitle";
const paginationLinks = "app_philosophy__components_PhilosophyBlogBody__paginationLinks";
const totalPosts = "app_philosophy__components_PhilosophyBlogBody__totalPosts";
const styles$2 = {
  blogBodyShell,
  main,
  siteTitle,
  siteSubtitle,
  paperEdge,
  navLinks,
  navLinkItem,
  navLinkText,
  currentLink,
  heading,
  paginationBar,
  paginationTitle,
  paginationLinks,
  totalPosts
};
function PhilosophyBlogBody(props2) {
  const years = [];
  for (let i = LAST_YEAR; i >= PHILOSOPHY_FIRST_YEAR; i--) {
    years.push(i);
  }
  const pages = [];
  if (props2.totalPages !== void 0 && props2.totalPages > 0) {
    for (let i = 1; i <= props2.totalPages; i++) {
      pages.push(i);
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: styles$2.blogBodyShell, children: [
    /* @__PURE__ */ jsxs("header", { children: [
      /* @__PURE__ */ jsx("h1", { className: styles$2.siteTitle, children: "Philosophy" }),
      /* @__PURE__ */ jsx("p", { className: styles$2.siteSubtitle, children: "Patrick Desjardins — essays and notes" }),
      /* @__PURE__ */ jsx("div", { className: styles$2.paperEdge, children: /* @__PURE__ */ jsx("nav", { "aria-label": "Philosophy", children: /* @__PURE__ */ jsxs("ul", { className: styles$2.navLinks, children: [
        /* @__PURE__ */ jsx("li", { className: styles$2.navLinkItem, children: /* @__PURE__ */ jsx(Link, { className: styles$2.navLinkText, href: "/", children: "Main Page" }) }),
        /* @__PURE__ */ jsx("li", { className: styles$2.navLinkItem, children: /* @__PURE__ */ jsx(Link, { className: styles$2.navLinkText, href: "/blog", children: "Technical Blog" }) }),
        /* @__PURE__ */ jsx("li", { className: styles$2.navLinkItem, children: /* @__PURE__ */ jsx(Link, { className: styles$2.navLinkText, href: "/philosophy", children: "Philosophy" }) }),
        /* @__PURE__ */ jsx("li", { className: styles$2.navLinkItem, children: /* @__PURE__ */ jsx(Link, { className: styles$2.navLinkText, href: "/philosophy/search", children: "Search" }) }),
        years.map((y) => /* @__PURE__ */ jsx("li", { className: styles$2.navLinkItem, children: /* @__PURE__ */ jsx(
          Link,
          {
            className: clsx(styles$2.navLinkText, {
              [styles$2.currentLink]: y === props2.year
            }),
            href: `/philosophy/for/${y}`,
            children: y
          }
        ) }, y))
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxs("main", { className: styles$2.main, children: [
      /* @__PURE__ */ jsx("h2", { className: styles$2.heading, children: props2.topTitle }),
      props2.children
    ] }),
    pages.length > 0 || props2.totalBlogPost !== void 0 ? /* @__PURE__ */ jsxs("footer", { children: [
      pages.length > 0 ? /* @__PURE__ */ jsxs("div", { className: styles$2.paginationBar, children: [
        /* @__PURE__ */ jsx("div", { className: styles$2.paginationTitle, children: "Essays by page" }),
        /* @__PURE__ */ jsx("div", { className: styles$2.paginationLinks, children: pages.map((page) => /* @__PURE__ */ jsx(
          Link,
          {
            className: clsx({
              [styles$2.currentLink]: page === props2.currentPage
            }),
            href: `/philosophy/page/${page}`,
            children: page
          },
          page
        )) })
      ] }) : null,
      props2.totalBlogPost === void 0 ? null : /* @__PURE__ */ jsxs("div", { className: styles$2.totalPosts, children: [
        "Total essays: ",
        props2.totalBlogPost
      ] })
    ] }) : null
  ] });
}
const metadata = {
  title: "Philosophy — Patrick Desjardins",
  description: "Essays and notes on philosophy by Patrick Desjardins."
};
async function Page$4() {
  const pageNumber = 1;
  const posts = await getAllPhilosophyPosts();
  const totalPage = getTotalPages(posts);
  posts.sort(sortByMetadataDateDesc);
  const pagePost = posts.slice(
    (pageNumber - 1) * MAX_POSTS_PER_PAGE,
    pageNumber * MAX_POSTS_PER_PAGE
  );
  const totalCount = posts.length;
  return /* @__PURE__ */ jsx(
    PhilosophyBlogBody,
    {
      currentPage: pageNumber,
      totalPages: totalPage,
      topTitle: "Essays",
      totalBlogPost: totalCount,
      children: pagePost.map((node) => /* @__PURE__ */ jsx(
        PhilosophyEntry,
        {
          id: node.metadata.fileName,
          slug: node.metadata.slug,
          title: node.frontmatter.title,
          date: node.frontmatter.date,
          categories: node.frontmatter.categories
        },
        node.metadata.fileName
      ))
    }
  );
}
const philosophyRoot = "app_philosophy_layout__philosophyRoot";
const styles$1 = {
  philosophyRoot
};
function PhilosophyLayout({
  children
}) {
  return /* @__PURE__ */ jsx("div", { className: styles$1.philosophyRoot, children });
}
function Page$3() {
  return /* @__PURE__ */ jsx("div", { id: "philosophy-search-root" });
}
const blogPostContainer = "app_philosophy__slug__Page__blogPostContainer";
const blogPostContent = "app_philosophy__slug__Page__blogPostContent";
const blogPostDate = "app_philosophy__slug__Page__blogPostDate";
const styles = {
  blogPostContainer,
  blogPostContent,
  blogPostDate
};
const EMPTY_PHILOSOPHY_SLUG = "__no-published-essays";
async function generateMetadata$2(props2) {
  if (props2.params.slug === EMPTY_PHILOSOPHY_SLUG) {
    return {
      title: "Philosophy — Patrick Desjardins",
      description: "Essays and notes on philosophy by Patrick Desjardins."
    };
  }
  const post = await getPhilosophyPostBySlug(props2.params.slug);
  if (post === void 0) {
    throw new Error("Philosophy post not found");
  }
  return {
    title: "Philosophy — " + post.frontmatter.title,
    description: post.frontmatter.title
  };
}
async function Page$2(props2) {
  const posts = await getAllPhilosophyPosts();
  const totalPages = getTotalPages(posts);
  const post = await getPhilosophyPostBySlug(props2.params.slug);
  if (post === void 0 && props2.params.slug === EMPTY_PHILOSOPHY_SLUG) {
    return /* @__PURE__ */ jsx(PhilosophyBlogBody, { totalPages, topTitle: "Essays", children: /* @__PURE__ */ jsx("div", { className: styles.blogPostContainer, children: /* @__PURE__ */ jsx("p", { className: styles.blogPostDate, children: "No philosophy essays are published yet." }) }) });
  }
  if (post === void 0) {
    throw new Error("Philosophy post not found");
  }
  return /* @__PURE__ */ jsx(PhilosophyBlogBody, { totalPages, topTitle: post.frontmatter.title, children: /* @__PURE__ */ jsxs("div", { className: styles.blogPostContainer, children: [
    /* @__PURE__ */ jsxs("p", { className: styles.blogPostDate, children: [
      "Posted on: ",
      post.frontmatter.date
    ] }),
    /* @__PURE__ */ jsx("div", { className: styles.blogPostContent, children: post.contentReact })
  ] }) });
}
async function generateMetadata$1(props2) {
  return {
    title: "Philosophy — " + String(props2.params.year),
    description: "Philosophy essays from " + String(props2.params.year) + " — Patrick Desjardins"
  };
}
async function Page$1(props2) {
  const year = Number(props2.params.year);
  const posts = await getAllPhilosophyPosts();
  const totalPages = getTotalPages(posts);
  const postForYear = posts.filter((file) => file.metadata.year === year).sort(sortByMetadataDateDesc);
  return /* @__PURE__ */ jsx(PhilosophyBlogBody, { totalPages, year, topTitle: "Essays", children: postForYear.map((node) => /* @__PURE__ */ jsx(
    PhilosophyEntry,
    {
      id: node.metadata.fileName,
      slug: node.metadata.slug,
      title: node.frontmatter.title,
      date: node.frontmatter.date,
      categories: node.frontmatter.categories
    },
    node.metadata.fileName
  )) });
}
async function generateMetadata(props2) {
  return {
    title: "Philosophy — page " + String(props2.params.pageNumber),
    description: "Philosophy essays by Patrick Desjardins — page " + String(props2.params.pageNumber)
  };
}
async function Page(props2) {
  const posts = await getAllPhilosophyPosts();
  posts.sort(sortByMetadataDateDesc);
  const currentPage = Number(props2.params.pageNumber);
  const result = posts.slice(
    (currentPage - 1) * MAX_POSTS_PER_PAGE,
    currentPage * MAX_POSTS_PER_PAGE
  );
  const totalPagesCount = getTotalPages(posts);
  return /* @__PURE__ */ jsx(
    PhilosophyBlogBody,
    {
      currentPage,
      totalPages: totalPagesCount,
      topTitle: "Essays",
      children: result.map((node) => /* @__PURE__ */ jsx(
        PhilosophyEntry,
        {
          id: node.metadata.fileName,
          slug: node.metadata.slug,
          title: node.frontmatter.title,
          date: node.frontmatter.date,
          categories: node.frontmatter.categories
        },
        node.metadata.fileName
      ))
    }
  );
}
function NotFound() {
  return /* @__PURE__ */ jsx(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh"
      },
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          style: {
            width: "50%",
            height: "20%",
            backgroundColor: "#ffeded",
            borderRadius: 12,
            padding: 12,
            textAlign: "center"
          },
          children: [
            /* @__PURE__ */ jsx("h1", { children: "Not Found" }),
            /* @__PURE__ */ jsx("p", { children: "Could not find requested resource" }),
            /* @__PURE__ */ jsx(Link, { href: "/", children: "Return Home" })
          ]
        }
      )
    }
  );
}
function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/"
    },
    sitemap: "https://patrickdesjardins.com/sitemap.xml"
  };
}
const BASE_URL$1 = "https://patrickdesjardins.com";
async function sitemap() {
  const [posts, philosophyPosts] = await Promise.all([
    getAllPosts(),
    getAllPhilosophyPosts()
  ]);
  const postEntries = posts.map((post) => ({
    url: `${BASE_URL$1}/blog/${post.metadata.slug}`,
    lastModified: new Date(post.metadata.date),
    changeFrequency: "monthly",
    priority: 0.7
  }));
  const philosophyEntries = philosophyPosts.map(
    (post) => ({
      url: `${BASE_URL$1}/philosophy/${post.metadata.slug}`,
      lastModified: new Date(post.metadata.date),
      changeFrequency: "monthly",
      priority: 0.65
    })
  );
  return [
    {
      url: BASE_URL$1,
      lastModified: /* @__PURE__ */ new Date(),
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: `${BASE_URL$1}/blog`,
      lastModified: /* @__PURE__ */ new Date(),
      changeFrequency: "daily",
      priority: 0.9
    },
    {
      url: `${BASE_URL$1}/philosophy`,
      lastModified: /* @__PURE__ */ new Date(),
      changeFrequency: "weekly",
      priority: 0.85
    },
    {
      url: `${BASE_URL$1}/philosophy/search`,
      lastModified: /* @__PURE__ */ new Date(),
      changeFrequency: "monthly",
      priority: 0.5
    },
    ...postEntries,
    ...philosophyEntries
  ];
}
const BASE_URL = "https://patrickdesjardins.com";
function withBlogLayout(children) {
  return /* @__PURE__ */ jsx(RootLayout, { children });
}
function withPhilosophyLayout(children) {
  return /* @__PURE__ */ jsx(PhilosophyLayout, { children });
}
function escapeHtml(value2) {
  return value2.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function pageTitle(metadata2) {
  const title = metadata2 == null ? void 0 : metadata2.title;
  return typeof title === "string" && title.length > 0 ? title : String(metadata$3.title);
}
function pageDescription(metadata2) {
  const description = metadata2 == null ? void 0 : metadata2.description;
  return typeof description === "string" && description.length > 0 ? description : String(metadata$3.description);
}
function gaScript() {
  const gaMeasurementId2 = "";
  if (gaMeasurementId2.length === 0) {
    return "";
  }
  const id = escapeHtml(gaMeasurementId2);
  return `<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"><\/script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config","${id}");<\/script>`;
}
function renderDocument(body, metadata2, assets) {
  const app = renderToStaticMarkup(/* @__PURE__ */ jsx(RootLayout$1, { children: body }));
  const css = assets.css.map((href) => `<link rel="stylesheet" href="${escapeHtml(href)}">`).join("");
  const js = assets.js.map((src) => `<script type="module" src="${escapeHtml(src)}"><\/script>`).join("");
  const head = [
    `<meta charset="utf-8">`,
    `<meta name="viewport" content="width=device-width, initial-scale=1">`,
    `<title>${escapeHtml(pageTitle(metadata2))}</title>`,
    `<meta name="description" content="${escapeHtml(pageDescription(metadata2))}">`,
    css,
    gaScript()
  ].join("");
  const withHead = app.replace(/(<html[^>]*>)/, `$1<head>${head}</head>`);
  return `<!doctype html>${withHead.replace("</body>", `${js}</body>`)}`;
}
function routeFilePath(routePath) {
  if (routePath === "/") {
    return "index.html";
  }
  return `${routePath.replace(/^\//, "")}.html`;
}
function postDependency(post) {
  return post.metadata.fullPathWithFileName;
}
function collectionDependencies(posts) {
  return posts.map(postDependency);
}
function sharedDependencies() {
  return [
    "src/app",
    "src/site",
    "src/constants",
    "src/lib",
    "src/_utils",
    "scripts/build-site.mjs",
    "scripts/render-site.mjs",
    "tools/sitegen/Cargo.toml",
    "tools/sitegen/Cargo.lock",
    "tools/sitegen/src",
    "_headers",
    "public/output",
    "public/philosophy-output",
    "vite.config.ts",
    "package.json"
  ];
}
function props(params) {
  return { params, searchParams: {} };
}
const value = (input) => () => input;
async function renderRouteDocument(renderPage, metadata2, assets) {
  return renderDocument(await renderPage(), await metadata2(), assets);
}
async function renderPath(routePath, assets) {
  if (routePath === "/") {
    return await renderRouteDocument(() => /* @__PURE__ */ jsx(Index, {}), value(metadata$2), assets);
  }
  if (routePath === "/blog") {
    return await renderRouteDocument(
      async () => withBlogLayout(await Page$9()),
      value(metadata$1),
      assets
    );
  }
  if (routePath === "/blog/search") {
    return await renderRouteDocument(
      () => withBlogLayout(/* @__PURE__ */ jsx(Page$8, {})),
      value({
        title: "Patrick Desjardins Blog Search",
        description: "Patrick Desjardins Blog Search"
      }),
      assets
    );
  }
  if (routePath === "/philosophy") {
    return await renderRouteDocument(
      async () => withPhilosophyLayout(await Page$4()),
      value(metadata),
      assets
    );
  }
  if (routePath === "/philosophy/search") {
    return await renderRouteDocument(
      () => withPhilosophyLayout(/* @__PURE__ */ jsx(Page$3, {})),
      value({
        title: "Philosophy Search",
        description: "Search philosophy essays by Patrick Desjardins"
      }),
      assets
    );
  }
  if (routePath === "/404") {
    return await renderRouteDocument(
      () => /* @__PURE__ */ jsx(NotFound, {}),
      value({
        title: "Page not found",
        description: "Page not found"
      }),
      assets
    );
  }
  const blogPageMatch = /^\/blog\/page\/([^/]+)$/.exec(routePath);
  if (blogPageMatch !== null) {
    const pageProps = props({ pageNumber: blogPageMatch[1] });
    return await renderRouteDocument(
      async () => withBlogLayout(await Page$5(pageProps)),
      async () => await generateMetadata$3(pageProps),
      assets
    );
  }
  const blogYearMatch = /^\/blog\/for\/([^/]+)$/.exec(routePath);
  if (blogYearMatch !== null) {
    const yearProps = props({ year: blogYearMatch[1] });
    return await renderRouteDocument(
      async () => withBlogLayout(await Page$6(yearProps)),
      async () => await generateMetadata$4(yearProps),
      assets
    );
  }
  const blogPostMatch = /^\/blog\/([^/]+)$/.exec(routePath);
  if (blogPostMatch !== null) {
    const postProps = props({ slug: blogPostMatch[1] });
    return await renderRouteDocument(
      async () => withBlogLayout(await Page$7(postProps)),
      async () => await generateMetadata$5(postProps),
      assets
    );
  }
  const philosophyPageMatch = /^\/philosophy\/page\/([^/]+)$/.exec(routePath);
  if (philosophyPageMatch !== null) {
    const pageProps = props({ pageNumber: philosophyPageMatch[1] });
    return await renderRouteDocument(
      async () => withPhilosophyLayout(await Page(pageProps)),
      async () => await generateMetadata(pageProps),
      assets
    );
  }
  const philosophyYearMatch = /^\/philosophy\/for\/([^/]+)$/.exec(routePath);
  if (philosophyYearMatch !== null) {
    const yearProps = props({ year: philosophyYearMatch[1] });
    return await renderRouteDocument(
      async () => withPhilosophyLayout(await Page$1(yearProps)),
      async () => await generateMetadata$1(yearProps),
      assets
    );
  }
  const philosophyPostMatch = /^\/philosophy\/([^/]+)$/.exec(routePath);
  if (philosophyPostMatch !== null) {
    const postProps = props({ slug: philosophyPostMatch[1] });
    return await renderRouteDocument(
      async () => withPhilosophyLayout(await Page$2(postProps)),
      async () => await generateMetadata$2(postProps),
      assets
    );
  }
  throw new Error(`Unknown route path: ${routePath}`);
}
async function buildRoutes(assets) {
  const [blogPosts, philosophyPosts] = await Promise.all([
    getAllPosts(),
    getAllPhilosophyPosts()
  ]);
  const sortedBlogPosts = [...blogPosts].sort(sortByMetadataDateDesc);
  const sortedPhilosophyPosts = [...philosophyPosts].sort(sortByMetadataDateDesc);
  const blogTotalPages = getTotalPages(sortedBlogPosts);
  const philosophyTotalPages = Math.max(1, getTotalPages(sortedPhilosophyPosts));
  const shared = sharedDependencies();
  const blogDeps = collectionDependencies(blogPosts);
  const philosophyDeps = collectionDependencies(philosophyPosts);
  const routes = [];
  function add(routePath, dependencies, renderPage, metadata2) {
    routes.push({
      path: routePath,
      outputPath: routeFilePath(routePath),
      dependencies: [...shared, ...dependencies],
      render: async () => renderDocument(await renderPage(), await metadata2(), assets)
    });
  }
  add("/", [], () => /* @__PURE__ */ jsx(Index, {}), value(metadata$2));
  add(
    "/blog",
    blogDeps,
    async () => withBlogLayout(await Page$9()),
    value(metadata$1)
  );
  add("/blog/search", blogDeps, () => withBlogLayout(/* @__PURE__ */ jsx(Page$8, {})), value({
    title: "Patrick Desjardins Blog Search",
    description: "Patrick Desjardins Blog Search"
  }));
  add(
    "/philosophy",
    philosophyDeps,
    async () => withPhilosophyLayout(await Page$4()),
    value(metadata)
  );
  add("/philosophy/search", philosophyDeps, () => withPhilosophyLayout(/* @__PURE__ */ jsx(Page$3, {})), value({
    title: "Philosophy Search",
    description: "Search philosophy essays by Patrick Desjardins"
  }));
  add("/404", [], () => /* @__PURE__ */ jsx(NotFound, {}), value({
    title: "Page not found",
    description: "Page not found"
  }));
  for (let pageNumber = 1; pageNumber <= blogTotalPages; pageNumber += 1) {
    const pageProps = props({ pageNumber: String(pageNumber) });
    add(
      `/blog/page/${pageNumber}`,
      blogDeps,
      async () => withBlogLayout(await Page$5(pageProps)),
      async () => await generateMetadata$3(pageProps)
    );
  }
  for (let year = LAST_YEAR; year >= FIRST_YEAR; year -= 1) {
    const yearProps = props({ year: String(year) });
    add(
      `/blog/for/${year}`,
      blogDeps,
      async () => withBlogLayout(await Page$6(yearProps)),
      async () => await generateMetadata$4(yearProps)
    );
  }
  for (const post of sortedBlogPosts) {
    const postProps = props({ slug: post.metadata.slug });
    add(
      `/blog/${post.metadata.slug}`,
      [postDependency(post)],
      async () => withBlogLayout(await Page$7(postProps)),
      async () => await generateMetadata$5(postProps)
    );
  }
  for (let pageNumber = 1; pageNumber <= philosophyTotalPages; pageNumber += 1) {
    const pageProps = props({ pageNumber: String(pageNumber) });
    add(
      `/philosophy/page/${pageNumber}`,
      philosophyDeps,
      async () => withPhilosophyLayout(await Page(pageProps)),
      async () => await generateMetadata(pageProps)
    );
  }
  for (let year = LAST_YEAR; year >= PHILOSOPHY_FIRST_YEAR; year -= 1) {
    const yearProps = props({ year: String(year) });
    add(
      `/philosophy/for/${year}`,
      philosophyDeps,
      async () => withPhilosophyLayout(await Page$1(yearProps)),
      async () => await generateMetadata$1(yearProps)
    );
  }
  for (const post of sortedPhilosophyPosts) {
    const postProps = props({ slug: post.metadata.slug });
    add(
      `/philosophy/${post.metadata.slug}`,
      [postDependency(post)],
      async () => withPhilosophyLayout(await Page$2(postProps)),
      async () => await generateMetadata$2(postProps)
    );
  }
  return routes;
}
async function renderSitemap() {
  const entries = await sitemap();
  const urls = entries.map((entry) => {
    const lastModified = entry.lastModified instanceof Date ? `<lastmod>${entry.lastModified.toISOString()}</lastmod>` : "";
    const changeFrequency = entry.changeFrequency === void 0 ? "" : `<changefreq>${entry.changeFrequency}</changefreq>`;
    const priority = entry.priority === void 0 ? "" : `<priority>${entry.priority}</priority>`;
    return `<url><loc>${escapeHtml(entry.url)}</loc>${lastModified}${changeFrequency}${priority}</url>`;
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}
function renderRobots() {
  const value2 = robots();
  return [
    `User-agent: ${value2.rules.userAgent}`,
    `Allow: ${value2.rules.allow}`,
    value2.rules.disallow === void 0 ? "" : `Disallow: ${value2.rules.disallow}`,
    `Sitemap: ${value2.sitemap}`,
    ""
  ].filter((line) => line.length > 0).join("\n");
}
export {
  BASE_URL,
  MAX_POSTS_PER_PAGE,
  buildRoutes,
  renderPath,
  renderRobots,
  renderSitemap
};
