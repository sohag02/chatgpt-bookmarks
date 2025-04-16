// Utility functions for DOM manipulation and element creation

/**
 * Waits for an element to be present in the DOM using XPath or querySelector
 * @param {string} selector - XPath string or CSS selector
 * @param {boolean} isXPath - Whether the selector is an XPath string
 * @returns {Promise<Element>} - The found DOM element
 */
export function waitForElement(
  selector: string,
  isXPath: boolean = false,
  timeout: number = 30000 // 30 seconds timeout
): Promise<Element> {
  return new Promise((resolve, reject) => {
    // Set a timeout to avoid waiting indefinitely
    const timeoutId = setTimeout(() => {
      clearInterval(checkInterval);
      reject(new Error(`Element not found: ${selector}`));
    }, timeout);

    const checkInterval = setInterval(() => {
      let element: Element | null;

      if (isXPath) {
        element = document.evaluate(
          selector,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue as Element;
      } else {
        element = document.querySelector(selector);
      }

      if (element) {
        clearInterval(checkInterval);
        clearTimeout(timeoutId);
        resolve(element);
      }
    }, 100);
  });
}

type ElementProps = {
  className?: string;
  innerHTML?: string;
  style?: Partial<CSSStyleDeclaration>;
  [key: string]: any;
};

/**
 * Creates a DOM element with specified attributes and properties
 * @param {string} tag - HTML tag name
 * @param {Object} props - Element properties and attributes
 * @returns {HTMLElement} - The created DOM element
 */
export function createElement(
  tag: string,
  props: ElementProps = {}
): HTMLElement {
  const element = document.createElement(tag);

  Object.entries(props).forEach(([key, value]) => {
    if (key === "className") {
      element.className = value;
    } else if (key === "innerHTML") {
      element.innerHTML = value;
    } else if (key === "style") {
      Object.assign(element.style, value);
    } else {
      element.setAttribute(key, value);
    }
  });

  return element;
}

type SVGProps = {
  width?: string;
  height?: string;
  viewBox?: string;
  fill?: string;
  [key: string]: any;
};

/**
 * Creates SVG element with specified attributes
 * @param {string} pathD - SVG path data
 * @param {Object} props - SVG element properties
 * @returns {SVGElement} - The created SVG element
 */
export function createSVGIcon(pathD: string, props: SVGProps = {}): SVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

  Object.entries({
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    ...props,
  }).forEach(([key, value]) => {
    svg.setAttribute(key, value);
  });

  path.setAttribute("d", pathD);
  path.setAttribute("stroke", "currentColor");
  path.setAttribute("stroke-width", "2");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");

  svg.appendChild(path);
  return svg;
}
