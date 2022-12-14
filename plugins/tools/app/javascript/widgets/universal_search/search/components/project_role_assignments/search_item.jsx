import { Link } from "react-router-dom"
import { Highlighter } from "react-bootstrap-typeahead"
import { projectUrl } from "../../../shared/object_link_helper"
import React from "react"

const ObjectLink = ({ id, name, term }) => (
  <React.Fragment>
    <Link to={`/project-role-assignments/${id}/show?tab=userRoles`}>
      {name ? (
        <Highlighter search={term || ""}>{name || ""}</Highlighter>
      ) : (
        <Highlighter search={term || ""}>{id || ""}</Highlighter>
      )}
    </Link>
    {name && (
      <React.Fragment>
        <br />
        <span className="info-text">
          <Highlighter search={term || ""}>{id || ""}</Highlighter>
        </span>
      </React.Fragment>
    )}
  </React.Fragment>
)

const SearchItem = ({ item, domain, project }) => {
  const scope = item.payload.scope || {}
  const projectLink = projectUrl(item)

  return (
    <tr>
      <td>
        {/* Domain */}
        <ObjectLink
          id={scope.domain_id || item.domain_id}
          name={scope.domain_name}
          term={domain}
        />
      </td>
      <td>
        {/* Project */}
        <ObjectLink id={item.id} name={item.name} term={project} />
      </td>
      <td>
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
            {projectLink && (
              <li>
                <a href={projectLink} target="_blank" rel="noreferrer">
                  <i className="fa fa-fw fa-external-link" /> Switch to Project
                </a>
              </li>
            )}
            <li>
              <Link to={`/project-role-assignments/${item.id}/show`}>
                Role Assignments
              </Link>
            </li>
          </ul>
        </div>
      </td>
    </tr>
  )
}

export default SearchItem
