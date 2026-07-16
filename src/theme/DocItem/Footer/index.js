import React, {useEffect, useState} from 'react';
import Footer from '@theme-original/DocItem/Footer';

import { FeedbackButton } from 'pushfeedback-react';
import { defineCustomElements } from 'pushfeedback/loader';
import 'pushfeedback/dist/pushfeedback/pushfeedback.css';

function FeedbackWidget() {
  const buttonThumbsUp = <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>;
  const buttonThumbsDown = <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg>;
  const projectId = 'wnjqslayhj';
  const [feedbackSent, setFeedbackSent] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      defineCustomElements(window);

      const handleSent = (event) => {
        console.log('Feedback submitted:', event);
        setFeedbackSent(true);
      };
      const handleError = (event) => {
        console.error('Feedback submission error:', event.detail.error);
      };

      document.addEventListener('feedbackSent', handleSent);
      document.addEventListener('feedbackError', handleError);
      document.querySelector('.feedback-widget-positive button').addEventListener('click', handleSent);

      return () => {
        document.removeEventListener('feedbackSent', handleSent);
        document.removeEventListener('feedbackError', handleError);
        document.querySelector('.feedback-widget-positive button').removeEventListener('click', handleSent);
      };
    }
  }, []);

  let styles;
  feedbackSent ? ( styles = { display: 'none' } ) : ( styles = {} )

  return(
    <div className="feedback-widget">
      <div className="margin-bottom--sm">
        <b>Was this helpful?</b>
      </div>

      {feedbackSent ? (
      <div className="feedback-thanks">Thanks for your feedback!</div>
      ) : ("")}

      <div className="feedback-buttons" style={styles}>
        <span className="feedback-widget-positive">
          <FeedbackButton project={projectId} submit="True" rating="1" custom-font="True" button-style="default" modal-position="center">
            <button className="button button--outline button--primary button--sm" title="Yes">
              {buttonThumbsUp}
            </button>
          </FeedbackButton>
        </span>
        <span className="feedback-widget-negative margin-left--sm">
          <FeedbackButton project={projectId} hide-screenshot-button="True" message-placeholder="A place to praise and to rant." rating="0" custom-font="True" button-style="default" modal-position="center">
            <button className="button button--outline button--primary button--sm" title="No">
              {buttonThumbsDown}
            </button>
          </FeedbackButton>
        </span>
      </div>
    </div>
  );
}

export default function FooterWrapper(props) {
  return (
    <>
    <FeedbackWidget/>
    <Footer {...props} />
    </>
  );
}