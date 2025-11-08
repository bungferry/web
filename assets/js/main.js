/*
* FILE: assets/js/main.js
* Perbaikan Akhir V2: Menggunakan Intersection Observer sebagai primary
* dan menambah Fallback Scroll Listener untuk mengatasi masalah stuck/macet.
*/

// --- Konfigurasi ---
const PICSUM_BASE_URL = "https://picsum.photos";
const INFINITE_SCROLL_CONFIG = {
  design: ["1999/1452", "1931/1087"],
  branding: ["1887/2831", "1964/2455"],
  identity: ["2070/1380", "1887/2830"]
};
const LOAD_COUNT = 6; 
const LOAD_RESET_DELAY = 1000; // 1 detik delay untuk reset isLoading
const SCROLL_THRESHOLD = 500; // Jarak (piksel) dari bawah halaman untuk memicu fallback

// --- Variabel State dan DOM ---
let currentFilter = 'all';
const galleryContainer = document.getElementById('gallery-container');
const triggerElement = document.getElementById('infinite-scroll-trigger');
const initialBoxes = Array.from(document.querySelectorAll('.container .box'));
let seedCounter = { design: 0, branding: 0, identity: 0 }; 
let isLoading = false; 

// --- Fungsi Helper ---

window.myFunction = function() {
  const x = document.getElementById("myTopnav");
  x.classList.toggle("responsive");
}

function createImageBox(category, size, seed) {
    const box = document.createElement('div');
    box.className = `box ${category} show`; 
    
    const img = document.createElement('img');
    img.src = `${PICSUM_BASE_URL}/seed/${seed}/${size}`;
    img.alt = `${category} photo`;
    img.loading = 'lazy'; 
    
    box.appendChild(img);
    return box;
}

// --- Logika Infinite Scroll ---

function loadMoreImages() {
    if (currentFilter === 'all' || isLoading) return; 
    
    isLoading = true; 

    const sizes = INFINITE_SCROLL_CONFIG[currentFilter];
    const newBoxes = []; 
    
    // 1. Buat dan siapkan semua gambar baru
    for (let i = 0; i < LOAD_COUNT; i++) {
        const randomSize = sizes[i % sizes.length]; 
        seedCounter[currentFilter]++;
        const seed = `iscroll-${currentFilter}-${seedCounter[currentFilter]}`;
        
        const newBox = createImageBox(currentFilter, randomSize, seed);
        newBoxes.push(newBox);
    }
    
    // 2. Sisipkan semua box baru ke DOM
    newBoxes.forEach(box => {
        galleryContainer.insertBefore(box, triggerElement);
    });

    // 3. PENTING: Reset guard menggunakan timer
    setTimeout(() => {
        isLoading = false; 
        
        // Paksa reflow CSS Columns
        if (galleryContainer) {
            galleryContainer.style.opacity = '0.999';
            galleryContainer.style.opacity = '1'; 
        }

    }, LOAD_RESET_DELAY); 
}

// Inisialisasi Intersection Observer (Primary Method)
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && currentFilter !== 'all' && !isLoading) {
            loadMoreImages();
        }
    });
}, {
    root: null, 
    rootMargin: '500px', 
    threshold: 0.1
});

if (triggerElement) {
    observer.observe(triggerElement);
}


// --- Logika Fallback Scroll Listener ---

function handleScrollFallback() {
    // Hanya aktif jika bukan di tab 'all'
    if (currentFilter === 'all' || isLoading) return; 

    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = document.documentElement.scrollTop;
    const clientHeight = document.documentElement.clientHeight;

    // Cek apakah user sudah berada di dekat bagian bawah halaman (dalam jarak SCROLL_THRESHOLD)
    if (scrollTop + clientHeight >= scrollHeight - SCROLL_THRESHOLD) {
        loadMoreImages();
    }
}

// Tambahkan event listener untuk fallback
window.addEventListener('scroll', handleScrollFallback);


// --- Fungsi Filter TABS ---

function filterSelection(c, btn) {
    currentFilter = c;
    const allBoxes = Array.from(document.querySelectorAll('.container .box'));
    
    // 1. Perbarui tombol aktif
    document.querySelectorAll("#tabs .btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    // 2. Tampilkan/Sembunyikan Gambar Statis
    initialBoxes.forEach(box => {
        box.classList.remove('show');
        if (c === 'all' || box.classList.contains(c)) {
            box.classList.add('show');
        }
    });

    // 3. Kelola Gambar Dinamis (Hapus gambar dari filter lama)
    allBoxes.forEach(box => {
        if (!initialBoxes.includes(box)) {
            box.remove(); 
        }
    });
    
    // 4. Jika beralih ke kategori, muat batch gambar awal
    if (c !== 'all') {
         seedCounter[c] = 0; 
         // Panggil loadMoreImages untuk memuat batch pertama
         loadMoreImages(); 
    } else {
        // Reset guard jika kembali ke 'All'
        isLoading = false;
    }
    
    // Paksa reflow
    setTimeout(() => {
        if (galleryContainer) {
            galleryContainer.style.opacity = '0.99'; 
            galleryContainer.style.opacity = '1'; 
        }
    }, 50); 
}

// --- Inisialisasi ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Pasang event listener ke tombol tab
    document.querySelectorAll("#tabs .btn").forEach(button => {
        button.addEventListener('click', function() {
            filterSelection(this.getAttribute('data-filter'), this);
        });
    });
    
    // 2. Panggil filter 'all' saat startup
    const defaultBtn = document.querySelector('#tabs .btn[data-filter="all"]');
    if(defaultBtn) filterSelection('all', defaultBtn);
});
