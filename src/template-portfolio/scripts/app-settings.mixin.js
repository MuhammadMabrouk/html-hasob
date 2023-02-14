export default {
  data() {
    return {
      appStorage: "hasobSavedSettings",
      htmlTag: null,
      bodyTag: null,
      appOpts: null,
      appSettings: null,
      renderedFontfamily: null,
      renderedFontsize: null,
    };
  },
  created() {
    // initialize app settings
    this.initAppSettings();
  },
  mounted() {
    // initialize app options
    this.initAppOptions();

    // get the app settings from the localStorage
    this.getAppSettings();
  },
  methods: {
    // initialize app options
    initAppOptions() {
      this.htmlTag = document.documentElement;
      this.bodyTag = document.body;
      this.appOpts = this.bodyTag.dataset;
    },

    // initialize app settings
    initAppSettings() {
      const savedSettings = localStorage.getItem(this.appStorage);
      this.appSettings = savedSettings ? JSON.parse(savedSettings) : {};
    },

    // apply a setting for the app
    applyAppSetting(setting, parentObj = null, localize = false) {
      if (parentObj) {

        // initialize an empty object if it doesn't exist
        !this.appSettings.hasOwnProperty([parentObj]) && (this.appSettings[parentObj] = {});

        // add setting properties to the parent object
        for (let prop in setting) {
          this.appSettings[parentObj][prop] = setting[prop];
        }
        this.bodyTag.setAttribute(`data-${parentObj}`, JSON.stringify(this.appSettings[parentObj]));

      } else {
        const varToStr = (varObj, isKebabCase = false) => {
          const propName = Object.keys(varObj)[0];
          return isKebabCase ? propName.split(/(?=[A-Z])/).join("-").toLowerCase() : propName;
        };
        const varToVal = varObj => Object.values(varObj)[0];

        // change the setting
        if (localize) {
          const lang = this.htmlTag.lang;
          const curVal = this.appSettings[varToStr(setting)];
          let finalVal;

          if (curVal) {
            if (curVal.hasOwnProperty(lang) && varToVal(setting).hasOwnProperty(lang)) {
              this.appSettings[varToStr(setting)] = varToVal(setting);
              this.bodyTag.setAttribute(`data-${varToStr(setting, true)}`, varToVal(setting)[lang]);

            } else if (curVal.hasOwnProperty(lang)) {
              this.appSettings[varToStr(setting)][lang] = varToVal(setting);
              this.bodyTag.setAttribute(`data-${varToStr(setting, true)}`, varToVal(setting));

            } else {
              const newVal = { [lang]: this.appOpts[varToStr(setting)] };
              finalVal = Object.assign({}, curVal, newVal);

              this.appSettings[varToStr(setting)] = finalVal;
              this.bodyTag.setAttribute(`data-${varToStr(setting, true)}`, this.appOpts[varToStr(setting)]);
            }

          } else {
            this.appSettings[varToStr(setting)] = { [lang]: this.appOpts[varToStr(setting)] };
            this.bodyTag.setAttribute(`data-${varToStr(setting, true)}`, varToVal(setting));
          }
        } else {
          this.appSettings[varToStr(setting)] = varToVal(setting);
          this.bodyTag.setAttribute(`data-${varToStr(setting, true)}`, varToVal(setting));
        }
      }
    },

    // save the app settings in the localStorage
    saveAppSettings() {
      localStorage.setItem(this.appStorage, JSON.stringify(this.appSettings));
    },

    // get the app settings from the localStorage
    getAppSettings() {
      this.getAppFileExplorerViewSettings();
      this.getAppHourFormatSettings();
      this.getAppModeSettings();
      this.getAppColorsSettings();
      this.getAppFontFamilySettings();
      this.getAppFontsizeSettings();
    },

    // get app file explorer view settings
    getAppFileExplorerViewSettings() {
      let fileExplorerView;

      if (this.appSettings) {
        if (this.appSettings.fileExplorerView) {
          fileExplorerView = this.appSettings.fileExplorerView;
        } else {
          fileExplorerView = this.appOpts.fileExplorerView;
        }
        this.applyAppSetting({ fileExplorerView });
        this.saveAppSettings();
      }
    },

    // get app hour format settings
    getAppHourFormatSettings() {
      let hourFormat;

      if (this.appSettings) {
        if (this.appSettings.hourFormat) {
          hourFormat = this.appSettings.hourFormat;
        } else {
          hourFormat = this.appOpts.hourFormat;
        }
        this.applyAppSetting({ hourFormat });
        this.saveAppSettings();
      }
    },

    // get app mode settings
    getAppModeSettings() {
      let mode;

      if (this.appSettings) {
        if (this.appSettings.mode) {
          mode = this.appSettings.mode;
          this.applyAppSetting({ mode });

          // So, try to get the browser default mode or make your own default
        } else {

          // Check to see if Media-Queries are supported
          if (window.matchMedia) {
            // Check if the dark-mode Media-Query matches
            mode = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
          } else {
            // Default (when Media-Queries are not supported)
            mode = this.appOpts.mode;
          }

          this.applyAppSetting({ mode });
          this.saveAppSettings();
        }
      }
    },

    // get app colors settings
    getAppColorsSettings() {
      let colors;

      if (this.appSettings) {
        if (this.appSettings.colors) {
          // it may contain some values, but not all values, so combine the default values with the new ones
          colors = Object.assign({}, JSON.parse(this.appOpts.colors), this.appSettings.colors);
        } else {
          colors = JSON.parse(this.appOpts.colors);
        }
        this.applyAppSetting({ ...colors }, "colors");
        this.changeAppColor();
      }
    },

    // get app fontfamily settings
    getAppFontFamilySettings() {
      let fontfamily;

      if (this.appSettings) {
        if (this.appSettings.fontfamily) {
          fontfamily = this.appSettings.fontfamily;
        } else {
          fontfamily = this.appOpts.fontfamily;
        }
        this.applyAppSetting({ fontfamily }, null, true);
        this.saveAppSettings();
        this.setAppFontfamily();
      }
    },

    // get app fontsize settings
    getAppFontsizeSettings() {
      let fontsize;

      if (this.appSettings) {
        if (this.appSettings.fontsize) {
          fontsize = this.appSettings.fontsize;
        } else {
          fontsize = this.appOpts.fontsize;
        }
        this.applyAppSetting({ fontsize }, null, true);
        this.saveAppSettings();
        this.setAppFontsize();
      }
    },
  },
};
