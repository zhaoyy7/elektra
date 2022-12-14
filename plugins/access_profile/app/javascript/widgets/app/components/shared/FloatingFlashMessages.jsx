import React from "react"
import { FlashMessages } from "lib/flashes"
import { Overlay, Popover, Alert } from "react-bootstrap"
import uniqueId from "lodash/uniqueId"

class FloatingFlashMessages extends React.Component {
  render() {
    const popOver = (
      <Popover id={uniqueId("flash-popover-")}>
        <div className="lbaas2">
          <FlashMessages />
        </div>
      </Popover>
    )

    const overlay = (
      <Overlay
        show={true}
        placement="right"
        container={this}
        // eslint-disable-next-line react/no-find-dom-node, no-undef
        target={() => ReactDOM.findDOMNode(this.target)}
      >
        {popOver}
      </Overlay>
    )

    return (
      <div className="sticky-flash">
        <div className="sticky-flash-container">
          <FlashMessages />
          {/* <Alert bsStyle="warning">
            <strong>Holy guacamole!</strong> Best check yo self, you're not
            looking too good.
          </Alert> */}
        </div>
      </div>
    )
  }
}

export default FloatingFlashMessages
