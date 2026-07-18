import { useEffect, useState, type ReactNode } from "react";
import Footer from "@theme-original/DocItem/Footer";
import type FooterType from "@theme/DocItem/Footer";
import type { WrapperProps } from "@docusaurus/types";

import { FeedbackButton } from "pushfeedback-react";
import { defineCustomElements } from "pushfeedback/loader";
import "pushfeedback/dist/pushfeedback/pushfeedback.css";

type Props = WrapperProps<typeof FooterType>;

const PROJECT_ID = "wnjqslayhj";

const ButtonThumbsUp = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
  </svg>
);

const ButtonThumbsDown = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
  </svg>
);

type FeedbackStatus = "idle" | "sent" | "failed";

function FeedbackWidget(): ReactNode {
  const [status, setStatus] = useState<FeedbackStatus>("idle");

  useEffect(() => {
    defineCustomElements(window);

    const handleSent = () => setStatus("sent");
    // "failed" reverts the optimistic thanks: the buttons return for a retry
    const handleError = (event: Event) => {
      console.error(
        "Feedback submission error:",
        (event as CustomEvent<{ error: unknown }>).detail.error,
      );
      setStatus("failed");
    };

    document.addEventListener("feedbackSent", handleSent);
    document.addEventListener("feedbackError", handleError);

    return () => {
      document.removeEventListener("feedbackSent", handleSent);
      document.removeEventListener("feedbackError", handleError);
    };
  }, []);

  return (
    <div className="feedback-widget">
      <div className="feedback-widget-title">Was this helpful?</div>

      {status === "sent" && (
        <div className="feedback-thanks">Thanks for your feedback!</div>
      )}

      {/* Hidden rather than unmounted: feedback events emit on the host
          element after the fetch resolves, so it must stay connected for the
          document listeners (esp. feedbackError) to hear them */}
      <div
        className="feedback-buttons"
        style={status === "sent" ? { display: "none" } : undefined}
      >
        <span className="feedback-widget-positive">
          <FeedbackButton
            project={PROJECT_ID}
            submit={true}
            rating={1}
            custom-font="True"
            button-style="default"
            modal-position="center"
          >
            <button
              className="feedback-thumb-button"
              title="Yes"
              onClick={() => setStatus("sent")}
            >
              <ButtonThumbsUp />
            </button>
          </FeedbackButton>
        </span>
        <span className="feedback-widget-negative">
          <FeedbackButton
            project={PROJECT_ID}
            hide-screenshot-button="True"
            message-placeholder="A place to praise and to rant."
            rating={0}
            custom-font="True"
            button-style="default"
            modal-position="center"
          >
            <button className="feedback-thumb-button" title="No">
              <ButtonThumbsDown />
            </button>
          </FeedbackButton>
        </span>
      </div>

      {status === "failed" && (
        <div className="feedback-widget-error">
          Something went wrong. Please try again.
        </div>
      )}
    </div>
  );
}

export default function FooterWrapper(props: Props): ReactNode {
  return (
    <>
      <FeedbackWidget />
      <Footer {...props} />
    </>
  );
}
