import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

function SurahDetail() {

  const { id } = useParams();
  const audioRef = useRef(null);

  const [dataSurah, setDataSurah] = useState(null);
  const [qari, setQari] = useState("01");

  // STATE BARU
  const [currentIndex, setCurrentIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const getDetail = async () => {
      const response = await axios.get(
        `https://equran.id/api/v2/surat/${id}`
      );
      setDataSurah(response.data.data);
    };

    getDetail();
  }, [id]);

  // AUTO PLAY SAAT INDEX BERUBAH
  useEffect(() => {
    if (currentIndex !== null && isPlaying && dataSurah) {
      audioRef.current.load();
      audioRef.current.play();
    }
  }, [currentIndex, isPlaying, dataSurah]);

  if (!dataSurah) return <p>Loading...</p>;

  // ==========================
  // FUNCTION PLAY
  // ==========================

  const playAyat = (index) => {
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  const playAll = () => {
    setCurrentIndex(0);
    setIsPlaying(true);
  };

  const pauseAudio = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const stopAudio = () => {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setCurrentIndex(null);
    setIsPlaying(false);
  };

  const handleEnded = () => {
    if (currentIndex < dataSurah.ayat.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(null);
      setIsPlaying(false);
    }
  };

  return (
    <div className="detail-container">

      <h1 className="surah-title">
        {dataSurah.namaLatin}
      </h1>

      {/* SELECT QARI */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <select
          value={qari}
          onChange={(e) => setQari(e.target.value)}
        >
          <option value="01">Abdul Basit</option>
          <option value="02">Misyari</option>
          <option value="03">Al Husary</option>
        </select>
      </div>

      {/* CONTROL BUTTON */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <button onClick={playAll}>▶ Play All</button>
        <button onClick={pauseAudio}>⏸ Pause</button>
        <button onClick={stopAudio}>⏹ Stop</button>
      </div>

      {/* LIST AYAT */}
      {dataSurah.ayat.map((ayat, index) => (
        <div
          key={ayat.nomorAyat}
          className="ayat-box"
          style={{
            background:
              index === currentIndex ? "#d4f5d4" : "transparent",
            padding: "10px",
            borderRadius: "10px",
          }}
        >

          <div className="arab">
            {ayat.teksArab}
          </div>

          <div className="latin">
            {ayat.teksLatin}
          </div>

          <div className="arti">
            {ayat.teksIndonesia}
          </div>

          <div style={{ textAlign: "center", marginTop: 10 }}>
            <button onClick={() => playAyat(index)}>
              ▶ Play Ayat
            </button>
          </div>

        </div>
      ))}

      {/* AUDIO ELEMENT */}
      {currentIndex !== null && (
        <audio
          ref={audioRef}
          onEnded={handleEnded}
        >
          <source
            src={dataSurah.ayat[currentIndex].audio[qari]}
            type="audio/mpeg"
          />
        </audio>
      )}

    </div>
  );
}

export default SurahDetail;