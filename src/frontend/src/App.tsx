import { Route, Routes } from "react-router-dom";

import VideoRating from "@/pages/video-rating";
import LolDice from "@/pages/lol-dice";

function App() {
  return (
    <Routes>
      <Route element={<VideoRating />} path="/" />
      <Route element={<VideoRating />} path="/video-rating" />
      <Route element={<LolDice />} path="/lol-dice" />
    </Routes>
  );
}

export default App;
