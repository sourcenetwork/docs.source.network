import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

var maxLines = 8  // css 150px is in sync with this

const collapseBlocks = () => {
  let blocks = document.querySelectorAll('main div.theme-code-block')
  if ( blocks.length == 0 ) return
  let randomBlockStyle = window.getComputedStyle(blocks[0].querySelector('pre'))
  // line-height px value for pre inside code blocks
  let lineHeight = parseFloat(randomBlockStyle.getPropertyValue('line-height'))

  blocks.forEach(collapseBlock)

  function collapseBlock(block) {
      if ( ! shouldCollapseBlock(block) ) return
      let pre = block.querySelector('pre')
      pre.classList.add('collapsed')

      let totalLines = Math.ceil(pre.clientHeight / lineHeight)
      let displayAll = document.createElement('div')
      displayAll.classList.add('display-all')
      pre.addEventListener('click', expandBlock)  // clicking anywhere on the code block expands it
      let displayAllLink = document.createElement('a')
      displayAllLink.innerHTML = `Expand (${totalLines} lines)`
      block.appendChild(displayAll)
      displayAll.appendChild(displayAllLink)
  }

  function shouldCollapseBlock(block) {
    let lineTolerance = 4 // don't collapse if block is longer but within tolerance
    if ( block.offsetHeight < (maxLines + lineTolerance) * lineHeight )
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
    let block = e.target.closest('div.theme-code-block')
    let pre = block.querySelector('pre')
    pre.classList.remove('collapsed')
    block.querySelector('div.display-all')?.remove()
  }
}

export function onRouteDidUpdate({location, previousLocation}) {
  // Don't execute if we are still on the same page; the lifecycle may be fired
  // because the hash changes (e.g. when navigating between headings)
  if (location.pathname === previousLocation?.pathname) return;
  collapseBlocks();
}

if (ExecutionEnvironment.canUseDOM) {
  // We also need to setCodeRevealTriggers when the page first loads; otherwise,
  // after reloading the page, these triggers will not be set until the user
  // navigates somewhere.
  window.addEventListener('load', () => {
    setTimeout(collapseBlocks, 1000);
  });
}
