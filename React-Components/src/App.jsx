import { ControlPanel,Navbar } from './components'
import './App.css'

const App = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ControlPanel/>
      {/* <cam></cam> */}
    </div>
  )
}

export default App