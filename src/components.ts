import { createElement, createSVGIcon } from "./utils.js";

/**
 * Interface for bookmark object
 */
export interface Bookmark {
  title: string;
  url: string;
  timestamp: string;
}

/**
 * Creates the bookmarks section component
 * @returns {HTMLElement} The bookmarks section element
 */
export function createBookmarksSection(): HTMLElement {
  return createElement("div", {
    className: "bookmarks-section",
    innerHTML: `
      <button data-testid="explore-gpts-button" class="flex w-full items-center gap-2.5 rounded-lg px-2 text-token-text-primary hover:bg-token-sidebar-surface-secondary h-9">
        <div class="flex h-6 w-6 items-center justify-center text-token-text-secondary">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M6.75 4.5C5.50736 4.5 4.5 5.50736 4.5 6.75C4.5 7.99264 5.50736 9 6.75 9C7.99264 9 9 7.99264 9 6.75C9 5.50736 7.99264 4.5 6.75 4.5ZM2.5 6.75C2.5 4.40279 4.40279 2.5 6.75 2.5C9.09721 2.5 11 4.40279 11 6.75C11 9.09721 9.09721 11 6.75 11C4.40279 11 2.5 9.09721 2.5 6.75Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M17.25 4.5C16.0074 4.5 15 5.50736 15 6.75C15 7.99264 16.0074 9 17.25 9C18.4926 9 19.5 7.99264 19.5 6.75C19.5 5.50736 18.4926 4.5 17.25 4.5ZM13 6.75C13 4.40279 14.9028 2.5 17.25 2.5C19.5972 2.5 21.5 4.40279 21.5 6.75C21.5 9.09721 19.5972 11 17.25 11C14.9028 11 13 9.09721 13 6.75Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M6.75 15C5.50736 15 4.5 16.0074 4.5 17.25C4.5 18.4926 5.50736 19.5 6.75 19.5C7.99264 19.5 9 18.4926 9 17.25C9 16.0074 7.99264 15 6.75 15ZM2.5 17.25C2.5 14.9028 4.40279 13 6.75 13C9.09721 13 11 14.9028 11 17.25C11 19.5972 9.09721 21.5 6.75 21.5C4.40279 21.5 2.5 19.5972 2.5 17.25Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M17.25 15C16.0074 15 15 16.0074 15 17.25C15 18.4926 16.0074 19.5 17.25 19.5C18.4926 19.5 19.5 18.4926 19.5 17.25C19.5 16.0074 18.4926 15 17.25 15ZM13 17.25C13 14.9028 14.9028 13 17.25 13C19.5972 13 21.5 14.9028 21.5 17.25C21.5 19.5972 19.5972 21.5 17.25 21.5C14.9028 21.5 13 19.5972 13 17.25Z" fill="currentColor"></path>
          </svg>
        </div>
        <span class="text-sm">Bookmarks</span>
        <svg class="collapse-icon ml-auto" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 9l-7 7-7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    `,
  });
}

/**
 * Creates the bookmark button component
 * @returns {HTMLElement} The bookmark button element
 */
export function createBookmarkButton(): HTMLElement {
  return createElement("button", {
    className: "add-bookmark-btn",
    innerHTML: `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 3H7C5.89543 3 5 3.89543 5 5V21L12 17.5L19 21V5C19 3.89543 18.1046 3 17 3Z" 
          stroke="currentColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"/>
      </svg>
      Add
    `,
  });
}

/**
 * Creates the bookmarks list component
 * @returns {HTMLElement} The bookmarks list element
 */
export function createBookmarksList(): HTMLElement {
  return createElement("div", {
    className: "bookmarks-list",
  });
}

/**
 * Creates a bookmark item component
 * @param {Bookmark} bookmark - The bookmark data
 * @param {number} index - The index of the bookmark
 * @returns {string} The bookmark item HTML
 */
export function createBookmarkItem(bookmark: Bookmark, index: number): string {
  return `
    <div class="bookmark-item">
      <a href="${bookmark.url}" class="bookmark-link">${bookmark.title}</a>
      <button class="remove-bookmark-btn" data-index="${index}" title="Remove bookmark">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
  `;
}
