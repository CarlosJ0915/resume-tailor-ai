import "./App.css";
import HeaderComponent from "./components/HeaderComponent";
import ResumeFormComponent from "./components/ResumeFormComponent";

function App() {
  return (
    <div className="app">
      <HeaderComponent />
      <main>
        <ResumeFormComponent />
      </main>
      <footer className="footer">AI suggestions can be wrong. Review your resume before sending it.</footer>
    </div>
  );
}

export default App;
