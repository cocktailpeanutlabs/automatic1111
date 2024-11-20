module.exports = async (kernel) => {
  return {
    daemon: true,
    run: [{
      method: "shell.run",
      params: {
        path: "app",
        venv: "venv",
        env: {
          SD_WEBUI_RESTARTING: 1,
        },
        message: "pip install tqdm moviepy --upgrade"
      }
    }, {
      when: "{{gpu ==='amd' && platform === 'win32'}}",
      method: "shell.run",
      params: {
        path: "app",
        message: "webui.bat",
        env: {
          "COMMANDLINE_ARGS": "--use-directml --skip-torch-cuda-test --opt-sub-quad-attention --no-half --api",
          "SD_WEBUI_RESTARTING": 1,
        },
        on: [{
          "event": "/http:\/\/[0-9.:]+/", "done": true
        }, {
          "event": "/error:/i",
          "break": false
        }]
      }
    }, {
      when: "{{!(gpu ==='amd' && platform === 'win32')}}",
      method: "shell.run",
      params: {
        path: "app",
        message: (kernel.platform === 'win32' ? 'webui-user.bat' : 'bash webui.sh -f'),
        env: {
          "SD_WEBUI_RESTARTING": 1,
        },
        on: [{
          "event": "/http:\/\/[0-9.:]+/", "done": true
        }, {
          "event": "/error:/i",
          "break": false
        }]
      }
    }, {
      method: "local.set",
      params: {
        "url": "{{input.event[0]}}",
      }
    }, {
      "method": "proxy.start",
      "params": {
        "uri": "{{local.url}}",
        "name": "Local Sharing"
      }
    }]
  }
}
