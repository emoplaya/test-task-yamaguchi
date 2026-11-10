export function getCssVariableAsNumber(element, variableName) {
  return Number.parseFloat(getComputedStyle(element).getPropertyValue(variableName));
}

export function setCssVariable(element, variableName, value) {
  element.style.setProperty(variableName, value);
}
