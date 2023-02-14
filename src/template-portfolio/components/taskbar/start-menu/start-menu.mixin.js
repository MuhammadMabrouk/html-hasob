export default {
  data() {
    return {
      // google fonts list
      googleFonts: null,

      // social links list
      socialLinks: null,
    };
  },
  mounted() {},
  methods: {
    // open start menu sub menu
    openStartMenuSubMenu(e) {
      const el = e.currentTarget;
      const id = el.dataset.menu;
      const nextSibling = el.nextSibling;
      const grandpa = el.parentElement.parentElement;
      const siblings = [...grandpa.children];

      if (id === "typography" && !this.googleFonts) {
        // get google fonts list
        this.getGoogleFontsList();
      }

      if (id === "contact" && !this.socialLinks) {
        // get social links list
        this.getSocialLinksList();
      }

      // add required classes on the clicked item & sub menu
      siblings.forEach(item => {
        item.querySelector(".startMenu__list__btn").classList.remove("active");
        item.querySelector(".startMenu__subMenu").classList.remove("detailsPopup__open");
      });
      el.classList.add("active");
      nextSibling.classList.add("detailsPopup__open");
    },

    // close start menu sub menu
    closeStartMenuSubMenu(e) {
      const el = e.currentTarget;
      const listItem = el.closest(".startMenu__list__item");

      // remove added classes from menu item & sub menu
      listItem.querySelector(".startMenu__list__btn").classList.remove("active");
      listItem.querySelector(".startMenu__subMenu").classList.remove("detailsPopup__open");
    },

    // get social links list
    getSocialLinksList() {
      // start loading spinner
      this.startLoading();

      fetch(this.appOpts.urlSocialLinks, { method: "GET" })
        .then(res => res.json())
        .then(data => {
          this.socialLinks = data.socialLinks;

          // end loading spinner
          this.endLoading();
        })
        .catch(err => console.log(err));
    },

    // restart window
    restartWindow(e) {
      if (e) {
        const msgs = e.currentTarget.dataset;
        const onOk = () => window.location.reload();

        // open confirm window
        this.openConfirmWindow({...msgs, onOk});
      } else {
        window.location.reload();
      }
    },

    // logout window
    logoutWindow(e) {
      const msgs = e.currentTarget.dataset;
      const onOk = () => {
        this.isLoggedOut = true;
        this.closeConfirmWindow();
      }

      // open confirm window
      this.openConfirmWindow({...msgs, onOk});
    },

    // login button
    loginButton() {
      this.isLoggedOut = false;

      // play start sound
      this.computerStart.play();
    },

    /* change settings functions *
    *****************************/
    // change the app file explorer view
    changeAppFileExplorerView(form) {
      this.applyAppSetting({ fileExplorerView: form.target.value });
      this.saveAppSettings();
    },

    // change the app hour format
    changeAppHourFormat(form) {
      this.applyAppSetting({ hourFormat: form.target.value });
      this.saveAppSettings();

      // reset the clock time
      this.resetClockTime();
    },

    // change the app mode
    changeAppMode(form) {
      this.applyAppSetting({ mode: form.target.value });
      this.saveAppSettings();
    },

    // change the app color
    changeAppColor(form) {
      if (form) {
        const color = form.target.name;
        const hsl = this.hex2hsl(form.target.value).replace(/[^\d,]/g, "").split(",");
  
        this.applyAppSetting({
          [`${color}-h`]: hsl[0],
          [`${color}-s`]: `${hsl[1]}%`,
          [`${color}-l`]: `${hsl[2]}%`
        }, "colors");
      }
      this.saveAppSettings();

      // set new colors to html style
      const colorsObj = JSON.parse(this.appOpts.colors);
      for (let color of Object.keys(colorsObj)) {
        this.htmlTag.style.setProperty([`--${color}`], colorsObj[color]);
      }

      // initialize swatch colors
      const primary = `${colorsObj["primary-h"]},${colorsObj["primary-s"]},${colorsObj["primary-l"]}`.replaceAll("%", "").split(",");
      const secondary = `${colorsObj["secondary-h"]},${colorsObj["secondary-s"]},${colorsObj["secondary-l"]}`.replaceAll("%", "").split(",");
      document.querySelector("#primary").value = this.hsl2hex(...primary);
      document.querySelector("#secondary").value = this.hsl2hex(...secondary);
    },

    // get google fonts list
    getGoogleFontsList() {
      // start loading spinner
      this.startLoading();

      fetch(this.appOpts.urlGoogleFonts, { method: "GET" })
        .then(res => res.json())
        .then(data => {
          this.googleFonts = data.googleFonts;

          // refresh fonts select
          setTimeout(() => document.querySelector("#google-fonts-select")._selectStyledInit());

          // end loading spinner
          this.endLoading();
        })
        .catch(err => console.log(err));
    },

    // change the app font family
    changeAppFontfamily(input) {
      const fontfamily = input.target.value;

      this.applyAppSetting({ fontfamily }, null, true);
      this.saveAppSettings();
      this.setAppFontfamily();
    },

    // set app font family
    setAppFontfamily() {
      this.renderedFontfamily = this.appOpts.fontfamily;

      const FFplaceholder = document.querySelector("#ff-placeholder");

      FFplaceholder.href = FFplaceholder.getAttribute("data-url").replace("ff-placeholder", this.renderedFontfamily);
      this.htmlTag.style.setProperty("--body-font-family", `"${this.renderedFontfamily.replace("+", " ")}", sans-serif`);
    },

    // change the app font size
    changeAppFontsize(input) {
      const fontsize = +input.target.value / 100 * 16;

      this.applyAppSetting({ fontsize }, null, true);
      this.saveAppSettings();
      this.setAppFontsize();
    },

    // set app font size
    setAppFontsize() {
      this.renderedFontsize = Math.round((+this.appOpts.fontsize / 16) * 100);
      this.htmlTag.style.setProperty("font-size", `${this.appOpts.fontsize}px`);
    },

    /* settings reset functions *
    ****************************/
    // reset the app global setting
    resetAppGlobalSetting(e, setting, args = []) {
      const msgs = e.currentTarget.dataset;
      const onOk = () => {
        const savedSettings = localStorage.getItem(this.appStorage);
        const settingsObj = JSON.parse(savedSettings);

        this[`resetApp${setting}Setting`](settingsObj, ...args);

        // save then restart the window
        localStorage.setItem(this.appStorage, JSON.stringify(settingsObj));
        this.restartWindow();
      };

      // open confirm window
      this.openConfirmWindow({...msgs, onOk});
    },

    // reset the app color setting
    resetAppColorSetting(settingsObj, color) {
      const colorsObj = settingsObj.colors;
      const colorsArr = Object.keys(colorsObj).filter(item => item.startsWith(color));

      colorsArr.forEach(item => delete colorsObj[item]);
    },

    // reset the app typography setting
    resetAppTypographySetting(settingsObj, settingName) {
      const settingObj = settingsObj[settingName];
      const settingItem = Object.keys(settingObj).find(item => item === this.htmlTag.lang);

      delete settingObj[settingItem];
    },

    /* color converter functions *
    *****************************/
    // convert hex code to rgb
    hex2rgb(hex) {
      let r = 0;
      let g = 0;
      let b = 0;

      // 3 digits
      if (hex.length == 4) {
        r = "0x" + hex[1] + hex[1];
        g = "0x" + hex[2] + hex[2];
        b = "0x" + hex[3] + hex[3];

        // 6 digits
      } else if (hex.length == 7) {
        r = "0x" + hex[1] + hex[2];
        g = "0x" + hex[3] + hex[4];
        b = "0x" + hex[5] + hex[6];
      }

      return "rgb(" + +r + "," + +g + "," + +b + ")";
    },

    // convert rgb to hsl
    rgb2hsl(rgb) {
      rgb = rgb.replace(/[^\d,]/g, "").split(",");

      let r = rgb[0];
      let g = rgb[1];
      let b = rgb[2];

      // make r, g, and b fractions of 1
      r /= 255;
      g /= 255;
      b /= 255;

      // find greatest and smallest channel values
      let cMin = Math.min(r, g, b);
      let cMax = Math.max(r, g, b);
      let delta = cMax - cMin;
      let h = 0;
      let s = 0;
      let l = 0;

      // calculate hue
      if (delta == 0) {
        h = 0;
        // red is max
      } else if (cMax == r) {
        h = ((g - b) / delta) % 6;
        // green is max
      } else if (cMax == g) {
        h = (b - r) / delta + 2;
        // blue is max
      } else {
        h = (r - g) / delta + 4;
      }

      h = Math.round(h * 60);

      // make negative hues positive behind 360°
      if (h < 0) {
        h += 360;
      }

      // calculate lightness
      l = (cMax + cMin) / 2;

      // calculate saturation
      s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

      // multiply l and s by 100
      s = +(s * 100).toFixed(1);
      l = +(l * 100).toFixed(1);

      return "hsl(" + h + "," + Math.ceil(s) + "%," + Math.ceil(l) + "%)";
    },

    // convert hex code to hsl
    hex2hsl(hex) {
      // convert hex to RGB first
      const rgb = this.hex2rgb(hex);

      // convert RGB to hsl second
      return this.rgb2hsl(rgb);
    },

    // convert hsl to hex code
    hsl2hex(h, s, l) {
      s /= 100;
      l /= 100;

      let c = (1 - Math.abs(2 * l - 1)) * s;
      let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      let m = l - c / 2;
      let r = 0;
      let g = 0;
      let b = 0;

      if (0 <= h && h < 60) {
        r = c;
        g = x;
        b = 0;
      } else if (60 <= h && h < 120) {
        r = x;
        g = c;
        b = 0;
      } else if (120 <= h && h < 180) {
        r = 0;
        g = c;
        b = x;
      } else if (180 <= h && h < 240) {
        r = 0;
        g = x;
        b = c;
      } else if (240 <= h && h < 300) {
        r = x;
        g = 0;
        b = c;
      } else if (300 <= h && h < 360) {
        r = c;
        g = 0;
        b = x;
      }

      // having obtained RGB, convert channels to hex
      r = Math.round((r + m) * 255).toString(16);
      g = Math.round((g + m) * 255).toString(16);
      b = Math.round((b + m) * 255).toString(16);

      // prepend 0s, if necessary
      r.length == 1 && (r = "0" + r);
      g.length == 1 && (g = "0" + g);
      b.length == 1 && (b = "0" + b);

      return "#" + r + g + b;
    },
  },
};
