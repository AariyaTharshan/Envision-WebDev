import { CameraProvider } from "./components/CameraContext";
import { ControlPanel, Navbar,Canvas } from './components'

const App = () => (
  <CameraProvider>
    <Navbar/>
    <ControlPanel />
    <Canvas />
  </CameraProvider>
);

export default App;
