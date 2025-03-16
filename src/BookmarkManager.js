import { createBookmarkItem } from "./components";

/**
 * Class to manage bookmarks operations and storage
 */
export class BookmarkManager {
  constructor() {
    this.bookmarks = [];
    this.loadBookmarks();
  }

  /**
   * Load bookmarks from chrome storage
   */
  async loadBookmarks() {
    const result = await chrome.storage.local.get("chatgptBookmarks");
    this.bookmarks = result.chatgptBookmarks || [];
    this.renderBookmarks();
  }

  /**
   * Save bookmarks to chrome storage
   */
  async saveBookmarks() {
    await chrome.storage.local.set({ chatgptBookmarks: this.bookmarks });
    this.renderBookmarks();
  }

  /**
   * Add a new bookmark
   */
  async addBookmark() {
    const title = document.title.replace(" - ChatGPT", "");
    const url = window.location.href;
    const timestamp = new Date().toISOString();

    this.bookmarks.unshift({ title, url, timestamp });
    await this.saveBookmarks();
  }

  /**
   * Remove a bookmark by index
   * @param {number} index - The index of the bookmark to remove
   */
  async removeBookmark(index) {
    this.bookmarks.splice(index, 1);
    await this.saveBookmarks();
  }

  /**
   * Render bookmarks in the UI
   */
  renderBookmarks() {
    const bookmarksList = document.querySelector(".bookmarks-list");
    if (!bookmarksList) return;

    bookmarksList.innerHTML = this.bookmarks.length === 0
      ? '<div class="no-bookmarks">No bookmarks yet</div>'
      : this.bookmarks.map((bookmark, index) => 
          createBookmarkItem(bookmark, index)
        ).join("");

    // Add event listeners to remove buttons
    bookmarksList.querySelectorAll(".remove-bookmark-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const index = parseInt(btn.dataset.index);
        this.removeBookmark(index);
      });
    });
  }
}