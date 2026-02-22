import './style.css'

// ----- Mobile nav -----
const toggle = document.querySelector('.nav-toggle')
const nav = document.querySelector('.nav')

toggle?.addEventListener('click', () => {
  nav?.classList.toggle('open')
})

document.querySelectorAll('.nav-links a').forEach((link) => {
  link.addEventListener('click', () => nav?.classList.remove('open'))
})

// ----- Scroll reveal (Intersection Observer) -----
const revealEls = document.querySelectorAll('.reveal')
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
      }
    })
  },
  { threshold: 0.05, rootMargin: '0px 0px 80px 0px' }
)
revealEls.forEach((el) => revealObserver.observe(el))

// ----- Hero: show immediately on load -----
const hero = document.querySelector('.hero')
if (hero) {
  hero.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'))
}

// ----- Rotating tech stack in hero (skills you know; typewriter; theme-visible colors) -----
const TECH_STACK = [
  { name: 'Python', color: '#f4c430' },
  { name: 'Pandas', color: '#e70488' },
  { name: 'NumPy', color: '#22d3ee' },
  { name: 'Matplotlib', color: '#0d9488' },
  { name: 'HTML', color: '#e44d26' },
  { name: 'CSS', color: '#a78bfa' },
  { name: 'Next.js', color: '#ffffff' },
  { name: 'Node.js', color: '#339933' },
  { name: 'Docker', color: '#2496ed' },
  { name: 'SQL', color: '#f29111' },
  { name: 'Excel', color: '#217346' },
  { name: 'Power BI', color: '#f2c811' },
]
const heroTechEl = document.getElementById('hero-tech-rotating')
if (heroTechEl) {
  let techIndex = 0
  let letterIndex = 0
  const TYPE_DELAY_MS = 100
  const PAUSE_AFTER_WORD_MS = 1200

  function typeNext() {
    if (!heroTechEl) return
    const tech = TECH_STACK[techIndex]
    if (letterIndex < tech.name.length) {
      heroTechEl.textContent = tech.name.slice(0, letterIndex + 1)
      heroTechEl.style.color = tech.color
      letterIndex++
      setTimeout(typeNext, TYPE_DELAY_MS)
    } else {
      letterIndex = 0
      techIndex = (techIndex + 1) % TECH_STACK.length
      setTimeout(typeNext, PAUSE_AFTER_WORD_MS)
    }
  }
  typeNext()
}

// ----- Header scroll state + active nav (throttled with rAF for smooth scroll) -----
const header = document.querySelector('.header')
const scrollProgress = document.querySelector('.scroll-progress') as HTMLElement
const sections = document.querySelectorAll('section[id]')
const navLinks = document.querySelectorAll('.nav-link')

function runScrollUpdates() {
  const y = window.scrollY
  if (header) {
    if (y > 40) header.classList.add('scrolled')
    else header.classList.remove('scrolled')
  }
  if (scrollProgress) {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    const pct = docHeight > 0 ? (y / docHeight) * 100 : 0
    scrollProgress.style.width = `${pct}%`
  }
  const yNav = y + 120
  let current = ''
  sections.forEach((section) => {
    const id = section.getAttribute('id')
    const top = (section as HTMLElement).offsetTop
    const height = (section as HTMLElement).offsetHeight
    if (yNav >= top && yNav < top + height) current = id || ''
  })
  navLinks.forEach((link) => {
    const href = (link as HTMLAnchorElement).getAttribute('href')?.slice(1)
    link.classList.toggle('active', href === current)
  })
}

let scrollRaf: number | null = null
function onScroll() {
  if (scrollRaf != null) return
  scrollRaf = requestAnimationFrame(() => {
    runScrollUpdates()
    scrollRaf = null
  })
}

window.addEventListener('scroll', onScroll, { passive: true })
runScrollUpdates()

// ----- Back to top -----
const backToTop = document.querySelector('.back-to-top')
const backToTopObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      // When hero is not intersecting (scrolled past), show button
      backToTop?.classList.toggle('visible', !entry.isIntersecting)
    })
  },
  { threshold: 0, rootMargin: '-80% 0px 0px 0px' }
)
if (hero) backToTopObserver.observe(hero)

window.addEventListener('load', runScrollUpdates)

// ----- 3D tilt on mouse move (hero + project cards) -----
const TILT_MAX = 8
const TILT_PERSPECTIVE = 1000

function initTilt(el: Element) {
  const onMove = (e: MouseEvent) => {
    const rect = (el as HTMLElement).getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const x = (e.clientX - centerX) / rect.width
    const y = (e.clientY - centerY) / rect.height
    const rotateY = x * TILT_MAX
    const rotateX = -y * TILT_MAX
    ;(el as HTMLElement).style.transform = `perspective(${TILT_PERSPECTIVE}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
  }

  const onLeave = () => {
    ;(el as HTMLElement).style.transform = `perspective(${TILT_PERSPECTIVE}px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`
  }

  el.addEventListener('mousemove', onMove as EventListener)
  el.addEventListener('mouseleave', onLeave)
}

document.querySelectorAll('[data-tilt]').forEach(initTilt)

// ----- Skills hub: click logo to reveal, draggable icons with connectors -----
const skillsHubTrigger = document.getElementById('skills-hub-trigger')
const skillsOrbitWrap = document.querySelector('.skills-orbit-wrap')
const skillsHub = document.querySelector('.skills-hub')
const skillsHubItems = document.querySelectorAll('.skills-hub-item')
const skillsHubPaths = document.querySelectorAll('.skills-hub-connectors .skills-hub-line')
const skillsHubSvg = document.querySelector('.skills-hub-connectors') as SVGSVGElement | null

const LOGO_SVG = { x: 200, y: 260 }
const ICON_RADIUS_SVG = 24
const ORIGINAL_PATHS: string[] = []

function pathFromIconPosition(iconX: number, iconY: number): string {
  const dx = LOGO_SVG.x - iconX
  const dy = LOGO_SVG.y - iconY
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const ux = dx / len
  const uy = dy / len
  const startX = iconX + ux * ICON_RADIUS_SVG
  const startY = iconY + uy * ICON_RADIUS_SVG
  const qx = LOGO_SVG.x
  const qy = (startY + LOGO_SVG.y) * 0.5
  return `M ${startX} ${startY} Q ${qx} ${qy} ${LOGO_SVG.x} ${LOGO_SVG.y}`
}

function updateAllConnectorsFromIcons() {
  if (!skillsHub) return
  skillsHubItems.forEach((item, index) => {
    const el = item as HTMLElement
    const rect = el.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const svg = clientToSvg(centerX, centerY)
    const d = pathFromIconPosition(svg.x, svg.y)
    const path = skillsHubPaths[index] as SVGPathElement
    if (path) {
      path.setAttribute('d', d)
      ORIGINAL_PATHS[index] = d
    }
  })
}

skillsHubTrigger?.addEventListener('click', () => {
  if (!skillsOrbitWrap) return
  if (skillsOrbitWrap.classList.contains('skills-hub-revealed')) return
  const btn = skillsHubTrigger as HTMLElement
  const logoRect = btn.getBoundingClientRect()
  const logoCenterX = logoRect.left + logoRect.width / 2
  const logoCenterY = logoRect.top + logoRect.height / 2
  const BURST_OFFSET = 14
  const STAGGER_BASE = 110
  const JITTER_MAX = 50
  skillsHubItems.forEach((item, i) => {
    const el = item as HTMLElement
    const iconRect = el.getBoundingClientRect()
    const iconCenterX = iconRect.left + iconRect.width / 2
    const iconCenterY = iconRect.top + iconRect.height / 2
    const deltaX = logoCenterX - iconCenterX
    const deltaY = logoCenterY - iconCenterY
    const burstDx = (Math.random() - 0.5) * 2 * BURST_OFFSET
    const burstDy = (Math.random() - 0.5) * 2 * BURST_OFFSET
    const jitter = Math.floor(Math.random() * JITTER_MAX)
    el.style.setProperty('--throw-x', `${deltaX}px`)
    el.style.setProperty('--throw-y', `${deltaY}px`)
    el.style.setProperty('--burst-dx', `${burstDx}px`)
    el.style.setProperty('--burst-dy', `${burstDy}px`)
    el.style.setProperty('--burst-delay', `${i * STAGGER_BASE + jitter}ms`)
  })
  void (skillsOrbitWrap as HTMLElement).offsetHeight
  btn.classList.add('playing')
  const logo = btn.querySelector('.skills-hub-center-logo')
  logo?.addEventListener('animationend', () => {
    btn.classList.remove('playing')
  }, { once: true })
  skillsOrbitWrap.classList.add('skills-hub-revealed')
  setTimeout(() => {
    updateAllConnectorsFromIcons()
    skillsOrbitWrap.classList.add('skills-connectors-visible')
    skillsHubSvg?.style.removeProperty('visibility')
  }, 2850)
})

window.addEventListener('resize', () => {
  if (skillsOrbitWrap?.classList.contains('skills-hub-revealed')) {
    updateAllConnectorsFromIcons()
  }
})

const DRAG_THRESHOLD_PX = 6

let dragState: {
  el: HTMLElement
  index: number
  offsetX: number
  offsetY: number
  startX: number
  startY: number
  committed: boolean
} | null = null

function startDrag(el: HTMLElement, index: number, clientX: number, clientY: number) {
  const rect = el.getBoundingClientRect()
  dragState = {
    el,
    index,
    offsetX: clientX - rect.left,
    offsetY: clientY - rect.top,
    startX: clientX,
    startY: clientY,
    committed: false,
  }
  el.classList.add('dragging')
  el.style.transform = 'translate(0, 0) scale(1)'
}

skillsHubItems.forEach((item, index) => {
  const el = item as HTMLElement
  el.addEventListener('mousedown', (e: MouseEvent) => {
    if (!skillsOrbitWrap?.classList.contains('skills-hub-revealed')) return
    if ((e.target as HTMLElement).closest('.skills-hub-item') !== el) return
    e.preventDefault()
    startDrag(el, index, e.clientX, e.clientY)
  })
  el.addEventListener('touchstart', (e: TouchEvent) => {
    if (!skillsOrbitWrap?.classList.contains('skills-hub-revealed')) return
    if ((e.target as HTMLElement).closest('.skills-hub-item') !== el) return
    if (e.cancelable) e.preventDefault()
    startDrag(el, index, e.touches[0].clientX, e.touches[0].clientY)
  }, { passive: false })
})

function clientToSvg(clientX: number, clientY: number): { x: number; y: number } {
  if (!skillsHubSvg) return { x: 0, y: 0 }
  const pt = skillsHubSvg.createSVGPoint()
  pt.x = clientX
  pt.y = clientY
  const ctm = skillsHubSvg.getScreenCTM()
  if (!ctm) return { x: 0, y: 0 }
  const svgPt = pt.matrixTransform(ctm.inverse())
  return { x: svgPt.x, y: svgPt.y }
}

function updateConnector(index: number, iconX: number, iconY: number) {
  const path = skillsHubPaths[index] as SVGPathElement
  if (!path) return
  const x = Number.isFinite(iconX) ? iconX : LOGO_SVG.x
  const y = Number.isFinite(iconY) ? iconY : LOGO_SVG.y
  path.setAttribute('d', pathFromIconPosition(x, y))
}

function syncConnectorToIcon(el: HTMLElement, index: number) {
  const rect = el.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const svg = clientToSvg(centerX, centerY)
  updateConnector(index, svg.x, svg.y)
}

let connectorRaf: number | null = null
function onPointerMove(clientX: number, clientY: number) {
  if (!dragState) return
  const { el, index, offsetX, offsetY, startX, startY } = dragState
  if (!dragState.committed) {
    const dx = clientX - startX
    const dy = clientY - startY
    if (dx * dx + dy * dy < DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) return
    const rect = el.getBoundingClientRect()
    dragState.committed = true
    dragState.offsetX = clientX - rect.left
    dragState.offsetY = clientY - rect.top
    el.style.position = 'fixed'
    el.style.left = `${rect.left}px`
    el.style.top = `${rect.top}px`
    el.style.transform = 'translate(0, 0) scale(1)'
    syncConnectorToIcon(el, index)
  }
  el.style.left = `${clientX - offsetX}px`
  el.style.top = `${clientY - offsetY}px`
  if (connectorRaf) cancelAnimationFrame(connectorRaf)
  connectorRaf = requestAnimationFrame(() => {
    connectorRaf = null
    syncConnectorToIcon(el, index)
  })
}

window.addEventListener('mousemove', (e: MouseEvent) => {
  onPointerMove(e.clientX, e.clientY)
})

window.addEventListener('touchmove', (e: TouchEvent) => {
  if (dragState && e.touches.length > 0 && e.cancelable) e.preventDefault()
  onPointerMove(e.touches[0]?.clientX ?? 0, e.touches[0]?.clientY ?? 0)
}, { passive: false })

function snapBack() {
  if (!dragState) return
  const { el, committed } = dragState
  dragState = null
  el.classList.remove('dragging')
  if (committed) {
    el.style.position = ''
    el.style.left = ''
    el.style.top = ''
    el.style.transform = ''
    requestAnimationFrame(() => {
      updateAllConnectorsFromIcons()
    })
  }
}

window.addEventListener('mouseup', snapBack)
window.addEventListener('touchend', (e: TouchEvent) => {
  if (e.touches.length === 0) snapBack()
})
window.addEventListener('touchcancel', (e: TouchEvent) => {
  if (e.touches.length === 0) snapBack()
})
