import React from "react";
import { useState } from "react"

const SearchInput = ({ onSearch, placeholder = "Search projects, users, or languages..." }) => {
  const [searchTerm, setSearchTerm] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim())
    }
  }

  const handleChange = (e) => {
    setSearchTerm(e.target.value)
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input type="text" value={searchTerm} onChange={handleChange} placeholder={placeholder} style={{ flex: 1 }} />
        <button type="submit">🔍 Search</button>
      </div>
    </form>
  )
}

export default SearchInput
