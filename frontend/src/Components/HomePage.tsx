import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 p-6">
      {/* Card Container */}
      <div className="relative w-3/4 min-h-[600px] bg-white rounded-xl shadow-2xl flex flex-col items-center justify-center p-8 pt-24 space-y-6 border-4 border-yellow-400">
        {/* Image Display - Now popping out */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-[110%] z-20">
          <img
            src="/imgg.png"
            alt="BroGPT"
            onClick={() => navigate("/chat")}
            className="h-full w-auto object-contain drop-shadow-[0_35px_35px_rgba(255,223,0,0.6)] animate-float"
          />
        </div>

        {/* Footer / Disclaimer */}
      </div>
      <div className="absolute bottom-4 text-xs text-gray-500 italic z-30 bg-white/90 px-4 py-2 rounded-lg">
        📜 Bro Code Disclaimer: "Results may include: 1) Mind-blowing advice, 2)
        Suit recommendations, 3) Occasional high-fives through the screen."
      </div>
    </div>
  );
};

export default HomePage;
