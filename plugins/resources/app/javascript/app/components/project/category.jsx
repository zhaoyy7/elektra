import { byUIString, t } from '../../utils';

import ProjectResource from '../../components/project/resource';

export default class ProjectCategory extends React.Component {
  state = {}

  render() {
    //these props are passed on to the ProjectResource children verbatim
    const forwardProps = {
      flavorData: this.props.flavorData,
      metadata:   this.props.metadata,
    };

    const { categoryName, category: categoryData } = this.props;
    const { serviceType, resources } = categoryData;

    return (
      <React.Fragment>
        <h3>{t(categoryName)}</h3>
        {resources.sort(byUIString).map(res => (
          <ProjectResource key={res.name} resource={res} {...forwardProps} />
        ))}
      </React.Fragment>
    );
  }
}
