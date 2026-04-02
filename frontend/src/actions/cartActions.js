import axios from 'axios'
import {CART_ADD_ITEM,CART_REMOVE_ITEM, CART_SAVE_SHIPPING_ADRESSE,CART_SAVE_PAYMENT,CART_SET_ITEMS} from '../constants/cartConstants'

export const syncCartForUser = (userId) => async (dispatch) => {
  if (!userId) {
    dispatch({
      type: CART_SET_ITEMS,
      payload: [],
    })
    localStorage.setItem('cartItems', JSON.stringify([]))
    return
  }

  try {
    const { data } = await axios.get(`/api/cart/${userId}`)
    const items = Array.isArray(data?.items)
      ? data.items.map((item) => ({
          product: item.productId,
          name: item.name,
          images: item.image ? [item.image] : [],
          price: item.price,
          countInStock: item.countInStock || 0,
          qty: item.qty || 1,
        }))
      : []

    dispatch({
      type: CART_SET_ITEMS,
      payload: items,
    })
    localStorage.setItem('cartItems', JSON.stringify(items))
  } catch (_error) {
    dispatch({
      type: CART_SET_ITEMS,
      payload: [],
    })
    localStorage.setItem('cartItems', JSON.stringify([]))
  }
}

export const clearCartForUser = (userId) => async (dispatch) => {
  if (!userId) {
    dispatch({ type: CART_SET_ITEMS, payload: [] })
    localStorage.setItem('cartItems', JSON.stringify([]))
    return
  }

  try {
    await axios.delete('/api/cart/clear', {
      data: { userId }
    })
  } catch (_error) {
  }

  dispatch({ type: CART_SET_ITEMS, payload: [] })
  localStorage.setItem('cartItems', JSON.stringify([]))
}

export const addToCart = (id, qty) => async (dispatch, getState) => {
const { data } = await axios.get(`/api/products/${id}`)
  dispatch({
    type: CART_ADD_ITEM,
    payload: {
      product: data._id,
      name: data.name,
      images: data.images,
      price: data.price,
      countInStock: data.countInStock,
      qty,
    },
  })

  const { userLogin: { userInfo } } = getState()
  if(userInfo?._id){
    try {
      await axios.post('/api/cart/add', {
        userId: userInfo._id,
        item: {
          productId: data._id,
          name: data.name,
          image: Array.isArray(data.images) ? data.images[0] : data.images,
          price: data.price,
          qty,
        }
      })
    } catch (_error) {
    }
  }

  localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems))
}

export const removeFromCart= (id)=> async (dispatch,getState)=>{
    dispatch({
      type: CART_REMOVE_ITEM,
      payload: id
    })

    const { userLogin: { userInfo } } = getState()
    if(userInfo?._id){
      try {
        await axios.delete('/api/cart/remove', {
          data: {
            userId: userInfo._id,
            productId: id,
          }
        })
      } catch (_error) {
      }
    }

    localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems))

}

export const saveAddressshipping = (data)=> (dispatch,getState)=>{
  dispatch({
    type: CART_SAVE_SHIPPING_ADRESSE,
    payload: data
  })
  localStorage.setItem('shippingAddress', JSON.stringify(data))

}
export const savepaymentmethod = (data)=> (dispatch,getState)=>{
  dispatch({
    type: CART_SAVE_PAYMENT,
    payload: data
  })
  localStorage.setItem('paymentMethod', JSON.stringify(data))

}