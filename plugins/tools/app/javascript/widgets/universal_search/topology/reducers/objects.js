import * as constants from "../constants"

//########################## OBJECTS ##############################
const initialObjectState = {
  children: [],
  isFetching: false,
  requestedAt: null,
  receivedAt: null,
}

const requestTopologyObjects = (state, { objectId, requestedAt }) => {
  const newState = { ...state }
  newState[objectId] = Object.assign({}, initialObjectState, state[objectId], {
    isFetching: true,
  })
  return newState
}

const removeLeaves = (state, { objectId }) => {
  if (
    !state[objectId] ||
    !state[objectId].children ||
    state[objectId].children.length == 0
  )
    return state

  const childrenToBeRemoved = state[objectId].children.filter((child) => {
    return (
      child &&
      state[child] &&
      state[child].children &&
      state[child].children.length == 0
    )
  })

  const newState = { ...state }

  newState[objectId] = Object.assign({}, initialObjectState, state[objectId], {
    children: (newState[objectId].children || []).filter(
      (c) => childrenToBeRemoved.indexOf(c) < 0
    ),
    requestedAt: null,
    receivedAt: null,
  })
  for (let nodeId of childrenToBeRemoved) {
    delete newState[nodeId]
  }

  return newState
}

const requestTopologyObjectsFailure = (state, { objectId }) => {
  const newState = { ...state }
  newState[objectId] = Object.assign({}, initialObjectState, state[objectId], {
    isFetching: false,
  })
  return newState
}

const receiveTopologyObjects = (state, { objects, receivedAt, parentId }) => {
  const newState = { ...state }
  if (parentId) {
    newState[parentId] = {
      ...initialObjectState,
      ...newState[parentId],
      isFetching: false,
      receivedAt,
    }
    newState[parentId].children = newState[parentId].children.slice()
  }

  for (let obj of objects) {
    newState[obj.id] = { ...initialObjectState, ...newState[obj.id], ...obj }
    if (parentId && obj.id != parentId) newState[parentId].children.push(obj.id)
  }

  return newState
}

const reset = (state) => ({})

// entries reducer
export default (state, action) => {
  if (state == null) {
    state = {}
  }
  switch (action.type) {
    case constants.RECEIVE_TOPOLOGY_OBJECTS:
      return receiveTopologyObjects(state, action)
    case constants.REQUEST_TOPOLOGY_OBJECTS:
      return requestTopologyObjects(state, action)
    case constants.REQUEST_TOPOLOGY_OBJECTS_FAILURE:
      return requestTopologyObjectsFailure(state, action)
    case constants.RESET_TOPOLOGY_STATE:
      return reset(state, action)
    case constants.REMOVE_LEAVES:
      return removeLeaves(state, action)
    default:
      return state
  }
}
