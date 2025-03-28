"use client"

import { useState } from "react"
import { HelpCircle, X, ImageIcon } from "lucide-react"

export default function PhaseSegmentation({ onClose }) {
  const [activeTab, setActiveTab] = useState("overall")
  const [currentPhase, setCurrentPhase] = useState("")
  const [fieldImage, setFieldImage] = useState(1)
  const [totalImages, setTotalImages] = useState(1)

  return (
    <div className="fixed right-0 top-0 h-full w-[800px] bg-white shadow-lg border-l border-gray-200 z-40">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-white">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          <span className="font-medium">Phase Segmentation</span>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-gray-700 rounded"
        >
          <X className="w-5 h-5" />
          </button>
      </div>

      {/* Content */}
      <div className="flex h-[calc(100%-48px)]">
        {/* Main Content Area */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* Step 1 */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-red-600">Step 1:</span>
            <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
              Get Image
              </button>
          </div>

          {/* Source Selection */}
          <div className="flex flex-col gap-2">
            <div className="text-sm font-medium">Source Selection</div>
            <div className="flex items-center gap-4 p-2 bg-gray-50 rounded border">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="source" defaultChecked />
                <span>View</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="source" />
                <span>Image</span>
              </label>
            </div>
          </div>

          {/* Method Selection */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Method</div>
            <div className="p-3 bg-gray-50 rounded border space-y-3">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="method" defaultChecked />
                  <span>Area Fraction Method</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="method" />
                  <span>Manual Point Count Method</span>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Configuration:</span>
                  <select className="text-sm border rounded px-2 py-1 bg-white">
                    <option>Select</option>
              </select>
            </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600">
                Apply
              </button>
                  <button className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 border">
                Delete
              </button>
            </div>
          </div>
          </div>
        </div>

          {/* Results Table */}
          <div className="border rounded shadow-sm">
            <div className="p-2 bg-gray-50 border-b text-sm font-medium">Current Results</div>
            <div className="max-h-[300px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-200 sticky top-0">
                  <tr>
                    <th className="px-2 py-1 border-r border-gray-300 text-left">#</th>
                    <th className="px-2 py-1 border-r border-gray-300 text-left">Color</th>
                    <th className="px-2 py-1 border-r border-gray-300 text-left">Element</th>
                    <th className="px-2 py-1 border-r border-gray-300 text-left">Area</th>
                    <th className="px-2 py-1 border-r border-gray-300 text-left">Area(%)</th>
                    <th className="px-2 py-1 text-left">Exp %</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-50">
                    <td className="px-2 py-1 border-r border-gray-300">1</td>
                    <td className="px-2 py-1 border-r border-gray-300">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    </td>
                    <td className="px-2 py-1 border-r border-gray-300">Ferrite</td>
                    <td className="px-2 py-1 border-r border-gray-300">64.45</td>
                    <td className="px-2 py-1 border-r border-gray-300">64.45</td>
                    <td className="px-2 py-1">-</td>
                  </tr>
                </tbody>
              </table>
          </div>
        </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-2">
          <div className="flex items-center gap-2">
              <span className="text-sm">Field Image:</span>
              <div className="flex items-center border rounded">
                <button className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 border-r">&lt;</button>
                <span className="px-3 py-1 text-sm">{fieldImage}</span>
                <button className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 border-l">&gt;</button>
            </div>
            </div>
            <button className="px-4 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
              Generate Report
            </button>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-56 border-l border-gray-200 bg-gray-50 p-4 space-y-4">
          {/* Controls */}
          <div className="space-y-2">
            <button className="w-full px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
              New Phase
          </button>
            <button className="w-full px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 border">
              Clear Phases
          </button>
            <button className="w-full px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 border">
              Replace Color
          </button>
        </div>

          {/* Current Phase */}
          <div className="pt-4 border-t border-gray-200">
            <div className="text-sm font-medium mb-2">Current Phase</div>
            <select className="w-full text-sm border rounded px-2 py-1 bg-white">
              <option value="">Select Phase</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
