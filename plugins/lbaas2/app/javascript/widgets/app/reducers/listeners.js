const initialState = {
  items: [],
  isLoading: false,
  updatedAt: null,
  searchTerm: null,
  error: null,
  selected: null,
  marker: null,
  hasNext: true,
  limit: 10,
  sortKey: "name",
  sortDir: "asc",
}

const requestListeners = (state) => ({ ...state, isLoading: true, error: null })

const receiveListeners = (
  state,
  { items, has_next, limit, sort_key, sort_dir }
) => {
  let newItems = (state.items.slice() || []).concat(items)
  // filter duplicated items
  newItems = newItems.filter(
    (item, pos, arr) => arr.findIndex((i) => i.id == item.id) == pos
  )

  const marker = items.length > 0 ? items[items.length - 1].id : null
  // sort
  newItems = newItems.sort((a, b) => a.name.localeCompare(b.name))

  return {
    ...state,
    isLoading: false,
    items: newItems,
    error: null,
    marker: marker,
    hasNext: has_next,
    limit: limit,
    sortKey: sort_key,
    sortDir: sort_dir,
    updatedAt: Date.now(),
  }
}

const requestListenersFailure = (state, { error }) => {
  const err = error
  return { ...state, isLoading: false, error: err }
}

const resetListeners = (state) => {
  return {
    ...state,
    items: [],
    isLoading: false,
    receivedAt: null,
    hasNext: true,
    marker: null,
    searchTerm: null,
    error: null,
    selected: null,
  }
}

const receiveListener = (state, { listener }) => {
  if (!listener && !listener.id) {
    return state
  }
  const index = state.items.findIndex((item) => item.id == listener.id)
  let items = state.items.slice()
  // update or add listener
  if (index >= 0) {
    items[index] = listener
  } else {
    items.push(listener)
  }
  // sort
  items = items.sort((a, b) => a.name.localeCompare(b.name))
  return { ...state, items: items, isLoading: false, error: null }
}

const removeListener = (state, { id }) => {
  const index = state.items.findIndex((item) => item.id == id)
  if (index < 0) {
    return state
  }
  let newItems = state.items.slice()
  newItems.splice(index, 1)
  return { ...state, items: newItems }
}

const requestListenerDelete = (state, { id }) => {
  const index = state.items.findIndex((item) => item.id == id)
  if (index < 0) {
    return state
  }
  let newItems = state.items.slice()
  newItems[index].provisioning_status = "PENDING_DELETE"
  return { ...state, items: newItems }
}

const setSearchTerm = (state, { searchTerm }) => ({ ...state, searchTerm })

const setSelectedItem = (state, { selected }) => ({ ...state, selected })

export default (state = initialState, action) => {
  switch (action.type) {
    case "REQUEST_LISTENERS":
      return requestListeners(state, action)
    case "RECEIVE_LISTENERS":
      return receiveListeners(state, action)
    case "REQUEST_LISTENERS_FAILURE":
      return requestListenersFailure(state, action)
    case "RESET_LISTENERS":
      return resetListeners(state, action)
    case "RECEIVE_LISTENER":
      return receiveListener(state, action)
    case "REMOVE_LISTENER":
      return removeListener(state, action)
    case "REQUEST_REMOVE_LISTENER":
      return requestListenerDelete(state, action)
    case "SET_LISTENERS_SEARCH_TERM":
      return setSearchTerm(state, action)
    case "SET_LISTENERS_SELECTED_ITEM":
      return setSelectedItem(state, action)
    default:
      return state
  }
}
