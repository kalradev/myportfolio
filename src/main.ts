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
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
)
revealEls.forEach((el) => revealObserver.observe(el))

// ----- Hero: show immediately on load -----
const hero = document.querySelector('.hero')
if (hero) {
  hero.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'))
}

// ----- Header scroll state -----
const header = document.querySelector('.header')
const scrollProgress = document.querySelector('.scroll-progress') as HTMLElement

function onScroll() {
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
}

window.addEventListener('scroll', onScroll, { passive: true })
onScroll()

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

// ----- Active nav link based on scroll position -----
const sections = document.querySelectorAll('section[id]')
const navLinks = document.querySelectorAll('.nav-link')

function setActiveNav() {
  const y = window.scrollY + 120
  let current = ''
  sections.forEach((section) => {
    const id = section.getAttribute('id')
    const top = (section as HTMLElement).offsetTop
    const height = (section as HTMLElement).offsetHeight
    if (y >= top && y < top + height) current = id || ''
  })
  navLinks.forEach((link) => {
    const href = (link as HTMLAnchorElement).getAttribute('href')?.slice(1)
    link.classList.toggle('active', href === current)
  })
}

window.addEventListener('scroll', setActiveNav, { passive: true })
window.addEventListener('load', setActiveNav)
