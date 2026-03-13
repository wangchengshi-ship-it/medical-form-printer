---
inclusion: fileMatch
fileMatchPattern: "CHANGELOG.md,.release-please-manifest.json,release-please-config.json,.github/**"
---

# 版本发布流程

本项目使用 [release-please](https://github.com/googleapis/release-please) 自动管理版本号和 CHANGELOG。

## Commit 规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>: <description>

[optional body]
```

### 常用 type

| Type | 说明 | 版本影响 |
|------|------|----------|
| `feat` | 新功能 | minor (0.x.0) |
| `fix` | Bug 修复 | patch (0.0.x) |
| `docs` | 文档更新 | 不触发发布 |
| `chore` | 构建/工具变更 | 不触发发布 |
| `refactor` | 重构 | 不触发发布 |
| `test` | 测试相关 | 不触发发布 |
| `perf` | 性能优化 | patch |

### Breaking Change

在 commit body 中加 `BREAKING CHANGE:` 会触发 major 版本升级：

```
feat: 重构分页 API

BREAKING CHANGE: renderPaginatedHtml 参数变更
```

## 发布流程

1. **日常开发**：正常写代码，commit 时用规范格式
2. **推送到 main**：release-please 自动创建 Release PR
3. **Review Release PR**：检查版本号和 CHANGELOG 是否正确
4. **合并 PR**：自动创建 GitHub Release → 触发 npm 发布

## 文件说明

| 文件 | 作用 |
|------|------|
| `.github/workflows/release-please.yml` | 自动化 workflow |
| `release-please-config.json` | 配置选项 |
| `.release-please-manifest.json` | 当前版本号记录 |

## 注意事项

- 不要手动修改 `package.json` 的 version 字段
- 不要手动在 CHANGELOG.md 写版本号，用 `[Unreleased]` 或让 release-please 自动生成
- 代码注释中的 `@since` 用 `next` 占位，发布时会自动替换
