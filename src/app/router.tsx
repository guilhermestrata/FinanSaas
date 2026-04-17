import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '../ui/layout/AppShell'
import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { ManagePage } from '../pages/manage/ManagePage'
import { SpreadsheetPage } from '../pages/spreadsheet/SpreadsheetPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'manage', element: <ManagePage /> },
      { path: 'spreadsheet', element: <SpreadsheetPage /> },
    ],
  },
])
