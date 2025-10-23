// config.js - File Konfigurasi Pusat (SIMPLE - Hanya Logo & Icon)
export const CONFIG = {
  // EDIT INI AJA UNTUK GANTI LOGO & ICON SEMUA HALAMAN
  favicon: "https://raw.githubusercontent.com/upload-file-lab/fileupload6/main/uploads/1760408834748.png",
  profileImage: "https://raw.githubusercontent.com/upload-file-lab/fileupload6/main/uploads/1760408834748.png"
};

// Helper untuk load favicon
export function loadFavicon() {
  const link = document.querySelector('link[rel="icon"]');
  if (link) {
    link.href = CONFIG.favicon;
  } else {
    const newLink = document.createElement('link');
    newLink.rel = 'icon';
    newLink.type = 'image/png';
    newLink.href = CONFIG.favicon;
    document.head.appendChild(newLink);
  }
}

// Helper untuk load profile image
export function loadProfileImage() {
  const img = document.getElementById('profile-image');
  if (img) {
    img.src = CONFIG.profileImage;
  }
}
