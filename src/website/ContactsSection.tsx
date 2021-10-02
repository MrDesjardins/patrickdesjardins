import "@fontsource/open-sans";
import "@fontsource/oswald";
import clsx from "clsx";
import * as React from "react";
import {
  sectionMainpage,
  sectionVisualTwo,
  contactContainer,
  contactContainer2,
  contactDetail,
  contactSection,
} from "./index.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faMapMarker,
  faPhone,
  faRss,
} from "@fortawesome/free-solid-svg-icons";
import {
  faTwitter,
  faLinkedin,
  faGithub,
  faStackOverflow,
  faAmazon,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
export const ContactSection = (): JSX.Element => {
  return (
    <section
      id="contact"
      className={clsx(sectionMainpage, sectionVisualTwo, contactSection)}
    >
      <header>Contact</header>
      <h3>You can contact me directly by email or use social media</h3>
      <div className={contactContainer}>
        <div className={contactDetail}>
          <FontAwesomeIcon icon={faPaperPlane} />
          <h5>mrdesjardins@gmail.com</h5>
        </div>

        <div className={contactDetail}>
          <FontAwesomeIcon icon={faMapMarker} />
          <h5>United States, California, San Jose</h5>
        </div>

        <div className={contactDetail}>
          <FontAwesomeIcon icon={faPhone} />
          <h5>971-801-0075</h5>
        </div>
      </div>
      <div className={contactContainer2}>
        <div className={contactDetail}>
          <a
            href="https://twitter.com/mrdesjardins"
            target="_blank"
            rel="noopener noreferrer"
            title="Patrick Desjardins Twitter Account Page"
          >
            <FontAwesomeIcon icon={faTwitter} />
          </a>
        </div>
        <div className={contactDetail}>
          <a
            href="https://linkedin.com/in/patrickdesjardins"
            target="_blank"
            rel="noopener noreferrer"
            title="Patrick Desjardins LinkedIn Account Page"
          >
            <FontAwesomeIcon icon={faLinkedin} />
          </a>
        </div>
        <div className={contactDetail}>
          <a
            href="https://github.com/MrDesjardins"
            target="_blank"
            rel="noopener noreferrer"
            title="Patrick Desjardins Github Account Page"
          >
            <FontAwesomeIcon icon={faGithub} />
          </a>
        </div>
        <div className={contactDetail}>
          <a
            href="https://stackexchange.com/users/7901"
            target="_blank"
            rel="noopener noreferrer"
            title="Patrick Desjardins Stack Exchange Account Page"
          >
            <FontAwesomeIcon icon={faStackOverflow} />
          </a>
        </div>
        <div className={contactDetail}>
          <a
            href="https://www.amazon.com/Patrick-Desjardins/e/B01MZBUL14"
            target="_blank"
            rel="noopener noreferrer"
            title="Patrick Desjardins Amazon Author Page"
          >
            <FontAwesomeIcon icon={faAmazon} />
          </a>
        </div>
        <div className={contactDetail}>
          <a
            href="https://www.youtube.com/channel/UCKBBbMaq3Q-MirzMecdJZCQ"
            target="_blank"
            rel="noopener noreferrer"
            title="Patrick Desjardins Youtube Page"
          >
            <FontAwesomeIcon icon={faYoutube} />
          </a>
        </div>
        <div className={contactDetail}>
          <a
            href="https://patrickdesjardins.com/rss.xml"
            target="_blank"
            rel="noopener noreferrer"
            title="Patrick Desjardins RSS Blog"
          >
            <FontAwesomeIcon icon={faRss} />
          </a>
        </div>
      </div>
    </section>
  );
};
