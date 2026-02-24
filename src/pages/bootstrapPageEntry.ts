import { type ComponentType, createElement } from "react";
import { createRoot } from "react-dom/client";

const DEFAULT_CONTAINER_SELECTORS = ["#divMain", "#main", "main"];

const getContainer = () => {
  for (const selector of DEFAULT_CONTAINER_SELECTORS) {
    const element = document.querySelector(selector);
    if (element instanceof HTMLElement) {
      return element;
    }
  }

  return null;
};

export const bootstrapPageEntry = (
  mountId: string,
  PageComponent: ComponentType,
) => {
  const container = getContainer();
  if (!container) {
    return;
  }

  let mountNode = document.getElementById(mountId);
  if (!(mountNode instanceof HTMLElement)) {
    mountNode = document.createElement("div");
    mountNode.id = mountId;
    mountNode.style.display = "contents";
    mountNode.setAttribute("aria-hidden", "true");
    container.appendChild(mountNode);
  }

  createRoot(mountNode).render(createElement(PageComponent));
};
