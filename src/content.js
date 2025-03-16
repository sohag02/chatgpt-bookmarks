import { waitForElement } from './utils.js';
import { createBookmarksSection, createBookmarkButton, createBookmarksList } from './components.js';
import { BookmarkManager } from './BookmarkManager.js';

/**
 * Initialize the extension
 */
async function init() {
  // Wait for the sidebar to be loaded
  const sidebarXPath = "/html/body/div[1]/div/div[1]/div[1]/div/div/div/nav/div[2]/div/div[2]";
  const sidebar = await waitForElement(sidebarXPath, true);
  console.log('sidebar', sidebar);

  // Create and append bookmarks section
  const bookmarksSection = createBookmarksSection();
  sidebar.appendChild(bookmarksSection);
  
  // Create and append bookmarks list
  const bookmarksList = createBookmarksList();
  bookmarksList.style.display = 'none';
  sidebar.appendChild(bookmarksList);
  
  // Add toggle functionality
  const bookmarksButton = bookmarksSection.querySelector('button');
  bookmarksButton.addEventListener('click', () => {
    bookmarksList.style.display = bookmarksList.style.display === 'none' ? 'block' : 'none';
    const collapseIcon = bookmarksButton.querySelector('.collapse-icon');
    collapseIcon.style.transform = bookmarksList.style.display === 'none' ? 'rotate(0deg)' : 'rotate(180deg)';
  });

  // Initialize bookmark manager
  const bookmarkManager = new BookmarkManager();

  // Initialize navbar button
  async function initNavbarButton() {
    const shareButton = await waitForElement("[aria-label='Share']");
    const navbar = shareButton?.parentElement;
    
    if (navbar && !navbar.querySelector('.add-bookmark-btn')) {
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
    subtree: true
  });
}

// Start the extension
init();