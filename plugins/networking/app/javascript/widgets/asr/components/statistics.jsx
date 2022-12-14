import ReactJson from "react-json-view"
import React from "react"

const Statistics = ({ isFetching, data, error }) => {
  if (isFetching) return <span className="spinner" />
  if (error) return <div className="alert alert-danger">{error}</div>
  if (data) {
    return <ReactJson src={data} collapsed={3} />
  }
  return null
}

export default Statistics
