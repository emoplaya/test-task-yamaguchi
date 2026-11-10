import { gsap } from "../libs/gsap.js";
import { SELECTORS, STATE_CLASSES } from "../constants.js";
import { getPositiveModulo } from "../utils/math.js";
import { getCssVariableAsNumber, setCssVariable } from "../utils/css.js";

const CELLS_COUNT_VARIABLE = "--wheel-cells-count";
const CELL_POSITION_VARIABLE = "--wheel-cell-position";
const ROTATION_VARIABLE = "--wheel-rotation";
const ROTATION_DURATION = 0.35;

function createDecorativeCopy(item) {
  const copy = item.cloneNode(true);

  copy.setAttribute("aria-hidden", "true");
  copy.querySelector(SELECTORS.wheelButton).tabIndex = -1;

  return copy;
}

export function createWheel(wheelElement, { onSelect }) {
  const list = wheelElement.querySelector(SELECTORS.wheelList);
  const originalItems = [...list.querySelectorAll(SELECTORS.wheelItem)];
  const slidesCount = originalItems.length;
  const cellsCount = getCssVariableAsNumber(wheelElement, CELLS_COUNT_VARIABLE);
  const halfOfCells = Math.floor(cellsCount / 2);
  const cells = [];

  for (let cellPosition = -halfOfCells; cellPosition <= halfOfCells; cellPosition += 1) {
    const slideIndex = getPositiveModulo(-cellPosition, slidesCount);
    const isOriginal = cellPosition <= 0 && cellPosition > -slidesCount;
    const originalItem = originalItems[slideIndex];
    const item = isOriginal ? originalItem : createDecorativeCopy(originalItem);

    setCssVariable(item, CELL_POSITION_VARIABLE, cellPosition);
    item.classList.remove(STATE_CLASSES.active);

    cells.push({
      item,
      button: item.querySelector(SELECTORS.wheelButton),
      cellPosition,
      isOriginal,
    });
  }

  list.replaceChildren(...cells.map(({ item }) => item));

  function rotateTo(slidePosition, { immediate = false } = {}) {
    gsap.to(wheelElement, {
      [ROTATION_VARIABLE]: slidePosition,
      duration: immediate ? 0 : ROTATION_DURATION,
      ease: "power2.out",
      overwrite: true,
    });
  }

  function highlight(activeSlideIndex) {
    cells.forEach(({ item, button, cellPosition }) => {
      const isActive = cellPosition + activeSlideIndex === 0;

      item.classList.toggle(STATE_CLASSES.active, isActive);

      if (isActive) {
        button.setAttribute("aria-current", "true");
      } else {
        button.removeAttribute("aria-current");
      }
    });
  }

  function handleClick(event) {
    const button = event.target.closest(SELECTORS.wheelButton);

    if (button) {
      onSelect(Number(button.dataset.slideTarget));
    }
  }

  function destroy() {
    wheelElement.removeEventListener("click", handleClick);

    cells.filter(({ isOriginal }) => !isOriginal).forEach(({ item }) => item.remove());

    originalItems.forEach((item, slideIndex) => {
      setCssVariable(item, CELL_POSITION_VARIABLE, -slideIndex);
    });
  }

  wheelElement.addEventListener("click", handleClick);

  return { rotateTo, highlight, destroy };
}
