// --- Konfigurasi ---
// Data dari _data/gallery.yml akan di-pass via 'data-config' di index.html jika ini web langsung,
// tapi karena ini Jekyll, kita akan hardcode config untuk demo JS ini, atau menggunakan trik 
// Liquid/JS. Untuk kesederhanaan, kita akan anggap config di bawah sudah tersedia.
const PICSUM_BASE_URL = "https://picsum.photos";
const INFINITE_SCROLL_CONFIG = {
  design: ["1999/1452", "1931/1087"],
  branding: ["1887/2831", "1964/2455"],
  identity: ["2070/1380", "1887/2830"]
};
const LOAD_COUNT = 6; // Jumlah gambar yang dimuat setiap kali scroll

// --- Variabel State ---
let currentFilter = 'all';
const galleryContainer = document.getElementById('gallery-container');
const triggerElement = document.getElementById('infinite-scroll-trigger');
const initialBoxes = Array.from(document.querySelectorAll('.container .box'));
let seedCounter = { // Untuk memastikan gambar Picsum berbeda setiap kali muat
    design: 0, 
    branding: 0, 
    identity: 0
}; 

// --- Fungsi Utama ---

// Fungsi untuk memuat dan menambahkan gambar baru
function loadMoreImages() {
    if (currentFilter === 'all') return; // Hanya Infinite Scroll untuk kategori

    const sizes = INFINITE_SCROLL_CONFIG[currentFilter];
    if (!sizes || sizes.length === 0) return;

    for (let i = 0; i < LOAD_COUNT; i++) {
        // Pilih ukuran gambar secara acak dan tingkatkan seed counter
        const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
        seedCounter[currentFilter]++;
        const seed = `iscroll-${currentFilter}-${seedCounter[currentFilter]}`;
        const imageUrl = `${PICSUM_BASE_URL}/seed/${seed}/${randomSize}`;

        // Buat elemen gambar
        const box = document.createElement('div');
        box.className = `box ${currentFilter} show`; // Tambahkan kelas 'show' agar langsung terlihat

        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = `${currentFilter} photo ${seedCounter[currentFilter]}`;
        
        box.appendChild(img);
        
        // Sisipkan sebelum elemen trigger
        galleryContainer.insertBefore(box, triggerElement);
    }
}

// Inisialisasi Intersection Observer untuk Infinite Scroll
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && currentFilter !== 'all') {
            loadMoreImages();
        }
    });
}, {
    root: null, // viewport
    rootMargin: '0px',
    threshold: 0.1
});

// Mulai mengamati elemen trigger
if (triggerElement) {
    observer.observe(triggerElement);
}

// --- Fungsi Filter dan Navigasi ---

// Fungsi filter yang dimodifikasi untuk menangani tampilan Infinite Scroll
function filterSelection(c, btn) {
    currentFilter = c;
    const allBoxes = Array.from(document.querySelectorAll('.container .box'));
    const boxesToHide = allBoxes.filter(box => !box.classList.contains(currentFilter));
    const boxesToShow = allBoxes.filter(box => box.classList.contains(currentFilter));

    if (c === 'all') {
        // Tampilkan hanya 8 gambar statis (yang merupakan initialBoxes)
        initialBoxes.forEach(box => {
            box.classList.add('show');
        });
        
        // Hapus semua gambar yang dimuat oleh Infinite Scroll
        allBoxes.forEach(box => {
            if (!initialBoxes.includes(box)) {
                box.remove();
            }
        });

    } else {
        // Sembunyikan semua yang tidak sesuai filter
        allBoxes.forEach(box => {
            box.classList.remove('show');
        });
        // Tampilkan yang sesuai filter (ini mencakup 8 gambar statis yang cocok)
        boxesToShow.forEach(box => {
            box.classList.add('show');
        });

        // Hapus gambar dari filter lain yang tidak lagi diperlukan, 
        // tapi pastikan 8 gambar statis dipertahankan
        allBoxes.forEach(box => {
            if (!initialBoxes.includes(box) && !box.classList.contains(c)) {
                box.remove();
            }
        });
        
        // Memuat beberapa gambar awal untuk Infinite Scroll saat pertama kali beralih
        if (document.querySelectorAll(`.container .box.${c}`).length <= initialBoxes.length / 4) {
             loadMoreImages(); 
        }
    }
    
    // Perbarui tombol aktif
    const current = document.querySelector("#tabs .btn.active");
    if (current) current.classList.remove("active");
    if (btn) btn.classList.add("active");
    
    // Perlu pembaruan layout untuk menghindari masalah kolom
    setTimeout(() => {
        galleryContainer.style.display = 'none';
        galleryContainer.offsetHeight; // force reflow
        galleryContainer.style.display = 'block';
    }, 50); 
}

// Tambahkan event listener ke tombol tab
document.querySelectorAll("#tabs .btn").forEach(button => {
    button.addEventListener('click', function() {
        filterSelection(this.getAttribute('data-filter'), this);
    });
});

// Inisialisasi filter ke "All" saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    filterSelection('all', document.querySelector('#tabs .btn.active'));
    // Inisialisasi menu topnav (fungsi myFunction dari kode demo)
    window.myFunction = function() {
      var x = document.getElementById("myTopnav");
      if (x.className === "topnav") {
        x.className += " responsive";
      } else {
        x.className = "topnav";
      }
    }
});
