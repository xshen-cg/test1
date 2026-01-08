# Deployment Guide

This project is configured to deploy automatically to GitHub Pages using GitHub Actions.

## Prerequisites

1.  **GitHub Repository**: This code must be pushed to a GitHub repository.
2.  **Settings**:
    *   Go to **Settings** -> **Pages**.
    *   Under **Build and deployment**, select **GitHub Actions** as the source.

## How it works

The deployment pipeline is defined in `.github/workflows/deploy.yml`. It triggers on:
*   Pushes to the `main` branch.
*   Manual trigger via the "Run workflow" button in the Actions tab.

The workflow performs the following steps:
1.  **Checkout**: Fetches the code.
2.  **Setup Node**: Installs Node.js.
3.  **Install Dependencies**: Runs `npm ci`.
4.  **Build**: Runs `npm run build`.
    *   *Note*: If you use API keys that are needed at build time, ensure they are added to the repository Secrets (Settings -> Secrets and variables -> Actions) as `GEMINI_API_KEY`.
5.  **Deploy**: Uploads the `dist` folder to GitHub Pages.

## Manual Deployment (Local)

To build and preview locally:

```bash
npm run build
npm run preview
```
