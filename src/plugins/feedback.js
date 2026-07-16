import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

function removeFooterThumbs() {
  let feedbackThumbsUp = document.querySelector('.feedback-widget button[title="Yes"]')
  if (feedbackThumbsUp == null) return; // if feedback was already submitted via modal widget
  let feedbackWidgetDiv = feedbackThumbsUp.closest('.feedback-widget')
  
  // remove thumbs elements
  feedbackWidgetDiv.querySelectorAll('span').forEach((el) => {el.remove()})
  
  // acknowledge their kindness (once)
  if (feedbackWidgetDiv.querySelector('div.feedback-thanks') != null) return;
  let thanksDiv = document.createElement('div')
  thanksDiv.classList.add('feedback-thanks');
  thanksDiv.innerHTML = 'Thanks for your feedback!'
  feedbackWidgetDiv.appendChild(thanksDiv)
}

function registerFeedbackHandlers() {
  // The Yes button submits feedback immediately, while the No button sends to the modal,
  // so we don't need to remove thumbs on negative feedback.
  document.querySelector('.feedback-widget button[title="Yes"]')?.addEventListener('click', (event) => {
    removeFooterThumbs();
  })
  
  // When feedback is sent (through the modal), remove footer widget
  document.addEventListener('feedbackSent', (event) => {
    const feedback = event.detail.feedback;
    console.log('Feedback submitted:', feedback);
    removeFooterThumbs();
  });
  
  // Any error on submission should still allow to submit again
  document.addEventListener('feedbackError', (event) => {
    const error = event.detail.error;
    console.error('Feedback submission error:', error);
  });
}

// For page loads
if (ExecutionEnvironment.canUseDOM && ExecutionEnvironment.canUseEventListeners) {
  window.addEventListener('load', () => {
    setTimeout(registerFeedbackHandlers, 1000);
  });
}
