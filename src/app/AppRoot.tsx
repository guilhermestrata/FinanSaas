import { RouterProvider } from 'react-router-dom'
import { QueryProvider } from './providers/QueryProvider'
import { router } from './router'

export function AppRoot() {
  return (
    <QueryProvider>
      <RouterProvider router={router} />
    </QueryProvider>
  )
}
