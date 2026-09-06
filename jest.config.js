/** @type {import('jest').Config} */
export default {
    // 使用 jsdom 模拟浏览器环境，必须，否则mount组件报错
    testEnvironment: "jsdom",
  
    // 识别的后缀
    moduleFileExtensions: ["js", "vue", "json"],
  
    transform: {
      // vue单文件处理器
      "^.+\\.vue$": "vue-jest",
      // js 文件交给 babel‑jest 转译
      "^.+\\.js$": "babel-jest"
    },
  
    moduleNameMapper: {
      // vite别名 @ → src
      "^@/(.*)$": "<rootDir>/src/$1",
      // mock css、less、scss、图片资源，jest不会处理样式和静态资源
      "\\.(css|scss|less|sass)$": "<rootDir>/__mocks__/styleMock.js",
      "\\.(png|jpg|jpeg|gif|svg|webp)$": "<rootDir>/__mocks__/fileMock.js",
      // mock vite import.meta.env 环境变量（关键！不然jest报错import.meta）
      "^import\\.meta\\.env": "<rootDir>/__mocks__/metaEnvMock.js"
    },
  
    // 匹配测试文件：xxx.spec.js
    testMatch: [
      "**/__tests__/**/*.spec.js",
      "**/?(*.)+(spec).js"
    ],
  
    // 覆盖率收集范围
    collectCoverageFrom: [
      "src/**/*.{js,vue}",
      "!src/**/*.config.js"
    ],
  
    // 忽略目录
    testPathIgnorePatterns: ["/node_modules/", "/dist/"]
  };
  