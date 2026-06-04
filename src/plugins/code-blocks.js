import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

var codeMaxLines = 8  // css 150px is in sync with this

const doYourCustomStuff = () => {
	let blocks = document.querySelectorAll('main div.theme-code-block')
	if ( blocks.length == 0 ) return
	let randomBlockStyle = window.getComputedStyle(blocks[0].querySelector('pre'))
	// line-height px value for pre inside code blocks
	let codeLineHeight = parseFloat(randomBlockStyle.getPropertyValue('line-height'))
	
	blocks.forEach(collapseCodeBlock)
	
	function collapseCodeBlock(block) {
		if ( ! shouldCollapseBlock(block) ) return
		let pre = block.querySelector('pre')
		let totalLines = Math.ceil(pre.clientHeight / codeLineHeight)
		pre.classList.add('collapsed')

		var displayAll = document.createElement('div')
		displayAll.classList.add('display-all')
		pre.addEventListener('click', expandCodeBlock)
		var displayAllLink = document.createElement('a')
		displayAllLink.innerHTML = `Expand (${totalLines} lines)`
		block.appendChild(displayAll)
		displayAll.appendChild(displayAllLink)
	}

	function shouldCollapseBlock(block) {
		var linesTolerance = 4 // don't collapse if block is longer but within tolerance
		if (block.offsetHeight < (codeMaxLines + linesTolerance) * codeLineHeight)
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

	function expandCodeBlock(e) {
		e.preventDefault()
		let block = e.target.closest('div.theme-code-block')
		let pre = block.querySelector('pre')
		pre.classList.remove('collapsed')
		block.removeChild(block.querySelector('div.display-all'))
  }
}

export function onRouteDidUpdate({location, previousLocation}) {
  // Don't execute if we are still on the same page; the lifecycle may be fired
  // because the hash changes (e.g. when navigating between headings)
  if (location.pathname === previousLocation?.pathname) return;
  doYourCustomStuff();
}

if (ExecutionEnvironment.canUseDOM) {
  // We also need to setCodeRevealTriggers when the page first loads; otherwise,
  // after reloading the page, these triggers will not be set until the user
  // navigates somewhere.
  window.addEventListener('load', () => {
    setTimeout(doYourCustomStuff, 1000);
  });
}
