import { makeSelectBox } from "../utils"
import { validatePolicy } from "./utils"
import React from "react"

const actionOptions = [
  { value: "protect", label: "Protect image" },
  { value: "delete", label: "Delete image" },
]
const repoFilterOptions = [
  { value: "off", label: "regardless of repository" },
  { value: "on", label: "if repository name matches..." },
]
const tagFilterOptions = [
  { value: "off", label: "regardless of tags" },
  { value: "on", label: "if tag name matches..." },
  { value: "untagged", label: "if image does not have tags" },
]
const timestampOptions = [
  { value: "off", label: "regardless of age" },
  { value: "pushed_at", label: "if push timestamp of image..." },
  { value: "last_pulled_at", label: "if last pull timestamp of image..." },
]
const timeConstraintOptions = [
  { value: "older_than", label: "is older than..." },
  { value: "newer_than", label: "is newer than..." },
  { value: "oldest", label: "is among the oldest..." },
  { value: "newest", label: "is among the newest..." },
]
const timeUnitOptions = [
  { value: "s", label: "seconds" },
  { value: "m", label: "minutes" },
  { value: "h", label: "hours" },
  { value: "d", label: "days" },
  { value: "w", label: "weeks" },
  { value: "y", label: "years" },
]

const GCPoliciesEditRow = ({
  index,
  policy,
  policyCount,
  isEditable,
  movePolicy,
  setPolicyAttribute,
  removePolicy,
}) => {
  const makeTextInput = (attr, value) => {
    value = value || ""
    if (!isEditable) {
      if (value === "") {
        return <em>Any</em>
      }
      return <code>{value || ""}</code>
    }
    return (
      <input
        type="text"
        value={value}
        className="form-control"
        onChange={(e) => setPolicyAttribute(index, attr, e.target.value)}
      />
    )
  }

  const makeNumberInput = (attr, value) => {
    value = value || 0
    if (!isEditable) {
      return <code>{value.toString()}</code>
    }
    return (
      <input
        type="number"
        value={value.toString()}
        className="form-control"
        min="1"
        onChange={(e) =>
          setPolicyAttribute(index, attr, parseInt(e.target.value, 10))
        }
      />
    )
  }

  const timeConstraint = policy.time_constraint || {}
  const currentTimestampOption = timeConstraint.on || "off"
  const currentTimeConstraintOption = timeConstraintOptions
    .map((o) => o.value)
    .find((key) => key in timeConstraint)

  const validationError = validatePolicy(policy)

  return (
    <tr>
      {isEditable ? (
        <td key="order" className="policy-order-buttons">
          {index > 0 ? (
            <button
              className="btn btn-xs btn-default"
              onClick={(e) => movePolicy(index, -1)}
            >
              Move up
            </button>
          ) : (
            <button className="btn btn-xs btn-default" disabled={true}>
              Move up
            </button>
          )}
          {index < policyCount - 1 ? (
            <button
              className="btn btn-xs btn-default"
              onClick={(e) => movePolicy(index, +1)}
            >
              Move down
            </button>
          ) : (
            <button className="btn btn-xs btn-default" disabled={true}>
              Move down
            </button>
          )}
        </td>
      ) : (
        <td key="order" className="policy-order-buttons"></td>
      )}
      <td>
        {makeSelectBox({
          isEditable,
          options: actionOptions,
          value: policy.action,
          onChange: (e) => setPolicyAttribute(index, "action", e.target.value),
        })}
      </td>
      <td className="form-inline">
        <div className="policy-matching-rule-line">
          {makeSelectBox({
            isEditable,
            options: repoFilterOptions,
            value: policy.ui_hints.repo_filter,
            onChange: (e) =>
              setPolicyAttribute(index, "repo_filter", e.target.value),
          })}
          {policy.ui_hints.repo_filter === "on" && (
            <React.Fragment>
              {" regex "}
              {makeTextInput("match_repository", policy.match_repository)}
              {(isEditable || policy.except_repository) && (
                <React.Fragment>
                  {" but not regex "}
                  {makeTextInput("except_repository", policy.except_repository)}
                </React.Fragment>
              )}
            </React.Fragment>
          )}
        </div>
        <div className="policy-matching-rule-line">
          {makeSelectBox({
            isEditable,
            options: tagFilterOptions,
            value: policy.ui_hints.tag_filter,
            onChange: (e) =>
              setPolicyAttribute(index, "tag_filter", e.target.value),
          })}
          {policy.ui_hints.tag_filter === "on" && (
            <React.Fragment>
              {" regex "}
              {makeTextInput("match_tag", policy.match_tag)}
              {(isEditable || policy.except_tag) && (
                <React.Fragment>
                  {" but not regex "}
                  {makeTextInput("except_tag", policy.except_tag)}
                </React.Fragment>
              )}
            </React.Fragment>
          )}
        </div>
        <div className="policy-matching-rule-line">
          {makeSelectBox({
            isEditable,
            options: timestampOptions,
            value: currentTimestampOption,
            onChange: (e) =>
              setPolicyAttribute(index, "timestamp", e.target.value),
          })}
          {currentTimestampOption !== "off" && (
            <React.Fragment>
              {" "}
              {makeSelectBox({
                isEditable,
                options: timeConstraintOptions,
                value: currentTimeConstraintOption,
                onChange: (e) =>
                  setPolicyAttribute(index, "time_constraint", e.target.value),
              })}
              {(currentTimeConstraintOption === "oldest" ||
                currentTimeConstraintOption == "newest") && (
                <React.Fragment>
                  {" "}
                  {makeNumberInput(
                    currentTimeConstraintOption,
                    policy.time_constraint[currentTimeConstraintOption]
                  )}
                  {" in this repository"}
                </React.Fragment>
              )}
              {(currentTimeConstraintOption === "older_than" ||
                currentTimeConstraintOption == "newer_than") && (
                <React.Fragment>
                  {" "}
                  {makeNumberInput(
                    currentTimeConstraintOption,
                    policy.time_constraint[currentTimeConstraintOption].value
                  )}{" "}
                  {makeSelectBox({
                    isEditable,
                    options: timeUnitOptions,
                    value:
                      policy.time_constraint[currentTimeConstraintOption].unit,
                    onChange: (e) =>
                      setPolicyAttribute(index, "time_unit", e.target.value),
                  })}
                </React.Fragment>
              )}
            </React.Fragment>
          )}
        </div>
        {validationError && <p className="text-danger">{validationError}</p>}
      </td>
      <td>
        {isEditable && (
          <button className="btn btn-link" onClick={(e) => removePolicy(index)}>
            Remove
          </button>
        )}
      </td>
    </tr>
  )
}

export default GCPoliciesEditRow
