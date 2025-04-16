import { waitForElement } from "./utils.ts";
import {
  createBookmarksSection,
  createBookmarkButton,
  createBookmarksList,
  createNewFolderButton,
} from "./components.ts";
import { BookmarkManager } from "./BookmarkManager.ts";

/**
 * Initialize the extension
 */
async function init(): Promise<void> {
  // Wait for the sidebar to be loaded
  const sidebarXPath =
    "/html/body/div[1]/div/div[1]/div[1]/div/div/div/nav/div[2]/div/div[2]";
  const sidebar = await waitForElement(sidebarXPath, true);

  // Create and append bookmarks section
  const bookmarksSection = createBookmarksSection();
  sidebar.appendChild(bookmarksSection);

  // Create and append bookmarks list
  const bookmarksList = createBookmarksList();
  bookmarksList.style.display = "none";
  sidebar.appendChild(bookmarksList);

  // Create and append new folder button
  const newFolderButton = createNewFolderButton();
  bookmarksList.appendChild(newFolderButton);

  // Initialize bookmark manager
  const bookmarkManager = new BookmarkManager();

  // Add new folder button event listener
  newFolderButton.addEventListener("click", () => {
    const folderName = prompt("Enter folder name:");
    if (folderName && folderName.trim()) {
      bookmarkManager.createFolder(folderName.trim());
      bookmarkManager.saveFolders();
    }
  });

  // Add toggle functionality
  const bookmarksButton = bookmarksSection.querySelector("button");
  if (bookmarksButton) {
    bookmarksButton.addEventListener("click", () => {
      bookmarksList.style.display =
        bookmarksList.style.display === "none" ? "block" : "none";
      const collapseIcon = bookmarksButton.querySelector(".collapse-icon");
      if (collapseIcon instanceof HTMLElement) {
        collapseIcon.style.transform =
          bookmarksList.style.display === "none"
            ? "rotate(0deg)"
            : "rotate(180deg)";
      }
    });
  }

  // Initialize navbar button
  async function initNavbarButton(): Promise<void> {
    const shareButton = await waitForElement("[aria-label='Open conversation options']");
    const navbar = shareButton?.parentElement;

    if (navbar && !navbar.querySelector(".add-bookmark-btn")) {
      const bookmarkButton = createBookmarkButton();
      navbar.appendChild(bookmarkButton);
      bookmarkButton.addEventListener("click", () => {
        bookmarkManager.addBookmark();
      });
    }
  }

  // Initialize navbar button and watch for URL changes
  await initNavbarButton();
  let lastUrl = window.location.href;

  const observer = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      initNavbarButton();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// Start the extension
init();
