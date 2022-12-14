import { Link } from "react-router-dom"
import { policy } from "lib/policy"
import React from "react"

// availability_zone: "qa-de-1a"
// cached_object_type: "share_replica"
// created_at: "2019-02-06T13:39:46.000000"
// id: "818a9e38-7100-43ab-86ff-e9265612eca4"
// project_id: null
// replica_state: "active"
// search_label: ""
// share_id: "d7da010b-a1b6-4a51-89c9-61ce1998e2b9"
// share_network_id: "d1d461b8-3c2e-4629-80ae-60a8d3a2a8b9"
// share_server_id: "dd24c960-27d0-4db0-94de-628177c17700"
// status: "available"
// updated_at: "2019-02-06T13:39:55.000000"

const ReplicaItem = ({
  replica,
  share,
  handleDelete,
  reloadReplica,
  promoteReplica,
  resyncReplica,
}) => {
  React.useEffect(() => {
    if (["replication_change", "creating"].indexOf(replica.status) < 0) return
    const polling = setInterval(() => reloadReplica(replica.id), 10000)

    return () => clearInterval(polling)
  }, [reloadReplica, replica.id, replica.status])

  const canI = React.useCallback(
    (permission) =>
      policy.isAllowed(`shared_filesystem_storage:replica_${permission}`, {
        replica,
      }),
    [replica]
  )
  return (
    <tr className={replica.isFetching || replica.isDeleting ? "updating" : ""}>
      <td>
        <Link to={`/replicas/${replica.id}/show`}>
          {replica.name || replica.id}
        </Link>
        {replica.name && (
          <React.Fragment>
            <br />
            <span className="info-text">{replica.id}</span>
          </React.Fragment>
        )}
      </td>
      <td>
        {share ? (
          <div>
            {share.name}
            <br />
            <span className="info-text">{replica.share_id}</span>
          </div>
        ) : (
          replica.share_id
        )}
      </td>

      <td>{replica.replica_state}</td>
      <td>
        {replica.status == "creating" && <span className="spinner" />}{" "}
        {replica.status}
      </td>
      <td className="snug">
        {(canI("promote") ||
          canI("delete") ||
          canI("resync") ||
          canI("get_error_log")) && (
          <div className="btn-group">
            <button
              className="btn btn-default btn-sm dropdown-toggle"
              type="button"
              data-toggle="dropdown"
              aria-expanded="true"
            >
              <i className="fa fa-cog"></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-right" role="menu">
              {canI("delete") && replica.status != "creating" && (
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      handleDelete(replica.id)
                    }}
                  >
                    Delete
                  </a>
                </li>
              )}
              {canI("promote") && (
                <li>
                  <a
                    onClick={(e) => {
                      e.preventDefault()
                      promoteReplica()
                    }}
                    href="#"
                  >
                    Activate
                  </a>
                </li>
              )}
              {canI("resync") && (
                <li>
                  <a
                    onClick={(e) => {
                      e.preventDefault()
                      resyncReplica()
                    }}
                    href="#"
                  >
                    Re-sync
                  </a>
                </li>
              )}
              {canI("get_error_log") && (
                <li>
                  <Link to={`/replicas/${replica.id}/error-log`}>
                    Error Log
                  </Link>
                </li>
              )}
            </ul>
          </div>
        )}
      </td>
    </tr>
  )
}
export default ReplicaItem
