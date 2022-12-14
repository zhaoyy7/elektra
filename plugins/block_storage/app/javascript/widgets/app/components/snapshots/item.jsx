/* eslint-disable no-undef */
import React from "react"
import { Link } from "react-router-dom"
import { scope } from "lib/ajax_helper"
import { Highlighter } from "react-bootstrap-typeahead"
import * as constants from "../../constants"

const MyHighlighter = ({ search, children }) => {
  if (!search || !children) return children
  return <Highlighter search={search}>{children + ""}</Highlighter>
}

export default class Snapshot extends React.Component {
  UNSAFE_componentWillReceiveProps(nextProps) {
    // stop polling if status has changed from creating to something else
    this.pendignState(nextProps) ? this.startPolling() : this.stopPolling()
  }

  componentDidMount() {
    if (this.pendignState()) this.startPolling()
  }

  componentWillUnmount() {
    // stop polling on unmounting
    this.stopPolling()
  }

  startPolling = () => {
    // do not create a new polling interval if already polling
    if (this.polling) return
    this.polling = setInterval(
      () => this.props.reloadSnapshot(this.props.snapshot.id),
      5000
    )
  }

  stopPolling = () => {
    clearInterval(this.polling)
    this.polling = null
  }

  handleDelete = (e) => {
    e.preventDefault()
    this.props.deleteSnapshot(this.props.snapshot.id)
  }

  pendignState = (props = this.props) => {
    return constants.SNAPSHOT_PENDING_STATUS.indexOf(props.snapshot.status) >= 0
  }

  render() {
    const { snapshot, searchTerm } = this.props
    return (
      <tr className={`state-${snapshot.status}`}>
        <td>
          {policy.isAllowed("block_storage:snapshot_get", {}) ? (
            <Link to={`/snapshots/${snapshot.id}/show`}>
              <MyHighlighter search={searchTerm}>{snapshot.name}</MyHighlighter>
            </Link>
          ) : (
            <MyHighlighter search={searchTerm}>{snapshot.name}</MyHighlighter>
          )}
          <br />
          <span className="info-text">
            <MyHighlighter search={searchTerm}>{snapshot.id}</MyHighlighter>
          </span>
        </td>
        <td>
          <MyHighlighter search={searchTerm}>
            {snapshot.description}
          </MyHighlighter>
        </td>
        <td>
          <MyHighlighter search={searchTerm}>{snapshot.size}</MyHighlighter>
        </td>
        <td>
          {snapshot.volume_name ? (
            <React.Fragment>
              <Link to={`/snapshots/volumes/${snapshot.volume_id}/show`}>
                {snapshot.volume_name}
              </Link>
              <br />
              <span className="info-text">{snapshot.volume_id}</span>
            </React.Fragment>
          ) : (
            snapshot.volume_id
          )}
        </td>
        <td>
          {this.pendignState() && <span className="spinner" />}
          <MyHighlighter search={searchTerm}>{snapshot.status}</MyHighlighter>
        </td>

        <td className="snug">
          {(policy.isAllowed("block_storage:snapshot_delete", {
            target: { scoped_domain_name: scope.domain },
          }) ||
            policy.isAllowed("block_storage:snapshot_update", {
              target: { scoped_domain_name: scope.domain },
            })) && (
            <div className="btn-group">
              <button
                className="btn btn-default btn-sm dropdown-toggle"
                disabled={this.pendignState()}
                type="button"
                data-toggle="dropdown"
                aria-expanded={true}
              >
                <span className="fa fa-cog"></span>
              </button>

              <ul className="dropdown-menu dropdown-menu-right" role="menu">
                {policy.isAllowed("block_storage:snapshot_update", {
                  target: { scoped_domain_name: scope.domain },
                }) && (
                  <li>
                    <Link to={`/snapshots/${snapshot.id}/edit`}>Edit</Link>
                  </li>
                )}
                {snapshot.status == "available" && (
                  <li>
                    <Link to={`/snapshots/${snapshot.id}/volumes/new`}>
                      Create Volume
                    </Link>
                  </li>
                )}
                {policy.isAllowed("block_storage:snapshot_delete", {
                  target: { scoped_domain_name: scope.domain },
                }) && (
                  <React.Fragment>
                    <li className="divider"></li>
                    <li>
                      <a href="#" onClick={this.handleDelete}>
                        Delete
                      </a>
                    </li>
                  </React.Fragment>
                )}
                {policy.isAllowed("block_storage:snapshot_reset_status") && (
                  <React.Fragment>
                    <li className="divider"></li>
                    <li>
                      <Link to={`/snapshots/${snapshot.id}/reset-status`}>
                        Reset Status
                      </Link>
                    </li>
                  </React.Fragment>
                )}
              </ul>
            </div>
          )}
        </td>
      </tr>
    )
  }
}
