import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { World } from './pages/World'
import { FileComplaint } from './pages/FileComplaint'
import { Investigating } from './pages/Investigating'
import { CaseResult } from './pages/CaseResult'
import { Certificate } from './pages/Certificate'
import { Archives } from './pages/Archives'
import { Notices } from './pages/Notices'
import { Minister } from './pages/Minister'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<World />} />
        <Route path="/file" element={<FileComplaint />} />
        <Route path="/investigating" element={<Investigating />} />
        <Route path="/case/:id" element={<CaseResult />} />
        <Route path="/certificate/:id" element={<Certificate />} />
        <Route path="/archives" element={<Archives />} />
        <Route path="/notices" element={<Notices />} />
        <Route path="/minister" element={<Minister />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
