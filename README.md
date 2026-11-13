# The Outfit Edit — GitHub Pages shop-the-reel site

A free static outfit catalog with one shareable URL per reel and a catalog editor that publishes directly to GitHub. No backend or paid services required.

## Publish to GitHub Pages

1. Create a **public** GitHub repository, e.g. `outfit-edit`.
2. Upload **all files and the assets folder** from this package to the repository root (do not upload the ZIP itself).
3. In the repository, go to **Settings → Pages → Build and deployment**, choose **Deploy from a branch**, branch **main**, folder **/(root)**, and save.
4. After deployment, open `https://YOUR-USERNAME.github.io/outfit-edit/`.
5. Each outfit has its own shareable link: `https://YOUR-USERNAME.github.io/outfit-edit/#/look/ethnic-edit-001`.

The `#/look/...` URL works on GitHub Pages without server routing rules.

## Add or edit outfits — automatic GitHub publishing

1. Create a **fine-grained personal access token** at GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens. Select **only this repository** and grant **Repository permissions → Contents → Read and write**. Set an expiration date.
2. Open `editor.html` locally using `python -m http.server 8000` from the project folder, then visit `http://localhost:8000/editor.html`. You can also use the hosted editor, but local use is safer when entering a token.
3. Enter `username/outfit-edit`, branch `main`, and paste the token. It stays in this browser tab's memory, is not saved to localStorage or the repository, and is sent only to `api.github.com` over HTTPS.
4. Add/edit looks and products. Click **Publish to GitHub ↑**. The editor commits `looks.json` directly to your repo and GitHub Pages updates after deployment. No manual download or upload required.
5. Copy a look's `/#/look/LOOK-ID` URL for your Instagram DM automation.

**Important security:** Never put your token in `looks.json`, GitHub commits, screenshots, or shared computers. Anyone who obtains it can modify the repository. Revoke it in GitHub if exposed. If the repository is managed by an organization, token approval may be needed. Publishing requires internet access and a repo you can write to.

**Alternative:** **Backup looks.json ↓** still downloads the catalog for manual publishing. The editor loads the current deployed catalog on refresh; it does not autosave incomplete edits.

### Images

You can paste an image URL, add a relative asset path (e.g. `assets/suit1.jpg`) and upload that image to your GitHub repo, or upload the photo in the editor (which embeds it inside `looks.json`). Embedded images make the JSON bigger; compress images to around 200–400 KB each for good performance. Only use product images you have permission to display; Amazon's program imposes special rules on product content and images. Do not scrape Amazon images or prices.

### Affiliate compliance

- Add your deployed site URL to **Amazon Associates Central** as a declared traffic source, and ensure your Instagram account is declared too.
- Use your own tagged Associates links in product buttons. Test that your affiliate tag is preserved.
- The footer and look pages contain affiliate disclosures. Review and customize them to your affiliate programs and applicable rules.
- The sample outfit contains placeholder images and **no active affiliate links**. Replace these before sharing.
- Use only approved product images and descriptions, and follow the Amazon Associates Operating Agreement, including restrictions on product data, imagery and link cloaking.

### Customize

Edit the brand name and disclosure in `index.html`, the home hero copy in `app.js`, and colors in `style.css`. The editor is at `editor.html`.
