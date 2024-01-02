module.exports = async (kernel) => {
  let repo
  if (kernel.gpu === "amd" && kernel.platform === "win32") {
    repo = "https://github.com/lshqqytiger/stable-diffusion-webui-directml.git"
  } else {
    repo = "https://github.com/AUTOMATIC1111/stable-diffusion-webui"
  }
  let o = {
    "pinokiod": ">=0.1.49",
    run: [{
      "method": "fs.rm",
      "params": {
        "path": "app"
      }
    }, {
      method: "shell.run",
      params: { message: `git clone ${repo} app` }
    }, {
      "uri": "./index.js",
      "method": "config",
    }, {
      "method": "self.set",
      "params": {
        "app/ui-config.json": {
          "txt2img/Width/value": 1024,
          "txt2img/Height/value": 1024,
        }
      }
    }, {
      "method": "shell.run",
      "params": {
        "message": "{{platform === 'win32' ? 'webui-user.bat' : 'bash webui.sh -f'}}",
        "path": "app",
        "on": [{ "event": "/http:\/\/[0-9.:]+/", "kill": true }]
      }
    }, {
      "method": "fs.share",
      "params": {
        "drive": {
// Don't share torch => the built-in installer uses its own version of torch
//          "torch": "{{platform === 'win32' ? 'app/venv/Lib/site-packages/torch' : 'app/venv/lib/python3.10/site-packages/torch'}}",
//          "torchvision": "{{platform === 'win32' ? 'app/venv/Lib/site-packages/torchvision' : 'app/venv/lib/python3.10/site-packages/torchvision'}}",
          "checkpoints": "app/models/Stable-diffusion",
//          "configs": "app/models/Stable-diffusion",
          "vae": "app/models/VAE",
          "loras": [
            "app/models/Lora",
            "app/models/LyCORIS"
          ],
          "upscale_models": [
            "app/models/ESRGAN",
            "app/models/RealESRGAN",
            "app/models/SwinIR"
          ],
          "embeddings": "app/embeddings",
          "hypernetworks": "app/models/hypernetworks",
          "controlnet": "app/models/ControlNet"
        },
        "peers": [
          "https://github.com/cocktailpeanutlabs/comfyui.git",
          "https://github.com/cocktailpeanutlabs/fooocus.git"
        ]
      }
    }, {
      "method": "fs.download",
      "params": {
        "url": "https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_base_1.0.safetensors",
        "dir": "app/models/Stable-diffusion"
      }
    }, {
      "method": "fs.download",
      "params": {
        "url": "https://huggingface.co/stabilityai/stable-diffusion-xl-refiner-1.0/resolve/main/sd_xl_refiner_1.0.safetensors",
        "dir": "app/models/checkpoints"
      }
    }, {
      "method": "input",
      "params": {
        "title": "Install Success",
        "description": "Click the 'start' tab to launch the app"
      }
    }]
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
