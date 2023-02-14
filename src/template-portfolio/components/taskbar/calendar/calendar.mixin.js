export default {
  data() {
    return {
      calendarDateObj: new Date(),
      calendarDate: null,
      calendarWeekdays: [
        { short: { en: "Su", ar: "ح" }, long: { en: "Sunday", ar: "الأحد" } },
        { short: { en: "Mo", ar: "ن" }, long: { en: "Monday", ar: "الاثنين" } },
        { short: { en: "Tu", ar: "ث" }, long: { en: "Tuesday", ar: "الثلاثاء" } },
        { short: { en: "Wd", ar: "ر" }, long: { en: "Wednesday", ar: "الأربعاء" } },
        { short: { en: "Th", ar: "خ" }, long: { en: "Thursday", ar: "الخميس" } },
        { short: { en: "Fr", ar: "ج" }, long: { en: "Friday", ar: "الجمعة" } },
        { short: { en: "Sa", ar: "س" }, long: { en: "Saturday", ar: "السبت" } },
      ],
      calendarEvents: null,
      todayEvents: null,
    };
  },
  mounted() {
    // get calendar events data
    this.getCalendarEventsData();
  },
  methods: {
    // render the calendar
    renderCalendar() {
      this.calendarDateObj.setDate(1);

      const year = this.calendarDateObj.getFullYear();
      const month = this.calendarDateObj.getMonth() + 1;
      const lastDay = new Date(this.calendarDateObj.getFullYear(), this.calendarDateObj.getMonth() + 1, 0).getDate();
      const prevLastDay = new Date(this.calendarDateObj.getFullYear(), this.calendarDateObj.getMonth(), 0).getDate();
      const daysDifference = this.appOpts.weekStartDay == 0 ? 0 : 7 - this.appOpts.weekStartDay;
      const firstDayIndex = this.calendarDateObj.getDay() + daysDifference;
      const nextDays = 42 - (firstDayIndex + lastDay);
      const daysEl = document.querySelector(".calendar__days");
      let daysHtml = "";

      // get calendar today date
      this.calendarDate = this.calendarDateObj.toLocaleString(this.appOpts.locales, { month: "long", year: "numeric" });

      // generate previous month days
      for (let p = firstDayIndex; p > 0; p--) {
        const dayNum = prevLastDay - p + 1;
        const curDate = `${year}/${month - 1}/${dayNum}`;
        const tarEvent = this.calendarEvents.find(eve => `${eve.date.year}/${eve.date.month}/${eve.date.day}` == curDate);
        let eventId;
        let eventClass;

        if (tarEvent) {
          eventId = ` id="${curDate}"`;
          eventClass = " has__events";
        } else {
          eventId = "";
          eventClass = "";
        }

        daysHtml += `<button${eventId} class="calendar__days__day${eventClass} day__prev">${dayNum.toLocaleString(this.appOpts.locales)}</button>`;
      }

      // generate current month days
      for (let i = 1; i <= lastDay; i++) {
        const curDate = `${year}/${month}/${i}`;
        const tarEvent = this.calendarEvents.find(eve => `${eve.date.year}/${eve.date.month}/${eve.date.day}` == curDate);
        let eventId;
        let eventClass;

        if (tarEvent) {
          eventId = ` id="${curDate}"`;
          eventClass = " has__events";
        } else {
          eventId = "";
          eventClass = "";
        }

        if (
          i === new Date().getDate() &&
          this.calendarDateObj.getMonth() === new Date().getMonth() &&
          this.calendarDateObj.getFullYear() === new Date().getFullYear()
        ) {
          daysHtml += `<button${eventId} class="calendar__days__day${eventClass} day__today">${i.toLocaleString(this.appOpts.locales)}</button>`;
        } else {
          daysHtml += `<button${eventId} class="calendar__days__day${eventClass}">${i.toLocaleString(this.appOpts.locales)}</button>`;
        }
      }

      // generate next month days
      for (let n = 1; n <= nextDays; n++) {
        const curDate = `${year}/${month + 1}/${n}`;
        const tarEvent = this.calendarEvents.find(eve => `${eve.date.year}/${eve.date.month}/${eve.date.day}` == curDate);
        let eventId;
        let eventClass;

        if (tarEvent) {
          eventId = ` id="${curDate}"`;
          eventClass = " has__events";
        } else {
          eventId = "";
          eventClass = "";
        }

        daysHtml += `<button${eventId} class="calendar__days__day${eventClass} day__next">${n.toLocaleString(this.appOpts.locales)}</button>`;
      }

      // render month days
      daysEl.innerHTML = daysHtml;

      // open calendar events on click
      const eventsDays = document.querySelectorAll(".calendar__days__day");
      eventsDays.forEach(day => day.addEventListener("click", this.showCalendarDayEvents));
    },

    // calendar go to prev year
    calendarGoToPrevYear() {
      this.calendarDateObj.setFullYear(this.calendarDateObj.getFullYear() - 1);
      this.renderCalendar();
    },

    // calendar go to prev month
    calendarGoToPrevMonth() {
      this.calendarDateObj.setMonth(this.calendarDateObj.getMonth() - 1);
      this.renderCalendar();
    },

    // calendar go to next year
    calendarGoToNextYear() {
      this.calendarDateObj.setFullYear(this.calendarDateObj.getFullYear() + 1);
      this.renderCalendar();
    },

    // calendar go to next month
    calendarGoToNextMonth() {
      this.calendarDateObj.setMonth(this.calendarDateObj.getMonth() + 1);
      this.renderCalendar();
    },

    // get calendar events data
    getCalendarEventsData() {
      // start loading spinner
      this.startLoading();

      fetch(this.appOpts.urlCalendarEvents, { method: "GET" })
        .then(res => res.json())
        .then(data => {
          this.calendarEvents = data.events;

          // render the calendar
          this.renderCalendar();

          // end loading spinner
          this.endLoading();
        })
        .catch(err => console.log(err));
    },

    // show calendar day events
    showCalendarDayEvents(e) {
      const dayEl = e.currentTarget;
      const dayId = dayEl.id;
      const eventsList = document.querySelector(".calendar__events__list");
      const eventsId = eventsList.getAttribute("data-events-id");

      // disable clicking more than once
      if (eventsId && eventsId === dayId) { return; }

      // update id for new events
      eventsList.setAttribute("data-events-id", dayId);

      // get today events
      this.todayEvents = this.calendarEvents.filter(eve => `${eve.date.year}/${eve.date.month}/${eve.date.day}` == dayId);

      // open calendar events
      this.openCalendarEvents(dayEl);
    },

    // go to calendar event
    goToCalendarEvent(path) {
      const pathArr = path.split("/");
      const getNextDir = (index) => {
        return new Promise(resolve => {
          const loop = () => {
            let btn;

            if (index === 0) {
              btn = document.querySelector(`.desktop__item[data-win-id=${pathArr[index]}Window]`);
            } else {
              btn = document.getElementById(`btn-${pathArr[index]}`);
            }
    
            btn ? resolve(btn) : setTimeout(loop);
          }
          loop();
        });
      }
      const clickAllBtns = async () => {
        for (let i = 0; i < pathArr.length; i++) {
          await getNextDir(i).then(btn => btn.dispatchEvent(new Event("dblclick")));
        }
      };

      // initialize file explorer directory
      this.fileExplorerInitDir(pathArr[0]);

      // click all folders until the target file
      clickAllBtns();
    },
  },
  computed: {
    // get calendar weekdays sorted
    calendarWeekdaysSorted() {
      if (this.appOpts?.weekStartDay > 0) {
        return [...this.calendarWeekdays.slice(this.appOpts.weekStartDay), ...this.calendarWeekdays.slice(0, this.appOpts.weekStartDay)];
      } else {
        return this.calendarWeekdays;
      }
    },

    // get formatted time from string
    formattedTime() {
      return timeString => {
        const date = new Date(`1970-01-01T${timeString}:00Z`);
        const timeOpts = { hour: "2-digit", minute: "2-digit", hour12: true };

        return date.toLocaleString(this.appOpts.locales, timeOpts);
      };
    },
  },
};
