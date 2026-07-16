import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

var maxLines = 8  // css 150px is in sync with this
var lineTolerance = 4  // don't collapse if block is longer but within tolerance
var collapsedClassName = 'collapsed'

function collapseBlocks() {
  let blocks = document.querySelectorAll('main div.theme-code-block')

  if ( blocks.length == 0 || isPageAlreadyCollapsed(blocks) ) return

  blocks.forEach(collapseBlock)

function collapseBlock(block) {
  if ( ! shouldCollapseBlock(block) ) return

  // Collapse
  let pre = block.querySelector('pre')
  pre.classList.add(collapsedClassName)

  // Link to expand
  let displayAll = document.createElement('div')
  displayAll.classList.add('display-all')
  displayAll.addEventListener('click', expandBlock)
  pre.addEventListener('click', expandBlock)  // clicking anywhere on the code block expands it
  let displayAllLink = document.createElement('a')
  displayAllLink.innerHTML = `Expand (${blockLineCount(block)} lines)`
  block.appendChild(displayAll)
  displayAll.appendChild(displayAllLink)
}

function shouldCollapseBlock(block) {
  if ( blockLineCount(block) < maxLines + lineTolerance )
    return false
  if ( block.querySelector('.code-block-collapse') != null )
    return true
  if ( block.querySelector('.code-block-no-collapse') != null )
    return false
  if ( block.querySelector('.codeBlockTitle_OeMC') != null
  && block.querySelector('.codeBlockTitle_OeMC').textContent == 'Result' )
    return true
  return false
}

function expandBlock(e) {
  e.preventDefault()
  let block = e.target.closest('div.theme-code-block')  // click can come from anywhere inside the block
  let pre = block.querySelector('pre')
  pre.classList.remove(collapsedClassName)
  block.querySelector('div.display-all')?.remove()
}

function blockLineCount(block) {
  let pre = block.querySelector('pre')
  let lineCount = pre.innerHTML.split('<div class="token-line"').length - 1
  return lineCount
}

function isPageAlreadyCollapsed(blocks) {
  // If at least one block has the collapsed class, we've already been here.
  // This is to avoid re-executing when navigating between headings.
  return Array.from(blocks).some( (b) =>
    b.querySelector('pre').classList.contains(collapsedClassName)
  )
}
}

// For react re-paints, after first page load
// TODO: investigate if the module can work when a md page is hot reloaded during development
export function onRouteDidUpdate({location, previousLocation}) {
  collapseBlocks();
}

// For page loads
if (ExecutionEnvironment.canUseDOM) {
  window.addEventListener('load', () => {
    setTimeout(collapseBlocks, 1000);
  });
}
