// main vue app
// ------------
import soundsMixin from "./app-sounds.mixin";
import settingsMixin from "./app-settings.mixin";
import formsMixin from "./forms.mixin";
import desktopMixin from "../components/desktop/desktop.mixin";
import taskbarMixin from "../components/taskbar/taskbar.mixin";
import startMenuMixin from "../components/taskbar/start-menu/start-menu.mixin";
import gamesMixin from "../components/taskbar/start-menu/games/games.mixin";
import calendarMixin from "../components/taskbar/calendar/calendar.mixin";

import VueClickAway from "vue3-click-away";

const app = Vue.createApp({
  mixins: [
    soundsMixin,
    settingsMixin,
    formsMixin,
    desktopMixin,
    taskbarMixin,
    startMenuMixin,
    gamesMixin,
    calendarMixin
  ],
  data() {
    return {
      globalDelay: 200,
      smallDevicesBreakpoint: 992,

      // flag to toggle the preloader
      isAppLoading: true,

      // flag to toggle the login screen
      isLoggedOut: false,

      // flag to toggle focus style class
      isAnyFocus: false,

      // toast notifications list
      frontNotifications: [],
      backNotifications: [],

      // manage loading spinner status
      ajaxLoading: [],

      // confirm window
      confirm: {
        title: "",
        msg: "",
        okText: "",
        cancelText: "",
        onOk: () => {},
        onCancel: this.closeConfirmWindow,
      },

      // store touch swipe direction
      touchSwipeDir: null,
    };
  },
  created() {},
  mounted() {
    // detect touch swipe direction
    this.detectTouchSwipeDir();

    if (window.innerWidth >= this.smallDevicesBreakpoint) {
      // initialize cursor loading
      this.initCursorLoading();
    }

    window.addEventListener("load", () => {
      // hide the preloader screen after loading
      this.isAppLoading = false;

      // show welcome message
      setTimeout(() => {
        this.setNotification({
          id: "welcomeMsg",
          msg: this.appOpts?.welcomeMsg,
          icon: `<img src="${this.appOpts?.userPicture}" alt="user" draggable="false">`,
        });
      }, this.globalDelay);
    });
  },
  methods: {
    // initialize cursor loading
    initCursorLoading() {
      const loading = document.querySelector(".cursor-loading");

      // return if disabled
      if (!loading) { return; }

      // make the loading follow the cursor
      document.addEventListener("mousemove", (e) => {
        loading.style.setProperty("top", `${e.clientY}px`);
        loading.style.setProperty("left", `${e.clientX}px`);
      });
    },

    // show messages by toast notifications
    setNotification({ id, className, icon, msg }) {
      const notify = {
        id: id || `${Date.now()}${this.frontNotifications.length}`,
        msg,
        ...(className && { className }),
        ...(icon && { icon }),
      };

      if (id) {
        !this.frontNotifications.some(e => e.id === id) && this.frontNotifications.push(notify);
      } else {
        this.frontNotifications.push(notify);
      }

      // play notification sound
      this.computerNotification.play();

      // remove this notification from the array after (n) seconds
      setTimeout(() => this.dismissNotification(notify.id), 8000);
    },

    // dismiss notification
    dismissNotification(id) {
      const index = this.frontNotifications.findIndex(notify => notify.id === id);

      if (index > -1) {
        const removedItem = this.frontNotifications.splice(index, 1);
        this.backNotifications.unshift(...removedItem);
      }
    },

    // dismiss all notification
    dismissAllNotifications() {
      this.backNotifications.unshift(...this.frontNotifications);
      this.frontNotifications = [];
    },

    // remove notification
    removeNotification(e, id) {
      e.stopPropagation();

      const index = this.backNotifications.findIndex(notify => notify.id === id);
      index > -1 && this.backNotifications.splice(index, 1);
    },

    // remove all notifications
    removeAllNotifications(e) {
      e.stopPropagation();

      this.backNotifications = [];
    },

    // add ajax loading spinner
    startLoading() {
      this.ajaxLoading.push(true);
    },

    // remove ajax loading spinner
    endLoading() {
      this.ajaxLoading.pop();
    },

    // open confirm window
    openConfirmWindow({title, msg, okText, cancelText, onOk, onCancel}) {
      const confirmEl = document.querySelector(".confirm");

      confirmEl.style.setProperty("display", "");
      confirmEl.classList.remove("confirm--close");

      this.confirm = Object.assign({}, this.confirm, ...arguments);

      setTimeout(() => confirmEl.focus(), this.globalDelay);
    },

    // close confirm window
    closeConfirmWindow() {
      const confirmEl = document.querySelector(".confirm");

      confirmEl.classList.add("confirm--close");
      confirmEl.addEventListener("animationend", () => {
        confirmEl.style.setProperty("display", "none");

        this.confirm = {
          title: "",
          msg: "",
          okText: "",
          cancelText: "",
          onOk: () => {},
          onCancel: this.closeConfirmWindow,
        };
      }, { once: true });
    },

    // detect touch swipe direction
    detectTouchSwipeDir() {
      let initialX = null;
      let initialY = null;

      const startTouch = (e) => {
        initialX = e.touches[0].clientX;
        initialY = e.touches[0].clientY;
      };
      const moveTouch = (e) => {
        if (initialX === null || initialY === null) { return; }

        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = initialX - currentX;
        const diffY = initialY - currentY;

        if (Math.abs(diffX) > Math.abs(diffY)) {
          // sliding horizontally
          this.touchSwipeDir = diffX > 0 ? "swipedLeft" : "swipedRight";

        } else {
          // sliding vertically
          this.touchSwipeDir = diffY > 0 ? "swipedUp" : "swipedDown";
        }

        initialX = null;
        initialY = null;

        e.preventDefault();
      };

      document.getElementById("app-inner").addEventListener("touchstart", startTouch);
      document.getElementById("app-inner").addEventListener("touchmove", moveTouch);
    },
  },
  computed: {
    // flag to toggle ajax loading spinner
    isAjaxLoading() {
      return this.ajaxLoading.some(state => state === true);
    },
  },
  directives: {
    // focus directive (v-focus | v-focus='boolean')
    focus: {
      mounted(el, binding) {
        if ((!binding.hasOwnProperty("value")) || binding.value) {
          el.focus();
        }
      }
    },
  },
});

app.use(VueClickAway);
app.mount("#app");
