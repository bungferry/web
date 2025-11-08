/*
* FILE: assets/js/main.js
* Deskripsi: Logika utama untuk filter galeri, infinite scroll, dan lazy loading.
*/

// --- Konfigurasi ---
const PICSUM_BASE_URL = "https://picsum.photos";
const INFINITE_SCROLL_CONFIG = {
  // Ukuran gambar untuk Infinite Scroll
  design: ["1999/1452", "1931/1087"],
  branding: ["1887/2831", "1964/2455"],
  identity: ["2070/1380", "1887/2830"]
};
const LOAD_COUNT = 6; // Jumlah gambar yang dimuat per batch

// --- Variabel State dan DOM ---
let currentFilter = 'all';
const galleryContainer = document.getElementById('gallery-container');
const triggerElement = document.getElementById('infinite-scroll-trigger');
const loadingSpinner = document.getElementById('loading-spinner');
const initialBoxes = Array.from(document.querySelectorAll('.container .box'));
let seedCounter = { design: 0, branding: 0, identity: 0 }; 
let isLoading = false; // Guard untuk mencegah double-load

// --- Fungsi Helper ---

// Fungsi untuk Toggle Menu Mobile
window.myFunction = function() {
  const x = document.getElementById("myTopnav");
  x.classList.toggle("responsive");
}

// Fungsi untuk membuat elemen gambar baru (dengan Lazy Loading)
function createImageBox(category, size, seed) {
    const box = document.createElement('div');
    // Gambar baru dari JS selalu memiliki kelas 'show'
    box.className = `box ${category} show`; 
    
    const img = document.createElement('img');
    img.src = `${PICSUM_BASE_URL}/seed/${seed}/${size}`;
    img.alt = `${category} photo`;
    img.loading = 'lazy'; // Menerapkan Lazy Loading
    
    box.appendChild(img);
    return box;
}

// --- Logika Infinite Scroll ---

function loadMoreImages() {
    if (currentFilter === 'all' || isLoading) return; 
    
    isLoading = true; 
    if (loadingSpinner) loadingSpinner.style.display = 'block'; // Tampilkan spinner

    const sizes = INFINITE_SCROLL_CONFIG[currentFilter];
    const newBoxes = []; 
    
    let imagesToLoad = LOAD_COUNT;
    let loadedCount = 0;

    const onImageLoadComplete = () => {
        loadedCount++;
        if (loadedCount === imagesToLoad) {
            // Semua gambar telah dimuat/gagal dimuat, sembunyikan spinner
            if (loadingSpinner) loadingSpinner.style.display = 'none';
            isLoading = false;
        }
    };

    for (let i = 0; i < LOAD_COUNT; i++) {
        const randomSize = sizes[i % sizes.length]; 
        seedCounter[currentFilter]++;
        const seed = `iscroll-${currentFilter}-${seedCounter[currentFilter]}`;
        
        const newBox = createImageBox(currentFilter, randomSize, seed);
        const newImage = newBox.querySelector('img');
        
        // Pasang event listener untuk melacak proses loading
        newImage.addEventListener('load', onImageLoadComplete);
        newImage.addEventListener('error', onImageLoadComplete);

        newBoxes.push(newBox);
    }
    
    // Sisipkan semua box baru ke DOM
    newBoxes.forEach(box => {
        galleryContainer.insertBefore(box, triggerElement);
    });

    // Fallback: Sembunyikan spinner setelah 5 detik jika ada masalah event listener
    if (LOAD_COUNT > 0) {
        setTimeout(() => {
            if (isLoading) { 
                if (loadingSpinner) loadingSpinner.style.display = 'none';
                isLoading = false;
            }
        }, 5000); 
    }
}

// Inisialisasi Intersection Observer
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && currentFilter !== 'all') {
            loadMoreImages();
        }
    });
}, {
    root: null, 
    rootMargin: '200px', // Memuat gambar saat trigger berjarak 200px dari viewport
    threshold: 0.1
});

if (triggerElement) {
    observer.observe(triggerElement);
}

// --- Fungsi Filter TABS ---

function filterSelection(c, btn) {
    currentFilter = c;
    const allBoxes = Array.from(document.querySelectorAll('.container .box'));
    
    // 1. Perbarui tombol aktif
    document.querySelectorAll("#tabs .btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    // 2. Tampilkan/Sembunyikan Gambar Statis (8 gambar awal dari Liquid)
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
    
    // 4. Jika beralih ke kategori, muat batch gambar awal (Infinite Scroll)
    if (c !== 'all') {
         seedCounter[c] = 0; // Reset seed counter
         loadMoreImages(); 
    } else {
        // Pastikan spinner disembunyikan jika kembali ke 'All'
        if (loadingSpinner) loadingSpinner.style.display = 'none';
        isLoading = false;
    }
    
    // Paksa reflow untuk memperbaiki tata letak kolom (masonry/CSS columns)
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
    
    // 2. Panggil filter 'all' saat startup untuk memastikan 8 gambar awal muncul
    const defaultBtn = document.querySelector('#tabs .btn[data-filter="all"]');
    if(defaultBtn) filterSelection('all', defaultBtn);
});
