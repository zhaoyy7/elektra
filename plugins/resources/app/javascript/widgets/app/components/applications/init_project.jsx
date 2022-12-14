/* eslint no-console:0 */
import Loader from "../../containers/loader"
import InitProjectModal from "../../containers/init_project"
import React from "react"

const initProject = (props) => {
  const { domainId, projectId, docsUrl } = props
  const scopeData = { domainID: domainId, projectID: projectId }
  const rootProps = { scopeData, docsUrl }

  return (
    <Loader scopeData={scopeData} isModal={true}>
      <InitProjectModal {...rootProps} />
    </Loader>
  )
}

export default initProject
