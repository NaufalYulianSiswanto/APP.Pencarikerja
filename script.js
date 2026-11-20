const jobs = [
  {
    id: 1, title: "Frontend Developer", company: "Tech Indonesia",
    location: "Jakarta", category: "Teknologi", salary: "Rp 6-9 juta",
    type: "Full Time", logo: "T", color: "#e9e6ff",
    desc: "Membangun tampilan website yang modern dan responsif.",
    requirements: "Menguasai HTML, CSS, JavaScript dan mampu bekerja dalam tim."
  },
  {
    id: 2, title: "UI/UX Designer", company: "Creative Studio",
    location: "Bandung", category: "Desain", salary: "Rp 5-8 juta",
    type: "Full Time", logo: "C", color: "#ffeadf",
    desc: "Membuat desain antarmuka aplikasi dan pengalaman pengguna.",
    requirements: "Memahami Figma, desain UI dan prinsip UX."
  },
  {
    id: 3, title: "Digital Marketing", company: "MarketPro",
    location: "Bekasi", category: "Marketing", salary: "Rp 4-7 juta",
    type: "Full Time", logo: "M", color: "#e0f6ed",
    desc: "Mengelola strategi pemasaran digital perusahaan.",
    requirements: "Memahami media sosial, SEO dan pemasaran digital."
  },
  {
    id: 4, title: "Backend Developer", company: "CodeWorks",
    location: "Remote", category: "Teknologi", salary: "Rp 7-12 juta",
    type: "Remote", logo: "W", color: "#e2efff",
    desc: "Mengembangkan sistem server dan API aplikasi.",
    requirements: "Memahami JavaScript, database dan REST API."
  },
  {
    id: 5, title: "Staff Administrasi", company: "Office Group",
    location: "Surabaya", category: "Administrasi", salary: "Rp 3-5 juta",
    type: "Full Time", logo: "O", color: "#fff0dc",
    desc: "Mengelola dokumen dan kegiatan administrasi kantor.",
    requirements: "Menguasai Microsoft Office dan teliti."
  },
  {
    id: 6, title: "Accountant", company: "Finance Corp",
    location: "Jakarta", category: "Keuangan", salary: "Rp 5-8 juta",
    type: "Full Time", logo: "F", color: "#fce5ef",
    desc: "Menyusun laporan keuangan dan memeriksa transaksi.",
    requirements: "Memahami akuntansi dan pengolahan data."
  },
  {
    id: 7, title: "Graphic Designer", company: "Pixel Creative",
    location: "Yogyakarta", category: "Desain", salary: "Rp 4-6 juta",
    type: "Part Time", logo: "P", color: "#e6e6ff",
    desc: "Membuat konten visual untuk kebutuhan promosi.",
    requirements: "Menguasai Canva, Photoshop atau Illustrator."
  },
  {
    id: 8, title: "SEO Specialist", company: "Digital Media",
    location: "Bandung", category: "Marketing", salary: "Rp 5-7 juta",
    type: "Full Time", logo: "D", color: "#e5f4ff",
    desc: "Mengoptimalkan website agar mudah ditemukan di mesin pencari.",
    requirements: "Memahami SEO, riset kata kunci dan analisis."
  }
];

function readStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

let saved = readStorage("jf_saved");
let applied = readStorage("jf_applied"); // data lama, dipertahankan untuk kompatibilitas
let allApplications = readStorage("jf_applications");
let currentUser = null;
let profile = {};
try {
  profile = JSON.parse(localStorage.getItem("jf_profile")) || {};
} catch {
  profile = {};
}


/* ================================
   AUTENTIKASI DEMO (LOCAL STORAGE)
   Catatan: untuk aplikasi latihan saja.
   Jangan gunakan password asli.
================================= */
const AUTH_USERS_KEY = "jf_users";
const AUTH_SESSION_KEY = "jf_current_user";
const APPLICATIONS_KEY = "jf_applications";

function saveApplications() {
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(allApplications));
}

function profileStorageKey(email) {
  return `jf_profile_${String(email || "guest").toLowerCase()}`;
}

function getAuthUsers() {
  try {
    const users = JSON.parse(localStorage.getItem(AUTH_USERS_KEY));
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

function setAuthMessage(message, isError = true) {
  const messageBox = document.getElementById("authMessage");
  if (!messageBox) return;
  messageBox.textContent = message;
  messageBox.classList.toggle("success", !isError);
}

function showAuthForm(mode) {
  const isRegister = mode === "register";
  document.getElementById("loginForm").hidden = isRegister;
  document.getElementById("registerForm").hidden = !isRegister;
  document.getElementById("authTitle").textContent = isRegister ? "Buat Akun Baru" : "Selamat Datang!";
  document.getElementById("authSubtitle").textContent = isRegister
    ? "Daftar sebagai pelamar atau HRD perusahaan."
    : "Masuk untuk melanjutkan ke JobFinder.";
  setAuthMessage("", false);
}

function openJobFinder(user) {
  currentUser = user;
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({
    email: user.email,
    name: user.name,
    role: user.role || "applicant",
    company: user.company || ""
  }));

  document.getElementById("authScreen").hidden = true;
  document.getElementById("jobApp").hidden = false;

  // Profil disimpan terpisah untuk setiap akun pelamar.
  try {
    profile = JSON.parse(localStorage.getItem(profileStorageKey(user.email))) || {};
  } catch { profile = {}; }
  if (!profile.name) profile.name = user.name;
  if (!profile.email) profile.email = user.email;
  localStorage.setItem(profileStorageKey(user.email), JSON.stringify(profile));
  localStorage.setItem("jf_profile", JSON.stringify(profile));

  const isHrd = user.role === "hrd";
  document.querySelectorAll(".applicant-only").forEach(el => el.hidden = isHrd);
  document.querySelectorAll(".hrd-only").forEach(el => el.hidden = !isHrd);
  document.getElementById("topName").textContent = user.name + (isHrd ? " · HRD" : "");
  document.getElementById("pageTitle").textContent = isHrd ? "Kelola Lamaran" : "Dashboard";

  if (isHrd) {
    go("hrdApplications");
    renderHrdApplications();
  } else {
    updateProfile();
    go("dashboard");
    renderHome();
    renderJobs();
  }
}

function closeJobFinder() {
  localStorage.removeItem(AUTH_SESSION_KEY);
  document.getElementById("jobApp").hidden = true;
  document.getElementById("authScreen").hidden = false;
  document.getElementById("loginForm").reset();
  document.getElementById("registerForm").reset();
  showAuthForm("login");
}

function initializeAuth() {
  const savedSession = localStorage.getItem(AUTH_SESSION_KEY);

  document.getElementById("showRegisterBtn").addEventListener("click", () => {
    showAuthForm("register");
  });

  document.getElementById("showLoginBtn").addEventListener("click", () => {
    showAuthForm("login");
  });

  document.getElementById("registerRole").addEventListener("change", event => {
    const isHrd = event.target.value === "hrd";
    document.getElementById("companyGroup").hidden = !isHrd;
    document.getElementById("registerCompany").required = isHrd;
  });

  document.getElementById("registerForm").addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim().toLowerCase();
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const role = document.getElementById("registerRole").value;
    const company = document.getElementById("registerCompany").value.trim();

    if (role === "hrd" && !company) {
      setAuthMessage("Nama perusahaan wajib diisi untuk akun HRD.");
      return;
    }
    if (password.length < 6) {
      setAuthMessage("Password minimal 6 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setAuthMessage("Konfirmasi password tidak sama.");
      return;
    }

    const users = getAuthUsers();
    if (users.some(user => user.email === email)) {
      setAuthMessage("Email sudah terdaftar. Silakan masuk.");
      return;
    }

    const newUser = { name, email, password, role, company };
    users.push(newUser);
    localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));

    document.getElementById("loginEmail").value = email;
    document.getElementById("loginPassword").value = "";
    showAuthForm("login");
    setAuthMessage("Pendaftaran berhasil. Silakan masuk.", false);
  });

  document.getElementById("loginForm").addEventListener("submit", event => {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;
    const user = getAuthUsers().find(item =>
      item.email === email && item.password === password
    );

    if (!user) {
      setAuthMessage("Email atau password salah.");
      return;
    }

    openJobFinder(user);
  });

  document.getElementById("logoutBtn").addEventListener("click", closeJobFinder);

  if (savedSession) {
    try {
      const session = JSON.parse(savedSession);
      const user = getAuthUsers().find(item => item.email === session.email);
      if (user) {
        openJobFinder(user);
        return;
      }
    } catch {
      // Jika data sesi rusak, tampilkan halaman login.
    }
    localStorage.removeItem(AUTH_SESSION_KEY);
  }

  document.getElementById("jobApp").hidden = true;
  document.getElementById("authScreen").hidden = false;
}


let currentJob = null;
let toastTimer;

function persist() {
  localStorage.setItem("jf_saved", JSON.stringify(saved));
  localStorage.setItem("jf_applied", JSON.stringify(applied));
  saveApplications();
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.display = "block";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.display = "none";
  }, 2300);
}

function go(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.toggle("active", page.id === pageId);
  });

  document.querySelectorAll("[data-page]").forEach(button => {
    button.classList.toggle("active", button.dataset.page === pageId);
  });

  const titles = {
    dashboard: "Dashboard",
    jobs: "Cari Pekerjaan",
    saved: "Favorit",
    applications: "Lamaran Saya",
    profile: "Profil Saya",
    hrdApplications: "Kelola Lamaran"
  };

  document.getElementById("pageTitle").textContent = titles[pageId];

  if (pageId === "saved") renderSaved();
  if (pageId === "applications") renderApplications();
  if (pageId === "hrdApplications") renderHrdApplications();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll("[data-page]").forEach(button => {
  button.addEventListener("click", () => go(button.dataset.page));
});

function jobCard(job) {
  const isSaved = saved.includes(job.id);

  return `
    <article class="job-card">
      <div class="job-top">
        <div class="company-logo" style="background:${job.color}">${job.logo}</div>
        <button class="bookmark" data-save="${job.id}" aria-label="Simpan lowongan">
          ${isSaved ? "❤️" : "♡"}
        </button>
      </div>
      <h3>${job.title}</h3>
      <p>${job.company}</p>
      <p>📍 ${job.location} · ${job.type}</p>
      <div class="tags">
        <span class="tag">${job.category}</span>
        <span class="tag">${job.type}</span>
      </div>
      <div class="job-bottom">
        <div class="salary">${job.salary}<div class="small-muted">/ bulan</div></div>
        <button class="primary" data-detail="${job.id}">Detail</button>
      </div>
    </article>
  `;
}

function renderHome() {
  document.getElementById("recommended").innerHTML =
    jobs.slice(0, 4).map(jobCard).join("");

  document.getElementById("statJobs").textContent = jobs.length;
  document.getElementById("statSaved").textContent = saved.length;
  document.getElementById("statApplied").textContent = applied.length;
}

function renderJobs() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const location = document.getElementById("locationFilter").value;
  const category = document.getElementById("categoryFilter").value;

  const filtered = jobs.filter(job => {
    const matchesQuery =
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query);

    return matchesQuery &&
      (!location || job.location === location) &&
      (!category || job.category === category);
  });

  document.getElementById("resultCount").textContent =
    `${filtered.length} lowongan ditemukan`;

  document.getElementById("allJobs").innerHTML = filtered.length
    ? filtered.map(jobCard).join("")
    : '<div class="empty">Tidak ada lowongan ditemukan.</div>';
}

["searchInput", "locationFilter", "categoryFilter"].forEach(id => {
  document.getElementById(id).addEventListener("input", renderJobs);
});

function searchHome() {
  document.getElementById("searchInput").value =
    document.getElementById("homeSearch").value;
  go("jobs");
  renderJobs();
}

document.getElementById("homeSearchBtn").addEventListener("click", searchHome);
document.getElementById("homeSearch").addEventListener("keydown", event => {
  if (event.key === "Enter") searchHome();
});

document.getElementById("seeAllJobs").addEventListener("click", () => go("jobs"));

function toggleSave(id) {
  saved = saved.includes(id)
    ? saved.filter(savedId => savedId !== id)
    : [...saved, id];

  persist();
  renderHome();
  renderJobs();
  renderSaved();

  showToast(saved.includes(id)
    ? "Lowongan berhasil disimpan"
    : "Lowongan dihapus dari favorit");
}

function renderSaved() {
  const list = jobs.filter(job => saved.includes(job.id));

  document.getElementById("savedJobs").innerHTML = list.length
    ? list.map(jobCard).join("")
    : '<div class="empty">Belum ada lowongan favorit ❤️</div>';
}

function showDetail(id) {
  currentJob = jobs.find(job => job.id === id);
  if (!currentJob) return;

  const alreadyApplied = applied.some(item => item.id === id);

  document.getElementById("modalContent").innerHTML = `
    <div class="company-logo" style="background:${currentJob.color}">
      ${currentJob.logo}
    </div>
    <h2>${currentJob.title}</h2>
    <p>${currentJob.company} · 📍 ${currentJob.location}</p>
    <hr>
    <h3>Informasi Pekerjaan</h3>
    <p><b>Gaji:</b> ${currentJob.salary}</p>
    <p><b>Kategori:</b> ${currentJob.category}</p>
    <p><b>Tipe:</b> ${currentJob.type}</p>
    <h3>Deskripsi</h3>
    <p>${currentJob.desc}</p>
    <h3>Persyaratan</h3>
    <p>${currentJob.requirements}</p>
    <div class="modal-actions">
      <button class="field" data-modal-save="${id}">
        ${saved.includes(id) ? "❤️ Tersimpan" : "♡ Simpan"}
      </button>
      <button class="primary" id="applyBtn" ${alreadyApplied ? "disabled" : ""}>
        ${alreadyApplied ? "Sudah Dilamar" : "Lamar Sekarang"}
      </button>
    </div>
  `;

  document.getElementById("modalBg").classList.add("show");

  document.querySelector("[data-modal-save]").addEventListener("click", () => {
    toggleSave(id);
    showDetail(id);
  });

  const applyButton = document.getElementById("applyBtn");
  if (!alreadyApplied) {
    applyButton.addEventListener("click", applyJob);
  }
}

function closeModal() {
  document.getElementById("modalBg").classList.remove("show");
}

document.getElementById("closeModalBtn").addEventListener("click", closeModal);

document.getElementById("modalBg").addEventListener("click", event => {
  if (event.target.id === "modalBg") closeModal();
});

function applyJob() {
  if (!currentUser || currentUser.role === "hrd") {
    showToast("Akun HRD tidak dapat mengirim lamaran.");
    return;
  }
  if (!currentJob) return;

  if (allApplications.some(item => item.id === currentJob.id && item.applicantEmail === currentUser.email)) {
    showToast("Kamu sudah melamar pekerjaan ini");
    return;
  }

  const applicantProfile = profile || {};
  allApplications.push({
    applicationId: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    id: currentJob.id,
    applicantEmail: currentUser.email,
    applicantName: applicantProfile.name || currentUser.name,
    phone: applicantProfile.phone || "Belum diisi",
    education: applicantProfile.education || "Belum diisi",
    skills: applicantProfile.skills || "Belum diisi",
    date: new Date().toLocaleDateString("id-ID"),
    status: "Menunggu",
    company: currentJob.company
  });
  applied.push({ id: currentJob.id, date: new Date().toLocaleDateString("id-ID"), status: "Menunggu" });

  persist();
  closeModal();
  renderHome();
  renderApplications();
  showToast("Lamaran simulasi berhasil dikirim!");
}

function renderApplications() {
  const container = document.getElementById("applicationList");
  const myApplications = allApplications.filter(item => item.applicantEmail === currentUser?.email);

  if (!myApplications.length) {
    container.innerHTML = '<div class="empty">Belum ada lamaran pekerjaan.</div>';
    return;
  }

  container.innerHTML = myApplications.map(application => {
    const job = jobs.find(item => item.id === application.id);
    if (!job) return "";
    return `
      <div class="list-row">
        <div><b>${job.title}</b><p class="small-muted">${job.company} · ${application.date}</p></div>
        <span class="status">${application.status}</span>
      </div>`;
  }).join("");
}

function renderHrdApplications() {
  const container = document.getElementById("hrdApplicationList");
  if (!currentUser || currentUser.role !== "hrd") return;

  const companyName = (currentUser.company || "").trim().toLowerCase();
  const companyApplications = allApplications.filter(item =>
    (item.company || "").trim().toLowerCase() === companyName
  );

  document.getElementById("hrdTotal").textContent = companyApplications.length;
  document.getElementById("hrdWaiting").textContent = companyApplications.filter(item =>
    ["Menunggu", "Diproses"].includes(item.status)
  ).length;
  document.getElementById("hrdAccepted").textContent = companyApplications.filter(item => item.status === "Diterima").length;

  if (!companyApplications.length) {
    container.innerHTML = '<div class="empty">Belum ada lamaran untuk perusahaan ' + escapeHtml(currentUser.company) + '.</div>';
    return;
  }

  container.innerHTML = companyApplications.map(application => {
    const job = jobs.find(item => item.id === application.id);
    if (!job) return "";
    return `
      <article class="hrd-application-card">
        <div class="hrd-card-head">
          <div><h3>${escapeHtml(application.applicantName)}</h3><p class="small-muted">${escapeHtml(application.applicantEmail)} · ${escapeHtml(application.date)}</p></div>
          <span class="status">${escapeHtml(application.status)}</span>
        </div>
        <p><b>Posisi:</b> ${escapeHtml(job.title)}</p>
        <p><b>Telepon:</b> ${escapeHtml(application.phone)}</p>
        <p><b>Pendidikan:</b> ${escapeHtml(application.education)}</p>
        <p><b>Keahlian:</b> ${escapeHtml(application.skills)}</p>
        <div class="hrd-actions">
          <button class="field" data-application-status="Diproses" data-application-id="${application.applicationId}">Proses</button>
          <button class="primary" data-application-status="Diterima" data-application-id="${application.applicationId}">Terima</button>
          <button class="danger-btn" data-application-status="Ditolak" data-application-id="${application.applicationId}">Tolak</button>
        </div>
      </article>`;
  }).join("");
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}

document.addEventListener("click", event => {
  const statusButton = event.target.closest("[data-application-status]");
  if (!statusButton || currentUser?.role !== "hrd") return;
  const application = allApplications.find(item => item.applicationId === statusButton.dataset.applicationId);
  if (!application || (application.company || "").toLowerCase() !== (currentUser.company || "").toLowerCase()) return;
  application.status = statusButton.dataset.applicationStatus;
  saveApplications();
  renderHrdApplications();
  showToast("Status lamaran diperbarui menjadi " + application.status);
});

function saveProfile() {
  profile = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    education: document.getElementById("education").value.trim(),
    skills: document.getElementById("skills").value.trim()
  };

  localStorage.setItem("jf_profile", JSON.stringify(profile));
  if (currentUser) localStorage.setItem(profileStorageKey(currentUser.email), JSON.stringify(profile));
  updateProfile();
  showToast("Profil berhasil disimpan!");
}

document.getElementById("saveProfileBtn").addEventListener("click", saveProfile);

function updateProfile() {
  document.getElementById("name").value = profile.name || "";
  document.getElementById("email").value = profile.email || "";
  document.getElementById("phone").value = profile.phone || "";
  document.getElementById("education").value = profile.education || "";
  document.getElementById("skills").value = profile.skills || "";

  const name = profile.name || "Pengguna";
  document.getElementById("profileDisplay").textContent = name;
  document.getElementById("topName").textContent = name;
  document.getElementById("topAvatar").textContent =
    name.charAt(0).toUpperCase();
}

/* Event delegation untuk tombol kartu lowongan */
document.addEventListener("click", event => {
  const saveButton = event.target.closest("[data-save]");
  const detailButton = event.target.closest("[data-detail]");

  if (saveButton) {
    toggleSave(Number(saveButton.dataset.save));
  }

  if (detailButton) {
    showDetail(Number(detailButton.dataset.detail));
  }
});

/* Inisialisasi aplikasi */
renderHome();
renderJobs();
updateProfile();


// Jalankan pemeriksaan login setelah elemen halaman siap.
document.addEventListener('DOMContentLoaded', initializeAuth);
