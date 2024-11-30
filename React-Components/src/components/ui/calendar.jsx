import React from 'react'

export function Calendar({ selected, onSelect }) {
  // This is a simplified calendar component
  return (
    <div>
      <input 
        type="date" 
        value={selected ? selected.toISOString().split('T')[0] : ''} 
        onChange={(e) => onSelect(new Date(e.target.value))}
      />
    </div>
  )
}

