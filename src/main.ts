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
