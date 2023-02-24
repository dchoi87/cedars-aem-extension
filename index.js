const extension = {
  $btns: document.querySelectorAll("button"),
  init: function () {
    const _self = this;

    if (_self.$btns.length) {
      _self.$btns.forEach((btn) => {
        const data_url = btn.dataset.url;
        const data_id = btn.dataset.id;

        btn.addEventListener("click", () => {
          if (chrome.tabs) {
            const config = { active: true, currentWindow: true };

            chrome.tabs.query(config, (tabs) => {
              const tab = tabs[0];
              const url = new URL(tab.url);
              const target = _self.getTargetUrl(url, data_url, data_id);

              if (target) {
                chrome.tabs.update(tab.id, { url: target });
                window.close();
              } else {
                alert("Not an AEM page");
              }
            });
          }
        });
      });
    }
  },
  getTargetUrl: function (url, data_url, data_id) {
    const path = this.getPath(url);
    const env = this.getEnv(url);

    if (!url.host.includes("aem-")) {
      return;
    }

    if (path.array.includes("content")) {
      return url.origin;
    }

    switch (data_id) {
      case "aem": {
        return data_url.replace("$env", env).replace("$path", path.noExt);
      }
      case "published": {
        return (
          data_url.replace("$env", env).replace("$path", path.withExt) +
          "?wcmmode=disabled"
        );
      }
      default: {
        return data_url.replace("$env", env).replace("$path", path.withExt);
      }
    }
  },
  getPath: function (url) {
    const path = url.pathname;
    const arr = path.split("/");
    const index = arr.indexOf("cedars-sinai");
    const split_path = index > -1 ? arr.slice(index + 1) : arr.slice(1);
    const constructed_path = split_path.join("/");
    const withExtension = constructed_path.includes(".html")
      ? constructed_path
      : `${constructed_path}.html`;
    const noExtension = constructed_path.replace(".html", "");

    return {
      array: split_path,
      withExt: withExtension,
      noExt: noExtension,
    };
  },
  getEnv: function (url) {
    return url.origin.includes("-dev")
      ? "dev"
      : url.origin.includes("-stage")
      ? "stage"
      : "prod";
  },
};

extension.init();
