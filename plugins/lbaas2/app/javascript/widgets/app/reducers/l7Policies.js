const initialState = {
  items: [],
  isLoading: false,
  receivedAt: null,
  hasNext: true,
  marker: null,
  searchTerm: null,
  error: null,
  selected: null,
}

const requestL7Policies = (state) => ({
  ...state,
  isLoading: true,
  error: null,
})

const receiveL7Policies = (state, { items, hasNext }) => {
  // sort
  const newItems = items.sort((a, b) => a.position - b.position)
  return {
    ...state,
    isLoading: false,
    items: newItems,
    error: null,
    hasNext,
    marker: items[items.length - 1],
    receivedAt: Date.now(),
  }
}

const requestL7PoliciesFailure = (state, { error }) => {
  const err = error
  return { ...state, isLoading: false, error: err }
}

const resetL7Policies = (state) => {
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

const receiveL7Policy = (state, { l7Policy }) => {
  if (!l7Policy || !l7Policy.id) {
    return state
  }
  const index = state.items.findIndex((item) => item.id == l7Policy.id)
  let items = state.items.slice()
  // update or add l7Policy
  if (index >= 0) {
    items[index] = l7Policy
  } else {
    items.push(l7Policy)
  }
  // sort
  const newItems = items.sort((a, b) => a.position - b.position)
  return { ...state, items: newItems, isLoading: false, error: null }
}

const removeL7Policy = (state, { id }) => {
  const index = state.items.findIndex((item) => item.id == id)
  if (index < 0) {
    return state
  }
  let newItems = state.items.slice()
  newItems.splice(index, 1)
  return { ...state, items: newItems }
}

const requestL7policyDelete = (state, { id }) => {
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
    case "REQUEST_L7POLICIES":
      return requestL7Policies(state, action)
    case "RECEIVE_L7POLICIES":
      return receiveL7Policies(state, action)
    case "REQUEST_L7POLICIES_FAILURE":
      return requestL7PoliciesFailure(state, action)
    case "RESET_L7POLICIES":
      return resetL7Policies(state, action)
    case "RECEIVE_L7POLICY":
      return receiveL7Policy(state, action)
    case "REMOVE_L7POLICY":
      return removeL7Policy(state, action)
    case "REQUEST_REMOVE_L7POLICY":
      return requestL7policyDelete(state, action)
    case "SET_L7POLICIES_SEARCH_TERM":
      return setSearchTerm(state, action)
    case "SET_L7POLICIES_SELECTED_ITEM":
      return setSelectedItem(state, action)
    default:
      return state
  }
}
