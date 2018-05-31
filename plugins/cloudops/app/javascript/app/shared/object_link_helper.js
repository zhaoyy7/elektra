const OBJECT_URL_PATH = {
  server: (id) => `compute/instances/?overlay=${id}`,
  volume: (id) => `block-storage/volumes?overlay=${id}`,
  volume_snapshot: (id) => `block-storage/snapshots?overlay=${id}`,
  image: (id) => `image/ng#/os-images/available/${id}/show`,
  flavor: (id) => `compute/flavors`,
  network: (id) => `networking/networks/external?overlay=${id}`,
  router: (id) => `networking/routers?overlay=${id}`,
  port: (id) => `networking/ports#/ports/${id}/show`,
  floatingip: (id) => `networking/floating_ips`,
  security_group: (id) => `networking/security_groups/${id}`,
  loadbalancer: (id) => `loadbalancing/loadbalancers/${id}/listeners`,
  zone: (id) => `dns-service/zones/${id}`,
  share: (id) => `shared-filesystem-storage/#/shares/${id}/show`,
  share_network: (id) => `shared-filesystem-storage/#/share-networks/${id}/show`,
  security_service: (id) => `shared-filesystem-storage/#/security-services/${id}/show`,
  share_snapshot: (id) => `shared-filesystem-storage/#/snapshots/${id}/show`
}

export const projectUrl = (item) => {
  if(!item) return null
  const scope = item.payload.scope || {}
  const isProject = item.cached_object_type=='project'
  let projectLink = null
  if(isProject) {
    projectLink = `/${item.domain_id}/${item.id}/home`
  } else if(scope.domain_id && scope.project_id) {
    projectLink = `/${scope.domain_id}/${scope.project_id}/home`
  }
  return projectLink
}

export const objectUrl = (item) => {
  if(!item) return null
  const path = OBJECT_URL_PATH[item.cached_object_type]
  console.log(path)
  if(!path) return null
  const scope = item.payload.scope || {}
  return(`/${scope.domain_id}/${scope.project_id}/${path(item.id)}`)
}