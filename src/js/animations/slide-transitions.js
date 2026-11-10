import { gsap } from "../libs/gsap.js";

const PREVIOUS_SLIDE_OFFSET_PERCENT = 35;
const NEXT_SLIDE_OFFSET_PERCENT = 130;
const HIDDEN_SLIDE_SCALE = 0.9;

export function showSlideImmediately(slides, visibleSlide) {
  gsap.killTweensOf(slides);
  gsap.set(slides, { autoAlpha: 0, yPercent: 0, scale: 1 });
  gsap.set(visibleSlide, { autoAlpha: 1 });
}

export function animateSlideChange({ slides, previousSlide, nextSlide, direction }) {
  const directionSign = direction >= 0 ? 1 : -1;
  const otherSlides = slides.filter((slide) => slide !== previousSlide && slide !== nextSlide);

  gsap.killTweensOf(slides);

  if (otherSlides.length > 0) {
    gsap.set(otherSlides, { autoAlpha: 0 });
  }

  gsap.to(previousSlide, {
    yPercent: -PREVIOUS_SLIDE_OFFSET_PERCENT * directionSign,
    scale: HIDDEN_SLIDE_SCALE,
    autoAlpha: 0,
    duration: 0.6,
    ease: "power2.in",
  });

  gsap.fromTo(
    nextSlide,
    {
      yPercent: NEXT_SLIDE_OFFSET_PERCENT * directionSign,
      scale: HIDDEN_SLIDE_SCALE,
      autoAlpha: 1,
    },
    {
      yPercent: 0,
      scale: 1,
      duration: 0.9,
      delay: 0.1,
      ease: "power3.out",
    },
  );
}
