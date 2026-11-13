
'use strict';

let looks = [];
let selected = -1;

const $ = id => document.getElementById(id);

const escapeHTML = value =>
  String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));

const notify = message => {
  $('status').textContent = message;
};

function refresh() {
  const picker = $('pick');

  if (selected < 0 && looks.length) selected = 0;
  if (selected >= looks.length) selected = looks.length - 1;

  picker.innerHTML = looks.map((look, index) =>
    `<option value="${index}">${escapeHTML(look.title || 'Untitled look')} (${escapeHTML(look.id)})</option>`
  ).join('');

  if (selected >= 0) picker.value = String(selected);
  render();
}

function refreshPickerLabel() {
  if (selected >= 0 && $('pick').options[selected]) {
    $('pick').options[selected].textContent =
      `${looks[selected].title} (${looks[selected].id})`;
  }
}

function render() {
  const form = $('form');

  if (selected < 0) {
    form.innerHTML =
      '<div class="empty">Click + New look to create your first outfit.</div>';
    return;
  }

  const look = looks[selected];
  if (!Array.isArray(look.products)) look.products = [];

  form.innerHTML = `
    <div class="panel">
      <h2>Look details</h2>

      <div class="row2">
        <div class="field">
          <label>Look ID (URL slug)</label>
          <input data-look="id" value="${escapeHTML(look.id)}">
        </div>

        <div class="field">
          <label>Category</label>
          <input data-look="category" value="${escapeHTML(look.category)}">
        </div>
      </div>

      <div class="field">
        <label>Title</label>
        <input data-look="title" value="${escapeHTML(look.title)}">
      </div>

      <div class="field">
        <label>Description</label>
        <textarea data-look="description">${escapeHTML(look.description)}</textarea>
      </div>

      <div class="field">
        <label>Cover photo URL or path</label>
        <input data-look="cover" value="${escapeHTML(look.cover)}">
      </div>

      <div class="field">
        <label>Or upload cover photo</label>
        <input type="file" accept="image/*" data-image="cover">
      </div>

      <button type="button" class="btn light danger" id="removeLook">
        Delete this look
      </button>
    </div>

    <div class="panel">
      <h2>Products (${look.products.length})</h2>

      <div id="products">
        ${look.products.map((product, index) => `
          <div class="productrow">
            <div class="row2">
              <div class="field">
                <label>Product name</label>
                <input
                  data-p="${index}"
                  data-key="name"
                  value="${escapeHTML(product.name)}"
                >
              </div>

              <div class="field">
                <label>Store</label>
                <select data-p="${index}" data-key="store">
                  <option ${product.store === 'Amazon' ? 'selected' : ''}>Amazon</option>
                  <option ${product.store === 'Meesho' ? 'selected' : ''}>Meesho</option>
                  <option ${product.store === 'Other' ? 'selected' : ''}>Other</option>
                </select>
              </div>
            </div>

            <div class="field">
              <label>Affiliate link (https://...)</label>
              <input
                data-p="${index}"
                data-key="url"
                value="${escapeHTML(product.url)}"
              >
            </div>

            <div class="field">
              <label>Product photo URL or path</label>
              <input
                data-p="${index}"
                data-key="image"
                value="${escapeHTML(product.image)}"
              >
            </div>

            <div class="field">
              <label>Or upload product photo</label>
              <input
                type="file"
                accept="image/*"
                data-image="product"
                data-p="${index}"
              >
            </div>

            <button
              type="button"
              class="btn light danger"
              data-remove="${index}"
            >
              Remove product
            </button>
          </div>
        `).join('')}
      </div>

      <button type="button" class="btn light" id="addProduct">
        + Add product
      </button>
    </div>
  `;

  form.querySelectorAll('[data-look]').forEach(input => {
    input.addEventListener('input', () => {
      look[input.dataset.look] = input.value;
      refreshPickerLabel();
    });
  });

  form.querySelectorAll('[data-key]').forEach(input => {
    input.addEventListener('input', () => {
      look.products[Number(input.dataset.p)][input.dataset.key] =
        input.value;
    });
  });

  form.querySelectorAll('[data-image]').forEach(input => {
    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        if (file.size > 1500000) {
          notify('Large image detected. Consider compressing it below 1.5 MB.');
        }

        const imageData = await readFileAsDataURL(file);

        if (input.dataset.image === 'cover') {
          look.cover = imageData;
        } else {
          look.products[Number(input.dataset.p)].image = imageData;
        }

        render();
        notify('Image added. Publish to save your changes.');
      } catch (error) {
        notify('Image upload failed: ' + error.message);
      }
    });
  });

  form.querySelectorAll('[data-remove]').forEach(button => {
    button.addEventListener('click', () => {
      look.products.splice(Number(button.dataset.remove), 1);
      render();
    });
  });

  $('addProduct').onclick = () => {
    look.products.push({
      name: 'New product',
      store: 'Amazon',
      image: 'assets/placeholder.svg',
      url: ''
    });

    render();
    notify('Product added. Enter its details below.');
  };

  $('removeLook').onclick = () => {
    if (confirm('Delete this look?')) {
      looks.splice(selected, 1);
      refresh();
      notify('Look deleted. Publish to save the change.');
    }
  };
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read image.'));
    reader.readAsDataURL(file);
  });
}

// Create a new outfit
$('new').onclick = () => {
  let number = looks.length + 1;
  let id = `look-${String(number).padStart(3, '0')}`;

  while (looks.some(look => look.id === id)) {
    number++;
    id = `look-${String(number).padStart(3, '0')}`;
  }

  looks.unshift({
    id,
    title: 'New outfit edit ♡',
    category: 'Fashion finds',
    description: 'Shop every piece from this reel.',
    cover: 'assets/placeholder.svg',
    products: []
  });

  selected = 0;
  refresh();
  notify('New look created. Add your products below.');
};

// Switch between outfits
$('pick').onchange = event => {
  selected = Number(event.target.value);
  render();
};

// Import an existing catalog
$('import').onchange = async event => {
  try {
    const file = event.target.files?.[0];
    if (!file) return;

    const data = JSON.parse(await file.text());

    if (!Array.isArray(data.looks)) {
      throw new Error('Missing looks array.');
    }

    looks = data.looks;
    selected = looks.length ? 0 : -1;
    refresh();

    notify(`Imported ${looks.length} looks.`);
  } catch (error) {
    notify('Import failed: ' + error.message);
  }
};

// Validate before publishing
function catalogJSON() {
  const ids = looks.map(look => look.id);

  if (new Set(ids).size !== ids.length) {
    throw new Error('Every look must have a unique ID.');
  }

  for (const look of looks) {
    if (!look.id || !Array.isArray(look.products)) {
      throw new Error('Invalid look details.');
    }

    for (const product of look.products) {
      if (product.url && !/^https:\/\//i.test(product.url)) {
        throw new Error('Affiliate links must begin with https://');
      }
    }
  }

  return JSON.stringify({ looks }, null, 2) + '\n';
}

// Download backup
$('export').onclick = () => {
  try {
    const content = catalogJSON();

    const blob = new Blob([content], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = 'looks.json';
    anchor.click();

    setTimeout(() => URL.revokeObjectURL(url), 2000);

    notify('Backup downloaded successfully.');
  } catch (error) {
    notify('Export failed: ' + error.message);
  }
};

// Encode JSON for GitHub
function toBase64UTF8(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';

  for (let i = 0; i < bytes.length; i += 8192) {
    binary += String.fromCharCode(
      ...bytes.subarray(i, i + 8192)
    );
  }

  return btoa(binary);
}

// Publish to GitHub
$('publish').onclick = async () => {
  const button = $('publish');

  try {
    const repo = $('repo').value.trim();
    const branch = $('branch').value.trim() || 'main';
    const token = $('token').value.trim();

    if (!/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(repo)) {
      throw new Error('Enter repository as username/repository.');
    }

    if (!token) {
      throw new Error('Enter your GitHub access token.');
    }

    const content = catalogJSON();

    button.disabled = true;
    notify('Checking GitHub repository...');

    const endpoint =
      `https://api.github.com/repos/${repo}/contents/looks.json`;

    const headers = {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28'
    };

    const current = await fetch(
      `${endpoint}?ref=${encodeURIComponent(branch)}`,
      { headers, cache: 'no-store' }
    );

    if (!current.ok && current.status !== 404) {
      throw new Error(
        `GitHub lookup failed (${current.status}): ` +
        (await current.text()).slice(0, 250)
      );
    }

    const existing = current.ok ? await current.json() : null;

    notify('Publishing your outfit catalog...');

    const payload = {
      message: 'Update outfit catalog',
      content: toBase64UTF8(content),
      branch
    };

    if (existing?.sha) {
      payload.sha = existing.sha;
    }

    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(
        `GitHub publish failed (${response.status}): ` +
        (await response.text()).slice(0, 300)
      );
    }

    notify(
      'Published successfully! GitHub Pages will update after deployment.'
    );

  } catch (error) {
    notify('Publish error: ' + error.message);
  } finally {
    button.disabled = false;
  }
};

// Load existing looks
fetch('looks.json')
  .then(response => {
    if (!response.ok) throw new Error('Catalog unavailable');
    return response.json();
  })
  .then(data => {
    looks = Array.isArray(data.looks) ? data.looks : [];
    selected = looks.length ? 0 : -1;
    refresh();
    notify('Catalog loaded. Ready to edit.');
  })
  .catch(() => {
    refresh();
    notify('Click + New look, or import an existing looks.json.');
  });
