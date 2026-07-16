import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

function hideFooterThumbs() {
  let feedbackThumbsUp = document
    .querySelector('.feedback-widget button[title="Yes"]')
  if (feedbackThumbsUp == null) return; // if feedback was already submitted via modal widget
  let feedbackWidgetDiv = feedbackThumbsUp.closest('.feedback-widget')
  
  // remove thumbs elements
  feedbackWidgetDiv
    .querySelectorAll('span')
    .forEach((el) => {el.remove()})
  
  // acknowledge their kindness (once)
  if (feedbackWidgetDiv.querySelector('div.feedback-thanks') != null) return;
  let thanksDiv = document.createElement('div')
  thanksDiv.classList.add('feedback-thanks');
  thanksDiv.innerHTML = `Thanks for your feedback!`
  feedbackWidgetDiv.appendChild(thanksDiv)
}

function processFeedback() {
  document.querySelector('.feedback-widget button[title="Yes"]').addEventListener('click', (event) => {
    hideFooterThumbs();
  })
  
  document.addEventListener('feedbackSent', (event) => {
    const feedback = event.detail.feedback;
    console.log('Feedback submitted:', feedback);
    hideFooterThumbs();
  });
  
  document.addEventListener('feedbackError', (event) => {
    const error = event.detail.error;
    console.error('Feedback submission error:', error);
    hideFooterThumbs();
  });
}

// For react re-paints, after first page load
// TODO: investigate if the module can work when a md page is hot reloaded during development
//export function onRouteDidUpdate({location, previousLocation}) {
//  processFeedback();
//}

// For page loads
if (ExecutionEnvironment.canUseDOM && ExecutionEnvironment.canUseEventListeners) {
  window.addEventListener('load', () => {
    setTimeout(processFeedback, 1000);
  });
}
