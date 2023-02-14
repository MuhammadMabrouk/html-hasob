export default {
  data() {
    return {
      // popup windows flags
      isEmailWindowOpen: false,
      isTicTacToeWindowOpen: false,
      isMemoryCardWindowOpen: false,
      isSnakeWindowOpen: false,

      // popup windows icons
      emailIcon: `<img src="assets/images/desktop/email.svg" alt="email" draggable="false">`,

      // text viewer windows array
      textViewerWindows: [],

      // store file explorer directory state
      fileExplorerDir: {},

      // desktop items array
      desktopItems: null,
    };
  },
  mounted() {
    // get desktop data
    this.getDesktopData();

    if (window.innerWidth >= this.smallDevicesBreakpoint) {
      // create draggable elements (for windows)
      this.createDraggableElements();
    }
  },
  destroyed() {
    document.removeEventListener("keydown", this.snakeBodyMovement);
    this.snakeBoardEl.removeEventListener("touchmove", this.snakeBodyMovement);
  },
  methods: {
    /* popup windows functions *
    ***************************/
    // check if it's the proper event
    isProperEvent(e) {
      if (window.innerWidth >= this.smallDevicesBreakpoint) {
        return e.type == "click" ? true : false;
      } else {
        return e.type == "dblclick" ? true : false;
      }
    },

    // get desktop data
    getDesktopData() {
      // start loading spinner
      this.startLoading();

      fetch(this.appOpts.urlDesktopItems, { method: "GET" })
        .then(res => res.json())
        .then(data => {
          this.desktopItems = data.desktop;

          // end loading spinner
          this.endLoading();
        })
        .catch(err => console.log(err));
    },

    // open desktop window
    openDesktopWindow(e) {
      // check if it's the proper event
      if (this.isProperEvent(e)) { return; }

      const id = e.currentTarget.dataset.winId.replace("Window", "");
      const item = this.desktopItems.find(obj => obj.id === id);

      if (item.hasOwnProperty("body")) {
        item.isWindowOpen = true;

        // add new text viewer window
        if (item.type === "text-file") {
          const id = `${item.id}Window`;
          const title = item.body.title[document.documentElement.lang];
          const content = item.body.content[document.documentElement.lang];
          this.textViewerAddWindow({ id, title, content });
        }

      } else {
        // get desktop window data
        this.getDesktopWindowData(item);
      }

      // add taskbar icon
      this.taskbarAppsAddIcon(e);
    },

    // get desktop window data
    getDesktopWindowData(item) {
      // start loading spinner
      this.startLoading();

      fetch(item.url, { method: "GET" })
        .then(res => res.json())
        .then(data => {
          item.body = data[item.id];
          item.isWindowOpen = true;

          if (item.type === "file-explorer") {
            // init file explorer directory
            this.fileExplorerInitDir(item.id);

          } else if (item.type === "text-file") {

            // add new text viewer window
            const id = `${item.id}Window`;
            const title = item.body.title[document.documentElement.lang];
            const content = item.body.content[document.documentElement.lang];
            this.textViewerAddWindow({ id, title, content });
          }

          // end loading spinner
          this.endLoading();
        })
        .catch(err => console.log(err));
    },

    // initialize file explorer directory
    fileExplorerInitDir(id) {
      this.fileExplorerDir[id] = {
        index: 0,
        current: { id: "root", title: null },
        folders: [{ id: "root", title: null }],
        tree: [],
      };
    },

    // on click on file explorer item
    fileExplorerItemClick(e, item) {
      // check if it's the proper event
      if (this.isProperEvent(e)) { return; }

      const el = e.currentTarget;
      const id = el.closest(".appsWindow").id.replace("Window", "");

      if (item.kind === "folder") {
        const dirObj = this.fileExplorerDir[id];
        const targetFolder = { id: item.id, title: item.title[document.documentElement.lang] };

        dirObj.current = targetFolder;
        dirObj.tree.push(item.id);
        dirObj.index++;

        // check if this index exists
        if (!!dirObj.folders[dirObj.index]) {
          if (dirObj.folders[dirObj.index].id !== item.id) {
            dirObj.folders[dirObj.index] = targetFolder;
            dirObj.folders.length = dirObj.index +1;
          }
        } else {
          dirObj.folders.push(targetFolder);
        }

      } else if (item.kind === "file") {
        if (item.type === "image" || item.type === "video") {
          let startAt;
          const gallery = el.dataset.gallery;
          const parent = el.parentElement;
          const siblings = [...parent.children].filter(sib => sib.dataset.gallery === gallery);
          const elements = siblings.map((sib, index) => {
            sib === el && (startAt = index);
            return {
              href: sib.dataset.href,
              type: sib.dataset.type,
              title: sib.title,
            };
          });

          // initialize the glightbox
          const lightbox = new GLightbox({ elements, startAt });

          // open the glightbox
          lightbox.open();
        }

        if (item.type === "webpage") {
          const a = document.createElement("a");
          a.href = item.url;
          a.target = "_blank";
          a.click();
        }

        if (item.type === "text") {
          const id = el.querySelector("template .win-id").innerHTML;
          const title = el.querySelector("template .win-title").innerHTML;
          const content = el.querySelector("template .win-content").innerHTML;

          // add new text viewer window
          this.textViewerAddWindow({ id, title, content });

          // add taskbar icon
          this.taskbarAppsAddIcon(e);
        }
      }
    },

    // file explorer move folder backward/forward
    fileExplorerMoveFolder(id, direction) {
      const dirObj = this.fileExplorerDir[id];
      const currentIndex = dirObj.folders.findIndex(folder => folder.id === dirObj.current.id);
      const targetFolder = dirObj.folders[currentIndex + direction];

      if (targetFolder) {
        if (direction === -1) {
          if (dirObj.index === 0) { return; }

          dirObj.index--;
          dirObj.current = { id: targetFolder.id, title: targetFolder.title };

          // remove last folder
          dirObj.tree.pop();

        } else if (direction === 1) {
          if (dirObj.index === dirObj.folders.length -1) { return; }

          dirObj.index++;
          dirObj.current = { id: targetFolder.id, title: targetFolder.title };
  
          // readd last folder
          dirObj.tree.push(targetFolder.id);
        }
      }
    },

    // file explorer change the view
    fileExplorerChangeView(e, view) {
      const el = e.currentTarget;
      const fileExplorer = el.closest(".fileExplorer");
      const FEWorkspace = fileExplorer.querySelector(".fileExplorer__workspace");
      const viewBtns = fileExplorer.querySelectorAll(".fileExplorer__footer button");

      FEWorkspace.dataset.view = view;

      viewBtns.forEach(btn => btn.classList.contains("active") && btn.classList.remove("active"));
      el.classList.add("active")
    },

    // open email window
    openEmailWindow(e, isDoubleClick = false) {
      if (isDoubleClick) {
        // check if it's the proper event
        if (this.isProperEvent(e)) { return; }
      }

      // clear previous data
      const contactForm = document.querySelector("#contactForm");
      contactForm.reset();

      this.isEmailWindowOpen = true;

      // add taskbar icon
      this.taskbarAppsAddIcon(e);

      // close start menu popup
      this.isStartMenuPopupOpen && this.closeStartMenuPopup();
    },

    // open tic tac toe game window
    openTicTacToeWindow(e, isDoubleClick = false) {
      if (isDoubleClick) {
        // check if it's the proper event
        if (this.isProperEvent(e)) { return; }
      }

      this.isTicTacToeWindowOpen = true;

      // get window dimensions
      this.getWindowDimensions(e);

      // add taskbar icon
      this.taskbarAppsAddIcon(e);

      // close start menu popup
      this.isStartMenuPopupOpen && this.closeStartMenuPopup();
    },

    // open memory card game window
    openMemoryCardWindow(e, isDoubleClick = false) {
      if (isDoubleClick) {
        // check if it's the proper event
        if (this.isProperEvent(e)) { return; }
      }

      // sort the cards array randomly
      this.memoryCardSortRandomly();

      this.isMemoryCardWindowOpen = true;

      // get window dimensions
      this.getWindowDimensions(e);

      // add taskbar icon
      this.taskbarAppsAddIcon(e);

      // close start menu popup
      this.isStartMenuPopupOpen && this.closeStartMenuPopup();
    },

    // open snake game window
    openSnakeWindow(e, isDoubleClick = false) {
      if (isDoubleClick) {
        // check if it's the proper event
        if (this.isProperEvent(e)) { return; }
      }

      this.isSnakeWindowOpen = true;

      // get window dimensions
      this.getWindowDimensions(e);

      // add taskbar icon
      this.taskbarAppsAddIcon(e);

      // snake get grid columns/rows count
      this.snakeGetGridCounts();

      // start snake game
      this.snakeGameRestart();

      // manage snake body movement
      document.addEventListener("keydown", this.snakeBodyMovement);
      this.snakeBoardEl.addEventListener("touchmove", this.snakeBodyMovement);

      setTimeout(() => {
        let msg;

        if (window.innerWidth >= this.smallDevicesBreakpoint) {
          msg = this.snakeBoardEl.dataset.gameStartMsg;
        } else {
          msg = this.snakeBoardEl.dataset.gameStartTouchMsg;
        }

        // show game start message
        this.setNotification({
          id: 'snakeGameStartMsg',
          msg,
          icon: this.snakeGameIcon,
        });
      }, this.globalDelay);

      // close start menu popup
      this.isStartMenuPopupOpen && this.closeStartMenuPopup();
    },

    // get window dimensions
    getWindowDimensions(e) {
      const id = e.currentTarget.dataset.winId;
      const winEl = document.getElementById(id);
      const gameContainer = winEl.querySelector(`.${id}__content`);
      const gameControls = winEl.querySelector(`.${id}__controls`);
      const gameControlsHeight = gameControls.offsetHeight + parseInt(getComputedStyle(gameControls).marginBottom);
      const gameBoardHeight = `${Math.min((gameContainer.offsetHeight - gameControlsHeight), gameContainer.offsetWidth)}px`;

      gameContainer.style.setProperty("--content-size", gameBoardHeight);
    },

    // add new text viewer window
    textViewerAddWindow({ id, title, content }) {
      if (this.textViewerWindows.some(w => w.id === id)) {
        document.getElementById(id).classList.add("appsWindow__open");
      } else {
        this.textViewerWindows.push({ id, title, content });
      }
    },

    // remove text viewer window
    textViewerRemoveWindow(id) {
      const index = this.textViewerWindows.findIndex(w => w.id === id);
      index > -1 && this.textViewerWindows.splice(index, 1);

      // remove from taskbar apps
      this.taskbarAppsRemoveIcon(id);
    },

    // minimize text viewer window
    textViewerMinimizeWindow(id) {
      document.getElementById(id).classList.remove("appsWindow__open");
    },

    // maximize running window
    maximizeWindow(e) {
      const el = e.target;
      const appWindow = el.closest(".appsWindow");
      const appWindowClasses = appWindow.classList;

      if (appWindowClasses.contains("appsWindow__maximized")) {
        appWindowClasses.remove("appsWindow__maximized");
      } else {
        appWindowClasses.add("appsWindow__maximized");
      }
    },

    // close running window
    closeWindow(e, minimize = false) {
      const el = e.currentTarget;
      const id = el.closest(".appsWindow").id;
      const item = this.desktopItems.find(obj => obj.id === id.replace("Window", ""));

      if (item) {
        item.isWindowOpen = false;
      } else {
        const winFlag = `is${id.charAt(0).toUpperCase()}${id.slice(1)}Open`;
        this[winFlag] = false;
      }

      if (minimize) {
        // cancel the animation frame
        this.snakeGameLoopStop();
      } else {
        // close & remove from taskbar apps
        this.taskbarAppsRemoveIcon(id);

        if (id === "snakeWindow") {
          // remove listeners
          document.removeEventListener("keydown", this.snakeBodyMovement);
          this.snakeBoardEl.removeEventListener("touchmove", this.snakeBodyMovement);

          // cancel the animation frame
          this.snakeGameLoopStop();
        }
      }
    },

    // toggle running window
    toggleWindow(e, closeBgAppsPopup = false) {
      const el = e.currentTarget;
      const id = el.dataset.winId.replace("Window", "");
      const item = this.desktopItems.find(obj => obj.id === id);
      const winEl = document.getElementById(`${id}Window`);
      const winClasses = winEl.classList;

      if (winClasses.contains("textViewerWindow")) {
        winClasses.contains("appsWindow__open") ? winClasses.remove("appsWindow__open") : winClasses.add("appsWindow__open");
      } else {
        if (item) {
          item.isWindowOpen = !item.isWindowOpen;
        } else {
          const winFlag = `is${id.charAt(0).toUpperCase()}${id.slice(1)}WindowOpen`;
          this[winFlag] = !this[winFlag];

          if (id === "snake") {
            this[winFlag] ? this.snakeGameLoopStart() : this.snakeGameLoopStop();
          }
        }
      }

      closeBgAppsPopup && this.closeBgAppsPopup();

      // set focus on the window
      setTimeout(() => winEl.focus(), this.globalDelay);
    },

    // close all background windows
    closeAllBgApps(e) {
      e.stopPropagation();

      this.taskbarApps = [];
    },

    // create draggable elements
    createDraggableElements() {
      let target = null;
      let x;
      let y;
      const mouseDownHandler = (e) => {
        let clickedDragger = false;

        for (var i = 0; e.composedPath()[i] !== document.body; i++) {
          if (e.composedPath()[i].classList?.contains("dragger")) {
            clickedDragger = true;
          } else if (clickedDragger && e.composedPath()[i].classList?.contains("draggable")) {
            target = e.composedPath()[i];
            let tgtRect = target.getBoundingClientRect();
            x = (e.clientX || e.touches[0].clientX) - tgtRect.left;
            y = (e.clientY || e.touches[0].clientY) - tgtRect.top;

            target.classList.add("dragging");
            target.style.right = "initial";
            target.style.left = (e.clientX || e.touches[0].clientX) - x + "px";
            target.style.top = (e.clientY || e.touches[0].clientY) - y + "px";

            return;
          }
        }
      }
      const mouseUpHandler = () => {
        if (target !== null) {
          target.classList.remove("dragging");
          target = null;
        }
      }
      const mouseMoveHandler = (e) => {
        if (target === null) { return; }

        target.style.left = (e.clientX || e.touches[0].clientX) - x + "px";
        target.style.top = (e.clientY || e.touches[0].clientY) - y + "px";

        let pRect = target.parentElement.getBoundingClientRect();
        let tgtRect = target.getBoundingClientRect();

        if (tgtRect.left < pRect.left) {
          target.style.left = 0;
        }
        if (tgtRect.top < pRect.top) {
          target.style.top = 0;
        }
        if (tgtRect.right > pRect.right) {
          target.style.left = pRect.width - tgtRect.width + "px";
        }
        if (tgtRect.bottom > pRect.bottom) {
          target.style.top = pRect.height - tgtRect.height + "px";
        }
      }

      document.addEventListener("mousedown", mouseDownHandler);
      document.addEventListener("touchstart", mouseDownHandler);

      document.addEventListener("mouseup", mouseUpHandler);
      document.addEventListener("touchend", mouseUpHandler);

      document.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("touchmove", mouseMoveHandler);
    },

    // taskbar apps add icon
    taskbarAppsAddIcon(e) {
      const el = e.currentTarget;
      const id = el.dataset.winId || el.querySelector("template .win-id").innerHTML;
      const icon = el.querySelector(".window__icon").innerHTML;
      const title = el.querySelector(".window__title").innerHTML;

      !this.taskbarApps.some(e => e.id === id) && this.taskbarApps.push({ id, title, icon });

      // set focus on the window
      setTimeout(() => document.getElementById(id).focus(), this.globalDelay);
    },

    // taskbar apps remove icon
    taskbarAppsRemoveIcon(id) {
      const index = this.taskbarApps.findIndex(app => app.id === id);
      index > -1 && this.taskbarApps.splice(index, 1);
    },

    // taskbar apps focusin
    taskbarAppsFocusin(e) {
      const el = e.currentTarget;
      document.querySelector(`.taskbar__mainBtn[data-win-id=${el.id}]`)?.classList.add("active");
    },

    // taskbar apps focusout
    taskbarAppsFocusout(e) {
      const el = e.currentTarget;
      document.querySelector(`.taskbar__mainBtn[data-win-id=${el.id}]`)?.classList.remove("active");
    },
  },
  computed: {
    // filtered file explorer items
    fileExplorerItems() {
      return (id, items) => {
        if (!items) { return []; }

        let targetFolder;
        this.fileExplorerDir[id].tree.forEach(item => {
          targetFolder = (targetFolder?.files || items).find(file => file.id === item);
        });
        const targetFiles = targetFolder?.files || items;
        const filesLength = targetFiles.length;

        const winEl = document.getElementById(`${id}Window`);
        const countEl = winEl.querySelector(".fileExplorer__footer__items .count");
        countEl.textContent = filesLength;

        return targetFiles;
      }
    },

    // clock widget
    clockWidget() {
      if (window.innerWidth >= this.smallDevicesBreakpoint) { return; }

      if (this.clockWidgetTime && this.clockWidgetDate) {
        const clock = this.appSettings?.hourFormat == "hour12" ? this.clockWidgetTime.split(" ") : [this.clockWidgetTime];
        const date = this.clockWidgetDate.split(", ");

        return {
          time: clock[0],
          ampm: clock[1] || false,
          weekday: date[0],
          date: date[1],
        };
      }
    },
  },
};
