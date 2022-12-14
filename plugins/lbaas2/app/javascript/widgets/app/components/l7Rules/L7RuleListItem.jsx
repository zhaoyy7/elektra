import React, { useEffect, useState, useMemo } from "react"
import CopyPastePopover from "../shared/CopyPastePopover"
import StaticTags from "../StaticTags"
import useL7Rule from "../../lib/hooks/useL7Rule"
import SmartLink from "../shared/SmartLink"
import { policy } from "lib/policy"
import { scope } from "lib/ajax_helper"
import Log from "../shared/logger"
import DropDownMenu from "../shared/DropdownMenu"
import useStatus from "../../lib/hooks/useStatus"
import usePolling from "../../lib/hooks/usePolling"
import BooleanLabel from "../shared/BooleanLabel"
import { addNotice, addError } from "lib/flashes"
import { ErrorsList } from "lib/elektra-form/components/errors_list"
import {
  matchParams,
  searchParamsToString,
  MyHighlighter,
  errorMessage,
} from "../../helpers/commonHelpers"
import useL7Policy from "../../lib/hooks/useL7Policy"

const L7RuleListItem = ({
  props,
  listenerID,
  l7PolicyID,
  l7Rule,
  searchTerm,
  shouldPoll,
}) => {
  const { removeL7Rule, persistL7Rule } = useL7Rule()
  const { persistL7Policy } = useL7Policy()
  const [loadbalancerID, setLoadbalancerID] = useState(null)
  const { entityStatus } = useStatus(
    l7Rule.operating_status,
    l7Rule.provisioning_status
  )

  useEffect(() => {
    const params = matchParams(props)
    setLoadbalancerID(params.loadbalancerID)
  }, [])

  const pollingCallback = () => {
    return persistL7Rule(loadbalancerID, listenerID, l7PolicyID, l7Rule.id)
  }

  usePolling({
    delay: l7Rule.provisioning_status.includes("PENDING") ? 20000 : 60000,
    callback: pollingCallback,
    active: shouldPoll || l7Rule?.provisioning_status?.includes("PENDING"),
  })

  const canEdit = useMemo(
    () =>
      policy.isAllowed("lbaas2:l7rule_update", {
        target: { scoped_domain_name: scope.domain },
      }),
    [scope.domain]
  )

  const canDelete = useMemo(
    () =>
      policy.isAllowed("lbaas2:l7rule_delete", {
        target: { scoped_domain_name: scope.domain },
      }),
    [scope.domain]
  )

  const canShowJSON = useMemo(
    () =>
      policy.isAllowed("lbaas2:l7rule_get", {
        target: { scoped_domain_name: scope.domain },
      }),
    [scope.domain]
  )

  const handleDelete = (e) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    const l7ruleID = l7Rule.id
    removeL7Rule(loadbalancerID, listenerID, l7PolicyID, l7Rule)
      .then(() => {
        addNotice(
          <React.Fragment>
            L7 Rule <b>{l7ruleID}</b> is being deleted.
          </React.Fragment>
        )
        // fetch the listener again containing the new policy so it gets updated fast
        persistL7Policy(loadbalancerID, listenerID, l7PolicyID)
          .then(() => {})
          .catch((error) => {})
      })
      .catch((error) => {
        addError(
          React.createElement(ErrorsList, {
            errors: errorMessage(error),
          })
        )
      })
  }

  return (
    <tr>
      <td className="snug-nowrap">
        <CopyPastePopover
          text={l7Rule.id}
          size={12}
          sliceType="MIDDLE"
          bsClass="cp copy-paste-ids"
          searchTerm={searchTerm}
        />
      </td>
      <td>{entityStatus}</td>
      <td>
        <StaticTags tags={l7Rule.tags} shouldPopover={true} />
      </td>
      <td className="word-break">
        <MyHighlighter search={searchTerm}>{l7Rule.type}</MyHighlighter>
        <br />
        {l7Rule.compare_type}
      </td>
      <td>
        <BooleanLabel value={l7Rule.invert} />
      </td>
      <td>
        <CopyPastePopover text={l7Rule.key} size={12} />
      </td>
      <td>
        <CopyPastePopover
          text={l7Rule.value}
          size={12}
          searchTerm={searchTerm}
        />
      </td>
      <td>
        <DropDownMenu buttonIcon={<span className="fa fa-cog" />}>
          <li>
            <SmartLink
              to={`/loadbalancers/${loadbalancerID}/listeners/${listenerID}/l7policies/${l7PolicyID}/l7rules/${
                l7Rule.id
              }/edit?${searchParamsToString(props)}`}
              isAllowed={canEdit}
              notAllowedText="Not allowed to edit. Please check with your administrator."
            >
              Edit
            </SmartLink>
          </li>
          <li>
            <SmartLink
              onClick={handleDelete}
              isAllowed={canDelete}
              notAllowedText="Not allowed to delete. Please check with your administrator."
            >
              Delete
            </SmartLink>
          </li>
          <li>
            <SmartLink
              to={`/loadbalancers/${loadbalancerID}/listeners/${listenerID}/l7policies/${l7PolicyID}/l7rules/${
                l7Rule.id
              }/json?${searchParamsToString(props)}`}
              isAllowed={canShowJSON}
              notAllowedText="Not allowed to get JSOn. Please check with your administrator."
            >
              JSON
            </SmartLink>
          </li>
        </DropDownMenu>
      </td>
    </tr>
  )
}

export default L7RuleListItem
