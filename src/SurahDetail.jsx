import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./SurahDetail.css";

const QARI_OPTIONS = [
  { value: "01", label: "Abdul Basit", style: "Mujawwad" },
  { value: "02", label: "Misyari Rasyid", style: "Murattal" },
  { value: "03", label: "Muhammad Al-Husary", style: "Murattal" },
];

function SurahDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const ayatRefs = useRef([]);

  const [dataSurah, setDataSurah] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qari, setQari] = useState("01");
  const [currentIndex, setCurrentIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showLatin, setShowLatin] = useState(true);

  useEffect(() => {
    const getDetail = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`https://equran.id/api/v2/surat/${id}`);
        setDataSurah(response.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    getDetail();
    setCurrentIndex(null);
    setIsPlaying(false);
    setProgress(0);
  }, [id]);

  useEffect(() => {
    if (currentIndex !== null && isPlaying && dataSurah) {
      const audio = audioRef.current;
      if (audio) {
        audio.load();
        audio.play().catch(console.error);
        // Scroll to current ayat
        ayatRefs.current[currentIndex]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [currentIndex, isPlaying, dataSurah]);

  // Stop audio when qari changes
  useEffect(() => {
    if (isPlaying) {
      stopAudio();
    }
  }, [qari]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio && audio.duration) {
      setProgress((audio.currentTime / audio.duration) * 100);
      setDuration(audio.duration);
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (audio && audio.duration) {
      const pct = parseFloat(e.target.value);
      audio.currentTime = (pct / 100) * audio.duration;
      setProgress(pct);
    }
  };

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const playAyat = (index) => {
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  const playAll = () => {
    setCurrentIndex(0);
    setIsPlaying(true);
  };

  const pauseAudio = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const resumeAudio = () => {
    audioRef.current?.play().catch(console.error);
    setIsPlaying(true);
  };

  const stopAudio = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setCurrentIndex(null);
    setIsPlaying(false);
    setProgress(0);
  };

  const prevAyat = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsPlaying(true);
    }
  };

  const nextAyat = () => {
    if (dataSurah && currentIndex < dataSurah.ayat.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsPlaying(true);
    }
  };

  const handleEnded = () => {
    if (dataSurah && currentIndex < dataSurah.ayat.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(null);
      setIsPlaying(false);
      setProgress(0);
    }
  };

  const navSurah = (dir) => {
    const newId = parseInt(id) + dir;
    if (newId >= 1 && newId <= 114) navigate(`/surah/${newId}`);
  };

  if (loading) {
    return (
      <div className="detail-root">
        <div className="detail-loading">
          <div className="loading-ring" />
          <p>Memuat surah...</p>
        </div>
      </div>
    );
  }

  if (!dataSurah) return null;

  const currentAyat = currentIndex !== null ? dataSurah.ayat[currentIndex] : null;

  return (
    <div className="detail-root">
      <div className="bg-pattern" />

      {/* Back Button */}
      <button className="back-btn" onClick={() => navigate("/")}>
        ← Kembali
      </button>

      {/* Header */}
      <header className="detail-header">
        <div className="surah-number-badge">{dataSurah.nomor}</div>
        <h1 className="detail-title-arabic">{dataSurah.nama}</h1>
        <h2 className="detail-title-latin">{dataSurah.namaLatin}</h2>
        <p className="detail-subtitle">
          {dataSurah.arti} · {dataSurah.jumlahAyat} Ayat ·{" "}
          <span className={dataSurah.tempatTurun === "Makkiyyah" ? "makki" : "madani"}>
            {dataSurah.tempatTurun}
          </span>
        </p>

        {/* Bismillah */}
        {dataSurah.nomor !== 1 && dataSurah.nomor !== 9 && (
          <div className="bismillah">﷽</div>
        )}
      </header>

      {/* Surah Nav */}
      <div className="surah-nav">
        <button
          className="surah-nav-btn"
          onClick={() => navSurah(-1)}
          disabled={parseInt(id) <= 1}
        >
          ← Sebelumnya
        </button>
        <span className="surah-nav-label">Surah {id} / 114</span>
        <button
          className="surah-nav-btn"
          onClick={() => navSurah(1)}
          disabled={parseInt(id) >= 114}
        >
          Berikutnya →
        </button>
      </div>

      {/* Controls Panel */}
      <div className="controls-panel">
        {/* Qari Selector */}
        <div className="qari-section">
          <label className="section-label">Qari</label>
          <div className="qari-options">
            {QARI_OPTIONS.map((q) => (
              <button
                key={q.value}
                className={`qari-btn ${qari === q.value ? "active" : ""}`}
                onClick={() => setQari(q.value)}
              >
                <span className="qari-name">{q.label}</span>
                <span className="qari-style">{q.style}</span>
              </button>
            ))}
          </div>
        </div>

        {/* View Toggles */}
        <div className="view-toggles">
          <button
            className={`toggle-btn ${showLatin ? "on" : ""}`}
            onClick={() => setShowLatin(!showLatin)}
          >
            Latin {showLatin ? "✓" : "×"}
          </button>
          <button
            className={`toggle-btn ${showTranslation ? "on" : ""}`}
            onClick={() => setShowTranslation(!showTranslation)}
          >
            Terjemahan {showTranslation ? "✓" : "×"}
          </button>
        </div>

        {/* Main Audio Controls */}
        <div className="audio-controls">
          <button className="ctrl-btn" onClick={prevAyat} disabled={currentIndex === null || currentIndex === 0} title="Ayat sebelumnya">⏮</button>
          
          {currentIndex === null ? (
            <button className="ctrl-btn play-btn" onClick={playAll} title="Play semua">▶</button>
          ) : isPlaying ? (
            <button className="ctrl-btn play-btn" onClick={pauseAudio} title="Pause">⏸</button>
          ) : (
            <button className="ctrl-btn play-btn" onClick={resumeAudio} title="Lanjut">▶</button>
          )}

          <button className="ctrl-btn stop-btn" onClick={stopAudio} disabled={currentIndex === null} title="Stop">⏹</button>
          <button className="ctrl-btn" onClick={nextAyat} disabled={currentIndex === null || currentIndex >= dataSurah.ayat.length - 1} title="Ayat berikutnya">⏭</button>
        </div>

        {/* Now Playing */}
        {currentIndex !== null && (
          <div className="now-playing">
            <div className="now-playing-info">
              <span className="np-label">Ayat {currentIndex + 1}</span>
              <span className="np-time">{formatTime((progress / 100) * duration)} / {formatTime(duration)}</span>
            </div>
            <input
              type="range"
              className="progress-bar"
              min="0"
              max="100"
              step="0.1"
              value={progress}
              onChange={handleSeek}
            />
          </div>
        )}
      </div>

      {/* Deskripsi */}
      {dataSurah.deskripsi && (
        <details className="surah-desc">
          <summary>Tentang Surah {dataSurah.namaLatin}</summary>
          <div
            className="desc-content"
            dangerouslySetInnerHTML={{
              __html: dataSurah.deskripsi.replace(/<[^>]+>/g, " ").trim(),
            }}
          />
        </details>
      )}

      {/* Ayat List */}
      <div className="ayat-list">
        {dataSurah.ayat.map((ayat, index) => {
          const active = index === currentIndex;
          return (
            <div
              key={ayat.nomorAyat}
              ref={(el) => (ayatRefs.current[index] = el)}
              className={`ayat-card ${active ? "active" : ""}`}
            >
              {/* Ayat header */}
              <div className="ayat-header">
                <div className="ayat-num">{ayat.nomorAyat}</div>
                <button
                  className={`ayat-play-btn ${active && isPlaying ? "playing" : ""}`}
                  onClick={() => (active && isPlaying ? pauseAudio() : playAyat(index))}
                  title={active && isPlaying ? "Pause" : "Play ayat ini"}
                >
                  {active && isPlaying ? "⏸" : "▶"}
                </button>
              </div>

              {/* Arab */}
              <p className="ayat-arab">{ayat.teksArab}</p>

              {/* Latin */}
              {showLatin && (
                <p className="ayat-latin">{ayat.teksLatin}</p>
              )}

              {/* Terjemahan */}
              {showTranslation && (
                <p className="ayat-terjemahan">{ayat.teksIndonesia}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Hidden Audio Element */}
      {currentAyat && (
        <audio
          ref={audioRef}
          onEnded={handleEnded}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={(e) => setDuration(e.target.duration)}
        >
          <source src={currentAyat.audio[qari]} type="audio/mpeg" />
        </audio>
      )}

      <footer className="detail-footer">
        <p>© 2025 Al-Qur'an Digital · Data dari equran.id</p>
      </footer>
    </div>
  );
}

export default SurahDetail;
