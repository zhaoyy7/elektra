import { OverlayTrigger, Tooltip } from "react-bootstrap"
import { Link } from "react-router-dom"
import React from "react"

import { confirm, showErrorModal } from "lib/dialogs"
import { addSuccess } from "lib/flashes"

import AccountDeleter from "../../containers/accounts/deleter"

export default class AccountRow extends React.Component {
  state = {
    isDeleting: false,
  }

  handleDelete(e) {
    e.preventDefault()
    if (this.state.isDeleting) {
      return
    }
    const { name: accountName, in_maintenance: inMaintenance } =
      this.props.account
    if (!inMaintenance) {
      showErrorModal("The account must be set in maintenance first.")
      return
    }

    confirm(
      `Really delete the account "${accountName}" and all images in it?`
    ).then(() => this.setState({ ...this.state, isDeleting: true }))
    //This causes <AccountDeleter/> to be mounted to perform the actual deletion.
  }

  handleDoneDeleting(success) {
    this.setState({ ...this.state, isDeleting: false })
    if (success) {
      addSuccess("Account deleted.")
    }
  }

  render() {
    const {
      name: accountName,
      auth_tenant_id: projectID,
      in_maintenance: inMaintenance,
      metadata,
      replication,
      platform_filter: platformFilter,
    } = this.props.account
    const isEditable = (metadata || {}).readonly_in_elektra != "true"
    const containerName = `keppel-${accountName}`
    const swiftContainerURL = `/_/${projectID}/object-storage/containers/${containerName}/list`

    let platformFilterDisplay = ""
    if (Array.isArray(platformFilter) && platformFilter.length > 0) {
      const pf = platformFilter
      if (
        pf.length == 1 &&
        pf[0].os == "linux" &&
        pf[0].architecture == "amd64"
      ) {
        platformFilterDisplay =
          ", restricted to x86_64 parts of multi-arch images"
      } else {
        platformFilterDisplay =
          ", with custom platform filter for multi-arch images"
      }
    }

    let statusDisplay = "Ready"
    if (this.state.isDeleting) {
      statusDisplay = (
        <AccountDeleter
          accountName={accountName}
          handleDoneDeleting={() => this.handleDoneDeleting()}
        />
      )
    } else if (inMaintenance) {
      const infoText = replication
        ? "No new images will be replicated while the account is in maintenance. Replicated images can still be pulled."
        : "No new images may be pushed while the account is in maintenance. Existing images can still be pulled."
      const tooltip = (
        <Tooltip id={`tooltip-in-maintenance-${accountName}`}>
          {infoText}
        </Tooltip>
      )
      statusDisplay = (
        <OverlayTrigger
          overlay={tooltip}
          placement="top"
          delayShow={300}
          delayHide={150}
        >
          <div className="text-warning">In maintenance</div>
        </OverlayTrigger>
      )
    }

    //NOTE: This table is relatively empty at the moment. I'm considering adding stats like `N repositories, M tags, X GiB used` to the display, but that would require extending the Keppel API first.
    return (
      <tr>
        <td className="col-md-4">
          <Link to={`/account/${accountName}`}>{accountName}</Link>
        </td>
        <td className="col-md-6">
          {replication ? (
            replication.strategy == "on_first_use" ? (
              <div>
                Replica of{" "}
                <strong>
                  {replication.upstream}/{accountName}
                </strong>
                {platformFilterDisplay}
              </div>
            ) : replication.strategy == "from_external_on_first_use" ? (
              <div>
                Replica of <strong>{replication.upstream.url}</strong>
                {platformFilterDisplay}
              </div>
            ) : (
              <div>Unknown replication strategy</div>
            )
          ) : (
            <div>Primary account</div>
          )}
          <div>
            Backed by Swift container{" "}
            <a href={swiftContainerURL} target="_blank" rel="noreferrer">
              {containerName}
            </a>
          </div>
        </td>
        <td className="col-md-2">{statusDisplay}</td>
        <td className="snug">
          <div className="btn-group">
            <button
              className="btn btn-default btn-sm dropdown-toggle"
              type="button"
              data-toggle="dropdown"
              aria-expanded={true}
            >
              <span className="fa fa-cog"></span>
            </button>
            <ul className="dropdown-menu dropdown-menu-right" role="menu">
              <li>
                <Link to={`/accounts/${accountName}/access_policies`}>
                  Access policies
                </Link>
              </li>
              <li>
                <Link to={`/accounts/${accountName}/gc_policies`}>
                  Garbage collection policies
                </Link>
              </li>
              {!replication && (
                <li>
                  <Link to={`/accounts/${accountName}/validation_rules`}>
                    Validation rules
                  </Link>
                </li>
              )}
              {this.props.isAdmin && (
                <React.Fragment>
                  <li className="divider"></li>
                  {isEditable &&
                    replication &&
                    replication.strategy == "from_external_on_first_use" && (
                      <li>
                        <Link to={`/accounts/${accountName}/upstream_config`}>
                          Edit replication credentials
                        </Link>
                      </li>
                    )}
                  {(!replication ||
                    replication.strategy == "from_external_on_first_use") && (
                    <li>
                      <Link to={`/accounts/${accountName}/sublease`}>
                        Issue sublease token
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link to={`/accounts/${accountName}/toggle_maintenance`}>
                      {inMaintenance ? "End maintenance" : "Set in maintenance"}
                    </Link>
                  </li>
                  <li>
                    <a href="#" onClick={(e) => this.handleDelete(e)}>
                      Delete
                    </a>
                  </li>
                </React.Fragment>
              )}
            </ul>
          </div>
        </td>
      </tr>
    )
  }
}
