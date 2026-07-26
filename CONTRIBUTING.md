# Contributing to Second Brain

Thank you for your interest in contributing to Second Brain! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/second-brain.git`
3. Install dependencies: `npm install --legacy-peer-deps`
4. Set up environment variables (see `.env.example`)
5. Run development server: `npm run dev`

## Development Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or updates

Example: `feature/add-search-functionality`

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build process or auxiliary tool changes

Examples:
```
feat(blog): add search functionality
fix(auth): resolve magic link expiration issue
docs(readme): update installation instructions
```

### Code Style

- Use TypeScript strictly
- Follow ESLint rules: `npm run lint`
- Format code with Prettier: `npm run format`
- Run type check: `npm run type-check`

### Pull Request Process

1. Create a new branch from `main`
2. Make your changes
3. Run tests and linting:
   ```bash
   npm run lint
   npm run type-check
   npm run build
   ```
4. Commit your changes with conventional commit messages
5. Push to your fork
6. Open a Pull Request to `main`
7. Fill in the PR template
8. Wait for review

### PR Requirements

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] Type check passes
- [ ] No linting errors
- [ ] Documentation updated (if applicable)
- [ ] Commit messages follow convention
- [ ] PR description is clear and complete

## Code Guidelines

### File Structure

- Place components in appropriate directories:
  - `src/components/ui/` - Reusable UI components
  - `src/components/features/` - Feature-specific components
  - `src/components/layout/` - Layout components
  - `src/lib/actions/` - Server actions
  - `src/lib/validations/` - Zod schemas

### TypeScript

- Always use TypeScript
- Define proper types/interfaces
- Avoid `any` type
- Use type inference where possible

### React Best Practices

- Use Server Components by default
- Add `"use client"` only when necessary
- Implement proper loading and error states
- Follow Next.js 15 patterns

### Accessibility

- Use semantic HTML
- Include ARIA labels where needed
- Ensure keyboard navigation
- Test with screen readers

## Testing

(To be implemented)

```bash
npm run test          # Run tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## Database Changes

If your PR includes database schema changes:

1. Update `prisma/schema.prisma`
2. Generate migration: `npx prisma migrate dev --name your-migration-name`
3. Update TypeScript types if needed
4. Document changes in PR description

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for complex functions
- Update API documentation if adding/changing endpoints

## Questions?

- Open an issue for bugs or feature requests
- Use discussions for questions and ideas
- Tag maintainers for urgent matters

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone.

### Our Standards

- Be respectful and inclusive
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

### Enforcement

Instances of abusive, harassing, or unacceptable behavior may be reported to the project maintainers.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Second Brain! 🎉
