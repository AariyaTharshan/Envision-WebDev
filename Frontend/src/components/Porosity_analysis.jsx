"use client"

import { useState } from "react"
import { HelpCircle, Minus, X, Play, FileText, ImageIcon, Moon, Sun, Filter, Plus, Trash } from "lucide-react"

export default function PorosityAnalysis() {
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
    <div className="flex flex-col w-full max-w-3xl mx-auto border border-gray-300 shadow bg-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1 bg-gray-200 border-b border-gray-300">
        <div className="flex items-center gap-1">
          <img src="/placeholder.svg?height=16&width=16" alt="" className="w-4 h-4" />
          <span className="text-sm font-medium">Porosity Analysis</span>
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
      <div className="flex">
        {/* Left section */}
        <div className="flex-1 p-2 space-y-3">
          {/* Step 1 */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-red-600">Step 1:</span>
            <button className="px-3 py-1 text-xs bg-gray-200 border border-gray-300 rounded hover:bg-gray-300">
              Get Image
            </button>
          </div>

          {/* Distribution Analysis */}
          <div className="text-xs font-medium">Distribution Analysis</div>

          {/* Image Preparation */}
          <div className="flex items-center gap-2">
            <span className="text-xs w-28">Image Preparation:</span>
            <select className="text-xs border border-gray-300 rounded px-1 py-0.5 bg-white flex-1">
              <option>Select</option>
            </select>
            <button className="px-3 py-1 text-xs bg-blue-500 text-white border border-blue-600 rounded hover:bg-blue-600 flex items-center gap-1">
              <Play className="w-3 h-3" />
              Run
            </button>
            <span className="text-xs text-red-600">(Required)</span>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <span className="text-xs w-28">Filters:</span>
            <select className="text-xs border border-gray-300 rounded px-1 py-0.5 bg-white flex-1">
              <option>Select</option>
            </select>
            <button className="px-3 py-1 text-xs bg-gray-200 border border-gray-300 rounded hover:bg-gray-300">
              Clear
            </button>
          </div>

          {/* Distribution buttons */}
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-xs bg-gray-200 border border-gray-300 rounded hover:bg-gray-300">
              Distribution
            </button>
            <button className="px-3 py-1 text-xs bg-gray-200 border border-gray-300 rounded hover:bg-gray-300">
              Default
            </button>
            <div className="flex items-center gap-1 ml-2">
              <input type="checkbox" id="saveReset" />
              <label htmlFor="saveReset" className="text-xs">
                Save or Reset Image
              </label>
            </div>
          </div>

          {/* Current Result */}
          <div className="flex flex-col">
            <div className="text-xs font-medium text-red-600">Current Result</div>
            <div className="border border-gray-300 h-48 overflow-auto">
              <table className="w-full text-xs">
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
            <span className="text-xs">Save Config:</span>
            <input type="text" className="text-xs border border-gray-300 rounded px-1 py-0.5 flex-1" />
            <button className="px-3 py-1 text-xs bg-gray-200 border border-gray-300 rounded hover:bg-gray-300">
              Save
            </button>
          </div>

          {/* Summary Result */}
          <div className="flex flex-col">
            <div className="text-xs font-medium text-red-600">Summary Result</div>
            <div className="flex border-b border-gray-300">
              <button
                className={`px-3 py-1 text-xs ${activeTab === "result" ? "bg-white border-t border-l border-r border-gray-300" : "bg-gray-200"}`}
                onClick={() => setActiveTab("result")}
              >
                Result
              </button>
              <button
                className={`px-3 py-1 text-xs ${activeTab === "graph" ? "bg-white border-t border-l border-r border-gray-300" : "bg-gray-200"}`}
                onClick={() => setActiveTab("graph")}
              >
                Graph
              </button>
            </div>
            <div className="border border-gray-300 h-48 bg-gray-300">
              {/* Graph or result would be displayed here */}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-center items-center gap-2 pt-2">
            <button className="px-3 py-1 text-xs bg-gray-200 border border-gray-300 rounded hover:bg-gray-300 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Report
            </button>
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
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-40 p-2 border-l border-gray-300 space-y-4">
          {/* Unit */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-xs">Unit:</span>
              <select className="text-xs border border-gray-300 rounded px-1 py-0.5 bg-white">
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
            <div className="text-xs font-medium">Source:</div>
            <div className="flex flex-col gap-1 pl-2">
              <div className="flex items-center gap-1">
                <input type="radio" id="view" name="source" defaultChecked />
                <label htmlFor="view" className="text-xs flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" /> View
                </label>
              </div>
              <div className="flex items-center gap-1">
                <input type="radio" id="image" name="source" />
                <label htmlFor="image" className="text-xs flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" /> Image
                </label>
              </div>
            </div>
          </div>

          {/* Dark/Light Features */}
          <div className="flex flex-col gap-1 border-t border-gray-300 pt-2">
            <div className="text-xs font-medium">Dark/Light Features:</div>
            <div className="flex flex-col gap-1 pl-2">
              <div className="flex items-center gap-1">
                <input type="radio" id="dark" name="features" defaultChecked />
                <label htmlFor="dark" className="text-xs flex items-center gap-1">
                  <Moon className="w-3 h-3" /> Dark
                </label>
              </div>
              <div className="flex items-center gap-1">
                <input type="radio" id="light" name="features" />
                <label htmlFor="light" className="text-xs flex items-center gap-1">
                  <Sun className="w-3 h-3" /> Light
                </label>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-2 border-t border-gray-300 pt-2">
            <button className="px-3 py-1 text-xs bg-gray-200 border border-gray-300 rounded hover:bg-gray-300 w-full flex items-center justify-center gap-1">
              <Filter className="w-3 h-3" />
              Filters
            </button>
            <button className="px-3 py-1 text-xs bg-gray-200 border border-gray-300 rounded hover:bg-gray-300 w-full flex items-center justify-center gap-1">
              <Plus className="w-3 h-3" />
              Add
            </button>
            <button className="px-3 py-1 text-xs bg-gray-200 border border-gray-300 rounded hover:bg-gray-300 w-full flex items-center justify-center gap-1">
              <Trash className="w-3 h-3" />
              Clear
            </button>
          </div>

          {/* Field */}
          <div className="flex flex-col gap-2 border-t border-gray-300 pt-2 mt-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Field:</span>
              <select className="text-xs border border-gray-300 rounded px-1 py-0.5 bg-white w-16">
                <option>-</option>
              </select>
            </div>
            <button className="px-3 py-1 text-xs bg-gray-200 border border-gray-300 rounded hover:bg-gray-300 w-full">
              Value
            </button>
            <button className="px-3 py-1 text-xs bg-gray-200 border border-gray-300 rounded hover:bg-gray-300 w-full">
              Delete
            </button>
            <button className="px-3 py-1 text-xs bg-gray-200 border border-gray-300 rounded hover:bg-gray-300 w-full">
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

