export const cliOps = `
  sequenceDiagram
      actor User
      participant CLI as Commander (index.ts)
      participant Cmd as Command Handler
      participant Prompt as Inquirer Prompts
      participant Script as bin/*.script.ts
      participant Manifest as manifest.ts
      participant Lock as lock.ts
      participant Browser as @puppeteer/browsers
      participant FS as File System

      User->>CLI: pbvm create -b chrome -i 123
      CLI->>Cmd: registerCreateCommand()
      Cmd->>Cmd: Zod parse options
      Cmd->>Prompt: promptCreateOptions() - 补全缺失参数
      Prompt-->>Cmd: {browser, buildId, alias, store}
      Cmd->>Prompt: promptConfirm() - 确认操作
      Prompt-->>Cmd: true

      Cmd->>Script: installBrowser(args)
      Script->>Manifest: checkoutInStore() - 检查是否已安装
      Manifest->>Lock: waitForLock(cacheDir)
      Manifest->>Browser: getInstalledBrowsers(cacheDir)
      Browser-->>Manifest: 已安装列表

      alt 已安装
          Manifest-->>Script: found ✓
      else 未安装
          Manifest-->>Script: null
          Script->>Browser: install({browser, buildId, platform})
          Browser->>FS: 下载 + 解压到 cacheDir
          Note over Script,Browser: SIGINT/SIGTERM 时清理半成品
          Browser-->>Script: {executablePath}
      end

      alt store mode
          Script-->>Cmd: 仅安装到 cache，不写入 browserlist
      else 项目模式
          Script->>Manifest: logCurrentList() - 写入 browserlist.json
          Manifest->>Lock: acquireLock(cwd)
          Manifest->>FS: readFile + writeFile browserlist.json
          Manifest-->>Script: alias name
      end

      Script-->>Cmd: success
      Cmd-->>User: ✅ Installed success...`

export const devOps = `
  graph TB
      subgraph "核心依赖链"
          A["@puppeteer/browsers"] --> B["browser.lock.ts"]
          B --> C["install.script.ts"]
          B --> D["remove.script.ts"]
          B --> E["manifest.ts (store list)"]

          A --> F["types/index.ts<br/>(Browser, BrowserPlatform 枚举)"]
          F --> G["所有 commands/*.ts"]
          F --> H["所有 prompts/*.ts"]
          F --> I["所有 bin/*.script.ts"]

          J["manifest.ts"] --> K["browserlist.json 操作"]
          J --> L["lock.ts<br/>(文件锁)"]
          C --> J
          D --> J

          M["base.browser.ts<br/>DevConnection"] --> N["chromium.browser.ts"]
          M --> O["firefox.browser.ts"]
          M --> P["browser.schema.ts<br/>(Zod schemas)"]

          N --> Q["buildEnvScript.ts"]
          O --> Q
          N --> P
          O --> P

          R["open.script.ts"] --> C
          R --> M
          S["info.script.ts"] --> N
          S --> O
      end
`.trim()

export const lockOps = `
  stateDiagram-v2
      [*] --> WaitLock: waitForLock()
      [*] --> AcquireLock: acquireLock()

      state WaitLock {
          CheckExist: 检查 .pbvm.lock 是否存在
          WaitStale: 等待 retryDelay ms
          CheckTimeout: 超时检查
          CheckExist --> WaitStale: 锁存在
          WaitStale --> CheckExist: 重试
          CheckExist --> [*]: 锁释放 (ENOENT)
          CheckExist --> CleanStale: 锁存在
      }

      state AcquireLock {
          TryCreate: fs.writeFile(pid, {flag:'wx'})
          Exists: EEXIST - 锁已被占用
          CreateSuccess: 创建成功 → 返回 release()
          TryCreate --> Exists
          TryCreate --> CreateSuccess
          Exists --> CleanStale
          Exists --> WaitRetry: 非超时
          WaitRetry --> TryCreate
          Exists --> ThrowTimeout: 超时抛错
      }

      state CleanStale {
          ReadPid: 读取锁文件 PID
          CheckAlive: process.kill(pid, 0)
          RemoveStale: fs.unlink() 清理死锁
          ReadPid --> CheckAlive
          CheckAlive --> RemoveStale: 进程不存在
          CheckAlive --> WaitStale: 进程存活

      }

      CreateSuccess --> Release: 操作完成
      Release: release() → fs.unlink(.pbvm.lock)
      Release --> [*]`.trim()

export const stroeMD = `
  graph LR
      subgraph "操作系统目录 (env-paths)"
          CACHE["📁 cache/<br/>浏览器二进制安装目录<br/>(可删除、可重建)"]
          DATA["📁 data/profiles/<br/>用户 Profile 数据<br/>(cookies/书签/偏好设置)"]
          CONFIG["📁 config/<br/>用户配置文件<br/>(代理/镜像源/默认模板)"]
          LOG["📁 log/<br/>日志"]
          TEMP["📁 temp/<br/>临时目录 (info 检测用)"]
      end

      subgraph "项目目录 (cwd)"
          BROWSERLIST["📄 browserlist.json<br/>当前项目的浏览器映射<br/>[{alias, browser, buildId, platform}, ...]"]
          LOCKFILE["📄 .pbvm.lock<br/>进程级文件锁<br/>(写入 PID)"]
      end
      BROWSER_LOCK --> UTIL_LOCK
      UTIL_LOCK --> UTIL_PATHS

      TYPES --> ZOD
      CMD_CREATE & CMD_REMOVE & CMD_ALIAS & CMD_INFO & CMD_OPEN --> TYPES
      API --> PUPPETEER
      API --> UTIL_MANIFEST
      API --> SCRIPT_OPEN
`.trim()
