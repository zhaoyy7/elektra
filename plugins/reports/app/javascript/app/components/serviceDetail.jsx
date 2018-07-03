import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Numeral from 'numeral';

const DetailsViewHighlightTransition = ({
  children,
  ...props
}) => (<CSSTransition {...props} timeout={300} unmountOnExit classNames="css-transition-highlight">
  {children}
</CSSTransition>);

const blackListKeys = ["region", "year", "month", "project_id", "price_sec"]

const ServiceDetail = props => (
  <div className="service-details flex-item">
    <table className="table datatable">
      <thead>
        <tr>
          <th colSpan="2">
            <i className="fa fa-square header-square" style={{color: props.getColor(props.service.service)}}/>
            <span>{props.service.service} - {props.service.measure}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {Object.keys(props.service).map(key => (
            !blackListKeys.includes(key) &&
            <tr className={(key == "price_loc") ? "heighlight" : "undefined"} key={props.service+key}>
              <th>{key}</th>
              <td>
                <TransitionGroup>
                  <DetailsViewHighlightTransition key={props.service+key+props.service[key]}>
                    <span>{(key == "price_loc") ? Numeral(props.service[key]).format('0,0.00') : props.service[key]}</span>
                  </DetailsViewHighlightTransition>
                </TransitionGroup>
              </td>
            </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default ServiceDetail;
