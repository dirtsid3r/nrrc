# Nuclear Reactor Recovery Console (NRRC)

An interactive nuclear reactor simulation game where players solve puzzles to prevent a meltdown. Features include:

- Interactive reactor diagram with real-time status visualization
- Multiple puzzle types including passphrase and sorting challenges
- NEXUS-AI emergency assistant system
- Animated typewriter effects and sound effects
- Responsive design for various screen sizes

## Deployment to GitHub Pages

This project is configured to be deployed to GitHub Pages:

1. Create a GitHub repository named "nrrc"
2. Connect your local repository to GitHub:
   ```bash
   git remote add origin https://github.com/dirtsid3r/nrrc.git
   git push -u origin main
   ```
3. Enable GitHub Pages in your repository settings:
   - Go to Settings > Pages
   - Set the source to "GitHub Actions"
   - The workflow will automatically build and deploy the site

## Local Development

To run the project locally:

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Building for Production

To build the project for production:

```bash
npm run build
```

This will create a static export in the `out` directory, which can be served by any static hosting service. 