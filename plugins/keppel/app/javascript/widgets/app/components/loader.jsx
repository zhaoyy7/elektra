import React from "react"
export default class Loader extends React.Component {
  componentDidMount() {
    this.props.loadAccountsOnce()
  }
  componentDidUpdate() {
    this.props.loadAccountsOnce()
  }

  render() {
    const { isFetching, isLoaded, children } = this.props
    return isFetching ? (
      <p>
        <span className="spinner" /> Loading accounts...
      </p>
    ) : isLoaded ? (
      <React.Fragment>{children}</React.Fragment>
    ) : (
      <p className="alert alert-error">Could not load accounts.</p>
    )
  }
}
