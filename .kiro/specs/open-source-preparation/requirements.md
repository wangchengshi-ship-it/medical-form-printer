# Requirements Document

## Introduction

本文档定义了将 `medical-print-renderer` 库开源发布所需的准备工作。该库是一个医疗表单打印渲染库，将结构化表单数据渲染为可打印的 HTML/PDF。开源准备工作包括文档完善、代码清理、CI/CD 配置和社区贡献指南。

## Glossary

- **Library**: `medical-form-printer` 打印渲染库（npm 包名）
- **Repository**: `https://github.com/wangchengshi-ship-it/medical-form-printer`
- **npm_Registry**: npm 公共包注册表
- **CI_CD**: 持续集成/持续部署流水线
- **README**: 项目主文档文件
- **CONTRIBUTING**: 贡献指南文档
- **CODE_OF_CONDUCT**: 行为准则文档
- **CHANGELOG**: 版本变更日志
- **LICENSE**: 开源许可证文件
- **GitHub_Actions**: GitHub 自动化工作流服务
- **Semantic_Versioning**: 语义化版本规范 (SemVer)

## Requirements

### Requirement 1: npm 包名和发布配置

**User Story:** As a library maintainer, I want to configure the npm package for public publishing, so that users can easily install the library.

#### Acceptance Criteria

1. THE Library SHALL use the npm package name `medical-form-printer`
2. THE Library SHALL include proper `package.json` fields for npm publishing (name, version, description, keywords, repository, homepage, bugs)
3. THE Library SHALL specify `files` field to include only necessary distribution files
4. THE Library SHALL include `engines` field specifying minimum Node.js version
5. WHEN publishing to npm THEN THE Library SHALL use semantic versioning format
6. THE Library SHALL update all internal references from `@medical/print-renderer` to `medical-form-printer`

### Requirement 2: 国际化文档

**User Story:** As an international developer, I want to read documentation in my language, so that I can understand and use the library.

#### Acceptance Criteria

1. THE Library SHALL provide an English README.md as the primary documentation
2. THE README SHALL include installation instructions with npm/yarn/pnpm/bun commands
3. THE README SHALL include quick start code examples for both browser and Node.js environments
4. THE README SHALL include API reference with TypeScript type signatures
5. THE README SHALL include a feature list highlighting key capabilities
6. THE README SHALL include links to detailed documentation, examples, and changelog
7. THE Library SHALL provide a Chinese README (README.zh-CN.md) for Chinese users
8. THE Library SHALL use English for all code comments and JSDoc documentation
9. THE Library SHALL use English for all error messages and console output
10. THE example data in documentation SHALL use generic international examples (not China-specific hospital names)

### Requirement 3: API 文档

**User Story:** As a developer, I want comprehensive API documentation, so that I can understand all available functions and options.

#### Acceptance Criteria

1. THE Library SHALL document all public exports with JSDoc comments
2. THE Library SHALL provide TypeScript type definitions for all public APIs
3. THE API documentation SHALL include parameter descriptions and return types
4. THE API documentation SHALL include usage examples for complex functions
5. WHEN a function has optional parameters THEN THE documentation SHALL specify default values

### Requirement 4: 代码清理和数据脱敏

**User Story:** As a library maintainer, I want to remove internal references, sensitive information, and localize the codebase, so that it is clean, safe, and accessible for international users.

#### Acceptance Criteria

1. THE Library SHALL NOT contain any hardcoded internal URLs, API keys, or credentials
2. THE Library SHALL NOT contain any references to internal systems or proprietary code
3. THE Library SHALL NOT contain any TODO comments referencing internal tasks or tickets
4. THE Library SHALL NOT contain any real hospital names (Chinese hospital names like "天津市中心妇产科医院" must be replaced with generic placeholders)
5. THE Library SHALL NOT contain any real patient information or medical data
6. THE Library SHALL NOT contain any real department names or staff names
7. THE Library SHALL use generic placeholder data in all examples, tests, and documentation:
   - Hospital: "Sample Hospital" / "Demo Medical Center"
   - Department: "Postpartum Care Unit" / "Sample Department"
   - Patient names: "Jane Doe" / "John Smith"
   - Dates: Use relative dates or generic dates like "2024-01-01"
8. THE Library SHALL translate all Chinese comments in source code to English
9. THE Library SHALL use English for all variable names, function names, and type names
10. THE Library SHALL provide i18n-ready error messages (externalized strings where applicable)
11. THE Library SHALL audit all Storybook stories for sensitive data
12. THE Library SHALL audit all test fixtures for sensitive data

### Requirement 5: CI/CD 配置

**User Story:** As a library maintainer, I want automated CI/CD pipelines, so that code quality is maintained and releases are automated.

#### Acceptance Criteria

1. THE Library SHALL include GitHub Actions workflow for running tests on pull requests
2. THE Library SHALL include GitHub Actions workflow for automated npm publishing on release tags
3. THE CI workflow SHALL run linting, type checking, and unit tests
4. THE CI workflow SHALL run on multiple Node.js versions (18.x, 20.x, 22.x)
5. WHEN a version tag is pushed THEN THE CD workflow SHALL automatically publish to npm
6. THE CI workflow SHALL generate and upload test coverage reports

### Requirement 6: 贡献指南

**User Story:** As a potential contributor, I want clear contribution guidelines, so that I know how to contribute to the project.

#### Acceptance Criteria

1. THE Library SHALL include a CONTRIBUTING.md file with contribution guidelines
2. THE CONTRIBUTING.md SHALL describe the development setup process
3. THE CONTRIBUTING.md SHALL describe the pull request process
4. THE CONTRIBUTING.md SHALL describe coding standards and commit message conventions
5. THE Library SHALL include a CODE_OF_CONDUCT.md file
6. THE Library SHALL include issue and pull request templates

### Requirement 7: 许可证和法律文件

**User Story:** As a user, I want clear licensing information, so that I know how I can use the library.

#### Acceptance Criteria

1. THE Library SHALL include a LICENSE file with MIT license text
2. THE LICENSE file SHALL include the correct copyright year and holder
3. THE package.json SHALL specify the license field as "MIT"
4. IF the library includes third-party code THEN THE Library SHALL include proper attribution

### Requirement 8: 版本管理和变更日志

**User Story:** As a user, I want to track version changes, so that I can understand what changed between versions.

#### Acceptance Criteria

1. THE Library SHALL maintain a CHANGELOG.md following Keep a Changelog format
2. THE CHANGELOG SHALL document all notable changes for each version
3. THE CHANGELOG SHALL categorize changes as Added, Changed, Deprecated, Removed, Fixed, Security
4. WHEN a new version is released THEN THE CHANGELOG SHALL be updated before publishing

### Requirement 9: 示例项目

**User Story:** As a developer, I want working examples, so that I can quickly understand how to use the library.

#### Acceptance Criteria

1. THE Library SHALL include an examples directory with working code samples
2. THE examples SHALL demonstrate browser usage with vanilla HTML/JS
3. THE examples SHALL demonstrate Node.js usage for PDF generation
4. THE examples SHALL include comments explaining key concepts
5. WHEN examples use external dependencies THEN THE examples SHALL include package.json

### Requirement 10: Storybook 文档站点

**User Story:** As a developer, I want to preview components visually, so that I can understand the rendering output.

#### Acceptance Criteria

1. THE Library SHALL maintain Storybook stories for all section renderers
2. THE Storybook SHALL be deployable as a static documentation site
3. THE Storybook SHALL include interactive controls for testing different configurations
4. WHEN the library is updated THEN THE Storybook stories SHALL reflect the changes
