
export function Button({ children, className = '', ...props }){
  return (
    <button className={`px-4 py-2 bg-primary text-primary-foreground rounded ${className}`} {...props}>
      {children}
    </button>
  )
}

