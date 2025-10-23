// config.js - File Konfigurasi Pusat untuk Semua Halaman
export const CONFIG = {
  // Profile Utama
  profile: {
    name: "Givy",
    tagline: "Social Media",
    description: "My digital life. One link. Simple hub.",
    profileImage: "https://raw.githubusercontent.com/upload-file-lab/fileupload6/main/uploads/1760408834748.png",
    favicon: "https://raw.githubusercontent.com/upload-file-lab/fileupload6/main/uploads/1760408834748.png"
  },

  // IQC Maker Config
  iqc: {
    title: "Givy IQC Maker",
    tagline: "WhatsApp IQC Maker",
    description: "Create WhatsApp Quote Cards easily",
    profileImage: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjgNFtKPgqKyS_jC5oOPR5_J1YLi5h6-JdNO-JoTIyzQG-CvPcfLqyP6RRLJPhu6yzKhrF7-HkhJq3y8_1l6bWPmmZ54Xu8-X79BFzF20viHbSAuyo6hSqlL5_43EYAWZduuh-ml61ZFqZqMiqXu6FIuyG2AI94NQBq2PoEQu2za9a4iPN-HHjASCvSRS0/w400-h248/Logo%20Monkey%20D.%20Luffy%20(Logo%20One%20Piece).png",
    favicon: "https://qu.ax/aqgyC.jpg"
  },

  // NGL Spam Config
  ngl: {
    title: "Givy NGL Spam",
    tagline: "NGL Spam Sender",
    description: "Send Anonymous Messages Repeatedly",
    profileImage: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjgNFtKPgqKyS_jC5oOPR5_J1YLi5h6-JdNO-JoTIyzQG-CvPcfLqyP6RRLJPhu6yzKhrF7-HkhJq3y8_1l6bWPmmZ54Xu8-X79BFzF20viHbSAuyo6hSqlL5_43EYAWZduuh-ml61ZFqZqMiqXu6FIuyG2AI94NQBq2PoEQu2za9a4iPN-HHjASCvSRS0/w400-h248/Logo%20Monkey%20D.%20Luffy%20(Logo%20One%20Piece).png",
    favicon: "https://qu.ax/aqgyC.jpg"
  },

  // Fake Tweet Config
  tweet: {
    title: "Givy Tweet",
    tagline: "Fake Tweet Maker",
    description: "Create a fake X (Twitter) post",
    profileImage: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjgNFtKPgqKyS_jC5oOPR5_J1YLi5h6-JdNO-JoTIyzQG-CvPcfLqyP6RRLJPhu6yzKhrF7-HkhJq3y8_1l6bWPmmZ54Xu8-X79BFzF20viHbSAuyo6hSqlL5_43EYAWZduuh-ml61ZFqZqMiqXu6FIuyG2AI94NQBq2PoEQu2za9a4iPN-HHjASCvSRS0/w400-h248/Logo%20Monkey%20D.%20Luffy%20(Logo%20One%20Piece).png",
    favicon: "https://qu.ax/aqgyC.jpg"
  },

  // Social Media Links
  social: {
    whatsapp: "https://wa.me/6283182725011?text=halo+givy😈",
    youtube: "https://youtube.com/@gipixu?si=D0B42_Dqs9i3tpdm",
    discord: "https://discord.com/users/950154095438749786",
    tiktok: "https://tiktok.com/@gipii_",
    spotify: "https://open.spotify.com/embed/playlist/7COR5ndl6zQfwESDBoYBqj?utm_source=generator&theme=0"
  },

  // API Endpoints
  apis: {
    telegramNotify: "/api/telegram",
    iqcGenerate: "https://api.deline.my.id/maker/iqc",
    nglSend: "https://api.eberardos.my.id/tools/ngl",
    tweetGenerate: "https://api.deline.my.id/maker/faketweet",
    uploadAvatar: "/api/upload"
  }
};

// Helper function
export function getConfig(section) {
  return CONFIG[section] || CONFIG.profile;
}
