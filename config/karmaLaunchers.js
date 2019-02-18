const customLaunchers = {
  // windows
  bs_chrome: {
    base: "BrowserStack",
    browser: "chrome",
    browser_version: "63",
    os: "Windows",
    os_version: "10"
  },
  bs_firefox: {
    base: "BrowserStack",
    browser: "firefox",
    browser_version: "57",
    os: "Windows",
    os_version: "10"
  },
  bs_ie_11: {
    base: "BrowserStack",
    browser: "ie",
    browser_version: "11.0",
    os: "Windows",
    os_version: "10"
  },
  bs_edge: {
    base: "BrowserStack",
    browser: "edge",
    browser_version: "16",
    os: "Windows",
    os_version: "10"
  },
  // os x
  bs_osx_safari: {
    base: "BrowserStack",
    browser: "safari",
    browser_version: "12",
    os: "OS X",
    os_version: "Mojave"
  }
  /*
  // ios
  bs_ios_safari: {
    base: "BrowserStack",
    browser: "safari",
    os: "iOS",
    os_version: "11.0",
    device: "iPhone 8",
    real_mobile: false
  },
  // android
  bs_android_chrome: {
    base: "BrowserStack",
    browser: "chrome",
    os: "android",
    os_version: "7.0",
    device: "Samsung Galaxy S8",
    real_mobile: true
  }
  */
};

module.exports = customLaunchers;
