import axios from "axios";
import { ORDER_CREATE_FAIL,ORDER_CREATE_REQUEST,ORDER_CREATE_SUCCESS, ORDER_DELIVER_FAIL, ORDER_DELIVER_REQUEST, ORDER_DELIVER_SUCCESS, ORDER_DETAILS_FAIL, ORDER_DETAILS_REQUEST, ORDER_DETAILS_SUCCESS, ORDER_LIST_FAIL, ORDER_LIST_MY_FAIL, ORDER_LIST_MY_REQUEST, ORDER_LIST_MY_SUCCESS, ORDER_LIST_REQUEST, ORDER_LIST_SUCCESS, ORDER_PAY_FAIL, ORDER_PAY_REQUEST, ORDER_PAY_SUCCESS } from "../constants/orderConstants";
import { clearCartForUser } from './cartActions';

const normalizeOrder = (order, userInfo) => {
    const orderItems = order.orderItems || order.items || []
    const user = order.user || {
        name: userInfo?.name || 'User',
        email: userInfo?.email || ''
    }

    const status = order.status || ''
    const isPaid = typeof order.isPaid === 'boolean' ? order.isPaid : status === 'paid' || status === 'delivered'
    const isDelivered = typeof order.isDelivered === 'boolean' ? order.isDelivered : status === 'delivered'

    return {
        ...order,
        orderItems,
        user,
        shippingAddress: order.shippingAddress || {},
        shippingPrice: order.shippingPrice || 0,
        taxPrice: order.taxPrice || 0,
        totalPrice: typeof order.totalPrice === 'number' ? order.totalPrice : 0,
        isPaid,
        isDelivered,
        paidAt: order.paidAt || (isPaid ? order.updatedAt : null),
        deliveredAt: order.deliveredAt || (isDelivered ? order.updatedAt : null)
    }
}

const createOrderMicroPayload = (order, userInfo) => ({
    userId: userInfo?._id,
    items: order.orderItems,
    shippingAddress: order.shippingAddress,
    paymentMethod: order.paymentMethod,
    totalPrice: Number(order.totalPrice),
})

export const CreateOrder = (order) => async(dispatch, getState) => {
    try {
        dispatch({
            type: ORDER_CREATE_REQUEST
        })

        const { userLogin: {userInfo} } = getState()

        if(!userInfo || !userInfo.token || !userInfo._id){
            throw new Error('Please login before placing order')
        }

        if(!Array.isArray(order.orderItems) || order.orderItems.length === 0){
            throw new Error('Your cart is empty')
        }

        if(!order.paymentMethod){
            throw new Error('Please select a payment method')
        }

        const config = {
            headers:{
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`
            }
        }

        const microResponse = await axios.post(`/api/orders`, createOrderMicroPayload(order, userInfo), config)
        const data = microResponse.data

        dispatch({
            type: ORDER_CREATE_SUCCESS,
            payload: normalizeOrder(data, userInfo)
        })

        dispatch(clearCartForUser(userInfo._id))


       
    } catch (error) {
        dispatch({
            type: ORDER_CREATE_FAIL,
            payload: 
                error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        })
        
    }
}
export const getOrderDetails = (id) => async(dispatch, getState) => {
    try {
        dispatch({
            type: ORDER_DETAILS_REQUEST
        })

        const { userLogin: {userInfo} } = getState()

        if(!userInfo || !userInfo.token){
            throw new Error('Please login to view order details')
        }

        const config = {
            headers:{
                Authorization: `Bearer ${userInfo.token}`
            }
        }

        let order
        try {
            const microResponse = await axios.get(`/api/orders/${userInfo._id}`,config)
            const data = microResponse.data
            order = Array.isArray(data) ? data.find((item) => item._id === id) : data
            if(!order){
                throw new Error('Order not found')
            }
        } catch (microError) {
            const monolithResponse = await axios.get(`/api/orders/${id}`,config)
            order = monolithResponse.data
        }

        dispatch({
            type: ORDER_DETAILS_SUCCESS,
            payload: normalizeOrder(order, userInfo)
        })


       
    } catch (error) {
        dispatch({
            type: ORDER_DETAILS_FAIL,
            payload: 
                error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        })
        
    }
}
export const payOrder = (orderId,paymentResult) => async(dispatch, getState) => {
    try {
        dispatch({
            type: ORDER_PAY_REQUEST
        })

        const { userLogin: {userInfo} } = getState()

        if(!userInfo || !userInfo.token){
            throw new Error('Please login before paying order')
        }

        const config = {
            headers:{
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`
            }
        }

        let data
        try {
            const microResponse = await axios.put(`/api/orders/status`,{orderId,status:'paid',paymentResult},config)
            data = microResponse.data
        } catch (microError) {
            const monolithResponse = await axios.put(`/api/orders/${orderId}/pay`,paymentResult,config)
            data = monolithResponse.data
        }
        dispatch({
            type: ORDER_PAY_SUCCESS,
            payload: data
        })


       
    } catch (error) {
        dispatch({
            type: ORDER_PAY_FAIL,
            payload: 
                error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        })
        
    }
}

export const deliverOrder = (order) => async(dispatch, getState) => {
    try {
        dispatch({
            type: ORDER_DELIVER_REQUEST
        })

        const { userLogin: {userInfo} } = getState()

        if(!userInfo || !userInfo.token){
            throw new Error('Please login before updating order status')
        }

        const config = {
            headers:{
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`
            }
        }

        let data
        try {
            const microResponse = await axios.put(`/api/orders/status`,{orderId: order._id, status:'delivered'},config)
            data = microResponse.data
        } catch (microError) {
            const monolithResponse = await axios.put(`/api/orders/${order._id}/deliver`,{},config)
            data = monolithResponse.data
        }
        dispatch({
            type: ORDER_DELIVER_SUCCESS,
            payload: data
        })


       
    } catch (error) {
        dispatch({
            type: ORDER_DELIVER_FAIL,
            payload: 
                error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        })
        
    }
}

export const listMyOrders = () => async(dispatch, getState) => {
    try {
        dispatch({
            type: ORDER_LIST_MY_REQUEST
        })

        const { userLogin: {userInfo} } = getState()

        if(!userInfo || !userInfo.token){
            throw new Error('Please login to view your orders')
        }

        const config = {
            headers:{
                Authorization: `Bearer ${userInfo.token}`
            }
        }

        let data
        try {
            const microResponse = await axios.get(`/api/orders/${userInfo._id}`,config)
            data = microResponse.data
        } catch (microError) {
            const monolithResponse = await axios.get(`/api/orders/myorders`,config)
            data = monolithResponse.data
        }
        dispatch({
            type: ORDER_LIST_MY_SUCCESS,
            payload: Array.isArray(data) ? data.map((item) => normalizeOrder(item, userInfo)) : []
        })


       
    } catch (error) {
        dispatch({
            type: ORDER_LIST_MY_FAIL,
            payload: 
                error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        })
        
    }
}

export const listOrders = () => async(dispatch, getState) => {
    try {
        dispatch({
            type: ORDER_LIST_REQUEST
        })

        const { userLogin: {userInfo} } = getState()

        if(!userInfo || !userInfo.token){
            throw new Error('Please login to view orders')
        }

        const config = {
            headers:{
                Authorization: `Bearer ${userInfo.token}`
            }
        }

        let data
        try {
            const microResponse = await axios.get(`/api/orders/${userInfo._id}`,config)
            data = microResponse.data
        } catch (microError) {
            const monolithResponse = await axios.get(`/api/orders/`,config)
            data = monolithResponse.data
        }
        dispatch({
            type: ORDER_LIST_SUCCESS,
            payload: Array.isArray(data) ? data.map((item) => normalizeOrder(item, userInfo)) : []
        })


       
    } catch (error) {
        dispatch({
            type: ORDER_LIST_FAIL,
            payload: 
                error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        })
        
    }
}