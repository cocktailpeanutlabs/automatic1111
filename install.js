module.exports = async (kernel) => {
  let repo
  if (kernel.gpu === "amd" && kernel.platform === "win32") {
    repo = "https://github.com/lshqqytiger/stable-diffusion-webui-directml.git"
  } else {
    repo = "https://github.com/AUTOMATIC1111/stable-diffusion-webui"
  }
  let o = {
    run: [{
      method: "shell.run",
      params: { message: `git clone ${repo} app` }
    }, {
      "uri": "./index.js",
      "method": "config",
    }]
  }
  if (kernel.gpu === "amd" && kernel.platform === "win32") {
    o.run.push({
      "method": "shell.run",
      "params": {
        "message": "copy requirements*.txt app\\ /Y",
      }
    })
  } else {
    // nothing
  }
  if (kernel.platform === "darwin" && kernel.arch === "x64") {
    // nothing
  } else {
    o.run.push({
      "method": "self.set",
      "params": {
        "app/ui-config.json": {
          "txt2img/Width/value": 1024,
          "txt2img/Height/value": 1024,
        }
      }
    })
  }
  if (kernel.platform === 'win32') {
    o.run.push({
      "method": "shell.run",
      "params": {
        "message": "mkdir app\\models\\ControlNet app\\models\\ESRGAN app\\models\\hypernetworks app\\models\\Lora",
      }
    })
  } else {
    o.run.push({
      "method": "shell.run",
      "params": {
        "message": "mkdir -p app/models/ControlNet app/models/ESRGAN app/models/hypernetworks app/models/Lora",
      }
    })
  }
  o.run.push({
    "method": "fs.share",
    "params": {
      "drive": {
        "checkpoints": "app/models/Stable-diffusion",
//          "configs": "app/models/Stable-diffusion",
        "vae": "app/models/VAE",
        "loras": "app/models/Lora",
        "upscale_models": "app/models/ESRGAN",
        "embeddings": "app/embeddings",
        "hypernetworks": "app/models/hypernetworks",
        "controlnet": "app/models/ControlNet"
      },
      "peers": [
        "https://github.com/cocktailpeanut/fluxgym.git",
        "https://github.com/cocktailpeanutlabs/fooocus.git",
        "https://github.com/cocktailpeanutlabs/comfyui.git",
        "https://github.com/pinokiofactory/comfy.git",
        "https://github.com/pinokiofactory/stable-diffusion-webui-forge.git"
      ]
    }
  })
//// Don't use links because gradio requires all files to be under the app directory, unless the app is launched with allowed_paths is specified
//  o.run.push({
//    "method": "fs.share",
//    "params": {
//      "drive": {
//        "outputs": "app/outputs"
//      }
//    }
//  })
  if (kernel.platform === "darwin" && kernel.arch === "x64") {
    o.run.push({
      "method": "fs.download",
      "params": {
        "uri": "https://huggingface.co/stabilityai/stable-diffusion-2-1/resolve/main/v2-1_768-ema-pruned.safetensors?download=true",
        "dir": "app/models/Stable-diffusion"
      }
    })
  } else {
    o.run = o.run.concat([{
      "method": "fs.download",
      "params": {
        "url": "https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_base_1.0.safetensors",
        "dir": "app/models/Stable-diffusion"
      }
    }, {
      "method": "fs.download",
      "params": {
        "url": "https://huggingface.co/stabilityai/stable-diffusion-xl-refiner-1.0/resolve/main/sd_xl_refiner_1.0.safetensors",
        "dir": "app/models/Stable-diffusion"
      }
    }])
  }
  console.log("#info", { gpu: kernel.gpu, platform: kernel.platform })
  if (kernel.gpu === 'amd' && kernel.platform === 'win32') {
    o.run = o.run.concat([{
      "method": "shell.run",
      "params": {
        "message": "webui.bat",
        "env": {
          "COMMANDLINE_ARGS": "--use-directml --skip-torch-cuda-test ",
          "SD_WEBUI_RESTARTING": 1,
        },
        "path": "app",
        "on": [{ "event": "/http:\/\/[0-9.:]+/", "kill": true }]
      }
    }])
  } else {
    o.run = o.run.concat([{
      "method": "shell.run",
      "params": {
        "message": "{{platform === 'win32' ? 'webui-user.bat' : 'bash webui.sh -f'}}",
        "env": {
          "SD_WEBUI_RESTARTING": 1,
        },
        "path": "app",
        "on": [{ "event": "/http:\/\/[0-9.:]+/", "kill": true }]
      }
    }])
  }
  if (kernel.platform === 'darwin') {
    o.requires = [{
      platform: "darwin",
      type: "conda",
      name: ["cmake", "protobuf", "rust", "wget"],
      args: "-c conda-forge"
    }]
  }
  return o
}
