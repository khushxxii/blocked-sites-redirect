# Contributing to Exam Focus App

First off, thank you for considering contributing to Exam Focus!

This is a productivity app designed to help students stay focused during exam preparation. Every contribution helps students worldwide achieve their academic goals.

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please create an issue with:

- **Clear title** describing the bug
- **Steps to reproduce** the behavior
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details** (OS, Node version, browser)

### Suggesting Enhancements

We love new ideas! Create an issue with:

- **Clear description** of the feature
- **Why it would be useful** for students
- **Possible implementation** (if you have ideas)
- **Mockups or examples** (if applicable)

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Make your changes** following the code style below
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Write clear commit messages**
6. **Submit a pull request!**

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/blocked-sites-redirect.git
cd blocked-sites-redirect

# Install dependencies
npm install

# Start development server (auto-reload)
npm run dev

# Open in browser
# http://localhost:3000
```

## Code Style Guidelines

### JavaScript
- Use **const** and **let**, avoid **var**
- Use **template literals** for strings with variables
- Add **comments** for complex logic
- Use **async/await** for asynchronous code
- Keep functions **small and focused**

### HTML
- Use **semantic HTML5** elements
- Include **alt text** for images
- Use **meaningful IDs and classes**
- Keep structure **clean and indented**

### CSS
- Use **CSS variables** for colors and common values
- Keep selectors **specific but not overly complex**
- Group related styles together
- Add comments for complex animations

### Example:
```javascript
// Good
const calculateProgress = (completed, total) => {
    return total === 0 ? 0 : Math.round((completed / total) * 100);
};

// Not ideal
function calc(c, t) {
    return t == 0 ? 0 : Math.round((c / t) * 100);
}
```

## What We're Looking For

### High Priority
- **Bug fixes**
- **Accessibility improvements**
- **Mobile responsiveness**
- **Internationalization** (multi-language support)
- **Performance optimizations**

### Great Additions
- **Theme customization** (dark mode, custom colors)
- **Analytics features** (charts, graphs, insights)
- **Notification improvements**
- **Multi-user support** (login system)
- **Mobile app** (React Native?)
- **Cloud sync** (save data across devices)

### Nice to Have
- **Custom sounds** for timers
- **Gamification** (achievements, streaks)
- **Study groups** (collaborate with friends)
- **Study materials** storage
- **AI study suggestions**

## Testing

Before submitting a PR, please test:

1. **All pages load correctly**
   - Dashboard (`/`)
   - Tasks (`/tasks`)
   - Tracker (`/tracker`)
   - Blocked page (`/blocked`)

2. **All features work**
   - Create/edit/delete tasks
   - Start/complete study sessions
   - Set exam date
   - View statistics

3. **No console errors**
   - Check browser console (F12)
   - Fix any JavaScript errors

4. **Database operations**
   - Tasks save correctly
   - Sessions log properly
   - Settings persist

5. **Responsive design**
   - Test on mobile screen size
   - Test on tablet screen size
   - Test on desktop

## Commit Message Guidelines

Use clear, descriptive commit messages:

```bash
# Good examples
git commit -m "fix: correct timer display on mobile devices"
git commit -m "feat: add dark mode support"
git commit -m "docs: update setup guide with screenshots"
git commit -m "style: improve task card spacing"
git commit -m "refactor: simplify database query logic"

# Not ideal
git commit -m "fixed stuff"
git commit -m "updates"
git commit -m "wip"
```

### Format:
```
<type>: <description>

[optional body]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Maintenance tasks

## Code Review Process

1. **We'll review your PR** within a few days
2. **We may suggest changes** - don't take it personally!
3. **Make requested changes** by pushing to your branch
4. **Once approved**, we'll merge your contribution
5. **Your name** will be in the contributors list!

## What Not to Do

- Don't commit `node_modules/` or `exam_focus.db`
- Don't commit large binary files
- Don't include personal information or API keys
- Don't make unrelated changes in a single PR
- Don't submit PRs with failing tests

## Communication

- Be respectful and constructive
- Explain your reasoning
- Be patient - maintainers are volunteers
- Help others when you can

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## First Time Contributing?

No problem! Here's a simple contribution to get started:

1. Fix a typo in documentation
2. Add a comment to unclear code
3. Improve error messages
4. Add a new motivational quote

Every contribution counts, no matter how small!

## Thank You!

Your contributions help students worldwide stay focused and achieve their goals. Thank you for being part of this project!

---

**Questions?** Open an issue with the label "question" and we'll be happy to help!

Happy coding!

