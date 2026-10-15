import { Provider } from 'react-redux'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { appRoutes } from './routes'
import { store } from './store'

// Data router: useBlocker (checkout in progress) and ScrollRestoration need it.
const router = createBrowserRouter(appRoutes)

export function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  )
}
