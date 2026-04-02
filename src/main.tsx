import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProviderWithRouter } from './ClerkProviderWithRouter.tsx'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ClerkProviderWithRouter>
      <App />
    </ClerkProviderWithRouter>
  </BrowserRouter>,
)

