const path = require('path')
module.exports = {
  version: "1.1",
  title: "Stable Diffusion web UI",
  description: "One-click launcher for Stable Diffusion web UI (AUTOMATIC1111/stable-diffusion-webui)",
  icon: "icon.png",
  menu: async (kernel) => {
    let installed = await kernel.exists(__dirname, "app", "venv")
    let installing = kernel.running(__dirname, "install.js")
    let configure = {
      icon: "fa-solid fa-gear",
      text: "Configure",
      href: (kernel.platform === 'win32' ? "app/webui-user.bat?mode=source#L6" : "app/webui-user.sh?mode=source#L13")
    }
    if (installing) {
      return [{ icon: "fa-solid fa-plug", text: "Installing", href: "install.js" }]
    } else if (installed) {
      let running = kernel.running(__dirname, "start.js")
      let arr
      if (running) {
        let local = kernel.memory.local[path.resolve(__dirname, "start.js")]
        if (local && local.url) {
          arr = [{
            icon: "fa-solid fa-rocket",
            text: "Open Web UI",
            href: local.url
          }, {
            icon: "fa-solid fa-desktop",
            text: "Terminal",
            href: "start.js"
          }, configure]
        } else {
          arr = [{
            icon: "fa-solid fa-desktop",
            text: "Terminal",
            href: "start.js"
          }, configure]
        }
      } else {
        arr = [{
          icon: "fa-solid fa-rocket",
          text: "Start",
          href: "start.js"
        }, configure]
      }
      arr = arr.concat([{
        icon: "fa-solid fa-download",
        text: "Download Models",
        menu: [
          { text: "Download by URL", icon: "fa-solid fa-download", href: "download.html?raw=true" },
          { text: "SDXL", icon: "fa-solid fa-download", href: "download-sdxl.json", mode: "refresh" },
          { text: "SDXL Turbo", icon: "fa-solid fa-download", href: "download-turbo.json", mode: "refresh" },
          { text: "Stable Video XT 1.1", icon: "fa-solid fa-download", href: "download-svd-xt-1.1.json", mode: "refresh" },
          { text: "Stable Video XT", icon: "fa-solid fa-download", href: "download-svd-xt.json", mode: "refresh" },
          { text: "Stable Video", icon: "fa-solid fa-download", href: "download-svd.json", mode: "refresh" },
          { text: "LCM LoRA", icon: "fa-solid fa-download", href: "download-lcm-lora.json", mode: "refresh" },
          { text: "SD 1.5", icon: "fa-solid fa-download", href: "download-sd15.json", mode: "refresh" },
          { text: "SD 2.1", icon: "fa-solid fa-download", href: "download-sd21.json", mode: "refresh" },
        ]
      }, {
        icon: "fa-solid fa-rotate", text: "Update", href: "update.json"
      }, {
        icon: "fa-solid fa-plug", text: "Reinstall", href: "install.js"
      }, {
        icon: "fa-solid fa-circle-xmark", text: "Reset", href: "reset.json", confirm: true
      }])
      return arr
    } else {
      return [{
        icon: "fa-solid fa-plug",
        text: "Install",
        href: "install.js"
      }, configure, {
        icon: "fa-solid fa-rotate",
        text: "Update",
        href: "update.json"
      }]
    }
  }
}
