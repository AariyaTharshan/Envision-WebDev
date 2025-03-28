"use client"

import { useState } from "react"
import { HelpCircle, X, Play, FileText, ImageIcon, Moon, Sun, Filter, Plus, Trash } from "lucide-react"

export default function PorosityAnalysis({ onClose }) {
  const [activeTab, setActiveTab] = useState("result")
  const [selectedRow, setSelectedRow] = useState(76)
  const [fieldImage, setFieldImage] = useState(1)
  const [totalImages, setTotalImages] = useState(1)

  // Sample data for the table
  const tableData = [
    { id: 70, length: 10.9, width: 10, area: 109, circ: 0.56, per: 41.8, q: 0 },
    { id: 71, length: 8.3, width: 7.5, area: 47, circ: 0.83, per: 26.8, q: 0 },
    { id: 72, length: 8.7, width: 7.3, area: 64, circ: 0.75, per: 34.3, q: 0 },
    { id: 73, length: 14.4, width: 10.9, area: 109, circ: 0.6, per: 48.1, q: 0 },
    { id: 74, length: 7.5, width: 7.3, area: 44, circ: 0.79, per: 26.5, q: 0 },
    { id: 75, length: 10.6, width: 8.9, area: 64, circ: 0.75, per: 33, q: 0 },
    { id: 76, length: 19.6, width: 16, area: 209, circ: 0.82, per: 65.8, q: 0 },
  ]

  return (
    <div className="fixed right-0 top-0 h-full w-[800px] bg-white shadow-lg border-l border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-white">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          <span className="font-medium">Porosity Analysis</span>
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
        {/* Left Panel */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* Step 1 */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-red-600">Step 1:</span>
            <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
              Get Image
            </button>
          </div>

          {/* Distribution Analysis */}
          <div className="text-sm font-medium">Distribution Analysis</div>

          {/* Image Preparation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Image Preparation:</span>
              <select className="text-sm border border-gray-300 rounded px-2 py-1 w-48">
                <option>Select Method</option>
              </select>
              <button className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 
                flex items-center gap-2">
                <Play className="w-4 h-4" />
                Run
              </button>
            </div>
          </div>

          {/* Results Table */}
          <div className="border rounded shadow-sm">
            <div className="p-2 bg-gray-50 border-b text-sm font-medium">Current Results</div>
            <div className="max-h-[300px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-200 sticky top-0">
                  <tr>
                    <th className="px-2 py-1 border-r border-gray-300 text-left">Id</th>
                    <th className="px-2 py-1 border-r border-gray-300 text-left">Length</th>
                    <th className="px-2 py-1 border-r border-gray-300 text-left">Width</th>
                    <th className="px-2 py-1 border-r border-gray-300 text-left">Area</th>
                    <th className="px-2 py-1 border-r border-gray-300 text-left">Circ</th>
                    <th className="px-2 py-1 border-r border-gray-300 text-left">Per</th>
                    <th className="px-2 py-1 text-left">?</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row) => (
                    <tr
                      key={row.id}
                      className={selectedRow === row.id ? "bg-blue-300" : "hover:bg-gray-100"}
                      onClick={() => setSelectedRow(row.id)}
                    >
                      <td className="px-2 py-1 border-r border-gray-300">{row.id}</td>
                      <td className="px-2 py-1 border-r border-gray-300">{row.length}</td>
                      <td className="px-2 py-1 border-r border-gray-300">{row.width}</td>
                      <td className="px-2 py-1 border-r border-gray-300">{row.area}</td>
                      <td className="px-2 py-1 border-r border-gray-300">{row.circ}</td>
                      <td className="px-2 py-1 border-r border-gray-300">{row.per}</td>
                      <td className="px-2 py-1">{row.q}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Save Config */}
          <div className="flex items-center gap-2">
            <span className="text-sm">Save Config:</span>
            <input type="text" className="text-sm border border-gray-300 rounded px-1 py-0.5 flex-1" />
            <button className="px-3 py-1 text-sm bg-gray-200 border border-gray-300 rounded hover:bg-gray-300">
              Save
            </button>
          </div>

          {/* Summary Result */}
          <div className="border rounded">
            <div className="flex border-b">
              <button
                className={`px-3 py-1 text-sm ${activeTab === "result" ? "bg-white border-t border-l border-r border-gray-300" : "bg-gray-200"}`}
                onClick={() => setActiveTab("result")}
              >
                Result
              </button>
              <button
                className={`px-3 py-1 text-sm ${activeTab === "graph" ? "bg-white border-t border-l border-r border-gray-300" : "bg-gray-200"}`}
                onClick={() => setActiveTab("graph")}
              >
                Graph
              </button>
            </div>
            <div className="h-64 bg-gray-50">
              {/* Graph content */}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-center items-center gap-2 pt-2">
            <button className="px-3 py-1 text-sm bg-gray-200 border border-gray-300 rounded hover:bg-gray-300 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Report
            </button>
            <div className="flex items-center gap-1">
              <span className="text-sm">Field Image:</span>
              <div className="flex items-center border border-gray-300 rounded">
                <button
                  className="px-1 text-sm bg-gray-200 hover:bg-gray-300"
                  onClick={() => setFieldImage(Math.max(1, fieldImage - 1))}
                >
                  &lt;
                </button>
                <span className="px-2 text-sm">{fieldImage}</span>
                <button
                  className="px-1 text-sm bg-gray-200 hover:bg-gray-300"
                  onClick={() => setFieldImage(Math.min(totalImages, fieldImage + 1))}
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-56 border-l border-gray-200 bg-gray-50 p-4 overflow-y-auto">
          {/* Unit */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-sm">Unit:</span>
              <select className="text-sm border border-gray-300 rounded px-1 py-0.5 bg-white">
                <option>microns</option>
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1">
                <HelpCircle className="w-3 h-3 text-blue-600" />
              </button>
              <button className="p-1">
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Source */}
          <div className="flex flex-col gap-1 border-t border-gray-300 pt-2">
            <div className="text-sm font-medium">Source:</div>
            <div className="flex flex-col gap-1 pl-2">
              <div className="flex items-center gap-1">
                <input type="radio" id="view" name="source" defaultChecked />
                <label htmlFor="view" className="text-sm flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" /> View
                </label>
              </div>
              <div className="flex items-center gap-1">
                <input type="radio" id="image" name="source" />
                <label htmlFor="image" className="text-sm flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" /> Image
                </label>
              </div>
            </div>
          </div>

          {/* Dark/Light Features */}
          <div className="flex flex-col gap-1 border-t border-gray-300 pt-2">
            <div className="text-sm font-medium">Dark/Light Features:</div>
            <div className="flex flex-col gap-1 pl-2">
              <div className="flex items-center gap-1">
                <input type="radio" id="dark" name="features" defaultChecked />
                <label htmlFor="dark" className="text-sm flex items-center gap-1">
                  <Moon className="w-3 h-3" /> Dark
                </label>
              </div>
              <div className="flex items-center gap-1">
                <input type="radio" id="light" name="features" />
                <label htmlFor="light" className="text-sm flex items-center gap-1">
                  <Sun className="w-3 h-3" /> Light
                </label>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-2 border-t border-gray-300 pt-2">
            <button className="px-3 py-1 text-sm bg-gray-200 border border-gray-300 rounded hover:bg-gray-300 w-full flex items-center justify-center gap-1">
              <Filter className="w-3 h-3" />
              Filters
            </button>
            <button className="px-3 py-1 text-sm bg-gray-200 border border-gray-300 rounded hover:bg-gray-300 w-full flex items-center justify-center gap-1">
              <Plus className="w-3 h-3" />
              Add
            </button>
            <button className="px-3 py-1 text-sm bg-gray-200 border border-gray-300 rounded hover:bg-gray-300 w-full flex items-center justify-center gap-1">
              <Trash className="w-3 h-3" />
              Clear
            </button>
          </div>

          {/* Field */}
          <div className="flex flex-col gap-2 border-t border-gray-300 pt-2 mt-auto">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Field:</span>
              <select className="text-sm border border-gray-300 rounded px-1 py-0.5 bg-white w-16">
                <option>-</option>
              </select>
            </div>
            <button className="px-3 py-1 text-sm bg-gray-200 border border-gray-300 rounded hover:bg-gray-300 w-full">
              Value
            </button>
            <button className="px-3 py-1 text-sm bg-gray-200 border border-gray-300 rounded hover:bg-gray-300 w-full">
              Delete
            </button>
            <button className="px-3 py-1 text-sm bg-gray-200 border border-gray-300 rounded hover:bg-gray-300 w-full">
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
