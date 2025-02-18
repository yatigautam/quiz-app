import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <h1>Welcome to the Interactive Quiz</h1>
      <Link to="/quiz">Start Quiz</Link>
    </div>
  );
}

export default Home;