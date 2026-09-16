const $ = (id) => document.getElementById(id);
const state = { owner: "ashhh857", repo: "Perfect-moment", token: "", gallery: [], gallerySha: null };

const loginPanel = $("login-panel");
const dashboard = $("dashboard");
const loginForm = $("login-form");
const loginError = $("login-error");
const uploadForm = $("upload-form");
const uploadButton = $("upload-button");
const uploadStatus = $("upload-status");
const photoList = $("photo-list");
const emptyState = $("empty-state");
const photoCount = $("photo-count");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginError.hidden = true;
  state.owner = $("github-owner").value.trim();
  state.repo = $("github-repo").value.trim();
  state.token = $("github-token").value.trim();
  if (!state.owner || !state.repo || !state.token) return showLoginError("Please fill all fields.");
  try {
    await github("GET", `/repos/${encodeURIComponent(state.owner)}/${encodeURIComponent(state.repo)}`);
    await loadGallery();
    loginPanel.hidden = true;
    dashboard.hidden = false;
  } catch (error) {
    showLoginError(error.message || "GitHub access failed. Check the username, repository and token permissions.");
    state.token = "";
  }
});

$("logout").addEventListener("click", () => {
  state.token = "";
  $("github-token").value = "";
  dashboard.hidden = true;
  loginPanel.hidden = false;
});

uploadForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const file = $("photo").files[0];
  if (!file) return setStatus("Choose a photo first.", true);
  uploadButton.disabled = true;
  setStatus("Preparing photo…");
  try {
    const prepared = await prepareImage(file);
    const safeBase = slug($("photo-title").value) || "decoration";
    const filename = `${Date.now()}-${safeBase}.webp`;
    const path = `assets/portfolio/${filename}`;
    setStatus("Uploading photo to GitHub…");
    await putFile(path, prepared.base64, `Add portfolio photo: ${$("photo-title").value.trim()}`);

    const item = {
      id: filename.replace(/\.webp$/i, ""),
      title: $("photo-title").value.trim(),
      category: $("photo-category").value,
      alt: $("photo-alt").value.trim() || $("photo-title").value.trim(),
      url: `assets/portfolio/${filename}`,
      published: $("photo-published").checked,
      createdAt: new Date().toISOString()
    };
    state.gallery.unshift(item);
    setStatus("Saving gallery list…");
    await saveGallery(`Update gallery for: ${item.title}`);
    renderList();
    uploadForm.reset();
    $("photo-published").checked = true;
    setStatus("Done. The photo is published. GitHub Pages may take a short while to refresh.");
  } catch (error) {
    console.error(error);
    setStatus(error.message || "Upload failed.", true);
  } finally {
    uploadButton.disabled = false;
  }
});

async function loadGallery() {
  const result = await github("GET", `/repos/${encodeURIComponent(state.owner)}/${encodeURIComponent(state.repo)}/contents/gallery.json?ref=main`);
  state.gallerySha = result.sha;
  try {
    const text = decodeBase64(result.content);
    state.gallery = JSON.parse(text);
    if (!Array.isArray(state.gallery)) state.gallery = [];
  } catch { state.gallery = []; }
  renderList();
}

async function saveGallery(message) {
  const encoded = base64EncodeUtf8(JSON.stringify(state.gallery, null, 2) + "\n");
  const body = { message, content: encoded, branch: "main" };
  if (state.gallerySha) body.sha = state.gallerySha;
  const result = await github("PUT", `/repos/${encodeURIComponent(state.owner)}/${encodeURIComponent(state.repo)}/contents/gallery.json`, body);
  state.gallerySha = result.content?.sha || state.gallerySha;
}

async function putFile(path, base64, message) {
  return github("PUT", `/repos/${encodeURIComponent(state.owner)}/${encodeURIComponent(state.repo)}/contents/${path.split("/").map(encodeURIComponent).join("/")}`, {
    message, content: base64, branch: "main"
  });
}

async function deletePhoto(item) {
  if (!confirm(`Delete “${item.title}” from the website?`)) return;
  try {
    setStatus("Deleting photo…");
    const file = await github("GET", `/repos/${encodeURIComponent(state.owner)}/${encodeURIComponent(state.repo)}/contents/${item.url.split("/").map(encodeURIComponent).join("/")}?ref=main`);
    await github("DELETE", `/repos/${encodeURIComponent(state.owner)}/${encodeURIComponent(state.repo)}/contents/${item.url.split("/").map(encodeURIComponent).join("/")}`, { message: `Delete portfolio photo: ${item.title}`, sha: file.sha, branch: "main" });
    state.gallery = state.gallery.filter(x => x.id !== item.id);
    await saveGallery(`Remove portfolio photo: ${item.title}`);
    renderList();
    setStatus("Photo deleted.");
  } catch (error) {
    setStatus(error.message || "Delete failed.", true);
  }
}

async function togglePublish(item) {
  try {
    item.published = !item.published;
    setStatus("Saving visibility…");
    await saveGallery(`${item.published ? "Publish" : "Hide"} portfolio photo: ${item.title}`);
    renderList();
    setStatus(item.published ? "Photo published." : "Photo hidden from the website.");
  } catch (error) {
    item.published = !item.published;
    setStatus(error.message || "Could not update photo.", true);
  }
}

function renderList() {
  photoList.innerHTML = "";
  photoCount.textContent = String(state.gallery.length);
  emptyState.hidden = state.gallery.length > 0;
  state.gallery.forEach(item => {
    const row = document.createElement("article");
    row.className = "admin-photo-row";
    row.innerHTML = `<img src="${escapeAttr(item.url)}" alt=""><div class="admin-photo-meta"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.category || "Decoration")} · ${item.published ? "Published" : "Hidden"}</small></div>`;
    const actions = document.createElement("div");
    actions.className = "admin-photo-actions";
    const toggle = document.createElement("button"); toggle.className = "button button-outline"; toggle.type = "button"; toggle.textContent = item.published ? "Hide" : "Publish"; toggle.onclick = () => togglePublish(item);
    const del = document.createElement("button"); del.className = "button button-outline"; del.type = "button"; del.textContent = "Delete"; del.onclick = () => deletePhoto(item);
    actions.append(toggle, del); row.appendChild(actions); photoList.appendChild(row);
  });
}

async function github(method, endpoint, body) {
  const response = await fetch(`https://api.github.com${endpoint}`, {
    method,
    headers: { "Accept": "application/vnd.github+json", "Authorization": `Bearer ${state.token}`, "X-GitHub-Api-Version": "2022-11-28", ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `GitHub API error (${response.status})`);
  return data;
}

async function prepareImage(file) {
  if (file.size <= 2 * 1024 * 1024 && file.type === "image/webp") return { base64: await fileToBase64(file) };
  const bitmap = await createImageBitmap(file);
  const max = 1800;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/webp", 0.82));
  if (!blob) throw new Error("Your browser could not convert this image.");
  if (blob.size > 2 * 1024 * 1024) throw new Error("Image is still over 2 MB after compression. Please choose a smaller photo.");
  return { base64: await fileToBase64(blob) };
}

function fileToBase64(file) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(",")[1]); reader.onerror = reject; reader.readAsDataURL(file); }); }
function decodeBase64(value) { const bin = atob(String(value).replace(/\n/g, "")); const bytes = Uint8Array.from(bin, c => c.charCodeAt(0)); return new TextDecoder().decode(bytes); }
function base64EncodeUtf8(value) { const bytes = new TextEncoder().encode(value); let bin = ""; bytes.forEach(b => bin += String.fromCharCode(b)); return btoa(bin); }
function slug(value) { return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50); }
function setStatus(message, error = false) { uploadStatus.textContent = message; uploadStatus.classList.toggle("is-error", error); }
function showLoginError(message) { loginError.textContent = message; loginError.hidden = false; }
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c])); }
function escapeAttr(value) { return escapeHtml(value); }
