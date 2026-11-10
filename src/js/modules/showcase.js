import { gsap, ScrollTrigger } from "../libs/gsap.js";
import { MEDIA_QUERIES, SELECTORS, STATE_CLASSES } from "../constants.js";
import { createWheel } from "./wheel.js";
import { animateSlideChange, showSlideImmediately } from "../animations/slide-transitions.js";

const SCROLL_TO_SLIDE_DURATION = 1;

function setupDesktopShowcase({ showcase, slides, wheelElement, prefersReducedMotion }) {
  const lastSlideIndex = slides.length - 1;
  let activeSlideIndex = -1;

  const wheel = createWheel(wheelElement, { onSelect: scrollToSlide });

  const scrollTrigger = ScrollTrigger.create({
    trigger: showcase,
    pin: true,
    anticipatePin: 1,
    start: "top top",
    end: () => `+=${window.innerHeight * lastSlideIndex}`,
    invalidateOnRefresh: true,
    snap: {
      snapTo: 1 / lastSlideIndex,
      duration: { min: 0.2, max: 0.6 },
      delay: 0.05,
      ease: "power1.inOut",
    },
    onUpdate: handleScrollUpdate,
  });

  function getScrollPositionOfSlide(slideIndex) {
    const scrollDistance = scrollTrigger.end - scrollTrigger.start;

    return scrollTrigger.start + (scrollDistance * slideIndex) / lastSlideIndex;
  }

  function scrollToSlide(slideIndex) {
    gsap.to(window, {
      scrollTo: { y: getScrollPositionOfSlide(slideIndex), autoKill: true },
      duration: prefersReducedMotion ? 0 : SCROLL_TO_SLIDE_DURATION,
      ease: "power2.inOut",
      overwrite: true,
    });
  }

  function activateSlide(nextSlideIndex, { direction = 1, immediate = false } = {}) {
    const previousSlide = slides[activeSlideIndex];
    const nextSlide = slides[nextSlideIndex];

    activeSlideIndex = nextSlideIndex;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle(STATE_CLASSES.active, slideIndex === nextSlideIndex);
    });

    wheel.highlight(nextSlideIndex);

    if (immediate || prefersReducedMotion || !previousSlide) {
      showSlideImmediately(slides, nextSlide);
      return;
    }

    animateSlideChange({ slides, previousSlide, nextSlide, direction });
  }

  function handleScrollUpdate({ progress, direction }) {
    const slidePosition = progress * lastSlideIndex;
    const nearestSlideIndex = Math.round(slidePosition);

    wheel.rotateTo(slidePosition, { immediate: prefersReducedMotion });

    if (nearestSlideIndex !== activeSlideIndex) {
      activateSlide(nearestSlideIndex, { direction });
    }
  }

  const initialSlidePosition = scrollTrigger.progress * lastSlideIndex;

  wheel.rotateTo(initialSlidePosition, { immediate: true });
  activateSlide(Math.round(initialSlidePosition), { immediate: true });

  return () => wheel.destroy();
}

export function initShowcase() {
  const showcase = document.querySelector(SELECTORS.showcase);

  if (!showcase) {
    return;
  }

  const slides = gsap.utils.toArray(SELECTORS.slide, showcase);
  const wheelElement = showcase.querySelector(SELECTORS.wheel);
  const mediaMatcher = gsap.matchMedia();

  mediaMatcher.add(
    {
      isDesktop: MEDIA_QUERIES.desktop,
      prefersReducedMotion: MEDIA_QUERIES.reducedMotion,
    },
    ({ conditions }) => {
      if (!conditions.isDesktop) {
        return undefined;
      }

      return setupDesktopShowcase({
        showcase,
        slides,
        wheelElement,
        prefersReducedMotion: conditions.prefersReducedMotion,
      });
    },
  );
}
