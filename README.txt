PERFECT MOMENTS — PREMIUM V5 FREE GALLERY ADMIN

This version uses GitHub as the free photo storage and GitHub API for the owner dashboard. No Firebase and no paid billing plan are required.

ONE-TIME SETUP
1. Upload/replace ALL files from this package in the GitHub repository: ashhh857/Perfect-moment. Do not upload the ZIP itself.
2. Make sure the repository default branch is main.
3. Open the live website and then /admin.html.
4. Create a GitHub Fine-grained Personal Access Token (PAT) with access limited to the Perfect-moment repository and Contents: Read and write.
5. Enter the username, repository name and token in the dashboard. The token is used only for the current browser session and is not saved by the dashboard.
6. Upload genuine Perfect Moments project photos. The dashboard writes images to assets/portfolio/ and updates gallery.json.

IMPORTANT SECURITY
- NEVER put the GitHub token into HTML, JavaScript, screenshots, WhatsApp messages, or public GitHub files.
- Use a fine-grained token restricted to this one repository.
- Do not give the token to anyone else.
- If the token is ever exposed, revoke it immediately in GitHub and create a new one.
- This is a practical ₹0 setup, not a server-side authentication system. The token itself is the owner credential.

PHOTO RULE
Only upload genuine work completed by Perfect Moments. The built-in images are sample visuals and should not be presented as customer work.

TECHNICAL
- Public gallery reads gallery.json from GitHub Pages.
- Admin uses the GitHub Contents API over HTTPS.
- Large images are resized/compressed to WebP in the browser before upload.
- The dashboard is marked noindex,nofollow.
- No Firebase billing or external database is required.
