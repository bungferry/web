// --- Konfigurasi ---
const PICSUM_BASE_URL = "https://picsum.photos";
const INFINITE_SCROLL_CONFIG = {
  design: ["1999/1452", "1931/1087"],
  branding: ["1887/2831", "1964/2455"],
  identity: ["2070/1380", "1887/2830"]
};
const LOAD_COUNT = 6; // jumlah gambar per batch

// --- Variabel State ---
let currentFilter = "all";
const galleryContainer = document.getElementById("gallery-container");
const triggerElement = document.getElementById("infinite-scroll-trigger");
const initialBoxes = Array.from(document.querySelectorAll(".container .box"));
let seedCounter = {
  design: 0,
  branding: 0,
  identity: 0
};

// helper: append box dengan animasi fade-in yang benar
function appendBoxWithFade(box) {
  // box sudah memiliki kelas 'fade-in' (state awal)
  if (triggerElement && galleryContainer.contains(triggerElement)) {
    galleryContainer.insertBefore(box, triggerElement);
  } else {
    galleryContainer.appendChild(box);
  }

  // paksa frame berikutnya lalu tambahkan kelas 'show' untuk memicu transisi
  requestAnimationFrame(() => {
    // gunakan sedikit delay untuk stagger (opsional)
    // setTimeout(() => box.classList.add('show'), 10);
    box.classList.add("show");
  });

  // bersihkan kelas fade-in setelah transisi selesai (satu kali)
  box.addEventListener("transitionend", (ev) => {
    // pastikan kita menunggu property opacity/transform selesai
    if (ev.propertyName === "opacity" || ev.propertyName === "transform") {
      box.classList.remove("fade-in");
    }
  }, { once: true });
}

// --- Fungsi untuk memuat gambar baru ---
function loadMoreImages() {
  if (currentFilter === "all") return;

  const sizes = INFINITE_SCROLL_CONFIG[currentFilter];
  if (!sizes || sizes.length === 0) return;

  for (let i = 0; i < LOAD_COUNT; i++) {
    const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
    seedCounter[currentFilter]++;
    const seed = `iscroll-${currentFilter}-${seedCounter[currentFilter]}`;
    const imageUrl = `${PICSUM_BASE_URL}/seed/${seed}/${randomSize}`;

    // buat elemen box tanpa 'show' — hanya 'fade-in' sehingga kita bisa trigger transisi
    const box = document.createElement("div");
    box.className = `box ${currentFilter} fade-in`; // NOTE: jangan tambahkan 'show' langsung

    const img = document.createElement("img");
    img.src = imageUrl;
    img.alt = `${currentFilter} photo ${seedCounter[currentFilter]}`;

    // ketika gambar load, kita sudah men-trigger show di appendBoxWithFade,
    // tapi jika mau menunggu load sebelum show, bisa pindah logic ke onload.
    // untuk responsif UX, kita akan tetap men-trigger show segera (gambar muncul saat load)
    box.appendChild(img);

    appendBoxWithFade(box);
  }
}

// --- Intersection Observer ---
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && currentFilter !== "all") {
        loadMoreImages();
      }
    });
  },
  {
    root: null,
    rootMargin: "0px",
    threshold: 0.1
  }
);

if (triggerElement) {
  observer.observe(triggerElement);
} else {
  console.warn("⚠️ Elemen #infinite-scroll-trigger tidak ditemukan!");
}

// --- Fungsi Filter ---
function filterSelection(c, btn) {
  currentFilter = c;
  const allBoxes = Array.from(document.querySelectorAll(".container .box"));
  const boxesToShow = allBoxes.filter((box) => box.classList.contains(c));

  if (c === "all") {
    // tampilkan 8 gambar awal (initialBoxes)
    initialBoxes.forEach((box) => box.classList.add("show"));
    allBoxes.forEach((box) => {
      if (!initialBoxes.includes(box)) box.remove();
    });
  } else {
    // sembunyikan semua
    allBoxes.forEach((box) => box.classList.remove("show"));
    // tampilkan yang cocok (existing)
    boxesToShow.forEach((box) => box.classList.add("show"));
    // hapus gambar kategori lain (hasil scroll)
    allBoxes.forEach((box) => {
      if (!initialBoxes.includes(box) && !box.classList.contains(c)) box.remove();
    });
    // load initial batch for the category
    loadMoreImages();
  }

  // perbarui tombol aktif
  const current = document.querySelector("#tabs .btn.active");
  if (current) current.classList.remove("active");
  if (btn) btn.classList.add("active");
}

// --- Event Listener Tab ---
document.querySelectorAll("#tabs .btn").forEach((button) => {
  button.addEventListener("click", function () {
    filterSelection(this.getAttribute("data-filter"), this);
  });
});

// --- Inisialisasi ---
document.addEventListener("DOMContentLoaded", () => {
  // berikan efek fade-in pada initialBoxes juga (stagger kecil untuk feel lebih baik)
  initialBoxes.forEach((box, idx) => {
    // jika box sudah show dari server, kita ingin animasi masuk
    if (!box.classList.contains("fade-in")) box.classList.add("fade-in");
    // tambahkan show sedikit bertahap
    setTimeout(() => {
      box.classList.add("show");
      // hapus kelas fade-in saat transisi selesai
      box.addEventListener("transitionend", (ev) => {
        if (ev.propertyName === "opacity" || ev.propertyName === "transform") {
          box.classList.remove("fade-in");
        }
      }, { once: true });
    }, 50 * idx); // stagger 50ms per item (opsional)
  });

  filterSelection("all", document.querySelector("#tabs .btn.active"));

  // menu responsif opsional
  window.myFunction = function () {
    const x = document.getElementById("myTopnav");
    x.className = x.className === "topnav" ? "topnav responsive" : "topnav";
  };

  if (triggerElement) triggerElement.style.minHeight = "100px";
});
