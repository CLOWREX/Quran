import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const JENIS_LABEL = {
  Makkiyyah: { label: "Makkiyah", color: "#c8a96e" },
  Madaniyyah: { label: "Madaniyah", color: "#7eb8a4" },
};

function Home() {
  const [surahList, setSurahList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const getSurah = async () => {
      try {
        const response = await axios.get("https://equran.id/api/v2/surat");
        setSurahList(response.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    getSurah();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return surahList;
    return surahList.filter(
      (s) =>
        s.namaLatin.toLowerCase().includes(q) ||
        s.arti.toLowerCase().includes(q) ||
        String(s.nomor).includes(q) ||
        s.nama.includes(q)
    );
  }, [search, surahList]);

  return (
    <div className="home-root">
      {/* Background pattern */}
      <div className="bg-pattern" />

      {/* Header */}
      <header className="home-header">
        <div className="header-ornament">﷽</div>
        <h1 className="site-title">
          <span className="title-arabic">القرآن الكريم</span>
          <span className="title-sub">Al-Qur'an Digital</span>
        </h1>
        <p className="header-desc">Baca, dengarkan, dan renungkan firman Allah SWT</p>
      </header>

      {/* Search */}
      <div className="search-wrapper">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            type="text"
            placeholder="Cari nama surah atau artinya..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch("")}>×</button>
          )}
        </div>
        {search && (
          <p className="search-result-count">
            {filtered.length} surah ditemukan
          </p>
        )}
      </div>

      {/* Surah Grid */}
      <main className="surah-grid-wrapper">
        {loading ? (
          <div className="loading-container">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="skeleton-card" style={{ animationDelay: `${i * 0.05}s` }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p>Surah "<strong>{search}</strong>" tidak ditemukan</p>
          </div>
        ) : (
          <div className="surah-grid">
            {filtered.map((surah, i) => {
              const jenis = JENIS_LABEL[surah.tempatTurun] || { label: surah.tempatTurun, color: "#aaa" };
              return (
                <div
                  key={surah.nomor}
                  className="surah-card"
                  style={{ animationDelay: `${Math.min(i * 0.03, 0.5)}s` }}
                  onClick={() => navigate(`/surah/${surah.nomor}`)}
                >
                  <div className="card-number">
                    <span>{surah.nomor}</span>
                  </div>
                  <div className="card-body">
                    <div className="card-top">
                      <div className="card-latin">{surah.namaLatin}</div>
                      <div className="card-arabic">{surah.nama}</div>
                    </div>
                    <div className="card-bottom">
                      <span className="card-arti">{surah.arti}</span>
                      <div className="card-meta">
                        <span className="card-ayat">{surah.jumlahAyat} ayat</span>
                        <span
                          className="card-jenis"
                          style={{ color: jenis.color }}
                        >
                          {jenis.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="home-footer">
        <p>© 2025 Al-Qur'an Digital · Data dari equran.id</p>
      </footer>
    </div>
  );
}

export default Home;
