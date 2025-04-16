import {
  createBookmarkItem,
  createFolderItem,
  createFolderSelector,
  type Bookmark,
  type Folder,
} from "./components.ts";
import { createElement } from "./utils.ts";

/**
 * Class to manage bookmarks operations and storage
 */
export class BookmarkManager {
  private bookmarks: Bookmark[];
  private folders: Folder[];

  constructor() {
    this.bookmarks = [];
    this.folders = [];
    this.loadData();
  }

  /**
   * Load bookmarks and folders from chrome storage
   */
  async loadData(): Promise<void> {
    const result = await chrome.storage.local.get([
      "chatgptBookmarks",
      "chatgptFolders",
    ]);
    this.bookmarks = result.chatgptBookmarks || [];
    this.folders = result.chatgptFolders || [];
    this.renderBookmarks();
    this.renderFolders();
  }

  /**
   * Save bookmarks to chrome storage
   */
  async saveBookmarks(): Promise<void> {
    await chrome.storage.local.set({ chatgptBookmarks: this.bookmarks });
    this.renderBookmarks();
  }

  /**
   * Save folders to chrome storage
   */
  async saveFolders(): Promise<void> {
    await chrome.storage.local.set({ chatgptFolders: this.folders });
    this.renderFolders();
  }

  /**
   * Generate a unique ID
   * @returns {string} Unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  /**
   * Add a new bookmark
   */
  async addBookmark(): Promise<void> {
    const title = document.title.replace(" - ChatGPT", "");
    const url = window.location.href;
    const timestamp = new Date().toISOString();

    // Ask user if they want to add to a folder
    if (this.folders.length > 0) {
      this.showFolderSelectionModal(title, url, timestamp);
    } else {
      this.bookmarks.unshift({ title, url, timestamp });
      await this.saveBookmarks();
    }
  }

  /**
   * Show folder selection modal for a new bookmark
   */
  private showFolderSelectionModal(
    title: string,
    url: string,
    timestamp: string
  ): void {
    // Create modal container
    const modal = createElement("div", {
      className: "bookmark-folder-modal",
    });

    // Create modal content
    const modalContent = createElement("div", {
      className: "bookmark-folder-modal-content",
    });

    // Add title
    const modalTitle = createElement("h3", {
      className: "modal-title",
      textContent: "Add Bookmark",
    });

    // Create folder selector
    const folderSelector = createFolderSelector(this.folders);

    // Create new folder button
    const newFolderSection = createElement("div", {
      className: "new-folder-section",
      style: { marginTop: "10px" },
    });

    const newFolderInput = createElement("input", {
      className: "new-folder-input",
      type: "text",
      placeholder: "New folder name",
    }) as HTMLInputElement;

    const createFolderBtn = createElement("button", {
      className: "create-folder-btn",
      textContent: "Create Folder",
    });

    createFolderBtn.addEventListener("click", () => {
      const folderName = newFolderInput.value.trim();
      if (folderName) {
        this.createFolder(folderName);
        this.saveFolders();

        // Update folder selector
        modal.removeChild(modalContent);
        this.showFolderSelectionModal(title, url, timestamp);
      }
    });

    newFolderSection.appendChild(newFolderInput);
    newFolderSection.appendChild(createFolderBtn);

    // Add buttons
    const buttonsContainer = createElement("div", {
      className: "modal-buttons",
    });

    const cancelButton = createElement("button", {
      className: "cancel-btn",
      textContent: "Cancel",
    });

    const addButton = createElement("button", {
      className: "add-btn",
      textContent: "Add Bookmark",
    });

    // Add event listeners
    cancelButton.addEventListener("click", () => {
      document.body.removeChild(modal);
    });

    addButton.addEventListener("click", async () => {
      const select = folderSelector.querySelector(
        "select"
      ) as HTMLSelectElement;
      const folderId = select?.value;

      this.bookmarks.unshift({
        title,
        url,
        timestamp,
        folderId: folderId || undefined,
      });

      await this.saveBookmarks();
      document.body.removeChild(modal);
    });

    // Assemble modal
    buttonsContainer.appendChild(cancelButton);
    buttonsContainer.appendChild(addButton);

    modalContent.appendChild(modalTitle);
    modalContent.appendChild(folderSelector);
    modalContent.appendChild(newFolderSection);
    modalContent.appendChild(buttonsContainer);

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Close modal when clicking outside
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }

  /**
   * Create a new folder
   * @param {string} name - The folder name
   * @returns {string} The new folder ID
   */
  createFolder(name: string): string {
    const id = this.generateId();
    const timestamp = new Date().toISOString();

    this.folders.push({ id, name, timestamp });
    return id;
  }

  /**
   * Remove a folder and update bookmarks
   * @param {string} folderId - The ID of the folder to remove
   */
  async removeFolder(folderId: string): Promise<void> {
    // Remove folder
    this.folders = this.folders.filter((folder) => folder.id !== folderId);

    // Update bookmarks (remove folder association)
    this.bookmarks = this.bookmarks.map((bookmark) => {
      if (bookmark.folderId === folderId) {
        const { folderId, ...rest } = bookmark;
        return rest;
      }
      return bookmark;
    });

    await Promise.all([this.saveFolders(), this.saveBookmarks()]);
  }

  /**
   * Move a bookmark to a folder
   * @param {number} index - The index of the bookmark to move
   * @param {string|undefined} folderId - The folder ID to move to (undefined to remove from folder)
   */
  async moveBookmarkToFolder(index: number, folderId?: string): Promise<void> {
    if (index < 0 || index >= this.bookmarks.length) return;

    if (folderId) {
      this.bookmarks[index].folderId = folderId;
    } else {
      delete this.bookmarks[index].folderId;
    }

    await this.saveBookmarks();
  }

  /**
   * Show folder selection modal for moving a bookmark
   * @param {number} bookmarkIndex - The index of the bookmark to move
   */
  showMoveToFolderModal(bookmarkIndex: number): void {
    const bookmark = this.bookmarks[bookmarkIndex];
    if (!bookmark) return;

    // Create modal container
    const modal = createElement("div", {
      className: "bookmark-folder-modal",
    });

    // Create modal content
    const modalContent = createElement("div", {
      className: "bookmark-folder-modal-content",
    });

    // Add title
    const modalTitle = createElement("h3", {
      className: "modal-title",
      textContent: "Move Bookmark to Folder",
    });

    // Create folder selector
    const folderSelector = createFolderSelector(
      this.folders,
      bookmark.folderId
    );

    // Create new folder button
    const newFolderSection = createElement("div", {
      className: "new-folder-section",
      style: { marginTop: "10px" },
    });

    const newFolderInput = createElement("input", {
      className: "new-folder-input",
      type: "text",
      placeholder: "New folder name",
    }) as HTMLInputElement;

    const createFolderBtn = createElement("button", {
      className: "create-folder-btn",
      textContent: "Create Folder",
    });

    createFolderBtn.addEventListener("click", () => {
      const folderName = newFolderInput.value.trim();
      if (folderName) {
        this.createFolder(folderName);
        this.saveFolders();

        // Update folder selector
        modal.removeChild(modalContent);
        this.showMoveToFolderModal(bookmarkIndex);
      }
    });

    newFolderSection.appendChild(newFolderInput);
    newFolderSection.appendChild(createFolderBtn);

    // Add buttons
    const buttonsContainer = createElement("div", {
      className: "modal-buttons",
    });

    const cancelButton = createElement("button", {
      className: "cancel-btn",
      textContent: "Cancel",
    });

    const moveButton = createElement("button", {
      className: "move-btn",
      textContent: "Move Bookmark",
    });

    // Add event listeners
    cancelButton.addEventListener("click", () => {
      document.body.removeChild(modal);
    });

    moveButton.addEventListener("click", async () => {
      const select = folderSelector.querySelector(
        "select"
      ) as HTMLSelectElement;
      const folderId = select?.value;

      await this.moveBookmarkToFolder(bookmarkIndex, folderId || undefined);
      document.body.removeChild(modal);
    });

    // Assemble modal
    buttonsContainer.appendChild(cancelButton);
    buttonsContainer.appendChild(moveButton);

    modalContent.appendChild(modalTitle);
    modalContent.appendChild(folderSelector);
    modalContent.appendChild(newFolderSection);
    modalContent.appendChild(buttonsContainer);

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Close modal when clicking outside
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }

  /**
   * Remove a bookmark by index
   * @param {number} index - The index of the bookmark to remove
   */
  async removeBookmark(index: number): Promise<void> {
    this.bookmarks.splice(index, 1);
    await this.saveBookmarks();
  }

  /**
   * Render folders in the UI
   */
  renderFolders(): void {
    const bookmarksList = document.querySelector(".bookmarks-list");
    if (!bookmarksList) return;

    // Clear existing folders
    bookmarksList
      .querySelectorAll(".folder-item")
      .forEach((item) => item.remove());

    // Render folders at the top
    const foldersHtml = this.folders
      .map((folder) => createFolderItem(folder))
      .join("");

    // Get the first child to insert before (to put folders at top)
    const firstChild = bookmarksList.firstChild;

    // Create a temporary container
    const temp = document.createElement("div");
    temp.innerHTML = foldersHtml;

    // Insert all nodes
    while (temp.firstChild) {
      bookmarksList.insertBefore(temp.firstChild, firstChild);
    }

    // Add event listeners to folder buttons
    bookmarksList.querySelectorAll(".toggle-folder-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const folderItem = (btn as HTMLElement).closest(".folder-item");
        const folderContent = folderItem?.querySelector(".folder-content");
        const collapseIcon = (btn as HTMLElement).querySelector(
          ".folder-toggle-icon"
        );

        if (folderContent instanceof HTMLElement) {
          const isVisible = folderContent.style.display !== "none";
          folderContent.style.display = isVisible ? "none" : "block";

          if (collapseIcon instanceof HTMLElement) {
            collapseIcon.style.transform = isVisible
              ? "rotate(0deg)"
              : "rotate(180deg)";
          }
        }
      });
    });

    bookmarksList.querySelectorAll(".remove-folder-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const folderId = (btn as HTMLElement).dataset.folderId;
        if (folderId) {
          this.removeFolder(folderId);
        }
      });
    });

    // Populate folder contents
    this.folders.forEach((folder) => {
      const folderContent = bookmarksList.querySelector(
        `.folder-content[data-folder-id="${folder.id}"]`
      );
      if (!folderContent) return;

      const folderBookmarks = this.bookmarks.filter(
        (b) => b.folderId === folder.id
      );

      folderContent.innerHTML =
        folderBookmarks.length === 0
          ? '<div class="no-bookmarks-in-folder">No bookmarks in this folder</div>'
          : folderBookmarks
              .map((bookmark, globalIndex) => {
                const index = this.bookmarks.findIndex((b) => b === bookmark);
                return createBookmarkItem(bookmark, index, true);
              })
              .join("");

      // Add event listeners to bookmark remove buttons in folders
      folderContent.querySelectorAll(".remove-bookmark-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          const index = parseInt((btn as HTMLElement).dataset.index || "0");
          this.removeBookmark(index);
        });
      });
    });
  }

  /**
   * Render bookmarks in the UI
   */
  renderBookmarks(): void {
    const bookmarksList = document.querySelector(".bookmarks-list");
    if (!bookmarksList) return;

    // Get all bookmarks that are not in folders
    const unfolderedBookmarks = this.bookmarks.filter(
      (bookmark) => !bookmark.folderId
    );

    // Add "No bookmarks" message if both unfolderedBookmarks and folders are empty
    if (unfolderedBookmarks.length === 0 && this.folders.length === 0) {
      bookmarksList.innerHTML =
        '<div class="no-bookmarks">No bookmarks yet</div>';
      return;
    }

    // Create HTML for unfolderedBookmarks
    const unfolderedHtml = unfolderedBookmarks
      .map((bookmark, index) => {
        const globalIndex = this.bookmarks.findIndex((b) => b === bookmark);
        return createBookmarkItem(bookmark, globalIndex);
      })
      .join("");

    // Set the HTML for unfolderedBookmarks
    // This keeps folders intact while replacing only the unfolderedBookmarks
    const elements = Array.from(bookmarksList.children);

    // Remove any existing unfolderedBookmarks (elements without folder-item class)
    elements.forEach((element) => {
      if (
        !element.classList.contains("folder-item") &&
        !element.classList.contains("no-bookmarks")
      ) {
        bookmarksList.removeChild(element);
      }
    });

    // Remove no-bookmarks message if it exists
    const noBookmarksElement = bookmarksList.querySelector(".no-bookmarks");
    if (noBookmarksElement) {
      bookmarksList.removeChild(noBookmarksElement);
    }

    // Append unfolderedBookmarks at the end
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = unfolderedHtml;

    while (tempDiv.firstChild) {
      bookmarksList.appendChild(tempDiv.firstChild);
    }

    // Add event listeners to bookmarks
    document.querySelectorAll(".bookmark-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const url = (e.target as HTMLAnchorElement).href;
        history.pushState(null, "", url);
        window.dispatchEvent(new PopStateEvent("popstate"));
      });
    });

    // Add event listeners to remove buttons
    bookmarksList.querySelectorAll(".remove-bookmark-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const index = parseInt((btn as HTMLElement).dataset.index || "0");
        this.removeBookmark(index);
      });
    });

    // Add event listeners to move buttons
    bookmarksList.querySelectorAll(".move-bookmark-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const index = parseInt((btn as HTMLElement).dataset.index || "0");
        this.showMoveToFolderModal(index);
      });
    });

    // Render folders and their contents
    this.renderFolders();
  }
}
