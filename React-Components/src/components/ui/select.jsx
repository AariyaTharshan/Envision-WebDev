import React from 'react'

export function Select({ children }) {
  return <select className="border rounded px-2 py-1">{children}</select>
}

export function SelectTrigger({ children }) {
  return <div>{children}</div>
}

export function SelectValue({ placeholder }) {
  return <span>{placeholder}</span>
}

export function SelectContent({ children }) {
  return <div>{children}</div>
}

export function SelectItem({ value, children }) {
  return <option value={value}>{children}</option>
}

