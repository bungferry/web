// --- Konfigurasi ---
const PICSUM_BASE_URL = "https://picsum.photos";
const INFINITE_SCROLL_CONFIG = {
  design: ["1999/1452", "1931/1087"],
  branding: ["1887/2831", "1964/2455"],
  identity: ["2070/1380", "1887/2830"]
};
const LOAD_COUNT = 6; // jumlah gambar yang dimuat setiap batch

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

// --- Fungsi Utama ---
function loadMoreImages() {
  if (currentFilter === "all") return;

  const sizes = INFINITE_SCROLL_CONFIG[currentFilter];
  if (!sizes || sizes.length === 0) return;

  for (let i = 0; i < LOAD_COUNT; i++) {
    const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
    seedCounter[currentFilter]++;
    const seed = `iscroll-${currentFilter}-${seedCounter[currentFilter]}`;
    const imageUrl = `${PICSUM_BASE_URL}/seed/${seed}/${randomSize}`;

    // buat elemen gambar
    const box = document.createElement("div");
    box.className = `box ${currentFilter} show`;

    const img = document.createElement("img");
    img.src = imageUrl;
    img.alt = `${currentFilter} photo ${seedCounter[currentFilter]}`;

    box.appendChild(img);

    // masukkan sebelum trigger jika ada, jika tidak append di akhir
    if (triggerElement && galleryContainer.contains(triggerElement)) {
      galleryContainer.insertBefore(box, triggerElement);
    } else {
      galleryContainer.appendChild(box);
    }
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

// pastikan trigger selalu diamati
if (triggerElement) {
  observer.observe(triggerElement);
} else {
  console.warn("⚠️ Elemen #infinite-scroll-trigger tidak ditemukan!");
}

// --- Fungsi Filter ---
function filterSelection(c, btn) {
  currentFilter = c;
  const allBoxes = Array.from(document.querySelectorAll(".container .box"));
  const boxesToHide = allBoxes.filter((box) => !box.classList.contains(c));
  const boxesToShow = allBoxes.filter((box) => box.classList.contains(c));

  if (c === "all") {
    // tampilkan hanya 8 gambar awal
    initialBoxes.forEach((box) => {
      box.classList.add("show");
    });
    allBoxes.forEach((box) => {
      if (!initialBoxes.includes(box)) {
        box.remove();
      }
    });
  } else {
    // sembunyikan semua dulu
    allBoxes.forEach((box) => box.classList.remove("show"));
    boxesToShow.forEach((box) => box.classList.add("show"));

    // hapus elemen hasil scroll dari kategori lain
    allBoxes.forEach((box) => {
      if (!initialBoxes.includes(box) && !box.classList.contains(c)) {
        box.remove();
      }
    });

    // selalu load batch pertama saat berpindah tab kategori
    loadMoreImages();
  }

  // perbarui tombol aktif
  const current = document.querySelector("#tabs .btn.active");
  if (current) current.classList.remove("active");
  if (btn) btn.classList.add("active");
}

// --- Event Listener untuk tab ---
document.querySelectorAll("#tabs .btn").forEach((button) => {
  button.addEventListener("click", function () {
    filterSelection(this.getAttribute("data-filter"), this);
  });
});

// --- Inisialisasi ---
document.addEventListener("DOMContentLoaded", () => {
  filterSelection("all", document.querySelector("#tabs .btn.active"));
  // fungsi menu responsif (optional)
  window.myFunction = function () {
    const x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
      x.className += " responsive";
    } else {
      x.className = "topnav";
    }
  };

  // pastikan trigger terlihat (khusus desktop)
  if (triggerElement) {
    triggerElement.style.minHeight = "100px";
  }
});
