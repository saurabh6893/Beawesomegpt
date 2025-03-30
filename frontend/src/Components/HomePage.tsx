import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-white mb-6 animate-bounce">
          Welcome to Legendary Chat!
        </h1>
        <p className="text-xl text-purple-200 mb-10">
          Ready to experience the most awesome chat app ever?
          <br />
          (Wait for it...)
        </p>

        <button
          onClick={() => navigate("/chat")}
          className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-bold text-xl rounded-full 
                    transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl
                    animate-pulse border-2 border-white"
        >
          SUIT UP AND CHAT! 💼🎩
        </button>

        <div className="mt-16 text-purple-300">
          <p className="text-sm italic">
            "When I get sad, I stop being sad and be awesome instead."
            <br />- Barney Stinson
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
