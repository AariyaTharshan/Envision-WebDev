"use client"

import { useState } from "react"
import { HelpCircle, Minus, X } from "lucide-react"

export default function PhaseSegmentation() {
  const [activeTab, setActiveTab] = useState("overall")
  const [currentPhase, setCurrentPhase] = useState("")
  const [fieldImage, setFieldImage] = useState(1)
  const [totalImages, setTotalImages] = useState(1)

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto border border-gray-300 shadow bg-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1 bg-gray-200 border-b border-gray-300">
        <div className="flex items-center gap-1">
          <img src="/placeholder.svg?height=16&width=16" alt="" className="w-4 h-4" />
          <span className="text-sm font-medium">Phase Segmentation</span>
        </div>
        <div className="flex items-center">
          <button className="p-1 hover:bg-gray-300">
            <Minus className="w-3 h-3" />
          </button>
          <button className="p-1 hover:bg-gray-300">
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="p-2 space-y-3">
        {/* Top section */}
        <div className="flex flex-wrap justify-between gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 p-1 border border-gray-300 bg-gray-200 rounded">
              <span className="text-xs">Source:</span>
              <div className="flex items-center gap-1">
                <input type="radio" id="source" name="source" defaultChecked />
                <label htmlFor="source" className="text-xs">
                  View
                </label>
              </div>
              <div className="flex items-center gap-1">
                <input type="radio" id="image" name="source" />
                <label htmlFor="image" className="text-xs">
                  Image
                </label>
              </div>
            </div>
            <div className="flex gap-1">
              <button className="px-3 py-1 text-xs bg-gray-200 border border-gray-300 rounded hover:bg-gray-300">
                Reset
              </button>
              <button className="px-3 py-1 text-xs bg-gray-200 border border-gray-300 rounded hover:bg-gray-300">
                Clear
              </button>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1">
              <span className="text-xs">Units:</span>
              <span className="text-xs">microns</span>
              <button className="p-1">
                <HelpCircle className="w-3 h-3 text-blue-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Method selection */}
        <div className="flex flex-col gap-1">
          <div className="flex gap-2">
            <div className="flex items-center gap-1">
              <input type="radio" id="areaFraction" name="method" defaultChecked />
              <label htmlFor="areaFraction" className="text-xs">
                Area Fraction Method
              </label>
            </div>
            <div className="flex items-center gap-1">
              <input type="radio" id="manualPoint" name="method" />
              <label htmlFor="manualPoint" className="text-xs">
                Manual Point Count Method
              </label>
            </div>
          </div>

          {/* Configuration */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <span className="text-xs">Configuration:</span>
              <select className="text-xs border border-gray-300 rounded px-1 py-0.5 bg-white">
                <option>-</option>
              </select>
            </div>
            <div className="flex gap-1">
              <button className="px-3 py-1 text-xs bg-gray-200 border border-gray-300 rounded hover:bg-gray-300">
                Apply
              </button>
              <button className="px-3 py-1 text-xs bg-gray-200 border border-gray-300 rounded hover:bg-gray-300">
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Import section */}
        <div className="flex flex-col gap-1 border-t border-b border-gray-300 py-2">
          <div className="text-xs font-medium">Import Module/Rake Data</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <input type="radio" id="module" name="importType" defaultChecked />
              <label htmlFor="module" className="text-xs">
                Module
              </label>
            </div>
            <div className="flex items-center gap-1">
              <input type="radio" id="rake" name="importType" />
              <label htmlFor="rake" className="text-xs">
                Rake
              </label>
            </div>
            <button className="px-3 py-1 text-xs bg-gray-200 border border-gray-300 rounded hover:bg-gray-300">
              Import
            </button>
          </div>
        </div>

        {/* Phase buttons */}
        <div className="flex flex-wrap gap-1">
          <button className="px-3 py-1 text-xs bg-gray-200 border border-gray-300 rounded hover:bg-gray-300">
            New Phase
          </button>
          <button className="px-3 py-1 text-xs bg-gray-200 border border-gray-300 rounded hover:bg-gray-300">
            Cancel
          </button>
          <button className="px-3 py-1 text-xs bg-gray-200 border border-gray-300 rounded hover:bg-gray-300">
            Clear Phases
          </button>
          <button className="px-3 py-1 text-xs bg-gray-200 border border-gray-300 rounded hover:bg-gray-300">
            Replace Color
          </button>
          <div className="flex items-center gap-1 ml-2">
            <input type="checkbox" id="replaceAll" />
            <label htmlFor="replaceAll" className="text-xs">
              Repeat Replace Color for All
            </label>
          </div>
        </div>

        {/* Current Result */}
        <div className="flex flex-col">
          <div className="text-xs font-medium">Current Result</div>
          <div className="flex">
            <div className="flex-1 border border-gray-300">
              <table className="w-full text-xs">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-2 py-1 border-r border-gray-300 text-left">#</th>
                    <th className="px-2 py-1 border-r border-gray-300 text-left">Color</th>
                    <th className="px-2 py-1 border-r border-gray-300 text-left">Element</th>
                    <th className="px-2 py-1 border-r border-gray-300 text-left">Area</th>
                    <th className="px-2 py-1 border-r border-gray-300 text-left">Area(%)</th>
                    <th className="px-2 py-1 text-left">Exp %</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-300">{/* Empty table body */}</tbody>
              </table>
            </div>
            <div className="flex flex-col gap-1 ml-2">
              <button className="px-3 py-1 text-xs bg-gray-200 border border-gray-300 rounded hover:bg-gray-300 w-20">
                Edit Phase
              </button>
              <button className="px-3 py-1 text-xs bg-gray-200 border border-gray-300 rounded hover:bg-gray-300 w-20">
                Split Phase
              </button>
              <button className="px-3 py-1 text-xs bg-gray-200 border border-gray-300 rounded hover:bg-gray-300 w-20">
                Clear Split
              </button>
              <div className="mt-2">
                <div className="text-xs">Current Phase</div>
                <select className="text-xs border border-gray-300 rounded px-1 py-0.5 bg-white w-full">
                  <option>-</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Save Configuration */}
        <div className="flex items-center justify-between border-t border-gray-300 pt-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <input type="radio" id="saveAll" name="saveType" defaultChecked />
              <label htmlFor="saveAll" className="text-xs">
                All
              </label>
            </div>
            <div className="flex items-center gap-1">
              <input type="radio" id="saveCurrent" name="saveType" />
              <label htmlFor="saveCurrent" className="text-xs">
                Current
              </label>
            </div>
            <div className="flex items-center gap-1">
              <input type="radio" id="saveName" name="saveType" />
              <label htmlFor="saveName" className="text-xs">
                Name
              </label>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <input type="text" className="text-xs border border-gray-300 rounded px-1 py-0.5 w-40" />
            <button className="px-3 py-1 text-xs bg-gray-200 border border-gray-300 rounded hover:bg-gray-300">
              Save
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-300">
          <button
            className={`px-3 py-1 text-xs ${activeTab === "overall" ? "bg-white border-t border-l border-r border-gray-300" : "bg-gray-200"}`}
            onClick={() => setActiveTab("overall")}
          >
            Overall Summary
          </button>
          <button
            className={`px-3 py-1 text-xs ${activeTab === "graphical" ? "bg-white border-t border-l border-r border-gray-300" : "bg-gray-200"}`}
            onClick={() => setActiveTab("graphical")}
          >
            Graphical Result
          </button>
          <button
            className={`px-3 py-1 text-xs ${activeTab === "module" ? "bg-white border-t border-l border-r border-gray-300" : "bg-gray-200"}`}
            onClick={() => setActiveTab("module")}
          >
            Module data
          </button>
          <button
            className={`px-3 py-1 text-xs ${activeTab === "rake" ? "bg-white border-t border-l border-r border-gray-300" : "bg-gray-200"}`}
            onClick={() => setActiveTab("rake")}
          >
            Rake Data
          </button>
        </div>

        {/* Results table */}
        <div className="border border-gray-300">
          <table className="w-full text-xs">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-2 py-1 border-r border-gray-300 text-left">#</th>
                <th className="px-2 py-1 border-r border-gray-300 text-left">Color</th>
                <th className="px-2 py-1 border-r border-gray-300 text-left">Element</th>
                <th className="px-2 py-1 border-r border-gray-300 text-left">Point Count</th>
                <th className="px-2 py-1 border-r border-gray-300 text-left">%</th>
                <th className="px-2 py-1 text-left">Exp %</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-blue-100">
                <td className="px-2 py-1 border-r border-gray-300">1</td>
                <td className="px-2 py-1 border-r border-gray-300">
                  <div className="w-4 h-4 bg-blue-500"></div>
                </td>
                <td className="px-2 py-1 border-r border-gray-300">Ferrite</td>
                <td className="px-2 py-1 border-r border-gray-300">10871</td>
                <td className="px-2 py-1 border-r border-gray-300">64.45</td>
                <td className="px-2 py-1">-</td>
              </tr>
              <tr className="bg-red-100">
                <td className="px-2 py-1 border-r border-gray-300">2</td>
                <td className="px-2 py-1 border-r border-gray-300">
                  <div className="w-4 h-4 bg-red-500"></div>
                </td>
                <td className="px-2 py-1 border-r border-gray-300">Ferrite</td>
                <td className="px-2 py-1 border-r border-gray-300">5982</td>
                <td className="px-2 py-1 border-r border-gray-300">35.55</td>
                <td className="px-2 py-1">-</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-2">
          <div className="flex items-center gap-1">
            <span className="text-xs">Field Image:</span>
            <div className="flex items-center border border-gray-300 rounded">
              <button
                className="px-1 text-xs bg-gray-200 hover:bg-gray-300"
                onClick={() => setFieldImage(Math.max(1, fieldImage - 1))}
              >
                &lt;
              </button>
              <span className="px-2 text-xs">{fieldImage}</span>
              <button
                className="px-1 text-xs bg-gray-200 hover:bg-gray-300"
                onClick={() => setFieldImage(Math.min(totalImages, fieldImage + 1))}
              >
                &gt;
              </button>
            </div>
          </div>
          <button className="px-3 py-1 text-xs bg-gray-200 border border-gray-300 rounded hover:bg-gray-300">
            Summary Report
          </button>
        </div>
      </div>
    </div>
  )
}

