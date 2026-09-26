# StoreSnap Agent - Team Setup Guide

Welcome to the **StoreSnap** project! This tool allows you to easily download all business images, reviews, and data directly from Google Maps. 

Because this tool downloads large amounts of images and files directly to your laptop, it **must be run locally on your own computer**, not on a cloud server. 

Please follow these exact steps to set up and run the app on your laptop.

---

## Step 1: Install Node.js
If you don't already have Node.js installed on your laptop, you need it to run this project.
1. Go to [Node.js Official Website](https://nodejs.org/).
2. Download the **LTS (Long Term Support)** version.
3. Install it using the standard setup wizard.

---

## Step 2: Download the Code from GitHub
1. Go to our GitHub repository.
2. Click the green **"Code"** button.
3. Click **"Download ZIP"**.
4. Extract (unzip) the downloaded folder anywhere on your laptop (for example, on your Desktop).
5. Open this extracted folder inside your code editor (like **VS Code**).

---

## Step 3: Install Required Packages
1. Open the Terminal inside VS Code (Go to `Terminal` -> `New Terminal`).
2. Run the following command to download all the necessary project files:
   ```bash
   npm install
   ```
   *(Wait a minute or two for this to finish).*

---

## Step 4: Create the `.env.local` File (CRITICAL)
For security reasons, our API keys are not uploaded to GitHub. You must create a configuration file manually.

1. Inside the main project folder in VS Code, create a new file and name it exactly: `.env.local`
2. Open this new `.env.local` file and paste the following code into it:

```env
# Your Apify API Token (Replace this with your actual token)
APIFY_API_TOKEN=your_apify_api_token_here

# Do not change these lines
APIFY_ACTOR_ID=compass/crawler-google-places
APIFY_TIMEOUT_SECONDS=3600
MAX_BUSINESS_IMAGES=99999
MAX_REVIEW_IMAGES=99999
```

> **Note:** If you do not have an Apify API Token yet, please open the `APIFY_GUIDE.md` file in this folder. Copy its text, paste it into ChatGPT, and ChatGPT will guide you step-by-step on how to get your token for free!

---

## Step 5: Start the App!
1. In your VS Code Terminal, type:
   ```bash
   npm run dev
   ```
2. Wait a few seconds until the terminal says "Ready" or "Compiled successfully".
3. Open your web browser (Chrome, Edge, etc.) and go to:
   **http://localhost:3000**

You will see the StoreSnap interface. Just paste a Google Maps URL, click download, and all images and data will be saved inside a `downloads` folder directly on your computer!
