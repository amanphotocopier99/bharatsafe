/* ==========================================================================
   BHARATSAFE ADMIN PORTAL ENGINE
   ========================================================================== */

// --- UTILITY: CONVERT FILE TO BASE64 ---
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    if (!file) return resolve("");
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

// --- TAB ROUTING & HEADING LOGIC ---
const tabs = document.querySelectorAll(".admin-tab-btn");
const tabViews = document.querySelectorAll(".admin-tab-view");
const viewTitle = document.getElementById("view-heading-title");
const primaryStatCount = document.getElementById("stat-primary-count");
const primaryStatLabel = document.getElementById("stat-primary-label");
const secondaryStatCount = document.getElementById("stat-secondary-count");
const secondaryStatLabel = document.getElementById("stat-secondary-label");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tabViews.forEach((v) => v.classList.remove("active"));

    tab.classList.add("active");
    const target = tab.dataset.tab;
    document.getElementById(target).classList.add("active");

    updateHeaderStats(target);
  });
});

function updateHeaderStats(activeTab) {
  if (activeTab === "tab-journal") {
    viewTitle.innerHTML = "Journal<br /><em>manager.</em>";
    const posts = getStorage("bs_posts");
    primaryStatCount.textContent = posts.length;
    primaryStatLabel.textContent = "Total posts";
    secondaryStatCount.textContent = posts.filter((p) => p.published).length;
    secondaryStatLabel.textContent = "Published";
  } else if (activeTab === "tab-products") {
    viewTitle.innerHTML = "Product<br /><em>catalog.</em>";
    const prods = getStorage("bs_products");
    primaryStatCount.textContent = prods.length;
    primaryStatLabel.textContent = "Total products";
    secondaryStatCount.textContent = prods.filter((p) => p.category === "bike").length;
    secondaryStatLabel.textContent = "Bike tags";
    document.getElementById("stat-active-tags").textContent = prods.length;
  } else if (activeTab === "tab-leads") {
    viewTitle.innerHTML = "Customer<br /><em>submissions.</em>";
    const leads = getStorage("bs_leads");
    primaryStatCount.textContent = leads.length;
    primaryStatLabel.textContent = "Submissions";
    secondaryStatCount.textContent = leads.filter((l) => l.status === "New").length;
    secondaryStatLabel.textContent = "Pending (New)";
  }
}

// Storage helpers
const getStorage = (key) => JSON.parse(localStorage.getItem(key) || "[]");
const setStorage = (key, data) => localStorage.setItem(key, JSON.stringify(data));

/* ==========================================================================
   1. JOURNAL / BLOGS LOGIC (Preserving your original model + image upgrade)
   ========================================================================== */
const postForm = document.getElementById("post-form");
const postList = document.getElementById("admin-post-list");
const postTitleInput = document.getElementById("post-title");
const postCategoryInput = document.getElementById("post-category");
const postCoverInput = document.getElementById("post-cover");
const postCoverPreview = document.getElementById("post-cover-preview");
const postExcerptInput = document.getElementById("post-excerpt");
const postContentInput = document.getElementById("post-content");
const postPublishedInput = document.getElementById("post-published");
const cancelEditBtn = document.getElementById("cancel-edit");
const editorTitle = document.getElementById("editor-title");
const submitLabel = document.getElementById("submit-label");
const formMessage = document.getElementById("form-message");

let editingPostId = null;
let currentPostCoverBase64 = "";

postCoverInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (file) {
    currentPostCoverBase64 = await fileToBase64(file);
    postCoverPreview.src = currentPostCoverBase64;
    postCoverPreview.style.display = "block";
  }
});

function renderPosts() {
  const posts = getStorage("bs_posts");
  updateHeaderStats("tab-journal");

  if (!posts.length) {
    postList.innerHTML = `<p style="opacity: 0.6; padding: 12px 0;">No stories created yet. Use the editor above to publish your first journal story.</p>`;
    return;
  }

  postList.innerHTML = posts
    .map(
      (post) => `
    <article class="post-row" style="display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.08);">
      <div style="display: flex; gap: 14px; align-items: center;">
        ${post.cover ? `<img src="${post.cover}" class="table-thumb" alt="" />` : ""}
        <div>
          <strong style="display: block; font-size: 1rem;">${escapeHtml(post.title)}</strong>
          <small style="opacity: 0.6;">${post.category} · ${post.date} · ${post.published ? "Published" : "Draft"}</small>
        </div>
      </div>
      <div class="action-btn-group">
        <button class="btn-sm-action" onclick="editPost('${post.id}')">Edit</button>
        <button class="btn-sm-danger" onclick="deletePost('${post.id}')">Delete</button>
      </div>
    </article>
  `
    )
    .join("");
}

postForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const posts = getStorage("bs_posts");

  const postData = {
    id: editingPostId || Date.now().toString(),
    title: postTitleInput.value.trim(),
    category: postCategoryInput.value,
    cover: currentPostCoverBase64,
    excerpt: postExcerptInput.value.trim(),
    content: postContentInput.value.trim(),
    published: postPublishedInput.checked,
    date: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
  };

  if (editingPostId) {
    const idx = posts.findIndex((p) => p.id === editingPostId);
    if (idx !== -1) posts[idx] = postData;
  } else {
    posts.unshift(postData);
  }

  setStorage("bs_posts", posts);
  resetPostForm();
  renderPosts();
  showMessage(formMessage, "Story saved successfully.");
});

window.editPost = (id) => {
  const posts = getStorage("bs_posts");
  const post = posts.find((p) => p.id === id);
  if (!post) return;

  editingPostId = post.id;
  postTitleInput.value = post.title;
  postCategoryInput.value = post.category;
  postExcerptInput.value = post.excerpt;
  postContentInput.value = post.content;
  postPublishedInput.checked = post.published;
  currentPostCoverBase64 = post.cover || "";

  if (currentPostCoverBase64) {
    postCoverPreview.src = currentPostCoverBase64;
    postCoverPreview.style.display = "block";
  }

  editorTitle.textContent = "Edit story";
  submitLabel.textContent = "Update story";
  cancelEditBtn.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
};

window.deletePost = (id) => {
  if (!confirm("Are you sure you want to delete this story?")) return;
  let posts = getStorage("bs_posts");
  posts = posts.filter((p) => p.id !== id);
  setStorage("bs_posts", posts);
  renderPosts();
};

cancelEditBtn.addEventListener("click", resetPostForm);

function resetPostForm() {
  postForm.reset();
  editingPostId = null;
  currentPostCoverBase64 = "";
  postCoverPreview.style.display = "none";
  editorTitle.textContent = "Write a new story";
  submitLabel.textContent = "Publish story";
  cancelEditBtn.hidden = true;
}

/* ==========================================================================
   2. PRODUCTS MANAGEMENT LOGIC
   ========================================================================== */
const productForm = document.getElementById("product-form");
const productTableBody = document.getElementById("product-table-body");
const prodTitleInput = document.getElementById("prod-title");
const prodCategoryInput = document.getElementById("prod-category");
const prodPriceInput = document.getElementById("prod-price");
const prodImgInput = document.getElementById("prod-img");
const prodImgPreview = document.getElementById("prod-img-preview");
const prodDescInput = document.getElementById("prod-desc");
const cancelProdEditBtn = document.getElementById("cancel-product-edit");
const prodSubmitLabel = document.getElementById("prod-submit-label");
const prodFormMessage = document.getElementById("prod-form-message");

let editingProdId = null;
let currentProdImageBase64 = "";

prodImgInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (file) {
    currentProdImageBase64 = await fileToBase64(file);
    prodImgPreview.src = currentProdImageBase64;
    prodImgPreview.style.display = "block";
  }
});

function renderProducts() {
  const products = getStorage("bs_products");
  updateHeaderStats("tab-products");

  if (!products.length) {
    productTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; opacity: 0.6; padding: 24px;">No products added yet.</td></tr>`;
    return;
  }

  productTableBody.innerHTML = products
    .map(
      (prod) => `
    <tr>
      <td>
        <img src="${prod.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'/%3E"}" class="table-thumb" alt="" />
      </td>
      <td><strong>${escapeHtml(prod.title)}</strong><br/><small style="opacity: 0.6;">${escapeHtml(prod.description || "")}</small></td>
      <td style="text-transform: capitalize;">${prod.category}</td>
      <td><strong>₹${prod.price}</strong></td>
      <td>
        <div class="action-btn-group">
          <button class="btn-sm-action" onclick="editProduct('${prod.id}')">Edit</button>
          <button class="btn-sm-danger" onclick="deleteProduct('${prod.id}')">Delete</button>
        </div>
      </td>
    </tr>
  `
    )
    .join("");
}

productForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const products = getStorage("bs_products");

  const productData = {
    id: editingProdId || Date.now().toString(),
    title: prodTitleInput.value.trim(),
    category: prodCategoryInput.value,
    price: prodPriceInput.value.trim(),
    description: prodDescInput.value.trim(),
    image: currentProdImageBase64,
  };

  if (editingProdId) {
    const idx = products.findIndex((p) => p.id === editingProdId);
    if (idx !== -1) products[idx] = productData;
  } else {
    products.unshift(productData);
  }

  setStorage("bs_products", products);
  resetProductForm();
  renderProducts();
  showMessage(prodFormMessage, "Product saved successfully.");
});

window.editProduct = (id) => {
  const products = getStorage("bs_products");
  const prod = products.find((p) => p.id === id);
  if (!prod) return;

  editingProdId = prod.id;
  prodTitleInput.value = prod.title;
  prodCategoryInput.value = prod.category;
  prodPriceInput.value = prod.price;
  prodDescInput.value = prod.description || "";
  currentProdImageBase64 = prod.image || "";

  if (currentProdImageBase64) {
    prodImgPreview.src = currentProdImageBase64;
    prodImgPreview.style.display = "block";
  }

  prodSubmitLabel.textContent = "Update product";
  cancelProdEditBtn.hidden = false;
};

window.deleteProduct = (id) => {
  if (!confirm("Are you sure you want to delete this product?")) return;
  let products = getStorage("bs_products");
  products = products.filter((p) => p.id !== id);
  setStorage("bs_products", products);
  renderProducts();
};

cancelProdEditBtn.addEventListener("click", resetProductForm);

function resetProductForm() {
  productForm.reset();
  editingProdId = null;
  currentProdImageBase64 = "";
  prodImgPreview.style.display = "none";
  prodSubmitLabel.textContent = "Save product";
  cancelProdEditBtn.hidden = true;
}

/* ==========================================================================
   3. CUSTOMER FORM SUBMISSIONS / LEADS LOGIC
   ========================================================================== */
const leadsTableBody = document.getElementById("leads-table-body");
const exportLeadsBtn = document.getElementById("export-leads-btn");

function renderLeads() {
  const leads = getStorage("bs_leads");
  updateHeaderStats("tab-leads");

  if (!leads.length) {
    leadsTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; opacity: 0.6; padding: 24px;">No customer activations or inquiries recorded yet.</td></tr>`;
    return;
  }

  leadsTableBody.innerHTML = leads
    .map(
      (lead, index) => `
    <tr>
      <td>${lead.date || "—"}</td>
      <td><strong>${escapeHtml(lead.name || "N/A")}</strong></td>
      <td>${escapeHtml(lead.phone || "N/A")}</td>
      <td>${escapeHtml(lead.emergencyPhone || "—")}</td>
      <td>${escapeHtml(lead.category || "General")}</td>
      <td>
        <span class="status-pill ${lead.status === "Resolved" ? "status-resolved" : "status-new"}">
          ${lead.status || "New"}
        </span>
      </td>
      <td>
        <div class="action-btn-group">
          <button class="btn-sm-action" onclick="toggleLeadStatus(${index})">Toggle</button>
          <button class="btn-sm-danger" onclick="deleteLead(${index})">Delete</button>
        </div>
      </td>
    </tr>
  `
    )
    .join("");
}

window.toggleLeadStatus = (index) => {
  const leads = getStorage("bs_leads");
  leads[index].status = leads[index].status === "Resolved" ? "New" : "Resolved";
  setStorage("bs_leads", leads);
  renderLeads();
};

window.deleteLead = (index) => {
  if (!confirm("Delete this submission record?")) return;
  const leads = getStorage("bs_leads");
  leads.splice(index, 1);
  setStorage("bs_leads", leads);
  renderLeads();
};

exportLeadsBtn.addEventListener("click", () => {
  const leads = getStorage("bs_leads");
  if (!leads.length) return alert("No lead data to export.");

  const headers = ["Date", "Name", "Phone", "Emergency Phone", "Category", "Status"];
  const rows = leads.map((l) => [
    `"${l.date || ""}"`,
    `"${l.name || ""}"`,
    `"${l.phone || ""}"`,
    `"${l.emergencyPhone || ""}"`,
    `"${l.category || ""}"`,
    `"${l.status || "New"}"`,
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `BharatSafe_Submissions_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// Helpers
function escapeHtml(str) {
  const div = document.createElement("div");
  div.innerText = str;
  return div.innerHTML;
}

function showMessage(el, text) {
  el.textContent = text;
  el.style.opacity = "1";
  setTimeout(() => {
    el.style.opacity = "0";
  }, 3000);
}

// Initial Boot
renderPosts();
renderProducts();
renderLeads();