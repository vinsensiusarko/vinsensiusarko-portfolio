export const EDITORIAL_EASE = [0.22, 1, 0.36, 1];

export const EDITORIAL_SPRING = {
  type: 'spring',
  visualDuration: 0.35,
  bounce: 0.12
};

export const TACTILE_SPRING = {
  type: 'spring',
  visualDuration: 0.22,
  bounce: 0.15
};

export const SCROLL_PROGRESS_SPRING = {
  stiffness: 260,
  damping: 32,
  restDelta: 0.001
};

export const PARALLAX_SPRING = {
  stiffness: 180,
  damping: 28,
  mass: 0.45
};

export const HERO_CONTAINER_VARIANTS = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.03
    }
  }
};

export const HERO_ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.36,
      ease: EDITORIAL_EASE
    }
  }
};

export const GALLERY_SLIDE_VARIANTS = {
  enter: (direction) => ({
    x: direction >= 0 ? 24 : -24,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.22,
      ease: EDITORIAL_EASE
    }
  },
  exit: (direction) => ({
    x: direction >= 0 ? -24 : 24,
    opacity: 0,
    transition: {
      duration: 0.16,
      ease: EDITORIAL_EASE
    }
  })
};
