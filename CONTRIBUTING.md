# Contributing to VibePort

Thank you for your interest in contributing to VibePort! 🎉

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/vibeport.git
   cd vibeport
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your proxy URL
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   # Open http://localhost:3000
   ```

## Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow existing code style
   - Add TypeScript types
   - Use Tailwind CSS classes
   - Keep components small and reusable

3. **Test Your Changes**
   ```bash
   npm run type-check
   npm run lint
   npm run build
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   # Open PR on GitHub
   ```

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style (formatting, no logic change)
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `test:` Adding tests
- `chore:` Maintenance tasks

**Examples:**
```
feat: add WebSocket live monitoring
fix: resolve quota calculation bug
docs: update installation guide
style: format code with prettier
refactor: extract chart component
perf: optimize dashboard rendering
test: add model playground tests
chore: update dependencies
```

## Code Style

### TypeScript
- Use explicit types (avoid `any`)
- Define interfaces for props
- Use async/await over promises
- Prefer const over let

### React
- Functional components with hooks
- Extract reusable components
- Use semantic HTML
- Keep JSX clean and readable

### Tailwind CSS
- Use utility classes
- Follow design system tokens
- Group related classes
- Use responsive variants

### File Structure
```
src/
├── app/              # Pages (App Router)
├── components/       # Reusable components
│   ├── ui/          # Base UI components
│   └── [feature]/   # Feature-specific
├── lib/             # Utilities
│   ├── api/         # API clients
│   ├── hooks/       # Custom hooks
│   └── utils/       # Helper functions
└── types/           # TypeScript types
```

## Pull Request Guidelines

### Before Submitting
- [ ] Code follows project style
- [ ] TypeScript types are correct
- [ ] No lint errors (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Tested locally
- [ ] Updated documentation if needed

### PR Description
- **Title:** Clear, descriptive, follows commit convention
- **Description:** What, why, and how
- **Screenshots:** For UI changes
- **Breaking Changes:** If any
- **Related Issues:** Link to issues

### Example PR Template
```markdown
## Description
Brief description of what this PR does.

## Changes
- Added feature X
- Fixed bug Y
- Updated documentation Z

## Screenshots
(if applicable)

## Testing
Steps to test this PR:
1. ...
2. ...

## Checklist
- [x] Code follows style guidelines
- [x] TypeScript types added
- [x] Tested locally
- [x] Documentation updated
```

## Feature Requests

Have an idea? Open an issue with:
- **Title:** Feature: [Your Feature]
- **Description:** What problem does it solve?
- **Use Case:** When would you use it?
- **Mockups:** If applicable

## Bug Reports

Found a bug? Open an issue with:
- **Title:** Bug: [Brief Description]
- **Environment:** OS, Node version, browser
- **Steps to Reproduce:** 1, 2, 3...
- **Expected:** What should happen
- **Actual:** What actually happened
- **Screenshots:** If applicable

## Questions?

- 💬 Open a [Discussion](https://github.com/xodapi/vibeport/discussions)
- 🐛 File an [Issue](https://github.com/xodapi/vibeport/issues)
- 📧 Email: support@vibeport.dev

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for making VibePort better! 🚀**
