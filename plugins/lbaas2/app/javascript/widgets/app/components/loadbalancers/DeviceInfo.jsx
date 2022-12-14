import React, { useState, useEffect } from "react"
import useLoadbalancer from "../../lib/hooks/useLoadbalancer"
import { matchPath } from "react-router-dom"
import Log from "../shared/logger"
import JsonView from "../shared/JsonView"
import { matchParams, searchParamsToString } from "../../helpers/commonHelpers"
import { fetchLoadbalancerDevice } from "../../actions/loadbalancer"

const DeviceInfo = (props) => {
  const [loadbalancerID, setLoadbalancerID] = useState(null)

  const [deviceInfo, setDeviceInfo] = useState({
    isLoading: false,
    error: null,
    item: {},
  })

  useEffect(() => {
    loadInfo()
  }, [])

  const loadInfo = () => {
    const params = matchParams(props)
    const lbID = params.loadbalancerID
    setLoadbalancerID(lbID)

    Log.debug("fetching Device Info")
    setDeviceInfo({ ...deviceInfo, isLoading: true, error: null })
    fetchLoadbalancerDevice(lbID)
      .then((data) => {
        if (data.device) {
          setDeviceInfo({
            ...deviceInfo,
            isLoading: false,
            item: data.device,
            error: null,
          })
        }
      })
      .catch((error) => {
        setDeviceInfo({
          ...deviceInfo,
          isLoading: false,
          error: error,
        })
      })
  }

  /*
   * Modal stuff
   */
  const [show, setShow] = useState(true)

  const close = (e) => {
    if (e) e.stopPropagation()
    setShow(false)
  }

  const restoreUrl = () => {
    if (!show) {
      const isRequestFromDetails = matchPath(
        props.location.pathname,
        "/loadbalancers/:loadbalancerID/show/device"
      )

      if (isRequestFromDetails && isRequestFromDetails.isExact) {
        props.history.replace(
          `/loadbalancers/${loadbalancerID}/show?${searchParamsToString(props)}`
        )
      } else {
        props.history.replace("/loadbalancers")
      }
    }
  }

  return (
    <JsonView
      show={show}
      close={close}
      restoreUrl={restoreUrl}
      title="Device Information"
      jsonObject={deviceInfo}
      loadObject={loadInfo}
    />
  )
}

export default DeviceInfo
