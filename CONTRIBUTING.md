# Contributing to medical-form-printer

Thank you for your interest in contributing to medical-form-printer! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Message Convention](#commit-message-convention)

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Set up the development environment (see below)
4. Create a branch for your changes
5. Make your changes and commit them
6. Push to your fork and submit a pull request

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm or bun

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/medical-form-printer.git
cd medical-form-printer

# Install dependencies
npm install

# Run tests to verify setup
npm test
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Build the library for production |
| `npm run dev` | Build in watch mode for development |
| `npm test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run storybook` | Start Storybook development server |
| `npm run build-storybook` | Build Storybook for deployment |

## Making Changes

1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. Make your changes, following the [coding standards](#coding-standards)

3. Write or update tests as needed

4. Run the test suite:
   ```bash
   npm test
   ```

5. Run linting and type checking:
   ```bash
   npm run lint
   npm run typecheck
   ```

6. Commit your changes following the [commit message convention](#commit-message-convention)

## Pull Request Process

1. Update documentation if you're changing functionality
2. Add or update tests for your changes
3. Ensure all tests pass and there are no linting errors
4. Update the CHANGELOG.md with your changes under the "Unreleased" section
5. Submit your pull request with a clear description of the changes

### PR Requirements

- [ ] Tests pass (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] No type errors (`npm run typecheck`)
- [ ] Documentation updated (if applicable)
- [ ] CHANGELOG.md updated

### Review Process

1. A maintainer will review your PR
2. Address any feedback or requested changes
3. Once approved, a maintainer will merge your PR

## Coding Standards

### TypeScript

- Use TypeScript for all source files
- Enable strict mode
- Provide explicit types for function parameters and return values
- Use interfaces for object shapes
- Avoid `any` type; use `unknown` if type is truly unknown

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in multi-line arrays and objects
- Maximum line length: 100 characters
- Use meaningful variable and function names

### Documentation

- Add JSDoc comments to all public functions and types
- Include `@param`, `@returns`, and `@example` annotations
- Keep comments up-to-date with code changes

### Testing

- Write tests for new functionality
- Maintain or improve code coverage
- Use descriptive test names
- Test edge cases and error conditions

## Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `style` | Code style changes (formatting, semicolons, etc.) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `build` | Changes to build system or dependencies |
| `ci` | Changes to CI configuration |
| `chore` | Other changes that don't modify src or test files |

### Examples

```bash
feat(renderer): add support for custom page sizes

fix(pdf): resolve font embedding issue on Windows

docs(readme): update installation instructions

test(sections): add tests for table section renderer
```

### Rules

- Use lowercase for type and scope
- Keep subject line under 72 characters
- Use imperative mood ("add" not "added" or "adds")
- Don't end subject line with a period
- Separate subject from body with a blank line
- Use body to explain what and why, not how

## Questions?

If you have questions, feel free to:

- Open an issue for discussion
- Check existing issues and pull requests

Thank you for contributing!
