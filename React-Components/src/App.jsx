import { ControlPanel,Navbar } from './components'
import './App.css'
import Popup from './components/Popup'
const App = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ControlPanel/>
      <Popup/> 
    </div>
  )
}

export default App