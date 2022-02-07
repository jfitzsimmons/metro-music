import "./App.css";

//import Header from "./components/Header/Header";
import Map from "./components/Map/Map";
import Score from "./components/Score/Score";
import Preview from "./components/Preview/Preview";

function App() {
  return (
      <main>
        <Score /> 
        <Map />
        <Preview />
      </main>
  );
}

export default App;
