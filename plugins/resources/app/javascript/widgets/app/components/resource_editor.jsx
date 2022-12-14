import React from "react"
import { Scope } from "../scope"
import { Unit, valueWithUnit } from "../unit"
import { t } from "../utils"

const ResourceEditor = (props) => {
  const {
    text: editQuotaText,
    value: newQuota,
    error: editError,
    isFlashing,
    isFollowing,
    checkResult: cr,
    readonlyReason,
  } = props.edit
  const {
    name: resourceName,
    unit: unitName,
    quota: oldQuota,
    scales_with: scalesWith,
  } = props.resource
  const scope = new Scope(props.scopeData)
  const unit = new Unit(unitName)

  let errorMessage = scope.formatInputError(editError, unitName)
  let message = undefined
  if (errorMessage) {
    message = <div className="col-md-4 text-danger">{errorMessage}</div>
  } else if (cr) {
    if (cr.unacceptable) {
      message = <div className="col-md-4 text-danger">{cr.unacceptable}</div>
    } else if (cr.requestRequired) {
      message = (
        <div className="col-md-4 text-warning">{cr.requestRequired}</div>
      )
    } else if (cr.success) {
      if (newQuota > oldQuota) {
        message = (
          <div className="col-md-4 text-success">
            Quota can be raised without approval
          </div>
        )
      } else if (newQuota < oldQuota) {
        message = (
          <div className="col-md-4 text-success">
            Quota can be reduced without approval
          </div>
        )
      } else {
        message = <div className="col-md-4 text-muted">Unchanged</div>
      }
    }
  } else if (readonlyReason === "cqd") {
    message = <div className="col-md-4">Centralized quota distribution</div>
  } else if (isFollowing) {
    message = (
      <div className="col-md-4">
        Adds {valueWithUnit(scalesWith.factor, unit)} per extra{" "}
        {t(scalesWith.resource_name + "_single")}
      </div>
    )
  } else if (scalesWith) {
    message = (
      <div className="col-md-4">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault()
            props.handleResetFollower(resourceName)
          }}
        >
          Reset
        </a>
      </div>
    )
  }

  return (
    <React.Fragment>
      <div
        className={`col-md-2 edit-quota-input ${
          isFlashing ? "edit-quota-input-is-flashing" : ""
        }`}
      >
        <input
          className="form-control input-sm"
          type="text"
          value={editQuotaText}
          disabled={props.disabled || readonlyReason !== "" ? true : false}
          onChange={(e) => props.handleInput(resourceName, e.target.value)}
          onBlur={(e) => {
            props.triggerParseInputs()
            return true
          }}
          onMouseOut={(e) => {
            props.triggerParseInputs()
            return true
          }}
          onKeyPress={(e) => {
            if (e.key == "Enter") {
              props.triggerParseInputs()
            }
            //continue handling the key-press event in the regular manner
            return true
          }}
        />
      </div>
      {message}
    </React.Fragment>
  )
}

export default ResourceEditor
