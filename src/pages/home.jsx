import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Home() {

  const [surahList, setSurahList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getSurah = async () => {
      const response = await axios.get(
        "https://equran.id/api/v2/surat"
      );
      setSurahList(response.data.data);
    };

    getSurah();
  }, []);

  return (
    <div className="surah-container">
      <h1 style={{ color: "white" }}>Daftar Surat</h1>

      {surahList.map((surah) => (
        <div
          key={surah.nomor}
          className="surah-card"
          onClick={() => navigate(`/surah/${surah.nomor}`)}
        >
          <h2>{surah.nomor}. {surah.namaLatin}</h2>
          <p>{surah.arti}</p>
        </div>
      ))}
    </div>
  );
}

export default Home;