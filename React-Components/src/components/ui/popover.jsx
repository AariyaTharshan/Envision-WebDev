import React, { useState } from 'react'

export function Popover({ children }) {
  return <div>{children}</div>
}

export function PopoverTrigger({ children }) {
  return <div>{children}</div>
}

export function PopoverContent({ children }) {
  return <div className="border rounded p-2 mt-1">{children}</div>
}

