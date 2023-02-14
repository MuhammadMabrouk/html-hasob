export default {
  data() {
    return {
      // taskbar visibility flags
      isBgAppsPopupOpen: false,
      isStartMenuPopupOpen: false,
      isLangsPopupOpen: false,
      isCalendarPopupOpen: false,
      isCalendarPopupEventsOpen: false,
      isNotificationsPopupOpen: false,

      // taskbar apps
      taskbarApps: [],

      // real time clock
      clockInterval: null,
      clockTime: null,
      clockDate: null,
      clockWidgetTime: null,
      clockWidgetDate: null,
    };
  },
  created() {},
  mounted() {
    // update the clock time
    this.updateClockTime();
  },
  beforeDestroy() {
    // prevent memory leak
    clearInterval(this.clockInterval);
  },
  methods: {
    // update the clock time
    updateClockTime() {
      let currentDay = new Date().getDate();
      const timeOpts = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: this.appSettings?.hourFormat == "hour12",
      };
      const dateFullOpts = { dateStyle: "full" };
      const dateShortOpts = {
        weekday: "short",
        month: "short",
        day: "2-digit" 
      };
      const updateFunc = () => {
        const dateObj = new Date();
        const updatedDay = dateObj.getDate();

        // get clock current time
        this.clockTime = dateObj.toLocaleString(this.appOpts.locales, timeOpts);
        this.clockWidgetTime = dateObj.toLocaleString("en-US", timeOpts);

        // get clock current date
        this.clockDate = dateObj.toLocaleString(this.appOpts.locales, dateFullOpts);
        this.clockWidgetDate = dateObj.toLocaleString("en-US", dateShortOpts);

        // update the calendar if it's a new day
        if (updatedDay !== currentDay) {
          currentDay = updatedDay;

          // render the calendar
          this.renderCalendar();
        }
      };

      // perform the first action immediately
      updateFunc();

      // update every n seconds
      const timer = window.innerWidth >= this.smallDevicesBreakpoint ? 1000 : 30000;
      this.clockInterval = setInterval(updateFunc, timer);
    },

    // reset the clock time
    resetClockTime() {
      // prevent memory leak
      clearInterval(this.clockInterval);

      // update the clock time
      this.updateClockTime();
    },

    // toggle taskbar popup
    toggleTaskbarPopup(e) {
      const id = e.currentTarget.dataset.winId;
      const name = `${id.charAt(0).toUpperCase()}${id.slice(1)}`;

      this[`is${name}Open`] ? this[`close${name}`]() : this.openTaskbarPopup(id, name);
    },

    // open taskbar popup
    openTaskbarPopup(id, name) {
      this[`is${name}Open`] = true;

      // dismiss all notification
      id === "notificationsPopup" && this.dismissAllNotifications();

      // set focus on the popup
      setTimeout(() => document.getElementById(id).focus(), this.globalDelay);
    },

    // close bg apps popup
    closeBgAppsPopup() {
      this.isBgAppsPopupOpen = false;
    },

    // close start menu popup
    closeStartMenuPopup() {
      this.isStartMenuPopupOpen = false;

      // close sub menus
      const listItems = document.querySelectorAll(".startMenu__list__item");
      listItems.forEach(item => {
        item.querySelector(".startMenu__list__btn").classList.remove("active");
        item.querySelector(".startMenu__subMenu")?.classList.remove("detailsPopup__open");
      });
    },

    // close languages popup
    closeLangsPopup() {
      this.isLangsPopupOpen = false;
    },

    // close time calendar
    closeCalendarPopup() {
      this.isCalendarPopupOpen = false;

      // close calendar events
      this.closeCalendarEvents();
    },

    // open calendar events
    openCalendarEvents(el) {
      const parent = el.parentElement;
      const siblings = [...parent.children];

      // add class active on the clicked day
      siblings.forEach(day => day.classList.remove("active"));
      el.classList.add("active");

      this.isCalendarPopupEventsOpen = true;

      setTimeout(() => {
        const clickableEvent = document.querySelector(".calendar__events__linked");
        const closeBtn = document.querySelector(".calendar__events__closeBtn");

        clickableEvent ? clickableEvent.focus() : closeBtn.focus();
      }, this.globalDelay);
    },

    // close calendar events
    closeCalendarEvents() {
      this.isCalendarPopupEventsOpen = false;

      // remove old events id
      document.querySelector(".calendar__events__list").setAttribute("data-events-id", "");

      // remove class active from all days
      document.querySelectorAll(".calendar__days__day").forEach(day => day.classList.remove("active"));
    },

    // close notifications popup
    closeNotificationsPopup() {
      this.isNotificationsPopupOpen = false;
    },
  },
};
