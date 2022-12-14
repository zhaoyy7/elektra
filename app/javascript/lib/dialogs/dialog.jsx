import React from "react"
import { Modal, Button } from "react-bootstrap"
import Deferred from "lib/tools/deferred"

export class ModalDialog extends React.Component {
  constructor(props) {
    super(props)

    this.state = { show: false }
    this.abort = this.abort.bind(this)
    this.confirm = this.confirm.bind(this)
  }

  static defaultProps = {
    confirmLabel: "Yes",
    abortLabel: "No",
    showAbortButton: true,
    size: "large",
    type: "info",
  }

  abort() {
    this.setState({ show: false }, () => this.promise.reject(true))
  }

  confirm() {
    this.setState({ show: false }, () => this.promise.resolve(true))
  }

  componentDidMount() {
    this.promise = new Deferred()
    this.setState({ show: true }, () => {
      //ReactDOM.findDOMNode(this.refs.confirm).focus()
      if (this.confirmButton) this.confirmButton.focus()
    })
  }

  render() {
    return (
      <Modal
        show={this.state.show}
        bsSize={this.props.size}
        onExited={this.props.onHide}
        aria-labelledby="contained-modal-title-lg"
      >
        <Modal.Header closeButton={false}>
          <Modal.Title id="contained-modal-title-lg">
            <i className={`dialog-title-icon ${this.props.type}`}></i>
            {this.props.type.replace(/\b\w/g, (l) => l.toUpperCase())}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {this.props.title && <h4>{this.props.title}</h4>}
          {this.props.message}
        </Modal.Body>
        <Modal.Footer>
          {this.props.showAbortButton && (
            <Button onClick={this.abort}>{this.props.abortLabel}</Button>
          )}
          <Button
            bsStyle="primary"
            onClick={this.confirm}
            ref={(confirm) => {
              this.confirmButton = confirm
            }}
          >
            {this.props.confirmLabel}
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }
}
