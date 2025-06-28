import { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";

export default function Winsite() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [atzencoins, setAtzencoins] = useState(0);
  const [currentCode, setCurrentCode] = useState<string | null>(null);

  useEffect(() => {
    if (code) {
      window.gtag?.('event', 'qr_code_scanned', {
        code: code,
        page_location: window.location.href
      });

      sessionStorage.setItem("qrCode", code);
      setCurrentCode(code);
    } else {
      const saved = sessionStorage.getItem("qrCode");
      if (!saved) {
        alert("No valid code found. Please scan again.");
        navigate("/");
      } else {
        setCurrentCode(saved);
      }
    }
  }, [code, navigate]);

  return (
    <div className="game-wrapper">
      <p>Code: {currentCode}</p>
      <p>Atzencoins: {atzencoins}</p>
    </div>
  );
} 